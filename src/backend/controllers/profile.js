/**
 * Contrôleur pour les routes /api/profile et /api/cv.
 * Responsabilités :
 *   - getProfile  : récupérer le profil et retourner les champs localisés
 *   - updateProfile: mettre à jour le profil (admin)
 *   - downloadCV  : générer le PDF et le streamer avec les bons headers
 *
 * Cache PDF simple basé sur updated_at :
 *   On stocke en mémoire { lang -> { updatedAt, buffer } }.
 *   Si updated_at en BDD correspond au cache, on sert le buffer mis en cache.
 *   Sinon, on régénère.
 */
'use strict';

const profileModel   = require('../models/profile');
const { generateCV } = require('../services/pdf-generator');
const { t, normalizeLang } = require('../i18n/index');

// -------------------------------------------------------
// Cache PDF en mémoire
// Structure : { 'fr': { updatedAt: Date|null, buffer: Buffer|null }, ... }
// -------------------------------------------------------
const pdfCache = {
  fr: { updatedAt: null, buffer: null },
  en: { updatedAt: null, buffer: null },
};

/**
 * Invalide le cache PDF pour toutes les langues.
 * Appelé après une mise à jour du profil.
 */
function invalidatePdfCache() {
  pdfCache.fr = { updatedAt: null, buffer: null };
  pdfCache.en = { updatedAt: null, buffer: null };
}

/**
 * Vérifie si le cache PDF est valide pour une langue donnée.
 * @param {string} lang
 * @param {Date|string} dbUpdatedAt - updated_at depuis la BDD
 * @returns {boolean}
 */
function isCacheValid(lang, dbUpdatedAt) {
  const cached = pdfCache[lang];
  if (!cached || !cached.buffer || !cached.updatedAt) return false;
  return new Date(cached.updatedAt).getTime() === new Date(dbUpdatedAt).getTime();
}

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

/**
 * Projette les champs bilingues du profil selon la langue demandée.
 * Retourne un objet "aplati" sans les champs _fr / _en.
 * @param {object} profile  - Ligne brute BDD
 * @param {string} lang     - 'fr' ou 'en'
 * @returns {object}
 */
function localizeProfile(profile, lang) {
  return {
    id:            profile.id,
    name:          profile.name,
    title:         lang === 'en' ? (profile.title_en || profile.title_fr) : profile.title_fr,
    bio:           lang === 'en' ? (profile.bio_en   || profile.bio_fr)   : profile.bio_fr,
    skills:        profile.skills,
    experiences:   localizeExperiences(profile.experiences, lang),
    education:     localizeEducation(profile.education, lang),
    contact_email: profile.contact_email,
    linkedin_url:  profile.linkedin_url,
    github_url:    profile.github_url,
    updated_at:    profile.updated_at,
  };
}

/**
 * Localise le tableau d'expériences (aplati selon lang).
 * @param {Array} experiences
 * @param {string} lang
 * @returns {Array}
 */
function localizeExperiences(experiences, lang) {
  if (!Array.isArray(experiences)) return [];
  return experiences.map((exp) => ({
    company:     exp.company,
    role:        lang === 'en' ? (exp.role_en || exp.role_fr) : (exp.role_fr || exp.role_en),
    period:      exp.period,
    description: lang === 'en'
      ? (exp.description_en || exp.description_fr)
      : (exp.description_fr || exp.description_en),
  }));
}

/**
 * Localise le tableau de formations (aplati selon lang).
 * @param {Array} education
 * @param {string} lang
 * @returns {Array}
 */
function localizeEducation(education, lang) {
  if (!Array.isArray(education)) return [];
  return education.map((edu) => ({
    school: edu.school,
    degree: lang === 'en' ? (edu.degree_en || edu.degree_fr) : (edu.degree_fr || edu.degree_en),
    year:   edu.year,
  }));
}

// -------------------------------------------------------
// Handlers
// -------------------------------------------------------

/**
 * GET /api/profile?lang=fr|en
 * Retourne les données du profil localisées selon le paramètre lang.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function getProfile(req, res, next) {
  try {
    const lang    = normalizeLang(req.query.lang);
    const profile = await profileModel.findOne();

    if (!profile) {
      return res.status(404).json({
        error: { code: 404, message: t('errors.profile_not_found', lang) },
      });
    }

    return res.status(200).json({
      data: localizeProfile(profile, lang),
      lang,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/profile
 * Met à jour le profil du consultant (réservé à l'admin — middleware auth requis en amont).
 * Invalide le cache PDF après mise à jour.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function updateProfile(req, res, next) {
  try {
    const lang = normalizeLang(req.query.lang || req.body.lang);

    const updated = await profileModel.update(req.body);

    if (!updated) {
      return res.status(404).json({
        error: { code: 404, message: t('errors.profile_not_found', lang) },
      });
    }

    // Invalider le cache PDF car les données ont changé
    invalidatePdfCache();

    return res.status(200).json({
      data: localizeProfile(updated, lang),
      lang,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/cv?lang=fr|en
 * Génère le CV en PDF et le streame en réponse.
 * Utilise un cache en mémoire basé sur updated_at du profil.
 *
 * Headers :
 *   Content-Type: application/pdf
 *   Content-Disposition: attachment; filename="CV-Nom-Lang.pdf"
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function downloadCV(req, res, next) {
  try {
    const lang    = normalizeLang(req.query.lang);
    const profile = await profileModel.findOne();

    if (!profile) {
      return res.status(404).json({
        error: { code: 404, message: t('errors.profile_not_found', lang) },
      });
    }

    // Construire le nom de fichier : "CV-Jean-Dupont-fr.pdf" ou "Resume-Jean-Dupont-en.pdf"
    const prefix    = t('cv.filename_prefix', lang);
    const safeName  = (profile.name || 'Consultant')
      .replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const filename  = `${prefix}-${safeName}-${lang}.pdf`;

    // --- Vérifier le cache ---
    if (isCacheValid(lang, profile.updated_at)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfCache[lang].buffer.length);
      res.setHeader('X-Cache', 'HIT');
      return res.send(pdfCache[lang].buffer);
    }

    // --- Générer le PDF ---
    const pdfStream = generateCV(profile, lang);

    // Collecter les chunks du stream dans un Buffer pour le cache
    const chunks = [];
    pdfStream.on('data', (chunk) => chunks.push(chunk));

    pdfStream.on('error', (err) => {
      console.error('[PDF] Erreur de génération :', err.message);
      if (!res.headersSent) {
        res.status(500).json({
          error: { code: 500, message: t('errors.pdf_generation_failed', lang) },
        });
      }
    });

    pdfStream.on('end', () => {
      const buffer = Buffer.concat(chunks);

      // Mettre en cache
      pdfCache[lang] = { updatedAt: profile.updated_at, buffer };

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('X-Cache', 'MISS');
      res.send(buffer);
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, downloadCV, invalidatePdfCache };

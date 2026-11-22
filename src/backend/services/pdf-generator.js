/**
 * Service de génération du CV en PDF via PDFKit.
 * Mise en page professionnelle sobre : titres bleu profond (#1E40AF),
 * texte noir, lignes séparatrices grises, police Helvetica, format A4.
 */
'use strict';

const PDFDocument = require('pdfkit');
const { t }       = require('../i18n/index');

// -------------------------------------------------------
// Constantes de mise en page
// -------------------------------------------------------
const PAGE_WIDTH  = 595.28;  // A4 en points
const PAGE_HEIGHT = 841.89;  // A4 en points
const MARGIN      = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const COLORS = {
  primary:    '#1E40AF',  // bleu profond — titres de sections
  text:       '#111111',  // noir principal
  muted:      '#555555',  // gris moyen — texte secondaire
  separator:  '#DDDDDD',  // gris clair — lignes séparatrices
  white:      '#FFFFFF',
};

const FONTS = {
  regular: 'Helvetica',
  bold:    'Helvetica-Bold',
  oblique: 'Helvetica-Oblique',
};

// -------------------------------------------------------
// Helpers de dessin
// -------------------------------------------------------

/**
 * Dessine une ligne séparatrice horizontale grise.
 * @param {PDFDocument} doc
 * @param {number} y
 */
function drawSeparator(doc, y) {
  doc
    .moveTo(MARGIN, y)
    .lineTo(PAGE_WIDTH - MARGIN, y)
    .strokeColor(COLORS.separator)
    .lineWidth(0.5)
    .stroke();
}

/**
 * Affiche un titre de section (bleu profond, Helvetica-Bold 12pt)
 * suivi d'une ligne séparatrice.
 * @param {PDFDocument} doc
 * @param {string} label
 */
function drawSectionTitle(doc, label) {
  // Espacement avant le titre
  doc.moveDown(0.6);
  const y = doc.y;

  doc
    .font(FONTS.bold)
    .fontSize(12)
    .fillColor(COLORS.primary)
    .text(label.toUpperCase(), MARGIN, y);

  doc.moveDown(0.3);
  drawSeparator(doc, doc.y);
  doc.moveDown(0.5);
}

/**
 * Vérifie qu'il reste assez de place sur la page, sinon en crée une nouvelle.
 * @param {PDFDocument} doc
 * @param {number} neededHeight - Hauteur minimale requise en points
 */
function ensureSpace(doc, neededHeight = 60) {
  if (doc.y + neededHeight > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
  }
}

// -------------------------------------------------------
// Sections du CV
// -------------------------------------------------------

/**
 * En-tête : nom, titre, coordonnées.
 * @param {PDFDocument} doc
 * @param {object} profile
 * @param {string} lang
 */
function drawHeader(doc, profile, lang) {
  const title = lang === 'en' ? profile.title_en : profile.title_fr;

  // Nom en grand
  doc
    .font(FONTS.bold)
    .fontSize(26)
    .fillColor(COLORS.primary)
    .text(profile.name || '', MARGIN, MARGIN, { width: CONTENT_WIDTH, align: 'left' });

  doc.moveDown(0.3);

  // Titre professionnel
  if (title) {
    doc
      .font(FONTS.oblique)
      .fontSize(13)
      .fillColor(COLORS.muted)
      .text(title, MARGIN, doc.y, { width: CONTENT_WIDTH });
    doc.moveDown(0.5);
  }

  // Coordonnées sur une même ligne (email | linkedin | github)
  const coords = [];
  if (profile.contact_email) {
    coords.push(`${t('cv.email', lang)}: ${profile.contact_email}`);
  }
  if (profile.linkedin_url) {
    coords.push(`${t('cv.linkedin', lang)}: ${profile.linkedin_url}`);
  }
  if (profile.github_url) {
    coords.push(`${t('cv.github', lang)}: ${profile.github_url}`);
  }

  if (coords.length > 0) {
    doc
      .font(FONTS.regular)
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text(coords.join('   |   '), MARGIN, doc.y, { width: CONTENT_WIDTH });
  }

  doc.moveDown(0.4);
  drawSeparator(doc, doc.y);
}

/**
 * Section "À propos" / "About".
 * @param {PDFDocument} doc
 * @param {object} profile
 * @param {string} lang
 */
function drawAbout(doc, profile, lang) {
  const bio = lang === 'en' ? profile.bio_en : profile.bio_fr;
  if (!bio) return;

  drawSectionTitle(doc, t('cv.about', lang));

  doc
    .font(FONTS.regular)
    .fontSize(10)
    .fillColor(COLORS.text)
    .text(bio, MARGIN, doc.y, { width: CONTENT_WIDTH, align: 'justify' });
}

/**
 * Section "Compétences" / "Skills".
 * Les skills sont groupés par catégorie depuis le JSONB.
 * Format attendu :
 *   [ { "category": "...", "items": ["item1", "item2"] } ]
 *   ou format plat : [ "item1", "item2" ]
 * @param {PDFDocument} doc
 * @param {object} profile
 * @param {string} lang
 */
function drawSkills(doc, profile, lang) {
  const skills = profile.skills;
  if (!skills || (Array.isArray(skills) && skills.length === 0)) return;

  drawSectionTitle(doc, t('cv.skills', lang));

  const fontSize = 10;
  doc.font(FONTS.regular).fontSize(fontSize).fillColor(COLORS.text);

  // Déterminer si le format est groupé par catégorie ou plat
  const isGrouped = Array.isArray(skills) && skills.length > 0 && typeof skills[0] === 'object' && skills[0].category;

  if (isGrouped) {
    for (const group of skills) {
      ensureSpace(doc, 40);
      const items = Array.isArray(group.items) ? group.items.join('  ·  ') : '';

      // Catégorie en gras bleu
      doc
        .font(FONTS.bold)
        .fontSize(10)
        .fillColor(COLORS.primary)
        .text(`${group.category}:  `, MARGIN, doc.y, { continued: true, width: CONTENT_WIDTH });

      // Items en texte normal
      doc
        .font(FONTS.regular)
        .fillColor(COLORS.text)
        .text(items, { width: CONTENT_WIDTH });

      doc.moveDown(0.3);
    }
  } else {
    // Format plat : liste séparée par des points médians
    const flatItems = Array.isArray(skills) ? skills.join('  ·  ') : String(skills);
    doc
      .font(FONTS.regular)
      .fontSize(10)
      .fillColor(COLORS.text)
      .text(flatItems, MARGIN, doc.y, { width: CONTENT_WIDTH });
  }
}

/**
 * Section "Expériences professionnelles" — chronologie inversée.
 * Format JSONB attendu :
 *   [{ "company": "", "role_fr": "", "role_en": "", "period": "", "description_fr": "", "description_en": "" }]
 * @param {PDFDocument} doc
 * @param {object} profile
 * @param {string} lang
 */
function drawExperiences(doc, profile, lang) {
  const experiences = profile.experiences;
  if (!experiences || (Array.isArray(experiences) && experiences.length === 0)) return;

  drawSectionTitle(doc, t('cv.experience', lang));

  // Trier par ordre inverse (le plus récent en premier)
  // On suppose que l'ordre dans le JSONB est chronologique ascendant
  const sorted = [...experiences].reverse();

  for (const exp of sorted) {
    ensureSpace(doc, 70);

    const role = lang === 'en' ? (exp.role_en || exp.role_fr) : (exp.role_fr || exp.role_en);
    const description = lang === 'en'
      ? (exp.description_en || exp.description_fr)
      : (exp.description_fr || exp.description_en);

    // Ligne 1 : Rôle (gras) — Entreprise
    const companyLine = exp.company ? `  —  ${exp.company}` : '';
    doc
      .font(FONTS.bold)
      .fontSize(10.5)
      .fillColor(COLORS.text)
      .text(`${role || ''}${companyLine}`, MARGIN, doc.y, { width: CONTENT_WIDTH - 80, continued: true });

    // Période à droite
    if (exp.period) {
      doc
        .font(FONTS.regular)
        .fontSize(9)
        .fillColor(COLORS.muted)
        .text(exp.period, { align: 'right', width: 80 });
    } else {
      doc.text('');
    }

    doc.moveDown(0.15);

    // Description
    if (description) {
      doc
        .font(FONTS.regular)
        .fontSize(9.5)
        .fillColor(COLORS.muted)
        .text(description, MARGIN + 10, doc.y, { width: CONTENT_WIDTH - 10 });
    }

    doc.moveDown(0.6);
  }
}

/**
 * Section "Formation" / "Education".
 * Format JSONB attendu :
 *   [{ "school": "", "degree_fr": "", "degree_en": "", "year": "" }]
 * @param {PDFDocument} doc
 * @param {object} profile
 * @param {string} lang
 */
function drawEducation(doc, profile, lang) {
  const education = profile.education;
  if (!education || (Array.isArray(education) && education.length === 0)) return;

  drawSectionTitle(doc, t('cv.education', lang));

  for (const edu of education) {
    ensureSpace(doc, 40);

    const degree = lang === 'en'
      ? (edu.degree_en || edu.degree_fr)
      : (edu.degree_fr || edu.degree_en);

    // Diplôme (gras) — École
    const schoolLine = edu.school ? `  —  ${edu.school}` : '';
    doc
      .font(FONTS.bold)
      .fontSize(10.5)
      .fillColor(COLORS.text)
      .text(`${degree || ''}${schoolLine}`, MARGIN, doc.y, { width: CONTENT_WIDTH - 60, continued: true });

    // Année à droite
    if (edu.year) {
      doc
        .font(FONTS.regular)
        .fontSize(9)
        .fillColor(COLORS.muted)
        .text(edu.year, { align: 'right', width: 60 });
    } else {
      doc.text('');
    }

    doc.moveDown(0.5);
  }
}

// -------------------------------------------------------
// Pied de page : numéros de page
// -------------------------------------------------------

/**
 * Ajoute les numéros de page sur chaque page générée.
 * Appelé après que le document soit finalisé.
 * @param {PDFDocument} doc
 */
function addPageNumbers(doc) {
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc
      .font(FONTS.regular)
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text(
        `${i + 1} / ${totalPages}`,
        MARGIN,
        PAGE_HEIGHT - MARGIN + 10,
        { width: CONTENT_WIDTH, align: 'center' }
      );
  }
}

// -------------------------------------------------------
// Export principal
// -------------------------------------------------------

/**
 * Génère le CV en PDF et retourne un Readable stream.
 *
 * @param {object} profileData - Données profil issues de la BDD
 * @param {string} lang        - Langue : 'fr' ou 'en'
 * @returns {PDFDocument}       Stream PDF lisible (PDFKit est un Readable stream)
 */
function generateCV(profileData, lang) {
  const doc = new PDFDocument({
    size:          'A4',
    margins:       { top: MARGIN, bottom: MARGIN + 20, left: MARGIN, right: MARGIN },
    bufferPages:   true,  // nécessaire pour addPageNumbers()
    info: {
      Title:   `CV — ${profileData.name || 'Consultant IT'}`,
      Author:  profileData.name || 'Consultant IT',
      Subject: lang === 'en' ? 'Resume' : 'Curriculum Vitae',
    },
  });

  // --- Construction du document ---
  drawHeader(doc, profileData, lang);
  drawAbout(doc, profileData, lang);
  drawSkills(doc, profileData, lang);
  drawExperiences(doc, profileData, lang);
  drawEducation(doc, profileData, lang);

  // Numéros de page (utilise bufferPages)
  addPageNumbers(doc);

  // Finaliser le PDF (flush le buffer)
  doc.end();

  return doc;
}

module.exports = { generateCV };

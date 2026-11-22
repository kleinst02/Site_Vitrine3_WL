/**
 * Contrôleur Blog — Logique métier de l'API articles.
 * Chaque fonction délègue l'accès aux données à models/article.js
 * et la conversion Markdown à services/markdown.js.
 */
'use strict';

const { validationResult } = require('express-validator');
const Article              = require('../models/article');
const { parseMarkdown }    = require('../services/markdown');

// Langues supportées
const SUPPORTED_LANGS = ['fr', 'en'];
const DEFAULT_LANG    = 'fr';

/**
 * Résout la langue à utiliser (query param > header Accept-Language > défaut).
 * @param {import('express').Request} req
 * @returns {'fr'|'en'}
 */
function resolveLang(req) {
  const qLang = (req.query.lang || '').toLowerCase();
  if (SUPPORTED_LANGS.includes(qLang)) return qLang;

  const hLang = (req.headers['accept-language'] || '').slice(0, 2).toLowerCase();
  if (SUPPORTED_LANGS.includes(hLang)) return hLang;

  return DEFAULT_LANG;
}

/**
 * Projette un article brut (toutes colonnes) vers un objet localisé
 * en fonction de la langue choisie.
 * @param {object} row    - Ligne brute de la BDD
 * @param {string} lang   - 'fr' ou 'en'
 * @param {boolean} [full] - Inclure le contenu HTML parsé
 * @returns {object}
 */
function localizeArticle(row, lang, full = false) {
  const other = lang === 'fr' ? 'en' : 'fr';

  const article = {
    id:         row.id,
    slug:       row.slug,
    // Champ localisé avec repli sur l'autre langue si vide
    title:      row[`title_${lang}`] || row[`title_${other}`] || '',
    excerpt:    row[`excerpt_${lang}`] || row[`excerpt_${other}`] || null,
    category:   row.category,
    published:  row.published,
    created_at: row.created_at,
    updated_at: row.updated_at,
    lang,
  };

  if (full) {
    const rawContent = row[`content_${lang}`] || row[`content_${other}`] || '';
    article.content_html = parseMarkdown(rawContent);
    // On expose aussi le Markdown brut pour permettre l'édition côté client
    article.content_raw = rawContent;
  }

  return article;
}

// ------------------------------------------------------------------
// GET /api/articles
// ------------------------------------------------------------------

/**
 * Liste paginée des articles publiés avec filtres optionnels.
 * Query params : page (défaut 1), limit (défaut 10, max 50), lang, category
 */
async function getArticles(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: { code: 400, message: errors.array()[0].msg },
      });
    }

    const lang     = resolveLang(req);
    const page     = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit    = Math.min(50, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const category = req.query.category || undefined;

    // Les articles non publiés sont exclus des requêtes publiques
    const filters = { page, limit, lang, category, published: true };

    const [rows, total] = await Promise.all([
      Article.findAll(filters),
      Article.count({ category, published: true }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.json({
      data: rows.map((row) => localizeArticle(row, lang, false)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    return next(err);
  }
}

// ------------------------------------------------------------------
// GET /api/articles/:slug
// ------------------------------------------------------------------

/**
 * Récupère un article complet par slug.
 * Le contenu Markdown est converti en HTML dans la réponse.
 */
async function getArticleBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    // Validation basique du slug (alphanumérique + tirets)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({
        error: { code: 400, message: 'Slug invalide.' },
      });
    }

    const row = await Article.findBySlug(slug);

    if (!row) {
      return res.status(404).json({
        error: { code: 404, message: 'Article introuvable.' },
      });
    }

    // Les articles non publiés ne sont pas accessibles publiquement
    if (!row.published) {
      return res.status(404).json({
        error: { code: 404, message: 'Article introuvable.' },
      });
    }

    const lang = resolveLang(req);
    return res.json({ data: localizeArticle(row, lang, true) });
  } catch (err) {
    return next(err);
  }
}

// ------------------------------------------------------------------
// POST /api/articles
// ------------------------------------------------------------------

/**
 * Crée un nouvel article.
 * Protégé par le middleware requireApiKey.
 */
async function createArticle(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: { code: 400, message: errors.array()[0].msg },
      });
    }

    const {
      slug, title_fr, title_en,
      content_fr, content_en,
      excerpt_fr, excerpt_en,
      category, published,
    } = req.body;

    let article;
    try {
      article = await Article.create({
        slug, title_fr, title_en,
        content_fr, content_en,
        excerpt_fr, excerpt_en,
        category,
        published: published === true || published === 'true',
      });
    } catch (dbErr) {
      // Violation de contrainte UNIQUE sur slug
      if (dbErr.code === '23505') {
        return res.status(409).json({
          error: { code: 409, message: 'Un article avec ce slug existe déjà.' },
        });
      }
      throw dbErr;
    }

    return res.status(201).json({ data: article });
  } catch (err) {
    return next(err);
  }
}

// ------------------------------------------------------------------
// PUT /api/articles/:id
// ------------------------------------------------------------------

/**
 * Met à jour un article existant.
 * Protégé par le middleware requireApiKey.
 */
async function updateArticle(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: { code: 400, message: errors.array()[0].msg },
      });
    }

    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        error: { code: 400, message: 'Identifiant d\'article invalide.' },
      });
    }

    const allowedFields = [
      'slug', 'title_fr', 'title_en',
      'content_fr', 'content_en',
      'excerpt_fr', 'excerpt_en',
      'category', 'published',
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: { code: 400, message: 'Aucun champ à mettre à jour fourni.' },
      });
    }

    // Normaliser le champ published si présent
    if (Object.prototype.hasOwnProperty.call(updateData, 'published')) {
      updateData.published = updateData.published === true || updateData.published === 'true';
    }

    let updated;
    try {
      updated = await Article.update(id, updateData);
    } catch (dbErr) {
      if (dbErr.code === '23505') {
        return res.status(409).json({
          error: { code: 409, message: 'Un article avec ce slug existe déjà.' },
        });
      }
      throw dbErr;
    }

    if (!updated) {
      return res.status(404).json({
        error: { code: 404, message: 'Article introuvable.' },
      });
    }

    return res.json({ data: updated });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getArticles, getArticleBySlug, createArticle, updateArticle };

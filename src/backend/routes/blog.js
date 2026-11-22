/**
 * Routes Express — Blog / Articles
 *
 * GET  /api/articles         — liste paginée (publique)
 * GET  /api/articles/:slug   — article par slug (publique)
 * POST /api/articles         — création (protégée par X-API-Key)
 * PUT  /api/articles/:id     — modification (protégée par X-API-Key)
 */
'use strict';

const { Router }     = require('express');
const { query, param, body } = require('express-validator');

const { requireApiKey }                                   = require('../middlewares/auth');
const { getArticles, getArticleBySlug, createArticle, updateArticle } = require('../controllers/blog');

const router = Router();

// ------------------------------------------------------------------
// Validateurs réutilisables
// ------------------------------------------------------------------

/** Validation des query params de pagination / filtrage */
const listValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Le paramètre "page" doit être un entier >= 1.')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Le paramètre "limit" doit être un entier entre 1 et 50.')
    .toInt(),

  query('lang')
    .optional()
    .isIn(['fr', 'en']).withMessage('Le paramètre "lang" doit être "fr" ou "en".'),

  query('category')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 }).withMessage('La catégorie ne peut pas dépasser 100 caractères.'),
];

/** Validation du corps pour la création d'article */
const createValidators = [
  body('slug')
    .notEmpty().withMessage('Le slug est requis.')
    .matches(/^[a-z0-9-]+$/).withMessage('Le slug ne peut contenir que des lettres minuscules, chiffres et tirets.')
    .isLength({ max: 255 }).withMessage('Le slug ne peut pas dépasser 255 caractères.'),

  body('title_fr')
    .notEmpty().withMessage('Le titre en français (title_fr) est requis.')
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Le titre doit contenir entre 2 et 255 caractères.'),

  body('title_en')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 255 }).withMessage('Le titre anglais ne peut pas dépasser 255 caractères.'),

  body('content_fr')
    .notEmpty().withMessage('Le contenu en français (content_fr) est requis.')
    .isString()
    .isLength({ min: 10 }).withMessage('Le contenu doit contenir au moins 10 caractères.'),

  body('content_en')
    .optional({ nullable: true })
    .isString(),

  body('excerpt_fr')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 }).withMessage('L\'extrait ne peut pas dépasser 500 caractères.'),

  body('excerpt_en')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 }).withMessage('L\'extrait anglais ne peut pas dépasser 500 caractères.'),

  body('category')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 100 }).withMessage('La catégorie ne peut pas dépasser 100 caractères.'),

  body('published')
    .optional()
    .isBoolean().withMessage('Le champ "published" doit être un booléen.'),
];

/** Validation du corps pour la mise à jour (tous les champs optionnels) */
const updateValidators = [
  body('slug')
    .optional()
    .matches(/^[a-z0-9-]+$/).withMessage('Le slug ne peut contenir que des lettres minuscules, chiffres et tirets.')
    .isLength({ max: 255 }).withMessage('Le slug ne peut pas dépasser 255 caractères.'),

  body('title_fr')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Le titre doit contenir entre 2 et 255 caractères.'),

  body('title_en')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 255 }).withMessage('Le titre anglais ne peut pas dépasser 255 caractères.'),

  body('content_fr')
    .optional()
    .isString()
    .isLength({ min: 10 }).withMessage('Le contenu doit contenir au moins 10 caractères.'),

  body('content_en')
    .optional({ nullable: true })
    .isString(),

  body('excerpt_fr')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 }).withMessage('L\'extrait ne peut pas dépasser 500 caractères.'),

  body('excerpt_en')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 }).withMessage('L\'extrait anglais ne peut pas dépasser 500 caractères.'),

  body('category')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 100 }).withMessage('La catégorie ne peut pas dépasser 100 caractères.'),

  body('published')
    .optional()
    .isBoolean().withMessage('Le champ "published" doit être un booléen.'),

  param('id')
    .isInt({ min: 1 }).withMessage('L\'identifiant doit être un entier positif.')
    .toInt(),
];

// ------------------------------------------------------------------
// Routes publiques
// ------------------------------------------------------------------

// GET /api/articles
router.get('/', listValidators, getArticles);

// GET /api/articles/:slug
router.get('/:slug', getArticleBySlug);

// ------------------------------------------------------------------
// Routes protégées (X-API-Key)
// ------------------------------------------------------------------

// POST /api/articles
router.post('/', requireApiKey, createValidators, createArticle);

// PUT /api/articles/:id
router.put('/:id', requireApiKey, updateValidators, updateArticle);

module.exports = router;

/**
 * Routes Express pour le profil et le CV PDF.
 *
 * Montage dans server.js :
 *   app.use('/api', profileRoutes)   → expose /api/profile et /api/cv
 *
 * Routes publiques :
 *   GET  /api/profile?lang=fr|en  — données profil localisées
 *   GET  /api/cv?lang=fr|en       — téléchargement CV PDF
 *
 * Route protégée (admin) :
 *   PUT  /api/profile             — mise à jour du profil (auth requise)
 */
'use strict';

const express = require('express');
const { query, validationResult } = require('express-validator');

const { getProfile, updateProfile, downloadCV } = require('../controllers/profile');
const { requireApiKey } = require('../middlewares/auth');
const { normalizeLang } = require('../i18n/index');
const { profileValidationRules, handleProfileValidationErrors } = require('../validators/profile');

const router = express.Router();

// -------------------------------------------------------
// Validation du paramètre lang (commun aux deux routes GET)
// -------------------------------------------------------
const langValidation = [
  query('lang')
    .optional()
    .trim()
    .isIn(['fr', 'en'])
    .withMessage((value, { req }) => {
      const lang = normalizeLang(req.query.lang);
      return lang === 'en'
        ? 'Language must be "fr" or "en".'
        : 'La langue doit être "fr" ou "en".';
    }),
];

/**
 * Middleware qui vérifie les erreurs de validation de paramètres query.
 * Retourne 400 avec le format d'erreur standard si invalide.
 */
function handleQueryValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const lang = normalizeLang(req.query.lang);
    const genericMsg = lang === 'en'
      ? 'Invalid query parameters.'
      : 'Paramètres de requête invalides.';

    return res.status(400).json({
      error: {
        code:    400,
        message: genericMsg,
        fields:  errors.array().map((e) => ({ field: e.path, message: e.msg })),
      },
    });
  }
  next();
}

// -------------------------------------------------------
// GET /api/profile?lang=fr|en — Profil localisé (public)
// -------------------------------------------------------
router.get(
  '/profile',
  langValidation,
  handleQueryValidation,
  getProfile
);

// -------------------------------------------------------
// PUT /api/profile — Mise à jour du profil (admin)
// -------------------------------------------------------
router.put(
  '/profile',
  requireApiKey,
  profileValidationRules,
  handleProfileValidationErrors,
  updateProfile
);

// -------------------------------------------------------
// GET /api/cv?lang=fr|en — Téléchargement CV PDF (public)
// -------------------------------------------------------
router.get(
  '/cv',
  langValidation,
  handleQueryValidation,
  downloadCV
);

module.exports = router;

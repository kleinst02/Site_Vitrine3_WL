/**
 * Validateurs express-validator pour le formulaire de contact.
 * Chaque champ est trim, typé et contraint selon les critères d'acceptation T-005.
 */
'use strict';

const { body, validationResult } = require('express-validator');

// Messages d'erreur localisés (FR / EN)
const MESSAGES = {
  fr: {
    name_required:    'Le nom est requis.',
    name_length:      'Le nom doit comporter entre 2 et 100 caractères.',
    email_required:   'L'adresse e-mail est requise.',
    email_invalid:    'L'adresse e-mail n'est pas valide.',
    subject_required: 'Le sujet est requis.',
    subject_length:   'Le sujet doit comporter entre 5 et 200 caractères.',
    message_required: 'Le message est requis.',
    message_length:   'Le message doit comporter entre 10 et 5000 caractères.',
    lang_invalid:     'La langue doit être "fr" ou "en".',
  },
  en: {
    name_required:    'Name is required.',
    name_length:      'Name must be between 2 and 100 characters.',
    email_required:   'Email address is required.',
    email_invalid:    'Email address is not valid.',
    subject_required: 'Subject is required.',
    subject_length:   'Subject must be between 5 and 200 characters.',
    message_required: 'Message is required.',
    message_length:   'Message must be between 10 and 5000 characters.',
    lang_invalid:     'Language must be "fr" or "en".',
  },
};

/**
 * Retourne les messages dans la langue demandée (défaut : fr).
 * @param {string} lang
 * @returns {object}
 */
function msgs(lang) {
  return MESSAGES[lang] || MESSAGES.fr;
}

/**
 * Tableau de middlewares de validation pour POST /api/contact.
 * La langue est lue depuis le corps de la requête (champ lang).
 * Les messages sont sélectionnés dynamiquement via req.body.lang.
 */
const contactValidationRules = [
  // lang — doit être validé en premier pour localiser les messages suivants
  body('lang')
    .optional()
    .trim()
    .isIn(['fr', 'en'])
    .withMessage((value, { req }) => msgs(req.body.lang).lang_invalid)
    .default('fr'),

  // name
  body('name')
    .notEmpty()
    .withMessage((value, { req }) => msgs(req.body.lang).name_required)
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage((value, { req }) => msgs(req.body.lang).name_length),

  // email
  body('email')
    .notEmpty()
    .withMessage((value, { req }) => msgs(req.body.lang).email_required)
    .trim()
    .isEmail()
    .withMessage((value, { req }) => msgs(req.body.lang).email_invalid)
    .normalizeEmail(),

  // subject
  body('subject')
    .notEmpty()
    .withMessage((value, { req }) => msgs(req.body.lang).subject_required)
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage((value, { req }) => msgs(req.body.lang).subject_length),

  // message
  body('message')
    .notEmpty()
    .withMessage((value, { req }) => msgs(req.body.lang).message_required)
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage((value, { req }) => msgs(req.body.lang).message_length),
];

/**
 * Middleware qui vérifie le résultat de la validation et renvoie 400 si erreurs.
 * Le format d'erreur respecte la convention du projet :
 *   { "error": { "code": 400, "message": "...", "fields": [ ... ] } }
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const lang = req.body.lang === 'en' ? 'en' : 'fr';
    const genericMsg = lang === 'en'
      ? 'Validation failed. Please check the fields below.'
      : 'Validation échouée. Veuillez corriger les champs indiqués.';

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

module.exports = { contactValidationRules, handleValidationErrors };

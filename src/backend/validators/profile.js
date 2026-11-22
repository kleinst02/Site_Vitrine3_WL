/**
 * Validateurs express-validator pour PUT /api/profile.
 * Tous les champs sont optionnels (mise à jour partielle).
 */
'use strict';

const { body, validationResult } = require('express-validator');

const profileValidationRules = [
  body('name')
    .optional()
    .trim()
    .isString().withMessage('Name must be a string.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),

  body('title_fr')
    .optional()
    .trim()
    .isString().withMessage('title_fr must be a string.')
    .isLength({ max: 200 }).withMessage('title_fr must be at most 200 characters.'),

  body('title_en')
    .optional()
    .trim()
    .isString().withMessage('title_en must be a string.')
    .isLength({ max: 200 }).withMessage('title_en must be at most 200 characters.'),

  body('bio_fr')
    .optional()
    .trim()
    .isString().withMessage('bio_fr must be a string.')
    .isLength({ max: 5000 }).withMessage('bio_fr must be at most 5000 characters.'),

  body('bio_en')
    .optional()
    .trim()
    .isString().withMessage('bio_en must be a string.')
    .isLength({ max: 5000 }).withMessage('bio_en must be at most 5000 characters.'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email is not valid.')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .isString().withMessage('Phone must be a string.'),

  body('location_fr')
    .optional()
    .trim()
    .isString().withMessage('location_fr must be a string.')
    .isLength({ max: 200 }).withMessage('location_fr must be at most 200 characters.'),

  body('location_en')
    .optional()
    .trim()
    .isString().withMessage('location_en must be a string.')
    .isLength({ max: 200 }).withMessage('location_en must be at most 200 characters.'),

  body('linkedin_url')
    .optional()
    .trim()
    .isURL().withMessage('linkedin_url must be a valid URL.'),

  body('website_url')
    .optional()
    .trim()
    .isURL().withMessage('website_url must be a valid URL.'),

  body('skills')
    .optional()
    .isArray().withMessage('skills must be an array.'),

  body('skills.*.name')
    .optional()
    .trim()
    .isString().withMessage('Each skill must have a name string.'),

  body('skills.*.category')
    .optional()
    .trim()
    .isString().withMessage('Each skill must have a category string.'),

  body('experiences')
    .optional()
    .isArray().withMessage('experiences must be an array.'),

  body('experiences.*.title')
    .optional()
    .trim()
    .isString().withMessage('Each experience must have a title string.'),

  body('experiences.*.company')
    .optional()
    .trim()
    .isString().withMessage('Each experience must have a company string.'),

  body('education')
    .optional()
    .isArray().withMessage('education must be an array.'),

  body('education.*.degree')
    .optional()
    .trim()
    .isString().withMessage('Each education entry must have a degree string.'),

  body('education.*.school')
    .optional()
    .trim()
    .isString().withMessage('Each education entry must have a school string.'),
];

/**
 * Middleware de gestion des erreurs de validation pour le profil.
 */
function handleProfileValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        code: 400,
        message: 'Validation failed. Please check the fields below.',
        fields: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      },
    });
  }
  next();
}

module.exports = { profileValidationRules, handleProfileValidationErrors };

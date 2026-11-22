/**
 * Routes Express pour le formulaire de contact.
 * Montage : app.use('/api/contact', contactRoutes)
 */
'use strict';

const express    = require('express');
const rateLimit  = require('express-rate-limit');

const { contactValidationRules, handleValidationErrors } = require('../validators/contact');
const { submitContact } = require('../controllers/contact');

const router = express.Router();

// ---------------------------------------------------------------------------
// Rate limiting spécifique : max 3 soumissions par IP par heure
// ---------------------------------------------------------------------------
const contactLimiter = rateLimit({
  windowMs:        60 * 60 * 1000, // 1 heure
  max:             3,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator:    (req) => req.ip,
  handler: (req, res) => {
    const lang = (req.body && req.body.lang) === 'en' ? 'en' : 'fr';
    const message = lang === 'en'
      ? 'Too many contact form submissions. Please try again in 1 hour.'
      : 'Trop de soumissions du formulaire de contact. Réessayez dans 1 heure.';

    return res.status(429).json({
      error: { code: 429, message },
    });
  },
});

// ---------------------------------------------------------------------------
// POST /api/contact
// ---------------------------------------------------------------------------
router.post(
  '/',
  contactLimiter,
  contactValidationRules,
  handleValidationErrors,
  submitContact
);

module.exports = router;

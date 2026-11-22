/**
 * Middleware de gestion d'erreurs centralisé.
 * Format de réponse unique : { "error": { "code", "message" } }
 * Aucune stack trace n'est exposée en production.
 */
'use strict';

const ERROR_MESSAGES = {
  fr: {
    400: 'Requête invalide.',
    401: 'Authentification requise.',
    403: 'Accès interdit.',
    404: 'Ressource introuvable.',
    409: 'Conflit de données.',
    422: 'Données non traitables.',
    429: 'Trop de requêtes. Réessayez dans quelques instants.',
    500: 'Erreur interne du serveur.',
  },
  en: {
    400: 'Bad request.',
    401: 'Authentication required.',
    403: 'Access forbidden.',
    404: 'Resource not found.',
    409: 'Data conflict.',
    422: 'Unprocessable entity.',
    429: 'Too many requests. Please try again later.',
    500: 'Internal server error.',
  },
};

/**
 * @param {Error}             err
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const lang   = (req.headers['accept-language'] || 'fr').startsWith('en') ? 'en' : 'fr';
  const msgs   = ERROR_MESSAGES[lang] || ERROR_MESSAGES.fr;

  // Message : utiliser le message personnalisé de l'erreur ou le message générique
  const message = err.expose && err.message
    ? err.message
    : (msgs[status] || msgs[500]);

  // Journaliser les erreurs serveur (sans exposer les détails au client)
  if (status >= 500) {
    console.error(`[ERROR ${status}]`, err.stack || err.message);
  }

  res.status(status).json({
    error: {
      code:    status,
      message,
    },
  });
}

module.exports = errorHandler;

/**
 * Middleware d'authentification par clé API.
 * Vérifie la présence et la validité du header X-API-Key.
 * Utilisé sur les routes protégées (POST, PUT, DELETE).
 */
'use strict';

/**
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requireApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: {
        code: 401,
        message: 'Clé API manquante. Fournissez le header X-API-Key.',
      },
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      error: {
        code: 403,
        message: 'Clé API invalide.',
      },
    });
  }

  return next();
}

module.exports = { requireApiKey };

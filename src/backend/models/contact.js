/**
 * Modèle d'accès aux données pour la table `contacts`.
 * Toutes les requêtes sont paramétrées ($1, $2, …) pour prévenir les injections SQL.
 */
'use strict';

const db = require('../config/database');

/**
 * Insère un nouveau message de contact.
 *
 * @param {{ name: string, email: string, subject: string, message: string, lang: string }} data
 * @returns {Promise<object>} La ligne insérée (id, name, email, subject, message, lang, created_at)
 */
async function create(data) {
  const { name, email, subject, message, lang } = data;

  const sql = `
    INSERT INTO contacts (name, email, subject, message, lang)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, email, subject, message, lang, created_at
  `;

  const result = await db.query(sql, [name, email, subject, message, lang || 'fr']);
  return result.rows[0];
}

/**
 * Récupère la liste paginée des messages de contact (usage futur : panneau admin).
 *
 * @param {number} [page=1]   - Numéro de page (1-based)
 * @param {number} [limit=20] - Nombre d'éléments par page (max 100)
 * @returns {Promise<{ data: object[], total: number, page: number, limit: number }>}
 */
async function findAll(page = 1, limit = 20) {
  const safePage  = Math.max(1, parseInt(page, 10)  || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset    = (safePage - 1) * safeLimit;

  const countSql = 'SELECT COUNT(*)::int AS total FROM contacts';
  const dataSql  = `
    SELECT id, name, email, subject, message, lang, created_at
    FROM contacts
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const [countResult, dataResult] = await Promise.all([
    db.query(countSql, []),
    db.query(dataSql, [safeLimit, offset]),
  ]);

  return {
    data:  dataResult.rows,
    total: countResult.rows[0].total,
    page:  safePage,
    limit: safeLimit,
  };
}

module.exports = { create, findAll };

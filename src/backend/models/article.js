/**
 * Modèle Article — Accès à la base de données.
 * Toutes les requêtes sont paramétrées ($1, $2, …) pour prévenir les injections SQL.
 */
'use strict';

const db = require('../config/database');

/**
 * Construit la clause WHERE et les paramètres associés selon les filtres.
 * @param {object} filters - { lang, category, published }
 * @param {number} startIndex - Index de départ des paramètres ($n)
 * @returns {{ clauses: string[], params: Array }}
 */
function buildWhereFragments(filters, startIndex = 1) {
  const clauses = [];
  const params  = [];
  let   idx     = startIndex;

  if (filters.published !== undefined) {
    clauses.push(`published = $${idx++}`);
    params.push(filters.published);
  }

  if (filters.category) {
    clauses.push(`LOWER(category) = LOWER($${idx++})`);
    params.push(filters.category);
  }

  return { clauses, params, nextIdx: idx };
}

/**
 * Récupère une liste paginée d'articles avec filtres optionnels.
 * @param {object} options
 * @param {number}  options.page      - Numéro de page (1-based)
 * @param {number}  options.limit     - Nombre de résultats par page
 * @param {string}  [options.lang]    - 'fr' ou 'en' (non filtrant, utile pour le ORDER)
 * @param {string}  [options.category]- Catégorie à filtrer
 * @param {boolean} [options.published]- Filtrer sur published
 * @returns {Promise<Array>}
 */
async function findAll({ page = 1, limit = 10, lang = 'fr', category, published } = {}) {
  const { clauses, params, nextIdx } = buildWhereFragments(
    { category, published },
    1
  );

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const offset = (page - 1) * limit;
  params.push(limit);    // $nextIdx
  params.push(offset);   // $nextIdx + 1

  const sql = `
    SELECT
      id, slug,
      title_fr, title_en,
      excerpt_fr, excerpt_en,
      category, published,
      created_at, updated_at
    FROM articles
    ${where}
    ORDER BY created_at DESC
    LIMIT $${nextIdx} OFFSET $${nextIdx + 1}
  `;

  const result = await db.query(sql, params);
  return result.rows;
}

/**
 * Compte le nombre total d'articles correspondant aux filtres.
 * @param {object} filters - { category, published }
 * @returns {Promise<number>}
 */
async function count({ category, published } = {}) {
  const { clauses, params } = buildWhereFragments({ category, published }, 1);
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const sql = `SELECT COUNT(*) AS total FROM articles ${where}`;
  const result = await db.query(sql, params);
  return parseInt(result.rows[0].total, 10);
}

/**
 * Récupère un article complet par son slug (content inclus).
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
async function findBySlug(slug) {
  const sql = `
    SELECT
      id, slug,
      title_fr, title_en,
      content_fr, content_en,
      excerpt_fr, excerpt_en,
      category, published,
      created_at, updated_at
    FROM articles
    WHERE slug = $1
  `;
  const result = await db.query(sql, [slug]);
  return result.rows[0] || null;
}

/**
 * Crée un nouvel article.
 * @param {object} articleData
 * @param {string}  articleData.slug
 * @param {string}  articleData.title_fr
 * @param {string}  [articleData.title_en]
 * @param {string}  articleData.content_fr
 * @param {string}  [articleData.content_en]
 * @param {string}  [articleData.excerpt_fr]
 * @param {string}  [articleData.excerpt_en]
 * @param {string}  [articleData.category]
 * @param {boolean} [articleData.published]
 * @returns {Promise<object>} Article créé
 */
async function create(articleData) {
  const {
    slug,
    title_fr,
    title_en   = null,
    content_fr,
    content_en = null,
    excerpt_fr = null,
    excerpt_en = null,
    category   = null,
    published  = false,
  } = articleData;

  const sql = `
    INSERT INTO articles
      (slug, title_fr, title_en, content_fr, content_en, excerpt_fr, excerpt_en, category, published)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING
      id, slug, title_fr, title_en, excerpt_fr, excerpt_en, category, published, created_at, updated_at
  `;

  const result = await db.query(sql, [
    slug, title_fr, title_en, content_fr, content_en,
    excerpt_fr, excerpt_en, category, published,
  ]);

  return result.rows[0];
}

/**
 * Met à jour un article existant par son id.
 * Seuls les champs fournis sont mis à jour ; updated_at est toujours rafraîchi.
 * @param {number} id
 * @param {object} articleData - Champs à mettre à jour
 * @returns {Promise<object|null>} Article mis à jour ou null si id inconnu
 */
async function update(id, articleData) {
  const ALLOWED_FIELDS = [
    'slug', 'title_fr', 'title_en',
    'content_fr', 'content_en',
    'excerpt_fr', 'excerpt_en',
    'category', 'published',
  ];

  const setClauses = [];
  const params     = [];
  let   idx        = 1;

  for (const field of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(articleData, field)) {
      setClauses.push(`${field} = $${idx++}`);
      params.push(articleData[field]);
    }
  }

  if (setClauses.length === 0) {
    // Aucun champ à mettre à jour : retourner l'article existant
    return findBySlug(id); // won't be called this way — handled in controller
  }

  // Toujours mettre à jour updated_at
  setClauses.push(`updated_at = NOW()`);

  params.push(id); // paramètre pour WHERE id = $n

  const sql = `
    UPDATE articles
    SET ${setClauses.join(', ')}
    WHERE id = $${idx}
    RETURNING
      id, slug, title_fr, title_en, excerpt_fr, excerpt_en, category, published, created_at, updated_at
  `;

  const result = await db.query(sql, params);
  return result.rows[0] || null;
}

module.exports = { findAll, findBySlug, create, update, count };

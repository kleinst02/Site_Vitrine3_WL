/**
 * Modèle d'accès aux données pour la table `profile`.
 * La table contient une seule ligne (profil unique du consultant).
 * Toutes les requêtes sont paramétrées ($1, $2, …) pour prévenir les injections SQL.
 */
'use strict';

const db = require('../config/database');

/**
 * Récupère le profil unique du consultant.
 *
 * @returns {Promise<object|null>} La ligne profil ou null si absente
 */
async function findOne() {
  const sql = `
    SELECT
      id,
      name,
      title_fr,
      title_en,
      bio_fr,
      bio_en,
      skills,
      experiences,
      education,
      contact_email,
      linkedin_url,
      github_url,
      updated_at
    FROM profile
    ORDER BY id ASC
    LIMIT 1
  `;

  const result = await db.query(sql, []);
  return result.rows[0] || null;
}

/**
 * Met à jour le profil du consultant (UPDATE partiel via COALESCE).
 * Accepte un sous-ensemble de champs — seuls les champs fournis sont modifiés.
 * updated_at est toujours mis à jour (invalidation du cache PDF).
 *
 * @param {object} data - Champs à mettre à jour
 * @param {string}  [data.name]
 * @param {string}  [data.title_fr]
 * @param {string}  [data.title_en]
 * @param {string}  [data.bio_fr]
 * @param {string}  [data.bio_en]
 * @param {Array}   [data.skills]       - Tableau JSONB
 * @param {Array}   [data.experiences]  - Tableau JSONB
 * @param {Array}   [data.education]    - Tableau JSONB
 * @param {string}  [data.contact_email]
 * @param {string}  [data.linkedin_url]
 * @param {string}  [data.github_url]
 * @returns {Promise<object|null>} La ligne mise à jour ou null si aucun profil
 */
async function update(data) {
  const {
    name,
    title_fr,
    title_en,
    bio_fr,
    bio_en,
    skills,
    experiences,
    education,
    contact_email,
    linkedin_url,
    github_url,
  } = data;

  // Construire la requête dynamiquement pour ne mettre à jour que les champs fournis
  // updated_at est toujours rafraîchi pour invalider le cache PDF
  const sql = `
    UPDATE profile
    SET
      name           = COALESCE($1, name),
      title_fr       = COALESCE($2, title_fr),
      title_en       = COALESCE($3, title_en),
      bio_fr         = COALESCE($4, bio_fr),
      bio_en         = COALESCE($5, bio_en),
      skills         = COALESCE($6::jsonb, skills),
      experiences    = COALESCE($7::jsonb, experiences),
      education      = COALESCE($8::jsonb, education),
      contact_email  = COALESCE($9, contact_email),
      linkedin_url   = COALESCE($10, linkedin_url),
      github_url     = COALESCE($11, github_url),
      updated_at     = NOW()
    WHERE id = (SELECT id FROM profile ORDER BY id ASC LIMIT 1)
    RETURNING
      id, name, title_fr, title_en, bio_fr, bio_en,
      skills, experiences, education,
      contact_email, linkedin_url, github_url, updated_at
  `;

  const params = [
    name           !== undefined ? name           : null,
    title_fr       !== undefined ? title_fr       : null,
    title_en       !== undefined ? title_en       : null,
    bio_fr         !== undefined ? bio_fr         : null,
    bio_en         !== undefined ? bio_en         : null,
    skills         !== undefined ? JSON.stringify(skills)      : null,
    experiences    !== undefined ? JSON.stringify(experiences) : null,
    education      !== undefined ? JSON.stringify(education)   : null,
    contact_email  !== undefined ? contact_email  : null,
    linkedin_url   !== undefined ? linkedin_url   : null,
    github_url     !== undefined ? github_url     : null,
  ];

  const result = await db.query(sql, params);
  return result.rows[0] || null;
}

module.exports = { findOne, update };

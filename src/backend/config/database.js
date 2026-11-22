/**
 * Configuration du pool de connexions PostgreSQL.
 * Toutes les valeurs sensibles proviennent exclusivement des variables d'environnement.
 */
'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.PG_HOST     || 'localhost',
  port:     parseInt(process.env.PG_PORT || '5432', 10),
  database: process.env.PG_DATABASE || 'consultant_db',
  user:     process.env.PG_USER,
  password: process.env.PG_PASSWORD,

  // Taille du pool : adapté à une charge modérée (site vitrine)
  max:             10,   // connexions simultanées max
  idleTimeoutMillis: 30000,  // fermer une connexion inactive après 30 s
  connectionTimeoutMillis: 5000, // délai max pour obtenir une connexion
});

// Vérification de la connexion au démarrage (non bloquante)
pool.on('connect', () => {
  // Connexion établie — aucun log verbeux en production
});

pool.on('error', (err) => {
  console.error('[DB] Erreur inattendue sur un client inactif :', err.message);
});

/**
 * Exécute une requête paramétrée.
 * @param {string} text  - Requête SQL avec placeholders $1, $2, ...
 * @param {Array}  params - Valeurs des paramètres
 * @returns {Promise<pg.QueryResult>}
 */
async function query(text, params) {
  return pool.query(text, params);
}

/**
 * Obtient un client dédié pour les transactions.
 * L'appelant est responsable d'appeler client.release().
 * @returns {Promise<pg.PoolClient>}
 */
async function getClient() {
  return pool.connect();
}

module.exports = { pool, query, getClient };

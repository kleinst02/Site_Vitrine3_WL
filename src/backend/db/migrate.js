/**
 * Script de migration SQL.
 * Exécute, dans l'ordre numérique, tous les fichiers .sql présents dans
 * le répertoire ./migrations/ qui n'ont pas encore été appliqués.
 *
 * Usage : node db/migrate.js
 */
'use strict';

// Chargement des variables d'environnement depuis .env situé à la racine du projet
require('dotenv').config({ path: require('path').resolve(__dirname, '../../..', '.env') });

const fs   = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Pool dédié au script (connexion unique suffisante)
const pool = new Pool({
  host:     process.env.PG_HOST     || 'localhost',
  port:     parseInt(process.env.PG_PORT || '5432', 10),
  database: process.env.PG_DATABASE || 'consultant_db',
  user:     process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  connectionTimeoutMillis: 10000,
});

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/**
 * Crée la table de suivi des migrations si elle n'existe pas.
 */
async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         SERIAL      PRIMARY KEY,
      filename   VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP   NOT NULL DEFAULT NOW()
    )
  `);
}

/**
 * Retourne la liste des migrations déjà appliquées.
 */
async function getAppliedMigrations(client) {
  const result = await client.query(
    'SELECT filename FROM schema_migrations ORDER BY filename'
  );
  return new Set(result.rows.map((r) => r.filename));
}

/**
 * Lit et trie les fichiers .sql du répertoire migrations.
 */
function getMigrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort(); // tri lexicographique sur le préfixe numérique
}

/**
 * Exécute le script de migration dans une transaction.
 */
async function applyMigration(client, filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filepath, 'utf8');

  console.log(`  [+] Application de ${filename}...`);
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query(
      'INSERT INTO schema_migrations (filename) VALUES ($1)',
      [filename]
    );
    await client.query('COMMIT');
    console.log(`  [OK] ${filename} appliquée.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw new Error(`Échec de la migration ${filename} : ${err.message}`);
  }
}

async function main() {
  console.log('=== Démarrage des migrations ===');

  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);
    const files   = getMigrationFiles();

    const pending = files.filter((f) => !applied.has(f));

    if (pending.length === 0) {
      console.log('Aucune migration en attente. Base de données à jour.');
    } else {
      console.log(`${pending.length} migration(s) à appliquer.`);
      for (const file of pending) {
        await applyMigration(client, file);
      }
      console.log('=== Toutes les migrations ont été appliquées. ===');
    }
  } catch (err) {
    console.error('[ERREUR]', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();

/**
 * Tests unitaires — config/database.js
 *
 * Valide la configuration du pool sans connexion réelle à PostgreSQL.
 * Lancement : node tests/database.test.js
 */
'use strict';

const assert = require('assert');

console.log('\n=== Tests config/database.js ===\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
    failed++;
  }
}

// --- Module chargeable ---
test('Le module database.js est importable', () => {
  // Définir les variables minimales pour éviter une connexion réelle
  process.env.PG_HOST     = 'localhost';
  process.env.PG_PORT     = '5432';
  process.env.PG_DATABASE = 'consultant_test';
  process.env.PG_USER     = 'test_user';
  process.env.PG_PASSWORD = 'test_pass';

  const db = require('../config/database');
  assert.ok(db, 'Le module doit être défini');
});

test('Le module exporte pool, query et getClient', () => {
  const db = require('../config/database');
  assert.ok(typeof db.pool   === 'object',   'pool doit être un objet');
  assert.ok(typeof db.query  === 'function',  'query doit être une fonction');
  assert.ok(typeof db.getClient === 'function', 'getClient doit être une fonction');
});

test('La fonction query est une fonction asynchrone', () => {
  const db = require('../config/database');
  const result = db.query('SELECT 1', []);
  // Sans connexion réelle, elle retourne une Promise
  assert.ok(result instanceof Promise, 'query() doit retourner une Promise');
  // On supprime le rejet non géré pour le test
  result.catch(() => {});
});

test('La fonction getClient est une fonction asynchrone', () => {
  const db = require('../config/database');
  const result = db.getClient();
  assert.ok(result instanceof Promise, 'getClient() doit retourner une Promise');
  result.catch(() => {});
});

// --- Résumé ---
console.log(`\n=== Résultat : ${passed} réussi(s), ${failed} échoué(s) ===\n`);
process.exit(failed > 0 ? 1 : 0);

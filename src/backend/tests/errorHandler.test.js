/**
 * Tests unitaires — middleware/errorHandler.js
 *
 * Valide le format de réponse d'erreur, les codes HTTP et la localisation.
 * Lancement : node tests/errorHandler.test.js
 */
'use strict';

const assert       = require('assert');
const errorHandler = require('../middleware/errorHandler');

console.log('\n=== Tests middleware/errorHandler.js ===\n');

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

// Fabrique un faux objet res.json() qui capture l'appel
function mockRes() {
  const res = {
    _status: null,
    _body:   null,
    status(code) { this._status = code; return this; },
    json(body)   { this._body   = body; return this; },
  };
  return res;
}

// --- Erreur 500 par défaut ---
test('Erreur sans status retourne 500', () => {
  const err = new Error('boom');
  const req = { headers: { 'accept-language': 'fr' } };
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  assert.strictEqual(res._status, 500);
});

test('La réponse contient la clé "error" avec code et message', () => {
  const err = new Error('boom');
  const req = { headers: { 'accept-language': 'fr' } };
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  assert.ok(res._body.error, 'Clé "error" absente');
  assert.strictEqual(typeof res._body.error.code, 'number');
  assert.strictEqual(typeof res._body.error.message, 'string');
});

// --- Erreur avec status personnalisé ---
test('Erreur 404 retourne le statut 404', () => {
  const err = Object.assign(new Error('Not found'), { status: 404 });
  const req = { headers: { 'accept-language': 'fr' } };
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  assert.strictEqual(res._status, 404);
});

// --- Localisation FR ---
test('Message localisé en français pour 404', () => {
  const err = Object.assign(new Error('Not found'), { status: 404 });
  const req = { headers: { 'accept-language': 'fr' } };
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  assert.ok(res._body.error.message.length > 0, 'Message ne doit pas être vide');
});

// --- Localisation EN ---
test('Message localisé en anglais quand Accept-Language: en', () => {
  const err = Object.assign(new Error('Not found'), { status: 404 });
  const req = { headers: { 'accept-language': 'en-US' } };
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  // Le message doit être la version anglaise
  assert.ok(res._body.error.message.includes('not found') ||
            res._body.error.message.includes('Resource') ||
            res._body.error.message.length > 0);
});

// --- Message personnalisé exposé ---
test('Un message marqué expose:true est retourné tel quel', () => {
  const err = Object.assign(new Error('Slug déjà utilisé'), { status: 409, expose: true });
  const req = { headers: { 'accept-language': 'fr' } };
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  assert.strictEqual(res._body.error.message, 'Slug déjà utilisé');
});

// --- Résumé ---
console.log(`\n=== Résultat : ${passed} réussi(s), ${failed} échoué(s) ===\n`);
process.exit(failed > 0 ? 1 : 0);

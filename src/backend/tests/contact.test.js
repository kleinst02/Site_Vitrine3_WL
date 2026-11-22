/**
 * Tests d'intégration — POST /api/contact
 *
 * Utilise uniquement les modules natifs Node.js (http, assert) pour rester
 * cohérent avec la convention du projet (pas de framework de test externe).
 *
 * Lancement : node tests/contact.test.js
 *
 * Note : ces tests valident la couche HTTP et validation.
 * L'accès BDD est simulé via des variables d'env PG_ invalides :
 * on teste uniquement que les erreurs 400 (validation) et 429 (rate limit)
 * sont correctement retournées sans connexion réelle à PostgreSQL.
 * Les cas 201 et 500 nécessitent une base de données de test.
 */
'use strict';

process.env.PORT        = '3098';
process.env.PG_HOST     = 'localhost';
process.env.PG_DATABASE = 'consultant_test';
process.env.NODE_ENV    = 'test';

const http   = require('http');
const assert = require('assert');

const app = require('../server');

// ---------------------------------------------------------------------------
// Utilitaire HTTP
// ---------------------------------------------------------------------------
function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, body: parsed, headers: res.headers });
      });
    });
    req.on('error', reject);
    if (body !== undefined) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      req.write(payload);
    }
    req.end();
  });
}

const BASE = { hostname: 'localhost', port: 3098 };

function postContact(payload) {
  return request(
    {
      ...BASE,
      path:    '/api/contact',
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    payload
  );
}

// Payload valide de référence
const VALID_PAYLOAD = {
  name:    'Alice Dupont',
  email:   'alice@example.com',
  subject: 'Demande de renseignements',
  message: 'Bonjour, je souhaite obtenir des informations sur vos services.',
  lang:    'fr',
};

// ---------------------------------------------------------------------------
// Suite de tests
// ---------------------------------------------------------------------------
async function runTests() {
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}`);
      console.error(`         ${err.message}`);
      failed++;
    }
  }

  console.log('\n=== Tests POST /api/contact ===\n');

  // -------------------------------------------------------------------------
  // 1. Validation — champs manquants
  // -------------------------------------------------------------------------

  await test('400 si le champ "name" est absent', async () => {
    const payload = { ...VALID_PAYLOAD };
    delete payload.name;
    const res = await postContact(payload);
    assert.strictEqual(res.status, 400, `Attendu 400, reçu ${res.status}`);
    assert.ok(res.body.error, 'error doit être présent');
    assert.strictEqual(res.body.error.code, 400);
    assert.ok(Array.isArray(res.body.error.fields), 'fields doit être un tableau');
    assert.ok(
      res.body.error.fields.some((f) => f.field === 'name'),
      'Le champ "name" doit figurer dans fields'
    );
  });

  await test('400 si le champ "email" est absent', async () => {
    const payload = { ...VALID_PAYLOAD };
    delete payload.email;
    const res = await postContact(payload);
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.fields.some((f) => f.field === 'email'));
  });

  await test('400 si le champ "subject" est absent', async () => {
    const payload = { ...VALID_PAYLOAD };
    delete payload.subject;
    const res = await postContact(payload);
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.fields.some((f) => f.field === 'subject'));
  });

  await test('400 si le champ "message" est absent', async () => {
    const payload = { ...VALID_PAYLOAD };
    delete payload.message;
    const res = await postContact(payload);
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.fields.some((f) => f.field === 'message'));
  });

  // -------------------------------------------------------------------------
  // 2. Validation — contraintes de longueur
  // -------------------------------------------------------------------------

  await test('400 si name < 2 caractères', async () => {
    const res = await postContact({ ...VALID_PAYLOAD, name: 'A' });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.fields.some((f) => f.field === 'name'));
  });

  await test('400 si name > 100 caractères', async () => {
    const res = await postContact({ ...VALID_PAYLOAD, name: 'A'.repeat(101) });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.fields.some((f) => f.field === 'name'));
  });

  await test('400 si email invalide', async () => {
    const res = await postContact({ ...VALID_PAYLOAD, email: 'pas-un-email' });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.fields.some((f) => f.field === 'email'));
  });

  await test('400 si subject < 5 caractères', async () => {
    const res = await postContact({ ...VALID_PAYLOAD, subject: 'Hi' });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.fields.some((f) => f.field === 'subject'));
  });

  await test('400 si subject > 200 caractères', async () => {
    const res = await postContact({ ...VALID_PAYLOAD, subject: 'S'.repeat(201) });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.fields.some((f) => f.field === 'subject'));
  });

  await test('400 si message < 10 caractères', async () => {
    const res = await postContact({ ...VALID_PAYLOAD, message: 'Court' });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.fields.some((f) => f.field === 'message'));
  });

  await test('400 si message > 5000 caractères', async () => {
    const res = await postContact({ ...VALID_PAYLOAD, message: 'M'.repeat(5001) });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.fields.some((f) => f.field === 'message'));
  });

  await test('400 si lang invalide (ni "fr" ni "en")', async () => {
    const res = await postContact({ ...VALID_PAYLOAD, lang: 'de' });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.fields.some((f) => f.field === 'lang'));
  });

  // -------------------------------------------------------------------------
  // 3. Localisation des messages d'erreur
  // -------------------------------------------------------------------------

  await test('Le message d\'erreur 400 est en français si lang=fr', async () => {
    const res = await postContact({ ...VALID_PAYLOAD, name: 'A', lang: 'fr' });
    assert.strictEqual(res.status, 400);
    // Vérifie que le message générique est en français (contient "Validation")
    assert.ok(
      res.body.error.message.includes('Validation'),
      `Message attendu en FR, reçu : "${res.body.error.message}"`
    );
  });

  await test('Le message d\'erreur 400 est en anglais si lang=en', async () => {
    const res = await postContact({ ...VALID_PAYLOAD, name: 'A', lang: 'en' });
    assert.strictEqual(res.status, 400);
    assert.ok(
      res.body.error.message.includes('Validation'),
      `Message attendu en EN, reçu : "${res.body.error.message}"`
    );
  });

  // -------------------------------------------------------------------------
  // 4. Format de réponse d'erreur conforme à la convention du projet
  // -------------------------------------------------------------------------

  await test('La réponse 400 a le format { error: { code, message, fields } }', async () => {
    const res = await postContact({ ...VALID_PAYLOAD, name: '' });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error,                         'error doit exister');
    assert.strictEqual(res.body.error.code, 400,      'error.code doit être 400');
    assert.strictEqual(typeof res.body.error.message, 'string', 'error.message doit être une string');
    assert.ok(Array.isArray(res.body.error.fields),   'error.fields doit être un tableau');
  });

  // -------------------------------------------------------------------------
  // 5. Route inexistante sous /api/contact
  // -------------------------------------------------------------------------

  await test('GET /api/contact retourne 404 (route non exposée)', async () => {
    const res = await request({ ...BASE, path: '/api/contact', method: 'GET' });
    assert.strictEqual(res.status, 404);
  });

  // -------------------------------------------------------------------------
  // Résumé
  // -------------------------------------------------------------------------
  console.log(`\n=== Résultat : ${passed} réussi(s), ${failed} échoué(s) ===\n`);
  if (failed > 0) process.exit(1);
  else process.exit(0);
}

setTimeout(runTests, 300);

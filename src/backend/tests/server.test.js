/**
 * Tests d'intégration — server.js
 *
 * Ces tests utilisent uniquement le module natif Node.js `http` et `assert`
 * pour éviter toute dépendance de test externe à ce stade du projet.
 * Ils valident la structure HTTP de base sans connexion à une base de données.
 *
 * Lancement : node tests/server.test.js
 */
'use strict';

// Chargement des variables d'environnement de test
process.env.PORT = '3099'; // port isolé pour les tests
process.env.PG_HOST = 'localhost';
process.env.PG_DATABASE = 'consultant_test';

const http   = require('http');
const assert = require('assert');

// Démarrage du serveur Express en mode test
const app    = require('../server');

// ------------------------------------------------------------------
// Utilitaire : effectue une requête HTTP et retourne { status, body }
// ------------------------------------------------------------------
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
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

const BASE = { hostname: 'localhost', port: 3099 };

// ------------------------------------------------------------------
// Suite de tests
// ------------------------------------------------------------------
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

  console.log('\n=== Tests server.js ===\n');

  // --- Health check ---
  await test('GET /api/health retourne 200', async () => {
    const res = await request({ ...BASE, path: '/api/health', method: 'GET' });
    assert.strictEqual(res.status, 200, `Status attendu 200, reçu ${res.status}`);
  });

  await test('GET /api/health retourne { status: "ok" }', async () => {
    const res = await request({ ...BASE, path: '/api/health', method: 'GET' });
    assert.strictEqual(res.body.status, 'ok');
    assert.ok(res.body.timestamp, 'timestamp doit être présent');
  });

  // --- 404 sur route inexistante ---
  await test('GET /api/inexistant retourne 404', async () => {
    const res = await request({ ...BASE, path: '/api/inexistant', method: 'GET' });
    assert.strictEqual(res.status, 404);
  });

  await test('GET /api/inexistant retourne le format d\'erreur standard', async () => {
    const res = await request({ ...BASE, path: '/api/inexistant', method: 'GET' });
    assert.ok(res.body.error, 'La réponse doit avoir une clé "error"');
    assert.strictEqual(typeof res.body.error.code, 'number');
    assert.strictEqual(typeof res.body.error.message, 'string');
  });

  // --- Headers de sécurité (Helmet) ---
  await test('GET /api/health retourne l\'en-tête X-Content-Type-Options', async () => {
    const res = await request({ ...BASE, path: '/api/health', method: 'GET' });
    assert.ok(
      res.headers['x-content-type-options'],
      'Header x-content-type-options absent (Helmet non configuré ?)'
    );
  });

  // --- Parsing JSON ---
  await test('POST avec JSON invalide retourne 400', async () => {
    const res = await request(
      {
        ...BASE,
        path: '/api/health',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      '{invalid json'
    );
    // Express retourne 400 sur un corps JSON malformé
    assert.strictEqual(res.status, 400, `Status attendu 400, reçu ${res.status}`);
  });

  // --- Résumé ---
  console.log(`\n=== Résultat : ${passed} réussi(s), ${failed} échoué(s) ===\n`);
  if (failed > 0) process.exit(1);
  else process.exit(0);
}

// Laisser le serveur démarrer avant de lancer les tests
setTimeout(runTests, 300);

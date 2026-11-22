/**
 * Tests d'intégration — routes /api/profile et /api/cv
 *
 * Stratégie : on mock profileModel pour ne pas requérir une BDD réelle.
 * Les tests valident :
 *   - Codes HTTP corrects
 *   - Format des réponses (data, error)
 *   - Localisation FR / EN
 *   - Headers PDF
 *   - Cas d'erreurs (404, 400 lang invalide)
 *
 * Lancement : node tests/profile.test.js
 */
'use strict';

process.env.PORT        = '3098';
process.env.PG_HOST     = 'localhost';
process.env.PG_DATABASE = 'consultant_test';
process.env.NODE_ENV    = 'test';

const http   = require('http');
const assert = require('assert');

// -------------------------------------------------------
// Mock du modèle profile avant le require de l'app
// -------------------------------------------------------
const profileModel = require('../models/profile');

// Profil de test
const TEST_PROFILE = {
  id:            1,
  name:          'Jean Dupont',
  title_fr:      'Consultant IT Senior',
  title_en:      'Senior IT Consultant',
  bio_fr:        'Consultant IT avec 10 ans d\'expérience.',
  bio_en:        'IT consultant with 10 years of experience.',
  skills:        [
    { category: 'Backend', items: ['Node.js', 'PostgreSQL'] },
    { category: 'Frontend', items: ['React', 'TypeScript'] },
  ],
  experiences:   [
    {
      company:        'Acme Corp',
      role_fr:        'Architecte Solutions',
      role_en:        'Solutions Architect',
      period:         '2020 — présent',
      description_fr: 'Conception d\'architectures cloud.',
      description_en: 'Cloud architecture design.',
    },
  ],
  education:     [
    {
      school:    'École Polytechnique',
      degree_fr: 'Master Informatique',
      degree_en: 'Master of Computer Science',
      year:      '2014',
    },
  ],
  contact_email: 'jean.dupont@example.com',
  linkedin_url:  'https://linkedin.com/in/jeandupont',
  github_url:    'https://github.com/jeandupont',
  updated_at:    new Date('2026-01-01T00:00:00.000Z'),
};

// Remplacer les fonctions du modèle par des stubs
let mockProfile = TEST_PROFILE;
const originalFindOne = profileModel.findOne;
const originalUpdate  = profileModel.update;

profileModel.findOne = async () => mockProfile;
profileModel.update  = async (data) => {
  if (!mockProfile) return null;
  mockProfile = { ...mockProfile, ...data, updated_at: new Date() };
  return mockProfile;
};

// -------------------------------------------------------
// Chargement de l'app après le mock
// -------------------------------------------------------
const app = require('../server');

// -------------------------------------------------------
// Utilitaire HTTP
// -------------------------------------------------------
function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const rawBuffer = Buffer.concat(chunks);
        let parsed;
        const ct = res.headers['content-type'] || '';
        if (ct.includes('application/json')) {
          try { parsed = JSON.parse(rawBuffer.toString()); } catch { parsed = rawBuffer; }
        } else {
          parsed = rawBuffer; // Buffer brut pour le PDF
        }
        resolve({ status: res.statusCode, body: parsed, headers: res.headers });
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

const BASE = { hostname: 'localhost', port: 3098 };

// -------------------------------------------------------
// Suite de tests
// -------------------------------------------------------
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

  console.log('\n=== Tests /api/profile & /api/cv ===\n');

  // -------------------------------------------------------
  // GET /api/profile — succès FR (par défaut)
  // -------------------------------------------------------
  await test('GET /api/profile retourne 200', async () => {
    const res = await request({ ...BASE, path: '/api/profile', method: 'GET' });
    assert.strictEqual(res.status, 200, `Attendu 200, reçu ${res.status}`);
  });

  await test('GET /api/profile retourne { data, lang }', async () => {
    const res = await request({ ...BASE, path: '/api/profile', method: 'GET' });
    assert.ok(res.body.data,  'Clé "data" manquante');
    assert.ok(res.body.lang,  'Clé "lang" manquante');
  });

  await test('GET /api/profile retourne lang=fr par défaut', async () => {
    const res = await request({ ...BASE, path: '/api/profile', method: 'GET' });
    assert.strictEqual(res.body.lang, 'fr');
  });

  await test('GET /api/profile retourne le title localisé en FR', async () => {
    const res = await request({ ...BASE, path: '/api/profile', method: 'GET' });
    assert.strictEqual(res.body.data.title, 'Consultant IT Senior');
  });

  await test('GET /api/profile retourne la bio localisée en FR', async () => {
    const res = await request({ ...BASE, path: '/api/profile', method: 'GET' });
    assert.ok(res.body.data.bio.includes('10 ans'));
  });

  // -------------------------------------------------------
  // GET /api/profile?lang=en
  // -------------------------------------------------------
  await test('GET /api/profile?lang=en retourne le title localisé en EN', async () => {
    const res = await request({ ...BASE, path: '/api/profile?lang=en', method: 'GET' });
    assert.strictEqual(res.body.data.title, 'Senior IT Consultant');
    assert.strictEqual(res.body.lang, 'en');
  });

  await test('GET /api/profile?lang=en retourne la bio localisée en EN', async () => {
    const res = await request({ ...BASE, path: '/api/profile?lang=en', method: 'GET' });
    assert.ok(res.body.data.bio.includes('10 years'));
  });

  await test('GET /api/profile?lang=en retourne les expériences localisées', async () => {
    const res = await request({ ...BASE, path: '/api/profile?lang=en', method: 'GET' });
    const exp = res.body.data.experiences[0];
    assert.strictEqual(exp.role, 'Solutions Architect');
  });

  await test('GET /api/profile?lang=fr retourne les expériences localisées', async () => {
    const res = await request({ ...BASE, path: '/api/profile?lang=fr', method: 'GET' });
    const exp = res.body.data.experiences[0];
    assert.strictEqual(exp.role, 'Architecte Solutions');
  });

  await test('GET /api/profile retourne skills, education, contact_email', async () => {
    const res = await request({ ...BASE, path: '/api/profile', method: 'GET' });
    const data = res.body.data;
    assert.ok(Array.isArray(data.skills),      'skills doit être un tableau');
    assert.ok(Array.isArray(data.education),   'education doit être un tableau');
    assert.ok(data.contact_email,              'contact_email manquant');
  });

  // -------------------------------------------------------
  // GET /api/profile — lang invalide
  // -------------------------------------------------------
  await test('GET /api/profile?lang=de retourne 400', async () => {
    const res = await request({ ...BASE, path: '/api/profile?lang=de', method: 'GET' });
    assert.strictEqual(res.status, 400, `Attendu 400, reçu ${res.status}`);
    assert.ok(res.body.error, 'Clé "error" manquante');
  });

  // -------------------------------------------------------
  // GET /api/profile — profil absent (404)
  // -------------------------------------------------------
  await test('GET /api/profile retourne 404 quand profil absent', async () => {
    const saved = mockProfile;
    mockProfile = null;
    const res = await request({ ...BASE, path: '/api/profile', method: 'GET' });
    mockProfile = saved;
    assert.strictEqual(res.status, 404, `Attendu 404, reçu ${res.status}`);
    assert.ok(res.body.error, 'Clé "error" manquante');
    assert.strictEqual(res.body.error.code, 404);
  });

  // -------------------------------------------------------
  // GET /api/cv — génération PDF
  // -------------------------------------------------------
  await test('GET /api/cv retourne 200', async () => {
    const res = await request({ ...BASE, path: '/api/cv', method: 'GET' });
    assert.strictEqual(res.status, 200, `Attendu 200, reçu ${res.status}`);
  });

  await test('GET /api/cv retourne Content-Type application/pdf', async () => {
    const res = await request({ ...BASE, path: '/api/cv', method: 'GET' });
    const ct = res.headers['content-type'] || '';
    assert.ok(ct.includes('application/pdf'), `Content-Type inattendu : ${ct}`);
  });

  await test('GET /api/cv retourne Content-Disposition attachment', async () => {
    const res = await request({ ...BASE, path: '/api/cv', method: 'GET' });
    const cd = res.headers['content-disposition'] || '';
    assert.ok(cd.includes('attachment'), `Content-Disposition inattendu : ${cd}`);
    assert.ok(cd.includes('.pdf'),       `Nom de fichier .pdf manquant : ${cd}`);
  });

  await test('GET /api/cv retourne un buffer non vide', async () => {
    const res = await request({ ...BASE, path: '/api/cv', method: 'GET' });
    assert.ok(Buffer.isBuffer(res.body), 'Le corps doit être un Buffer');
    assert.ok(res.body.length > 0, 'Le buffer PDF est vide');
  });

  await test('GET /api/cv?lang=en retourne filename avec "Resume" et "en"', async () => {
    const res = await request({ ...BASE, path: '/api/cv?lang=en', method: 'GET' });
    const cd = res.headers['content-disposition'] || '';
    assert.ok(cd.includes('Resume'), `Préfixe "Resume" manquant : ${cd}`);
    assert.ok(cd.includes('-en.pdf'), `Suffixe "-en.pdf" manquant : ${cd}`);
  });

  await test('GET /api/cv?lang=fr retourne filename avec "CV" et "fr"', async () => {
    const res = await request({ ...BASE, path: '/api/cv?lang=fr', method: 'GET' });
    const cd = res.headers['content-disposition'] || '';
    assert.ok(cd.includes('CV'),     `Préfixe "CV" manquant : ${cd}`);
    assert.ok(cd.includes('-fr.pdf'), `Suffixe "-fr.pdf" manquant : ${cd}`);
  });

  await test('GET /api/cv?lang=de retourne 400', async () => {
    const res = await request({ ...BASE, path: '/api/cv?lang=de', method: 'GET' });
    assert.strictEqual(res.status, 400, `Attendu 400, reçu ${res.status}`);
  });

  await test('GET /api/cv retourne 404 quand profil absent', async () => {
    const saved = mockProfile;
    mockProfile = null;
    const res = await request({ ...BASE, path: '/api/cv', method: 'GET' });
    mockProfile = saved;
    assert.strictEqual(res.status, 404, `Attendu 404, reçu ${res.status}`);
  });

  // -------------------------------------------------------
  // Cache PDF : second appel = X-Cache: HIT
  // -------------------------------------------------------
  await test('GET /api/cv — second appel retourne X-Cache: HIT', async () => {
    // Premier appel (MISS)
    await request({ ...BASE, path: '/api/cv?lang=fr', method: 'GET' });
    // Second appel (HIT attendu)
    const res = await request({ ...BASE, path: '/api/cv?lang=fr', method: 'GET' });
    const xCache = res.headers['x-cache'] || '';
    assert.strictEqual(xCache, 'HIT', `X-Cache attendu "HIT", reçu "${xCache}"`);
  });

  // -------------------------------------------------------
  // PUT /api/profile — protégé par auth
  // -------------------------------------------------------
  await test('PUT /api/profile sans auth retourne 401 ou 403', async () => {
    const res = await request(
      {
        ...BASE,
        path:    '/api/profile',
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
      },
      JSON.stringify({ name: 'Test' })
    );
    assert.ok([401, 403].includes(res.status), `Attendu 401 ou 403, reçu ${res.status}`);
  });

  // -------------------------------------------------------
  // Résumé
  // -------------------------------------------------------
  console.log(`\n=== Résultat : ${passed} réussi(s), ${failed} échoué(s) ===\n`);

  // Restaurer les mocks
  profileModel.findOne = originalFindOne;
  profileModel.update  = originalUpdate;

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

// Laisser le serveur démarrer
setTimeout(runTests, 300);

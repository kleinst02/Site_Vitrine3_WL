/**
 * Tests unitaires — i18n/index.js
 *
 * Valide : t(key, lang), normalizeLang(), fallback FR, clé manquante.
 * Lancement : node tests/i18n.test.js
 */
'use strict';

const assert = require('assert');
const { t, normalizeLang, SUPPORTED_LANGS } = require('../i18n/index');

async function runTests() {
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

  console.log('\n=== Tests i18n ===\n');

  // --- t() en FR ---
  test('t("errors.404", "fr") retourne la traduction française', () => {
    assert.strictEqual(t('errors.404', 'fr'), 'Ressource introuvable.');
  });

  test('t("errors.500", "fr") retourne la traduction française', () => {
    assert.strictEqual(t('errors.500', 'fr'), 'Erreur interne du serveur.');
  });

  test('t("cv.about", "fr") retourne "À propos"', () => {
    assert.strictEqual(t('cv.about', 'fr'), 'À propos');
  });

  test('t("cv.skills", "fr") retourne "Compétences"', () => {
    assert.strictEqual(t('cv.skills', 'fr'), 'Compétences');
  });

  // --- t() en EN ---
  test('t("errors.404", "en") retourne la traduction anglaise', () => {
    assert.strictEqual(t('errors.404', 'en'), 'Resource not found.');
  });

  test('t("cv.about", "en") retourne "About"', () => {
    assert.strictEqual(t('cv.about', 'en'), 'About');
  });

  test('t("cv.filename_prefix", "en") retourne "Resume"', () => {
    assert.strictEqual(t('cv.filename_prefix', 'en'), 'Resume');
  });

  test('t("cv.filename_prefix", "fr") retourne "CV"', () => {
    assert.strictEqual(t('cv.filename_prefix', 'fr'), 'CV');
  });

  // --- Fallback sur 'fr' ---
  test('t() avec lang inconnue utilise fr comme fallback', () => {
    const result = t('errors.404', 'de');
    assert.strictEqual(result, 'Ressource introuvable.');
  });

  test('t() sans lang utilise fr comme fallback', () => {
    const result = t('errors.500', undefined);
    assert.strictEqual(result, 'Erreur interne du serveur.');
  });

  // --- Clé manquante ---
  test('t() avec clé manquante retourne la clé brute', () => {
    const result = t('inexistant.cle', 'fr');
    assert.strictEqual(result, 'inexistant.cle');
  });

  test('t() avec clé manquante en EN retourne le fallback FR si dispo', () => {
    // errors.profile_not_found est défini en FR et EN
    const result = t('errors.profile_not_found', 'en');
    assert.strictEqual(result, 'Profile not found.');
  });

  // --- normalizeLang() ---
  test('normalizeLang("fr") retourne "fr"', () => {
    assert.strictEqual(normalizeLang('fr'), 'fr');
  });

  test('normalizeLang("en") retourne "en"', () => {
    assert.strictEqual(normalizeLang('en'), 'en');
  });

  test('normalizeLang("de") retourne "fr" par défaut', () => {
    assert.strictEqual(normalizeLang('de'), 'fr');
  });

  test('normalizeLang(undefined) retourne "fr"', () => {
    assert.strictEqual(normalizeLang(undefined), 'fr');
  });

  test('normalizeLang("FR") accepte la casse insensible', () => {
    assert.strictEqual(normalizeLang('FR'), 'fr');
  });

  test('normalizeLang("EN") accepte la casse insensible', () => {
    assert.strictEqual(normalizeLang('EN'), 'en');
  });

  // --- SUPPORTED_LANGS ---
  test('SUPPORTED_LANGS contient "fr" et "en"', () => {
    assert.ok(SUPPORTED_LANGS.includes('fr'), '"fr" manquant');
    assert.ok(SUPPORTED_LANGS.includes('en'), '"en" manquant');
    assert.strictEqual(SUPPORTED_LANGS.length, 2);
  });

  // --- Clés email ---
  test('t("email.contact_notification_subject", "fr") retourne un template', () => {
    const result = t('email.contact_notification_subject', 'fr');
    assert.ok(result.includes('{{name}}'), 'Template {{name}} manquant');
  });

  test('t("email.contact_notification_subject", "en") retourne un template anglais', () => {
    const result = t('email.contact_notification_subject', 'en');
    assert.ok(result.toLowerCase().includes('contact'), 'Mot "contact" manquant');
  });

  // --- Résumé ---
  console.log(`\n=== Résultat : ${passed} réussi(s), ${failed} échoué(s) ===\n`);
  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runTests();

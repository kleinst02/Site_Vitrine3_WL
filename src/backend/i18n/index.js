/**
 * Helper i18n serveur.
 * Fournit la fonction t(key, lang) pour récupérer les traductions
 * depuis les fichiers JSON fr.json / en.json.
 * Fallback sur 'fr' si la clé est manquante en 'en'.
 */
'use strict';

const fr = require('./fr.json');
const en = require('./en.json');

const LOCALES = { fr, en };
const SUPPORTED_LANGS = ['fr', 'en'];

/**
 * Résout une clé de traduction en chemin objet imbriqué (notation pointée).
 * Exemple : "errors.404" → locales.errors["404"]
 *
 * @param {object} locale - Objet de traduction
 * @param {string} key    - Clé en notation pointée
 * @returns {string|undefined}
 */
function resolve(locale, key) {
  return key.split('.').reduce((obj, part) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, part)) {
      return obj[part];
    }
    return undefined;
  }, locale);
}

/**
 * Retourne la traduction pour la clé et la langue données.
 * - Si la langue n'est pas supportée, utilise 'fr'.
 * - Si la clé est manquante dans la langue demandée, utilise 'fr' comme fallback.
 * - Si la clé est introuvable partout, retourne la clé brute.
 *
 * @param {string} key  - Clé de traduction en notation pointée (ex: "errors.404")
 * @param {string} lang - Code de langue ("fr" ou "en")
 * @returns {string}
 */
function t(key, lang) {
  const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : 'fr';

  // Chercher dans la langue demandée
  const locale  = LOCALES[safeLang];
  let value = resolve(locale, key);

  // Fallback sur 'fr' si manquant
  if (value === undefined && safeLang !== 'fr') {
    value = resolve(LOCALES.fr, key);
  }

  // Fallback ultime : retourner la clé brute
  return typeof value === 'string' ? value : key;
}

/**
 * Normalise un paramètre lang entrant (query string, header, etc.).
 * Retourne 'fr' ou 'en', 'fr' par défaut.
 *
 * @param {string|undefined} lang
 * @returns {'fr'|'en'}
 */
function normalizeLang(lang) {
  if (typeof lang === 'string' && SUPPORTED_LANGS.includes(lang.toLowerCase().trim())) {
    return lang.toLowerCase().trim();
  }
  return 'fr';
}

module.exports = { t, normalizeLang, SUPPORTED_LANGS };

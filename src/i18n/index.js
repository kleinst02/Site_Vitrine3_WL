/**
 * Système i18n front-end.
 * Charge les traductions FR/EN et localise dynamiquement le DOM.
 */
'use strict';

var I18n = (function () {

  var translations = {};
  var currentLang = 'fr';
  var SUPPORTED = ['fr', 'en'];

  /**
   * Détecte la langue depuis l'URL (/en/...) ou le navigateur.
   */
  function detectLang() {
    var path = window.location.pathname;
    if (path.startsWith('/en/') || path === '/en') return 'en';
    // Fallback : attribut HTML
    var htmlLang = document.documentElement.lang;
    if (htmlLang && htmlLang.startsWith('en')) return 'en';
    return 'fr';
  }

  /**
   * Charge les fichiers JSON de traduction.
   */
  function loadTranslations(callback) {
    var loaded = 0;
    SUPPORTED.forEach(function (lang) {
      fetch('/src/i18n/' + lang + '.json')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          translations[lang] = data;
          loaded++;
          if (loaded === SUPPORTED.length && callback) callback();
        })
        .catch(function () {
          loaded++;
          if (loaded === SUPPORTED.length && callback) callback();
        });
    });
  }

  /**
   * Récupère une traduction par clé dotée (ex: "nav.home").
   */
  function t(key, params) {
    var keys = key.split('.');
    var value = translations[currentLang];
    for (var i = 0; i < keys.length; i++) {
      if (!value) return key;
      value = value[keys[i]];
    }
    if (typeof value !== 'string') return key;
    if (params) {
      value = value.replace(/\{(\w+)\}/g, function (_, k) {
        return params[k] != null ? params[k] : k;
      });
    }
    return value;
  }

  /**
   * Localise tous les éléments du DOM ayant [data-i18n].
   * Ex: <span data-i18n="nav.home">Accueil</span>
   *
   * Sécurité XSS : on utilise textContent par défaut.
   * Les éléments avec [data-i18n-html] sont les seuls autorisés à recevoir innerHTML
   * (uniquement pour les traductions contenant du balisage légitime, ex: heroTitle).
   */
  function localizeDOM() {
    // Éléments textuels standards : textContent uniquement
    var elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var translated = t(key);
      if (translated !== key) {
        el.textContent = translated;
      }
    });

    // Éléments avec balisage HTML légitime (marqués explicitement data-i18n-html)
    var htmlElements = document.querySelectorAll('[data-i18n-html]');
    htmlElements.forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      var translated = t(key);
      if (translated !== key) {
        el.innerHTML = translated;
      }
    });

    // Attributs : data-i18n-placeholder, data-i18n-aria-label, data-i18n-title
    ['placeholder', 'aria-label', 'title'].forEach(function (attr) {
      var attrElements = document.querySelectorAll('[data-i18n-' + attr + ']');
      attrElements.forEach(function (el) {
        var key = el.getAttribute('data-i18n-' + attr);
        var translated = t(key);
        if (translated !== key) el.setAttribute(attr, translated);
      });
    });

    // Meta tags : data-i18n-content met à jour l'attribut content (meta description, etc.)
    var metaElements = document.querySelectorAll('[data-i18n-content]');
    metaElements.forEach(function (el) {
      var key = el.getAttribute('data-i18n-content');
      var translated = t(key);
      if (translated !== key) {
        el.setAttribute('content', translated);
      }
    });

    // Mettre à jour lang sur <html> (m-10)
    document.documentElement.lang = currentLang;
  }

  /**
   * Change la langue et recharge la localisation.
   */
  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    currentLang = lang;
    document.documentElement.lang = lang;
    localizeDOM();

    // Mettre à jour l'URL
    var path = window.location.pathname;
    var routes = translations[lang] && translations[lang].routes;
    if (!routes) return;

    // Émettre un événement pour que d'autres composants réagissent
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  /**
   * Retourne la langue courante.
   */
  function getLang() {
    return currentLang;
  }

  /**
   * Retourne les routes pour la langue courante.
   */
  function getRoutes() {
    return (translations[currentLang] && translations[currentLang].routes) || {};
  }

  /**
   * Initialisation.
   */
  function init(callback) {
    currentLang = detectLang();
    loadTranslations(function () {
      localizeDOM();
      if (callback) callback();
    });
  }

  return {
    init: init,
    t: t,
    setLang: setLang,
    getLang: getLang,
    getRoutes: getRoutes,
    detectLang: detectLang,
    localizeDOM: localizeDOM
  };

})();

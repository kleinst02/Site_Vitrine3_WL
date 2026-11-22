/**
 * layout.js — Gestionnaire de layout global
 * Injecte le header (nav) et le footer persistants sur toutes les pages.
 * Initialise le système i18n et le routeur.
 *
 * Usage : <script src="/src/pages/_layout/layout.js" defer></script>
 *         (après i18n/index.js et router.js)
 */
'use strict';

var Layout = (function () {

  var headerEl = null;
  var footerEl = null;
  var initialized = false;

  /**
   * Charge un fragment HTML et l'injecte dans un élément conteneur.
   */
  function loadFragment(url, container, callback) {
    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load ' + url);
        return res.text();
      })
      .then(function (html) {
        // Parser le HTML pour extraire le contenu pertinent
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');

        // Pour le header : extraire le <header>
        var headerTag = doc.querySelector('header');
        if (headerTag) {
          container.replaceWith(headerTag);
          headerEl = headerTag;
        } else {
          // Pour le footer : extraire le <footer>
          var footerTag = doc.querySelector('footer');
          if (footerTag) {
            container.replaceWith(footerTag);
            footerEl = footerTag;
          } else {
            container.innerHTML = doc.body ? doc.body.innerHTML : html;
          }
        }

        if (callback) callback();
      })
      .catch(function () {
        // Échec silencieux : ne pas exposer l'URL interne en console
        if (callback) callback();
      });
  }

  /**
   * Met à jour les textes de la nav et du footer selon la langue courante.
   */
  function localizeLayout() {
    if (typeof I18n === 'undefined') return;

    var lang = I18n.getLang();

    // Localiser le logo
    var logoText = document.querySelector('.nav-logo__text');
    if (logoText) logoText.textContent = I18n.t('nav.logo');

    // Localiser les liens de navigation desktop
    var navLinkMap = {
      'home': '/',
      'about': lang === 'fr' ? '/a-propos' : '/en/about',
      'services': lang === 'fr' ? '/services' : '/en/services',
      'portfolio': lang === 'fr' ? '/realisations' : '/en/portfolio',
      'blog': lang === 'fr' ? '/blog' : '/en/blog',
      'contact': lang === 'fr' ? '/contact' : '/en/contact'
    };

    var navLinks = document.querySelectorAll('.nav-links .nav-link');
    var navKeys = ['home', 'about', 'services', 'portfolio', 'blog', 'contact'];
    navLinks.forEach(function (link, index) {
      var key = navKeys[index];
      if (key) {
        link.textContent = I18n.t('nav.' + key);
        link.setAttribute('href', navLinkMap[key]);
      }
    });

    // Localiser les liens mobile
    var mobileLinks = document.querySelectorAll('.nav-mobile__link');
    mobileLinks.forEach(function (link, index) {
      var key = navKeys[index];
      if (key) {
        link.textContent = I18n.t('nav.' + key);
        link.setAttribute('href', navLinkMap[key]);
      }
    });

    // Localiser le logo link
    var logoLink = document.querySelector('.nav-logo');
    if (logoLink) {
      logoLink.setAttribute('href', lang === 'fr' ? '/' : '/en');
      logoLink.setAttribute('aria-label', I18n.t('nav.logo') + ' — Accueil');
    }

    // Bouton switch langue
    var langBtns = document.querySelectorAll('[data-lang-toggle]');
    langBtns.forEach(function (btn) {
      btn.textContent = I18n.t('langSwitch');
      btn.setAttribute('aria-label', I18n.t('langSwitchLabel'));
    });

    // CTA nav
    var ctaBtns = document.querySelectorAll('.nav-actions .btn-primary, .nav-mobile__actions .btn-primary');
    ctaBtns.forEach(function (btn) {
      btn.textContent = I18n.t('home.heroCTA');
      btn.setAttribute('href', navLinkMap.contact);
    });

    // Navigation principale aria-label
    var mainNav = document.querySelector('.nav[aria-label]');
    if (mainNav) {
      mainNav.setAttribute('aria-label', lang === 'fr' ? 'Navigation principale' : 'Main navigation');
    }

    // Footer : localiser les colonnes
    localizeFooter(lang);

    // Localiser le DOM pour les éléments avec data-i18n
    I18n.localizeDOM();
  }

  /**
   * Localise les textes du footer.
   */
  function localizeFooter(lang) {
    if (typeof I18n === 'undefined') return;

    // Copyright
    var copyrightText = document.querySelector('.footer-copyright__text');
    if (copyrightText) {
      var year = new Date().getFullYear();
      copyrightText.innerHTML = I18n.t('footer.copyright', { year: year });
    }

    // Liens légaux
    var legalLinks = document.querySelectorAll('.footer-copyright__links a');
    var legalKeys = ['legal', 'privacy', 'cookies', 'a11y'];
    legalLinks.forEach(function (link, index) {
      var key = legalKeys[index];
      if (key) {
        link.textContent = I18n.t('footer.' + key);
      }
    });

    // Titres des colonnes du footer
    var colTitles = document.querySelectorAll('.footer-col__title');
    var colTitleTexts = lang === 'fr'
      ? ['Navigation', 'Contact', 'Réseaux sociaux']
      : ['Navigation', 'Contact', 'Social media'];
    colTitles.forEach(function (title, index) {
      if (colTitleTexts[index]) title.textContent = colTitleTexts[index];
    });

    // Liens nav du footer
    var footerNavLinks = document.querySelectorAll('.footer-links__item a');
    var footerNavKeys = ['home', 'about', 'services', 'portfolio', 'blog', 'contact'];
    var footerNavPaths = {
      fr: { home: '/', about: '/a-propos', services: '/services', portfolio: '/realisations', blog: '/blog', contact: '/contact' },
      en: { home: '/en', about: '/en/about', services: '/en/services', portfolio: '/en/portfolio', blog: '/en/blog', contact: '/en/contact' }
    };
    footerNavLinks.forEach(function (link, index) {
      var key = footerNavKeys[index];
      if (key) {
        link.textContent = I18n.t('nav.' + key);
        link.setAttribute('href', footerNavPaths[lang][key]);
      }
    });

    // Description réseaux sociaux
    var socialDesc = document.querySelector('.footer-social__desc');
    if (socialDesc) {
      socialDesc.textContent = lang === 'fr'
        ? 'Suivez notre actualité et nos publications sur les réseaux.'
        : 'Follow our news and publications on social media.';
    }
  }

  /**
   * Initialise le layout : charge header, footer, i18n, router.
   */
  function init() {
    if (initialized) return;
    initialized = true;

    var siteHeader = document.getElementById('site-header');
    var siteFooter = document.getElementById('site-footer');
    var loaded = 0;
    var total = 0;

    function onFragmentLoaded() {
      loaded++;
      if (loaded >= total) {
        // Tout est chargé → initialiser i18n et localiser
        if (typeof I18n !== 'undefined') {
          I18n.init(function () {
            localizeLayout();

            // Écouter les changements de langue
            window.addEventListener('langchange', function () {
              localizeLayout();
            });
          });
        }

        // Réinitialiser nav.js (car le header a été injecté dynamiquement)
        initNavBehavior();
      }
    }

    if (siteHeader) {
      total++;
      loadFragment('/src/ui/components/nav.html', siteHeader, onFragmentLoaded);
    }
    if (siteFooter) {
      total++;
      loadFragment('/src/ui/components/footer.html', siteFooter, onFragmentLoaded);
    }

    if (total === 0) {
      // Pas de placeholder, layout déjà en place
      if (typeof I18n !== 'undefined') {
        I18n.init(function () {
          localizeLayout();
        });
      }
    }
  }

  /**
   * Réinitialise le comportement du menu hamburger après injection dynamique.
   */
  function initNavBehavior() {
    var toggleBtn = document.querySelector('[data-nav-toggle]');
    var mobileMenu = document.getElementById('nav-mobile-menu');
    if (!toggleBtn || !mobileMenu) return;

    var isOpen = false;

    function openMenu() {
      isOpen = true;
      toggleBtn.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('nav-mobile--open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var firstLink = mobileMenu.querySelector('.nav-mobile__link');
      if (firstLink) setTimeout(function () { firstLink.focus(); }, 50);
    }

    function closeMenu(restoreFocus) {
      isOpen = false;
      toggleBtn.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('nav-mobile--open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (restoreFocus !== false) toggleBtn.focus();
    }

    toggleBtn.addEventListener('click', function () {
      isOpen ? closeMenu() : openMenu();
    });

    var mobileLinks = mobileMenu.querySelectorAll('.nav-mobile__link');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () { closeMenu(false); });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen) closeMenu();
    });

    document.addEventListener('click', function (event) {
      if (isOpen && !mobileMenu.contains(event.target) && !toggleBtn.contains(event.target)) {
        closeMenu();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024 && isOpen) closeMenu(false);
    });
  }

  return {
    init: init,
    localizeLayout: localizeLayout
  };

})();

// Auto-init au chargement du DOM
document.addEventListener('DOMContentLoaded', function () {
  Layout.init();
});

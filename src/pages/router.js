/**
 * router.js — Routeur SPA léger
 * Navigation entre pages sans rechargement complet.
 * Gère les URLs localisées FR/EN via le module I18n.
 *
 * Usage : <script src="/src/i18n/index.js"></script>
 *         <script src="/src/pages/router.js" defer></script>
 */
'use strict';

var Router = (function () {

  // ── Définition des routes ──────────────────────────────────
  // Chaque route mappe un chemin vers un fichier HTML de page.
  var routes = {
    fr: {
      '/':              '/src/pages/home/index.html',
      '/a-propos':      '/src/pages/about/index.html',
      '/services':      '/src/pages/services/index.html',
      '/realisations':  '/src/pages/portfolio/index.html',
      '/blog':          '/src/pages/blog/index.html',
      '/contact':       '/src/pages/contact/index.html'
    },
    en: {
      '/en':            '/src/pages/home/index.html',
      '/en/about':      '/src/pages/about/index.html',
      '/en/services':   '/src/pages/services/index.html',
      '/en/portfolio':  '/src/pages/portfolio/index.html',
      '/en/blog':       '/src/pages/blog/index.html',
      '/en/contact':    '/src/pages/contact/index.html'
    }
  };

  // Route slug → i18n route key mapping (for language switching)
  var routeKeys = {
    '/':              'home',
    '/a-propos':      'about',
    '/services':      'services',
    '/realisations':  'portfolio',
    '/blog':          'blog',
    '/contact':       'contact',
    '/en':            'home',
    '/en/about':      'about',
    '/en/services':   'services',
    '/en/portfolio':  'portfolio',
    '/en/blog':       'blog',
    '/en/contact':    'contact'
  };

  var mainEl = null;
  var currentPath = '';

  // ── Helpers ────────────────────────────────────────────────

  /**
   * Résout le chemin courant en supprimant trailing slash et query.
   */
  function normalizePath(path) {
    // Remove query string and hash
    path = path.split('?')[0].split('#')[0];
    // Remove trailing slash (sauf racine)
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return path || '/';
  }

  /**
   * Retourne la langue depuis un chemin URL.
   */
  function langFromPath(path) {
    if (path === '/en' || path.startsWith('/en/')) return 'en';
    return 'fr';
  }

  /**
   * Cherche le fichier HTML correspondant à un chemin donné.
   */
  function resolveRoute(path) {
    var lang = langFromPath(path);
    var langRoutes = routes[lang];
    if (langRoutes && langRoutes[path]) {
      return { file: langRoutes[path], lang: lang, key: routeKeys[path] || null };
    }

    // Vérifier s'il s'agit d'un article de blog (/blog/slug ou /en/blog/slug)
    if (lang === 'fr' && path.startsWith('/blog/')) {
      return { file: '/src/pages/blog/article.html', lang: 'fr', key: 'blog' };
    }
    if (lang === 'en' && path.startsWith('/en/blog/')) {
      return { file: '/src/pages/blog/article.html', lang: 'en', key: 'blog' };
    }

    // 404
    return { file: '/src/pages/404.html', lang: lang, key: null };
  }

  /**
   * Charge le contenu HTML d'une page dans <main>.
   */
  function loadPage(route, pushState) {
    if (!mainEl) {
      mainEl = document.getElementById('main-content');
    }
    if (!mainEl) return;

    // Fetch le fragment HTML de la page
    fetch(route.file)
      .then(function (res) {
        if (!res.ok) throw new Error(res.status);
        return res.text();
      })
      .then(function (html) {
        // Extraire uniquement le contenu du <main> de la page
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var pageMain = doc.querySelector('main') || doc.querySelector('#main-content');
        var pageTitle = doc.querySelector('title');

        if (pageMain) {
          mainEl.innerHTML = pageMain.innerHTML;
        } else {
          // Fallback : injecter le body entier
          mainEl.innerHTML = doc.body ? doc.body.innerHTML : html;
        }

        // Mettre à jour le title
        if (pageTitle) {
          document.title = pageTitle.textContent;
        }

        // Mettre à jour les meta description et OG si présents
        var pageMeta = doc.querySelector('meta[name="description"]');
        if (pageMeta) {
          var currentMeta = document.querySelector('meta[name="description"]');
          if (currentMeta) currentMeta.setAttribute('content', pageMeta.getAttribute('content'));
        }

        // Mettre à jour la langue
        if (typeof I18n !== 'undefined') {
          I18n.setLang(route.lang);
          I18n.localizeDOM();
        }

        // Mettre à jour les liens actifs dans la nav
        updateActiveLinks(currentPath);

        // Scroll en haut
        window.scrollTo(0, 0);

        // Focus sur le main pour l'accessibilité (lecteurs d'écran)
        mainEl.setAttribute('tabindex', '-1');
        mainEl.focus({ preventScroll: true });

        // Émettre un événement de navigation
        window.dispatchEvent(new CustomEvent('routechange', {
          detail: { path: currentPath, lang: route.lang, key: route.key }
        }));

        // Exécuter les scripts inline de la page chargée
        executePageScripts(mainEl);
      })
      .catch(function () {
        mainEl.innerHTML =
          '<div class="container section" style="text-align:center;padding:var(--space-3xl) 0;">' +
          '<h1>Erreur de chargement</h1>' +
          '<p>Impossible de charger cette page.</p>' +
          '<a href="/" class="btn btn-primary">Retour à l\'accueil</a>' +
          '</div>';
      });
  }

  /**
   * Exécute les scripts inline trouvés dans un conteneur.
   */
  function executePageScripts(container) {
    var scripts = container.querySelectorAll('script');
    scripts.forEach(function (oldScript) {
      var newScript = document.createElement('script');
      if (oldScript.src) {
        newScript.src = oldScript.src;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  /**
   * Met à jour les classes actives dans la navigation.
   */
  function updateActiveLinks(path) {
    // Desktop nav links
    var navLinks = document.querySelectorAll('.nav-link, .nav-mobile__link');
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;

      var isActive = (href === path) ||
        (path === '/' && href === '/') ||
        (path === '/en' && href === '/en');

      if (isActive) {
        link.classList.add('nav-link--active', 'nav-mobile__link--active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('nav-link--active', 'nav-mobile__link--active');
        link.removeAttribute('aria-current');
      }
    });

    // Footer links
    var footerLinks = document.querySelectorAll('.footer-links__item a');
    footerLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === path) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  // ── Navigation ─────────────────────────────────────────────

  /**
   * Navigue vers un chemin donné.
   */
  function navigate(path, replace) {
    path = normalizePath(path);
    if (path === currentPath) return;

    currentPath = path;
    var route = resolveRoute(path);

    if (replace) {
      history.replaceState({ path: path }, '', path);
    } else {
      history.pushState({ path: path }, '', path);
    }

    loadPage(route, false);
  }

  /**
   * Retourne le chemin équivalent dans l'autre langue.
   */
  function getAlternateLangPath(path) {
    path = normalizePath(path);
    var currentLang = langFromPath(path);
    var key = routeKeys[path];

    if (!key) return currentLang === 'fr' ? '/en' : '/';

    var i18nRoutes = (typeof I18n !== 'undefined') ? I18n.getRoutes() : null;
    if (currentLang === 'fr') {
      // FR → EN
      var enRoutes = routes.en;
      for (var enPath in enRoutes) {
        if (routeKeys[enPath] === key) return enPath;
      }
      return '/en';
    } else {
      // EN → FR
      var frRoutes = routes.fr;
      for (var frPath in frRoutes) {
        if (routeKeys[frPath] === key) return frPath;
      }
      return '/';
    }
  }

  // ── Interception des clics ─────────────────────────────────

  function handleClick(event) {
    // Remonter pour trouver un <a>
    var anchor = event.target.closest('a[href]');
    if (!anchor) return;

    var href = anchor.getAttribute('href');
    if (!href) return;

    // Ignorer : liens externes, mailto, tel, download, target blank, ctrl/meta click
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (anchor.hasAttribute('download') || anchor.getAttribute('target') === '_blank') return;
    if (event.ctrlKey || event.metaKey || event.shiftKey) return;

    // Liens internes : intercepter
    event.preventDefault();
    navigate(href);
  }

  // ── Gestion du bouton retour ───────────────────────────────

  function handlePopState(event) {
    var path = normalizePath(window.location.pathname);
    currentPath = path;
    var route = resolveRoute(path);
    loadPage(route, false);
  }

  // ── Switch langue ──────────────────────────────────────────

  function handleLangSwitch() {
    var newPath = getAlternateLangPath(currentPath);
    navigate(newPath);
  }

  // ── Mise à jour des liens de navigation selon la langue ────

  function updateNavLinks(lang) {
    var navRoutes = routes[lang];
    if (!navRoutes) return;

    // Construire un map key → path
    var keyToPath = {};
    for (var path in navRoutes) {
      var key = routeKeys[path];
      if (key) keyToPath[key] = path;
    }

    // Mettre à jour les liens nav desktop
    var navLinks = document.querySelectorAll('.nav-link[href], .nav-mobile__link[href]');
    navLinks.forEach(function (link) {
      var currentHref = link.getAttribute('href');
      var key = routeKeys[currentHref];
      if (key && keyToPath[key]) {
        link.setAttribute('href', keyToPath[key]);
      }
    });

    // Mettre à jour les liens du footer
    var footerLinks = document.querySelectorAll('.footer-links__item a[href]');
    footerLinks.forEach(function (link) {
      var currentHref = link.getAttribute('href');
      var key = routeKeys[currentHref];
      if (key && keyToPath[key]) {
        link.setAttribute('href', keyToPath[key]);
      }
    });

    // Mettre à jour le CTA nav
    var ctaLinks = document.querySelectorAll('.nav-actions .btn[href], .nav-mobile__actions .btn[href]');
    ctaLinks.forEach(function (link) {
      if (keyToPath.contact) link.setAttribute('href', keyToPath.contact);
    });
  }

  // ── Initialisation ─────────────────────────────────────────

  function init() {
    mainEl = document.getElementById('main-content');
    currentPath = normalizePath(window.location.pathname);

    // Écouter les clics sur les liens
    document.addEventListener('click', handleClick);

    // Écouter le bouton retour/avancer
    window.addEventListener('popstate', handlePopState);

    // Écouter les boutons de switch langue
    document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        handleLangSwitch();
      });
    });

    // Écouter l'événement langchange (émis par I18n)
    window.addEventListener('langchange', function (e) {
      var lang = e.detail && e.detail.lang;
      if (lang) {
        updateNavLinks(lang);
      }
    });

    // Marquer le lien actif au chargement
    updateActiveLinks(currentPath);
  }

  return {
    init: init,
    navigate: navigate,
    getAlternateLangPath: getAlternateLangPath,
    updateNavLinks: updateNavLinks
  };

})();

// Auto-init quand le DOM est prêt
document.addEventListener('DOMContentLoaded', function () {
  Router.init();
});

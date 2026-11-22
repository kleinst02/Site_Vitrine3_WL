/**
 * nav.js — Menu hamburger mobile + switch langue
 * Design System : Élégant, sobre, professionnel
 *
 * Fonctionnalités :
 *   - Toggle menu mobile (ouverture / fermeture)
 *   - Transformation hamburger → X (via aria-expanded + CSS)
 *   - Fermeture au clic en dehors du menu
 *   - Fermeture à la touche Echap
 *   - Fermeture au clic sur un lien mobile
 *   - Blocage du scroll arrière-plan quand menu ouvert
 *   - Switch langue FR ↔ EN
 *   - Respect de prefers-reduced-motion
 *
 * Usage : <script src="/src/ui/components/nav.js" defer></script>
 */

(function () {
  'use strict';

  // ── Sélecteurs ──────────────────────────────────────────────
  const toggleBtn    = document.querySelector('[data-nav-toggle]');
  const mobileMenu   = document.getElementById('nav-mobile-menu');
  const mobileLinks  = mobileMenu ? mobileMenu.querySelectorAll('.nav-mobile__link') : [];
  const langBtns     = document.querySelectorAll('[data-lang-toggle]');

  if (!toggleBtn || !mobileMenu) return;

  // ── État ────────────────────────────────────────────────────
  let isOpen = false;

  // ── Helpers ─────────────────────────────────────────────────

  /**
   * Ouvre le menu mobile.
   */
  function openMenu() {
    isOpen = true;
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.setAttribute('aria-label', 'Fermer le menu de navigation');
    mobileMenu.classList.add('nav-mobile--open');
    mobileMenu.setAttribute('aria-hidden', 'false');

    // Bloquer le scroll de la page
    document.body.style.overflow = 'hidden';

    // Focus sur le premier lien du menu (accessibilité)
    const firstLink = mobileMenu.querySelector('.nav-mobile__link');
    if (firstLink) {
      // Délai minimal pour laisser l'animation se déclencher
      setTimeout(() => firstLink.focus(), 50);
    }
  }

  /**
   * Ferme le menu mobile.
   * @param {boolean} [restoreFocus=true] - Rend le focus au bouton hamburger.
   */
  function closeMenu(restoreFocus = true) {
    isOpen = false;
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', 'Ouvrir le menu de navigation');
    mobileMenu.classList.remove('nav-mobile--open');
    mobileMenu.setAttribute('aria-hidden', 'true');

    // Restaurer le scroll
    document.body.style.overflow = '';

    if (restoreFocus) {
      toggleBtn.focus();
    }
  }

  /**
   * Bascule l'état du menu.
   */
  function toggleMenu() {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  // ── Événements ──────────────────────────────────────────────

  // Clic sur le bouton hamburger
  toggleBtn.addEventListener('click', toggleMenu);

  // Fermer quand on clique sur un lien mobile
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenu(false); // Ne pas remettre le focus (navigation en cours)
    });
  });

  // Fermer à la touche Echap
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen) {
      closeMenu();
    }
  });

  // Fermer au clic en dehors du menu (overlay)
  document.addEventListener('click', function (event) {
    if (
      isOpen &&
      !mobileMenu.contains(event.target) &&
      !toggleBtn.contains(event.target)
    ) {
      closeMenu();
    }
  });

  // Fermer si la fenêtre est redimensionnée vers desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024 && isOpen) {
      closeMenu(false);
    }
  });

  // ── Switch Langue ────────────────────────────────────────────

  const LANGS = ['FR', 'EN'];
  let currentLang = 'FR';

  langBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Basculer la langue
      currentLang = currentLang === 'FR' ? 'EN' : 'FR';
      const nextLang = currentLang === 'FR' ? 'EN' : 'FR';

      // Mettre à jour le texte de tous les boutons langue
      langBtns.forEach(function (b) {
        b.textContent = currentLang;
        b.setAttribute(
          'aria-label',
          'Changer la langue vers le ' + (currentLang === 'FR' ? 'anglais' : 'français')
        );
      });

      // Mettre à jour l'attribut lang de la page
      document.documentElement.lang = currentLang.toLowerCase();

      // Émettre un événement personnalisé pour permettre à d'autres modules
      // de réagir au changement de langue
      document.dispatchEvent(
        new CustomEvent('langChange', { detail: { lang: currentLang } })
      );
    });
  });

  // ── Gestion prefers-reduced-motion ──────────────────────────
  // Les animations sont gérées par CSS (@media prefers-reduced-motion: reduce)
  // Aucune action JS supplémentaire requise.

})();

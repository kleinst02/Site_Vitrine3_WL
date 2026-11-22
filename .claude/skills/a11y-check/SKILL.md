---
name: a11y-check
description: Vérifie l'accessibilité WCAG AA d'une page ou d'un composant (clavier, contraste, sémantique, ARIA, formulaires).
---

# Contrôle d'accessibilité WCAG AA

1. Navigation clavier complète, focus visible, aucun piège au clavier, ordre logique.
2. Contrastes : texte ≥ 4,5:1, grand texte et composants ≥ 3:1.
3. Sémantique : landmarks, hiérarchie des titres, listes, boutons vs liens corrects.
4. Images : `alt` pertinent (vide si décorative) ; icônes cliquables nommées.
5. Formulaires : labels associés, erreurs annoncées (`aria-live` ou `role="alert"`), champs requis indiqués.
6. ARIA : utilisé seulement si le HTML natif ne suffit pas ; rôles et états cohérents.
7. Zoom 200 % et reflow à 320 px sans perte de contenu ; `prefers-reduced-motion` respecté.
8. Si disponible, compléter par `axe-core` ou Lighthouse et joindre les résultats au rapport.

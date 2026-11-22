---
name: design-tokens
description: Définit et maintient les jetons de design (couleurs, typographie, espacements, rayons, ombres, breakpoints) dans la config Tailwind et /src/ui/.
---

# Jetons de design

1. Source unique : `tailwind.config.js` et `/src/ui/tokens.css` ; aucune valeur en dur dans les composants.
2. Couleurs : primaire `#1E40AF`, fond `#F9FAFB` ; ajouter variantes (hover, actif, désactivé) et couleurs sémantiques (succès, erreur, alerte).
3. Vérifier chaque paire texte/fond : contraste ≥ 4,5:1 (3:1 pour grand texte).
4. Typographie : échelle modulaire, tailles en `rem`, interligne 1,5 pour le corps.
5. Espacements sur une grille de 4 px ; breakpoints Mobile-First (sm 640, md 768, lg 1024, xl 1280).
6. Documenter chaque jeton (nom, valeur, usage) dans `/src/ui/TOKENS.md`.

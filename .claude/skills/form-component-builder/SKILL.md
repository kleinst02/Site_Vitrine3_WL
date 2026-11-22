---
name: form-component-builder
description: Construit des composants métiers interactifs (formulaires, filtres, calculatrices) accessibles, validés et testés, à partir des briques de /src/ui/.
---

# Composant métier interactif

1. Lister champs, règles de validation et messages d'erreur depuis le ticket.
2. Composer avec les éléments de `/src/ui/` (champ, bouton, alerte).
3. Chaque champ : `<label>` associé, `aria-describedby` pour l'aide/erreur, `aria-invalid` si erreur.
4. Valider à la saisie (blur) et à la soumission ; focus sur la première erreur ; message en français clair.
5. États : initial, chargement (bouton désactivé), succès, erreur serveur, vide.
6. Empêcher la double soumission ; ne jamais faire confiance au client seul (la validation serveur fait foi).
7. Tests : cas nominal, entrée invalide, erreur réseau, navigation clavier.
8. Documenter props, événements et exemple d'usage en tête du fichier.

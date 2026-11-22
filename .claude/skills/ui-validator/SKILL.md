---
name: ui-validator
description: Valide la conformité visuelle, le responsive et l'accessibilité d'un composant Web.
---

# Procédure de Validation UI

1. Consulter la grille de référence dans `references/responsive-rules.md`.
2. Analyser le code HTML/CSS du composant visé dans `/src/ui/`.
3. Vérifier la présence des balises ARIA et des contrastes de couleur.
4. Vérifier que tous les états existent : défaut, survol, focus visible, actif, désactivé.
5. Vérifier l'usage exclusif des jetons de design.
6. Générer un bilan indiquant les points conformes et les corrections nécessaires.

---
name: code-review-checklist
description: Checklist de revue de code et de tests pour valider un ticket avant fusion (conformité, qualité, tests, périmètre).
---

# Checklist de revue

1. Périmètre : seuls les fichiers autorisés par le ticket sont modifiés.
2. Critères d'acceptation : chacun est vérifié et coché.
3. Tests : lancer la suite complète ; nouveaux tests présents et pertinents.
4. Lisibilité : noms clairs, fonctions courtes, pas de code mort ni de `console.log`.
5. Dépendances : aucune ajoutée sans justification.
6. Gestion d'erreurs : cas limites, entrées vides, erreurs réseau.
7. Performance : pas de requête N+1, pas d'image non optimisée.
8. Rapport `/.tasks/REVIEW-T-xxx.md` : verdict + défauts (critique/majeur/mineur) avec fichier:ligne.

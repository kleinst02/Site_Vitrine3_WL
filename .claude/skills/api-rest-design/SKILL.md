---
name: api-rest-design
description: Conçoit et implémente des routes API REST Express cohérentes, validées, sécurisées et documentées.
---

# Conception d'API REST

1. Ressources au pluriel (`/api/v1/articles`), verbes HTTP corrects (GET, POST, PUT/PATCH, DELETE).
2. Structure : route → validation d'entrée → contrôleur → service → accès données.
3. Valider toute entrée (type, longueur, format) ; rejeter avec 400 et message clair.
4. Codes : 200, 201, 204, 400, 401, 403, 404, 409, 422, 500 ; format d'erreur unique `{ "error": { "code", "message" } }`.
5. Auth et autorisation vérifiées sur chaque route non publique ; pagination sur les listes.
6. Requêtes SQL paramétrées uniquement ; pas de stack trace dans les réponses.
7. Test d'intégration par route (succès + au moins un cas d'erreur).
8. Documenter dans `/src/backend/API.md` : méthode, URL, entrées, sorties, erreurs.

---
name: client-state-pattern
description: Gère l'état client d'un composant JS ES6 (état local, appels API, chargement/erreur) de façon simple et prévisible, sans dépendance inutile.
---

# Gestion d'état client

1. Un objet d'état unique par composant : `{ status: 'idle'|'loading'|'success'|'error', data, error }`.
2. Une fonction `setState` pure qui déclenche un seul rendu ; pas de mutation directe du DOM dispersée.
3. Appels API via une fonction `request()` partagée (`fetch`, `AbortController`, gestion des codes HTTP).
4. Annuler les requêtes obsolètes (debounce 300 ms pour la recherche/filtre).
5. Afficher chaque `status` explicitement (squelette, erreur avec bouton Réessayer, vide).
6. Pas de donnée sensible en `localStorage` ; sessions via cookies `HttpOnly` côté serveur.
7. Aucun framework tant que le ticket ne le justifie pas.

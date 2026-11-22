---
name: security-audit
description: Audit de sécurité d'une application Web Node/Express/PostgreSQL (OWASP Top 10, secrets, authentification, entrées).
---

# Audit de sécurité

1. Injection : toute requête SQL paramétrée ; aucune concaténation d'entrée utilisateur.
2. XSS : sortie échappée, pas de `innerHTML` avec donnée non fiable, CSP en place.
3. Authentification : mots de passe hachés (bcrypt/argon2), cookies `HttpOnly` + `Secure` + `SameSite`, limitation de tentatives.
4. Autorisation : contrôle d'accès sur chaque route et ressource (pas d'IDOR).
5. CSRF sur les actions modifiant l'état ; CORS restrictif ; en-têtes (`helmet`).
6. Secrets : aucun dans le dépôt ni dans les logs ; `.env` ignoré par git ; `.env.example` sans valeurs.
7. Dépendances : `npm audit` ; signaler les vulnérabilités hautes/critiques.
8. Erreurs : pas de stack trace ni d'information interne côté client.
9. Toute faille critique bloque la fusion.

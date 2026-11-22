---
name: page-assembly
description: Assemble composants UI, composants métiers et données serveur en pages Web complètes avec layout, SEO de base et sémantique correcte.
---

# Assemblage de pages

1. Créer ou réutiliser un layout commun (`<header>`, `<nav>`, `<main>`, `<footer>`) dans `/src/pages/_layout`.
2. Pour chaque page : lister les composants requis ; manquant → demander au bon agent via `/.mailboxes/`.
3. Structure sémantique : un seul `<h1>`, titres hiérarchisés, lien d'évitement « Aller au contenu ».
4. Balises `<title>`, `meta description`, Open Graph, `lang="fr"`, favicon.
5. Brancher les données via les endpoints de `API.md` ; gérer chargement et erreur.
6. Images avec `alt`, dimensions et `loading="lazy"` ; pas de CSS spécifique à la page si un jeton existe.
7. Contrôler le rendu à 375, 768 et 1280 px.

---
name: responsive-routing
description: Configure le routage applicatif, la navigation responsive (menu mobile, fil d'Ariane) et les pages d'erreur.
---

# Routage et navigation

1. Table de routes unique `/src/pages/routes.md` + implémentation : URL lisibles, minuscules, sans accents.
2. Prévoir page 404 et page d'erreur 500 utiles (lien retour accueil).
3. Navigation : menu horizontal ≥ md, menu burger accessible en dessous (`aria-expanded`, `aria-controls`, fermeture Échap).
4. Marquer la page courante avec `aria-current="page"`.
5. Routes protégées : redirection vers connexion, puis retour à la page demandée.
6. Redirections 301 pour toute URL renommée.
7. Mettre à jour `sitemap.xml` et `robots.txt`.

# ROADMAP - Site Vitrine Consultant IT

## Objectif
Concevoir et livrer un site vitrine professionnel, multilingue (FR/EN), avec blog et formulaire de contact, pour un consultant informatique. Le site doit refléter une image **élégante, sobre et professionnelle**.

## Public cible
Prospects (DSI, chefs de projet, PME), recruteurs, partenaires technologiques.

## Périmètre V1

### Pages
| Page | Description |
|------|-------------|
| Accueil | Hero, proposition de valeur, apercu services, CTA |
| A propos | Parcours, competences, valeurs (source : LinkedIn) |
| Services | Liste des expertises avec descriptions |
| Realisations | Portfolio / references projets |
| Blog | Articles, annonces, actualites (liste + detail) |
| Contact | Formulaire complet + coordonnees + liens sociaux |

### Fonctionnalites indispensables (V1)
- Design system elegant, sobre, professionnel (tokens, composants)
- Responsive Mobile-First, accessibilite WCAG AA
- Multilingue FR/EN (contenus + URL localisees)
- SEO pousse : meta, Open Graph, schema.org, sitemap.xml, robots.txt
- Formulaire de contact fonctionnel (validation, envoi email, stockage BDD)
- Blog avec liste paginee et page article
- CV genere automatiquement en PDF (depuis les donnees du profil)
- Back-end Node.js/Express + PostgreSQL

### Fonctionnalites souhaitables (V1.1)
- Animations et micro-interactions subtiles
- Filtrage/categories sur le blog
- Integration Google Analytics / Search Console
- Optimisation images (lazy loading, WebP)

### Hors perimetre (V2+)
- CMS / interface d'administration
- Newsletter / mailing list
- Systeme de reservation / calendrier
- Espace client securise

## Jalons

```
Jalon 0 - Cadrage & Roadmap            [ACTUEL]
Jalon 1 - Design System / UI            Tokens, composants generiques, layout
Jalon 2 - Back-end & API                BDD, API contact, API blog, i18n serveur
Jalon 3 - Composants metiers             Formulaire contact, carte projet, article blog
Jalon 4 - Assemblage ecrans              Pages completes, routage, i18n front, SEO
Jalon 5 - Revue / QA                    Tests, accessibilite, securite, performance
Jalon 6 - Validation humaine            Demo, corrections, feu vert mise en ligne
```

## Risques identifies
| Risque | Mitigation |
|--------|------------|
| Contenus incomplets (textes, images) | Placeholders structures ; import LinkedIn |
| Complexite i18n (FR/EN sur toutes pages + blog) | Architecture i18n des le Jalon 1 |
| SEO : mauvais balisage ou perf degradee | Checklist SEO au Jalon 5, audit Lighthouse |
| Formulaire : spam ou faille securite | Rate limiting, CSRF, validation serveur |

## Hypotheses confirmees
1. ✅ Stack back-end : Node.js/Express + PostgreSQL.
2. ✅ Blog : articles en Markdown (pas de CMS en V1).
3. ✅ CV PDF : generation automatique depuis les donnees profil (pas un fichier statique).
4. ✅ Hebergement : VPS Hostinger (deploiement a prevoir).
5. ✅ Contenus : profil LinkedIn (www.linkedin.com/in/wilfriedlangry) + placeholders.

## Informations client
- Profil LinkedIn : www.linkedin.com/in/wilfriedlangry
- Hebergement : VPS Hostinger
- Style : elegant, sobre, professionnel
- Langues : FR (principal) + EN

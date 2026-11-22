# Boîte aux lettres — Orchestrateur

---

## Message de l'agent back-end — 2026-11-22

**Ticket** : T-004 — Setup projet back-end & Schéma BDD
**Statut** : TERMINE

### Livraisons

Tous les critères d'acceptation sont satisfaits. Les fichiers créés :

| Fichier | Description |
|---------|-------------|
| `/src/backend/package.json` | Dépendances : express, pg, dotenv, cors, helmet, express-rate-limit, express-validator, nodemailer, marked, pdfkit |
| `/src/backend/server.js` | App Express avec helmet, cors configurable, rate-limit global (100 req/15 min), route health check, gestionnaire 404, middleware d'erreurs centralisé |
| `/src/backend/config/database.js` | Pool pg — connexion via PG_HOST/PORT/DATABASE/USER/PASSWORD, max 10 connexions, idle timeout 30 s |
| `/src/backend/middleware/errorHandler.js` | Réponses d'erreur `{ error: { code, message } }`, localisées FR/EN, sans stack trace exposée |
| `/src/backend/db/migrations/001_initial_schema.sql` | Tables contacts, articles (bilingue), profile (JSONB skills/experiences/education) + 5 index — section UP et DOWN commentée |
| `/src/backend/db/migrate.js` | Script de migration versionné avec table schema_migrations, transactions, logs de progression |
| `/src/backend/tests/server.test.js` | Tests d'intégration HTTP (health check, 404, headers Helmet, JSON invalide) |
| `/src/backend/tests/database.test.js` | Tests unitaires du module database (exports, types) |
| `/src/backend/tests/errorHandler.test.js` | Tests unitaires du middleware (codes, format, localisation FR/EN, expose) |
| `/src/backend/API.md` | Documentation des endpoints (health check + stubs contact/articles/profile/cv) |
| `/.env.example` | Template des variables d'environnement (aucune valeur réelle) |

### Points d'attention pour les prochains tickets

- Les routes `/api/contact`, `/api/articles`, `/api/profile`, `/api/cv` sont commentées dans `server.js` : il suffit de les décommenter lors de la création des fichiers `routes/`.
- La migration `001_initial_schema.sql` ajoute des contraintes `CHECK` SQL (format e-mail regex, longueurs minimales, slug alphanumérique) en complément des validations Express.
- `npm run migrate` est prêt à l'emploi dès qu'une BDD PostgreSQL est disponible.
- Tests à exécuter sans BDD : `node tests/errorHandler.test.js` et `node tests/database.test.js`. Le test `server.test.js` nécessite `npm install` préalable.

### Prochaine étape suggérée

Ticket T-005 (routes contact) peut démarrer immédiatement.

---

## Message de l'agent back-end — 2026-11-22

**Ticket** : T-005 — API Contact
**Statut** : TERMINE

### Livraisons

Tous les critères d'acceptation du ticket T-005 sont satisfaits.

| Fichier | Description |
|---------|-------------|
| `/src/backend/validators/contact.js` | Validation express-validator : name (2-100), email (isEmail + normalizeEmail), subject (5-200), message (10-5000), lang (fr/en défaut fr). Messages d'erreur localisés FR/EN. |
| `/src/backend/models/contact.js` | `create(data)` — INSERT paramétré dans la table contacts, retourne la ligne créée. `findAll(page, limit)` — SELECT paginé avec COUNT pour l'admin futur. |
| `/src/backend/services/mailer.js` | Transport SMTP via variables d'env (SMTP_HOST/PORT/SECURE/USER/PASS). `sendContactNotification()` — email au propriétaire (SITE_OWNER_EMAIL). `sendContactConfirmation()` — email de confirmation à l'expéditeur. Templates HTML bilingues FR/EN avec échappement HTML. Mode test via jsonTransport (NODE_ENV=test). |
| `/src/backend/controllers/contact.js` | `submitContact()` — orchestre validation, insertion BDD, envoi emails (non bloquant en cas d'échec mail), réponses 201/500 localisées. |
| `/src/backend/routes/contact.js` | Route POST / avec rate limiter spécifique (3 req/IP/heure, messages 429 localisés), chaîne de middlewares : limiter → validator → handleValidationErrors → controller. |
| `/src/backend/server.js` | Ajout du montage : `app.use('/api/contact', contactRoutes)` |
| `/src/backend/API.md` | Documentation complète POST /api/contact : corps, exemples requête/réponse, tous les codes d'erreur. |
| `/src/backend/tests/contact.test.js` | 15 tests d'intégration HTTP : champs manquants, contraintes de longueur, email invalide, lang invalide, localisation FR/EN des messages, format de réponse, GET 404. |

### Points d'attention

- Les erreurs d'envoi d'e-mail (SMTP) sont loguées côté serveur mais ne retournent pas d'erreur 500 au client : l'enregistrement BDD est la réponse principale.
- `SITE_OWNER_EMAIL` doit être défini dans `.env` pour que les notifications parviennent au propriétaire.
- Le rate limiter contact (3/IP/heure) est indépendant du rate limiter global (100/IP/15 min).
- Les tests `contact.test.js` valident la couche HTTP + validation sans BDD réelle ; les cas 201 nécessitent une BDD de test active.

### Prochaine étape suggérée

Ticket T-006 (articles/blog) ou envoi au Reviewer pour validation de T-005.

---

## Message de l'agent back-end — 2026-11-22

**Ticket** : T-006 — API Blog
**Statut** : TERMINE

### Livraisons

Tous les critères d'acceptation du ticket T-006 sont satisfaits.

| Fichier | Description |
|---------|-------------|
| `/src/backend/middlewares/auth.js` | `requireApiKey` — vérifie header X-API-Key : 401 si absent, 403 si invalide vs process.env.API_KEY |
| `/src/backend/services/markdown.js` | `parseMarkdown(content)` — conversion Markdown→HTML via `marked` (GFM activé), avec suppression des tags `<script>`, `<iframe>`, etc. et attributs `on*` |
| `/src/backend/models/article.js` | `findAll()`, `findBySlug()`, `create()`, `update()`, `count()` — toutes les requêtes SQL paramétrées, filtrage par published/category, pagination LIMIT/OFFSET, UPDATE dynamique |
| `/src/backend/controllers/blog.js` | `getArticles()`, `getArticleBySlug()`, `createArticle()`, `updateArticle()` — résolution de langue (query param > Accept-Language > fr), projection localisée, conversion Markdown à la lecture, gestion 409 sur slug dupliqué |
| `/src/backend/routes/blog.js` | GET / (liste paginée), GET /:slug (article complet), POST / (protégé), PUT /:id (protégé) — validateurs express-validator sur chaque route |
| `/src/backend/server.js` | Ajout `app.use('/api/articles', blogRoutes)` + ajout X-API-Key dans CORS allowedHeaders |
| `/src/backend/API.md` | Documentation complète des 4 endpoints : paramètres, exemples JSON, codes d'erreur |
| `/src/backend/tests/blog.test.js` | Tests unitaires (parseMarkdown, requireApiKey) + tests d'intégration HTTP (validation, auth 401/403, slugs invalides, corps vide PUT, format erreur standard) |

### Architecture et décisions techniques

- **Localisation** : la fonction `localizeArticle()` fait un repli sur l'autre langue si le champ est vide (ex. : title_fr vide → retourne title_en).
- **Contenu Markdown** : converti côté serveur uniquement sur GET /:slug (pas dans la liste pour alléger les réponses). Le champ `content_raw` expose le Markdown original pour l'édition côté client.
- **Sécurité XSS** : suppression des balises et attributs dangereux par regex légère (pas de dépendance DOMPurify côté Node).
- **UPDATE dynamique** : le modèle `article.js` construit la clause SET dynamiquement — seuls les champs explicitement fournis sont modifiés.
- **Articles non publiés** : exclus des GET publics (liste et slug) ; toujours retournés sur les routes protégées POST/PUT.

### Points d'attention

- `API_KEY` doit être défini dans `.env` pour que les routes protégées fonctionnent.
- La migration `001_initial_schema.sql` existante couvre déjà la table `articles` — aucune nouvelle migration n'est nécessaire.
- Les tests `blog.test.js` couvrent la validation et l'auth sans BDD ; les cas de succès 200/201 nécessitent une BDD de test active.

### Prochaine étape suggérée

Ticket T-007 (API Profil) ou revue du T-006 par l'agent Reviewer.

---

## Message de l'agent back-end — 2026-11-22

**Ticket** : T-007 — API Profil, i18n serveur & Génération CV PDF
**Statut** : TERMINE

### Livraisons

Tous les critères d'acceptation du ticket T-007 sont satisfaits.

| Fichier | Description |
|---------|-------------|
| `/src/backend/i18n/fr.json` | Traductions françaises : messages d'erreur API (profile_not_found, lang_invalid, pdf_generation_failed…), labels CV PDF (sections, en-têtes), templates email contact |
| `/src/backend/i18n/en.json` | Mêmes clés en anglais |
| `/src/backend/i18n/index.js` | Helper `t(key, lang)` avec notation pointée, fallback sur 'fr' si clé manquante en 'en', retour de la clé brute si introuvable partout. `normalizeLang(lang)` retourne 'fr' ou 'en' (casse insensible, défaut 'fr') |
| `/src/backend/models/profile.js` | `findOne()` — SELECT le profil unique (LIMIT 1 ORDER BY id). `update(data)` — UPDATE partiel via COALESCE sur les 11 champs bilingues + JSONB, rafraîchit always `updated_at` pour invalider le cache PDF |
| `/src/backend/services/pdf-generator.js` | `generateCV(profileData, lang)` — retourne un stream PDFKit. Layout A4 Helvetica marges 50pt : en-tête (nom grand bleu, titre italique gris, coordonnées), À propos, Compétences (groupées par catégorie), Expériences (chronologie inversée), Formation. Palette : titres #1E40AF, texte #111111, secondaire #555555, séparateurs #DDDDDD. Numéros de page via bufferPages |
| `/src/backend/controllers/profile.js` | `getProfile()` — retourne profil localisé (champs bilingues aplatis selon lang). `updateProfile()` — met à jour le profil + invalide le cache PDF. `downloadCV()` — cache en mémoire par langue basé sur updated_at (X-Cache: HIT/MISS), stream → buffer → send avec bons headers |
| `/src/backend/routes/profile.js` | GET /profile (public + validation lang), PUT /profile (requireApiKey), GET /cv (public + validation lang). Monté via `app.use('/api', profileRoutes)` |
| `/src/backend/server.js` | Ajout `const profileRoutes = require('./routes/profile')` + `app.use('/api', profileRoutes)` |
| `/src/backend/API.md` | Documentation complète GET /api/profile, PUT /api/profile (formats JSONB experiences/education), GET /api/cv (structure PDF, palette couleurs, cache X-Cache) |
| `/src/backend/tests/profile.test.js` | Tests d'intégration HTTP : 200 profil FR/EN, localisation title/bio/experiences/education, 400 lang invalide, 404 profil absent, headers PDF, buffer non vide, filename FR/EN, cache HIT, PUT sans auth 401/403 |
| `/src/backend/tests/i18n.test.js` | Tests unitaires : t() FR/EN, fallback lang inconnue, clé manquante → clé brute, normalizeLang() (casse, défaut, valeurs invalides), SUPPORTED_LANGS, templates email |

### Architecture et décisions techniques

- **Cache PDF** : stockage en mémoire `{ fr: { updatedAt, buffer }, en: { updatedAt, buffer } }`. Comparaison de `updated_at` (timestamp BDD) pour invalider. Réinitialisé à chaque PUT /api/profile. Pas de persistence au redémarrage (acceptable pour un site vitrine).
- **localizeProfile()** : projection "aplatie" — les champs `_fr`/`_en` sont absents de la réponse API, remplacés par `title`, `bio`, `role`, `degree` selon la langue. Repli sur l'autre langue si le champ est vide.
- **experiences/education** : chronologie inversée pour le PDF (`[...experiences].reverse()`) sans modifier le JSONB en BDD.
- **generateCV()** : appelle `doc.end()` en interne — le caller collecte les chunks via events `data`/`end`. `bufferPages: true` requis pour addPageNumbers().
- **Validation lang** : via express-validator `query('lang').isIn(['fr','en'])` — retourne 400 avec format standard `{ error: { code, fields } }`.

### Points d'attention

- `pdfkit` v0.15 est déjà dans les dépendances (T-004) — aucun `npm install` supplémentaire.
- La table `profile` est à une seule ligne — `findOne()` fait un `LIMIT 1`, `update()` cible `WHERE id = (SELECT id FROM profile LIMIT 1)`.
- Les tests `profile.test.js` mockent `profileModel.findOne/update` pour fonctionner sans BDD.
- En production, prévoir un redémarrage du cache si plusieurs instances Node.js (utiliser Redis pour un cache distribué).

### Prochaine étape suggérée

Revue T-007 par l'agent Reviewer, puis lancement du ticket front-end (agent-composants / agent-ecrans).

---

## Message de l'agent Écrans & Layout — 2026-11-22

**Ticket** : T-018 — Corrections post-revue
**Statut** : CORRECTIONS T-018 TERMINÉES

### Corrections appliquées

| ID | Fichier | Correction |
|----|---------|------------|
| M-04 / M-05 | `src/ui/components/footer.html` | Remplacement de "ConseilIT" par "Wilfried Langry" dans l'aria-label du lien GitHub (ligne 130) et dans le texte de copyright statique (ligne 156). |
| M-06 | `src/pages/404.html` | Ajout de `<script src="/src/pages/router.js"></script>` avant `layout.js`. |
| M-07 | `src/i18n/index.js` | Ajout dans `localizeDOM()` d'un bloc traitant les éléments `[data-i18n-content]` : met à jour l'attribut `content` des meta tags (meta description, etc.) avec la traduction correspondante. Les clés `home.metaDesc` existaient déjà dans `fr.json` et `en.json`. |
| M-08 | `src/pages/blog/article.html` | Ajout de 4 balises dans le `<head>` : `<link rel="canonical" id="canonical-url">`, `<link rel="alternate" hreflang="fr" id="hreflang-fr">`, `<link rel="alternate" hreflang="en" id="hreflang-en">`, `<link rel="alternate" hreflang="x-default" id="hreflang-default">`. Le script JS inline de la page les remplit dynamiquement avec les URLs `/fr/blog/SLUG` et `/en/blog/SLUG` lors du chargement de l'article. |
| M-09 | `src/i18n/index.js` | Remplacement de la logique `innerHTML` implicite (détection de `<` dans la traduction) par une approche sécurisée : `textContent` par défaut pour tous les éléments `[data-i18n]`, `innerHTML` uniquement pour les éléments explicitement marqués `[data-i18n-html]`. L'élément `h1.hero__title` dans `home/index.html` a reçu `data-i18n-html` car sa traduction contient un `<span class="hero__highlight">`. |
| m-01 | `src/ui/components/footer.html` | Les liens légaux (Mentions légales, Politique de confidentialité, Cookies, Accessibilité) masqués avec `style="display:none"` pour éviter des 404 en attendant la création de ces pages. Un commentaire HTML documente la raison. |
| m-06 | `public/sitemap.xml` | Uniformisation des trailing slashes : `/en/` remplacé par `/en` dans la `<loc>` et les hreflang de la page d'accueil anglaise. Les autres URLs internes (`/en/about`, etc.) n'avaient pas de trailing slash — cohérence maintenue. |
| m-10 | `src/i18n/index.js` | La mise à jour de `document.documentElement.lang` était déjà présente dans `localizeDOM()` et `setLang()`. Confirmé opérationnel — aucune modification nécessaire. |
| m-12 | `src/pages/_layout/layout.js` | Remplacement du `console.warn('[Layout] Erreur chargement fragment:', url, err)` par un catch silencieux, sans exposer l'URL interne en console de production. |

### Points d'attention

- La traduction `home.heroTitle` contient du HTML dans les deux fichiers JSON (fr.json et en.json) — le marquage `data-i18n-html` sur le `<h1>` est intentionnel et documenté dans le code.
- Les liens légaux masqués dans le footer devront être réactivés (retirer `style="display:none"`) lors de la création effective des pages `/mentions-legales`, `/confidentialite`, `/cookies`, `/accessibilite`.
- La mise à jour du canonical dans article.html construit les URLs avec le préfixe `/fr/blog/SLUG` — vérifier que le routeur Express gère bien ces préfixes de langue si la structure de routes change.

---

## Message agent-ecrans — 2026-11-22
Ticket : T-019 — Corrections majeurs S-01 + SEO-01/02/03
Statut : TERMINÉ

Corrections appliquées :
- S-01 : article.html — title/category via textContent, innerHTML conservé uniquement pour article.content (sanitisé serveur)
- SEO-01 : og:description ajouté sur contact/index.html
- SEO-02 : og:description ajouté sur blog/index.html
- SEO-03 : og:description ajouté sur portfolio/index.html

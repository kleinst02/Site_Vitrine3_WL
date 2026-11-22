# API Back-end — Consultant IT

## Généralités

- **Base URL** : `http://localhost:3000` (configurable via `PORT`)
- **Format** : JSON (Content-Type: application/json)
- **Encodage** : UTF-8
- **Rate limit global** : 100 requêtes / 15 min / IP
- **Format d'erreur standard** :
  ```json
  { "error": { "code": <HTTP status>, "message": "<description>" } }
  ```

---

## Health Check

### GET /api/health

Vérifie que le serveur est opérationnel.

**Réponse 200**
```json
{ "status": "ok", "timestamp": "2026-11-22T10:00:00.000Z" }
```

---

## Contacts — /api/contact

| Méthode | URL          | Description                     | Auth |
|---------|--------------|---------------------------------|------|
| POST    | /api/contact | Soumettre un message de contact | Non  |

> Les routes admin (GET liste, DELETE) seront sécurisées et implémentées dans un ticket ultérieur.

---

### POST /api/contact

Enregistre un message de contact en base de données et déclenche les e-mails de notification
(au propriétaire du site) et de confirmation (à l'expéditeur).

**Rate limit** : 3 soumissions par IP par heure (indépendant du rate limit global).

**Corps de la requête (JSON)**

| Champ   | Type   | Requis | Contraintes                             |
|---------|--------|--------|-----------------------------------------|
| name    | string | Oui    | 2–100 caractères (trim automatique)     |
| email   | string | Oui    | Format e-mail valide, max 255 car.      |
| subject | string | Oui    | 5–200 caractères (trim automatique)     |
| message | string | Oui    | 10–5000 caractères (trim automatique)   |
| lang    | string | Non    | `"fr"` ou `"en"` — défaut : `"fr"`     |

**Exemple de requête**
```json
{
  "name": "Alice Dupont",
  "email": "alice@example.com",
  "subject": "Demande de renseignements",
  "message": "Bonjour, je souhaite en savoir plus sur vos services.",
  "lang": "fr"
}
```

**Réponse 201 — Succès**
```json
{
  "data": {
    "id": 42,
    "created_at": "2026-11-22T10:00:00.000Z"
  },
  "message": "Votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais."
}
```

**Réponse 400 — Validation échouée**
```json
{
  "error": {
    "code": 400,
    "message": "Validation échouée. Veuillez corriger les champs indiqués.",
    "fields": [
      { "field": "name", "message": "Le nom doit comporter entre 2 et 100 caractères." }
    ]
  }
}
```

**Réponse 429 — Trop de soumissions**
```json
{
  "error": {
    "code": 429,
    "message": "Trop de soumissions du formulaire de contact. Réessayez dans 1 heure."
  }
}
```

**Réponse 500 — Erreur interne**
```json
{
  "error": {
    "code": 500,
    "message": "Une erreur interne est survenue. Veuillez réessayer plus tard."
  }
}
```

**Codes de réponse**

| Code | Description                                              |
|------|----------------------------------------------------------|
| 201  | Message enregistré avec succès                           |
| 400  | Validation échouée (détail des champs dans `fields`)     |
| 429  | Rate limit atteint (3 soumissions/IP/heure)              |
| 500  | Erreur interne serveur (BDD ou autre)                    |

**Notes**
- Les messages d'erreur sont localisés selon le champ `lang` de la requête.
- En cas d'échec d'envoi d'e-mail, la réponse 201 est quand même retournée
  (l'e-mail est loggué en erreur côté serveur mais ne bloque pas l'utilisateur).
- L'adresse e-mail est normalisée (lowercase) avant stockage.

---

## Articles — /api/articles

| Méthode | URL                  | Description                      | Auth         |
|---------|----------------------|----------------------------------|--------------|
| GET     | /api/articles        | Lister les articles publiés      | Non          |
| GET     | /api/articles/:slug  | Récupérer un article par slug    | Non          |
| POST    | /api/articles        | Créer un article                 | X-API-Key    |
| PUT     | /api/articles/:id    | Mettre à jour un article         | X-API-Key    |

> Authentification : header `X-API-Key: <valeur>` (variable `API_KEY` côté serveur).

---

### GET /api/articles

Liste paginée des articles publiés. Les articles avec `published = false` sont exclus.

**Paramètres de requête (query string)**
| Paramètre | Type    | Défaut | Contraintes         | Description                        |
|-----------|---------|--------|---------------------|------------------------------------|
| lang      | string  | fr     | "fr" ou "en"        | Langue des champs retournés        |
| category  | string  | —      | max 100 caractères  | Filtrer par catégorie              |
| page      | integer | 1      | >= 1                | Numéro de page                     |
| limit     | integer | 10     | 1–50                | Éléments par page                  |

**Réponse 200**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "mon-article",
      "title": "Mon article",
      "excerpt": "Résumé de l'article…",
      "category": "tech",
      "published": true,
      "created_at": "2026-11-22T10:00:00.000Z",
      "updated_at": "2026-11-22T10:00:00.000Z",
      "lang": "fr"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Erreurs**
| Code | Description                                   |
|------|-----------------------------------------------|
| 400  | Paramètre de pagination ou de langue invalide |
| 500  | Erreur interne du serveur                     |

---

### GET /api/articles/:slug

Récupère un article complet par son slug. Le contenu Markdown est converti en HTML côté serveur.

**Paramètres de chemin**
| Paramètre | Type   | Contraintes                        |
|-----------|--------|------------------------------------|
| slug      | string | Minuscules, chiffres et tirets     |

**Paramètres de requête**
| Paramètre | Type   | Défaut | Description                      |
|-----------|--------|--------|----------------------------------|
| lang      | string | fr     | Langue des champs ("fr" ou "en") |

**Réponse 200**
```json
{
  "data": {
    "id": 1,
    "slug": "mon-article",
    "title": "Mon article",
    "excerpt": "Résumé de l'article…",
    "content_html": "<h1>Mon article</h1><p>…</p>",
    "content_raw": "# Mon article\n\n…",
    "category": "tech",
    "published": true,
    "created_at": "2026-11-22T10:00:00.000Z",
    "updated_at": "2026-11-22T10:00:00.000Z",
    "lang": "fr"
  }
}
```

**Erreurs**
| Code | Description                                              |
|------|----------------------------------------------------------|
| 400  | Slug contient des caractères invalides (majuscules, _…) |
| 404  | Article introuvable ou non publié                        |
| 500  | Erreur interne du serveur                                |

---

### POST /api/articles

Crée un nouvel article. Requiert le header `X-API-Key`.

**Headers requis**
| Header       | Valeur                |
|--------------|-----------------------|
| X-API-Key    | Clé API secrète       |
| Content-Type | application/json      |

**Corps de la requête**
| Champ       | Type    | Requis | Contraintes                                      |
|-------------|---------|--------|--------------------------------------------------|
| slug        | string  | Oui    | Unique, minuscules, chiffres, tirets, max 255    |
| title_fr    | string  | Oui    | 2–255 caractères                                 |
| title_en    | string  | Non    | max 255 caractères                               |
| content_fr  | string  | Oui    | minimum 10 caractères (Markdown)                 |
| content_en  | string  | Non    | Markdown                                         |
| excerpt_fr  | string  | Non    | max 500 caractères                               |
| excerpt_en  | string  | Non    | max 500 caractères                               |
| category    | string  | Non    | max 100 caractères                               |
| published   | boolean | Non    | Défaut : false                                   |

**Réponse 201**
```json
{
  "data": {
    "id": 42,
    "slug": "nouveau-article",
    "title_fr": "Nouvel article",
    "title_en": "New article",
    "excerpt_fr": null,
    "excerpt_en": null,
    "category": "tech",
    "published": false,
    "created_at": "2026-11-22T10:00:00.000Z",
    "updated_at": "2026-11-22T10:00:00.000Z"
  }
}
```

**Erreurs**
| Code | Description                                        |
|------|----------------------------------------------------|
| 400  | Validation échouée (champ manquant ou invalide)    |
| 401  | Header X-API-Key absent                            |
| 403  | Clé API invalide                                   |
| 409  | Un article avec ce slug existe déjà                |
| 500  | Erreur interne du serveur                          |

---

### PUT /api/articles/:id

Met à jour un article existant. Seuls les champs fournis sont modifiés. `updated_at` est toujours rafraîchi. Requiert le header `X-API-Key`.

**Paramètres de chemin**
| Paramètre | Type    | Contraintes         |
|-----------|---------|---------------------|
| id        | integer | Entier positif >= 1 |

**Headers requis**
| Header       | Valeur           |
|--------------|------------------|
| X-API-Key    | Clé API secrète  |
| Content-Type | application/json |

**Corps de la requête** (au moins un champ requis)
| Champ       | Type    | Requis | Contraintes                                   |
|-------------|---------|--------|-----------------------------------------------|
| slug        | string  | Non    | Unique, minuscules, chiffres, tirets, max 255 |
| title_fr    | string  | Non    | 2–255 caractères                              |
| title_en    | string  | Non    | max 255 caractères                            |
| content_fr  | string  | Non    | minimum 10 caractères (Markdown)              |
| content_en  | string  | Non    | Markdown                                      |
| excerpt_fr  | string  | Non    | max 500 caractères                            |
| excerpt_en  | string  | Non    | max 500 caractères                            |
| category    | string  | Non    | max 100 caractères                            |
| published   | boolean | Non    | true ou false                                 |

**Réponse 200**
```json
{
  "data": {
    "id": 42,
    "slug": "article-modifie",
    "title_fr": "Titre modifié",
    "title_en": "Modified title",
    "excerpt_fr": null,
    "excerpt_en": null,
    "category": "tech",
    "published": true,
    "created_at": "2026-11-22T10:00:00.000Z",
    "updated_at": "2026-11-22T11:00:00.000Z"
  }
}
```

**Erreurs**
| Code | Description                                     |
|------|-------------------------------------------------|
| 400  | Corps vide, id invalide ou champ mal formaté    |
| 401  | Header X-API-Key absent                         |
| 403  | Clé API invalide                                |
| 404  | Article introuvable                             |
| 409  | Un article avec ce slug existe déjà             |
| 500  | Erreur interne du serveur                       |

---

## Profil — /api/profile

| Méthode | URL          | Description                     | Auth      |
|---------|--------------|---------------------------------|-----------|
| GET     | /api/profile | Récupérer le profil localisé    | Non       |
| PUT     | /api/profile | Mettre à jour le profil (admin) | X-API-Key |

### GET /api/profile

Retourne les données du profil du consultant. Les champs bilingues (title, bio, experiences, education)
sont projetés selon la langue demandée.

**Paramètres query**
| Paramètre | Type   | Requis | Valeurs     | Défaut | Description             |
|-----------|--------|--------|-------------|--------|-------------------------|
| lang      | string | Non    | "fr", "en"  | "fr"   | Langue de localisation  |

**Réponse 200**
```json
{
  "data": {
    "id": 1,
    "name": "Jean Dupont",
    "title": "Consultant IT Senior",
    "bio": "Consultant IT avec 10 ans d'expérience.",
    "skills": [
      { "category": "Backend", "items": ["Node.js", "PostgreSQL"] }
    ],
    "experiences": [
      {
        "company": "Acme Corp",
        "role": "Architecte Solutions",
        "period": "2020 — présent",
        "description": "Conception d'architectures cloud."
      }
    ],
    "education": [
      {
        "school": "École Polytechnique",
        "degree": "Master Informatique",
        "year": "2014"
      }
    ],
    "contact_email": "jean.dupont@example.com",
    "linkedin_url": "https://linkedin.com/in/jeandupont",
    "github_url": "https://github.com/jeandupont",
    "updated_at": "2026-01-01T00:00:00.000Z"
  },
  "lang": "fr"
}
```

**Erreurs**
| Code | Condition                              |
|------|----------------------------------------|
| 400  | Paramètre lang invalide (hors fr/en)   |
| 404  | Aucun profil enregistré en base        |
| 500  | Erreur interne                         |

---

### PUT /api/profile

Met à jour le profil du consultant. Mise à jour partielle : seuls les champs fournis sont modifiés.
Invalide automatiquement le cache PDF (`updated_at` est toujours rafraîchi).

**Headers requis**
| Header       | Valeur           |
|--------------|------------------|
| X-API-Key    | Clé API secrète  |
| Content-Type | application/json |

**Corps de la requête (tous les champs sont optionnels)**
| Champ          | Type   | Description                                   |
|----------------|--------|-----------------------------------------------|
| name           | string | Nom complet                                   |
| title_fr       | string | Titre professionnel en français               |
| title_en       | string | Titre professionnel en anglais                |
| bio_fr         | string | Bio / résumé en français                      |
| bio_en         | string | Bio / résumé en anglais                       |
| skills         | array  | Tableau JSONB des compétences                 |
| experiences    | array  | Tableau JSONB des expériences (voir format)   |
| education      | array  | Tableau JSONB des formations (voir format)    |
| contact_email  | string | Adresse e-mail de contact                     |
| linkedin_url   | string | URL profil LinkedIn                           |
| github_url     | string | URL profil GitHub                             |

**Format JSONB experiences**
```json
[
  {
    "company": "Acme Corp",
    "role_fr": "Architecte Solutions",
    "role_en": "Solutions Architect",
    "period": "2020 — présent",
    "description_fr": "Conception d'architectures cloud.",
    "description_en": "Cloud architecture design."
  }
]
```

**Format JSONB education**
```json
[
  {
    "school": "École Polytechnique",
    "degree_fr": "Master Informatique",
    "degree_en": "Master of Computer Science",
    "year": "2014"
  }
]
```

**Réponses**
| Code | Description                                              |
|------|----------------------------------------------------------|
| 200  | Profil mis à jour — retourne le profil localisé          |
| 401  | Header X-API-Key absent                                  |
| 403  | Clé API invalide                                         |
| 404  | Aucun profil en base                                     |
| 500  | Erreur interne                                           |

---

## CV PDF — /api/cv

| Méthode | URL     | Description                        | Auth |
|---------|---------|------------------------------------|------|
| GET     | /api/cv | Télécharger le CV en PDF           | Non  |

### GET /api/cv

Génère dynamiquement le CV du consultant en PDF depuis les données BDD et le retourne en téléchargement.

Cache en mémoire : si `updated_at` du profil n'a pas changé depuis la dernière génération, le buffer
mis en cache est renvoyé directement (`X-Cache: HIT`), sinon régénération (`X-Cache: MISS`).

**Paramètres query**
| Paramètre | Type   | Requis | Valeurs     | Défaut | Description            |
|-----------|--------|--------|-------------|--------|------------------------|
| lang      | string | Non    | "fr", "en"  | "fr"   | Langue du CV           |

**Réponse 200**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="CV-Jean-Dupont-fr.pdf"` (préfixe : "CV" en FR, "Resume" en EN)
- `Content-Length: <taille en octets>`
- `X-Cache: HIT | MISS`

**Structure du PDF (A4, Helvetica, marges 50pt)**
1. En-tête : nom (grand, bleu), titre professionnel (gris italique), coordonnées
2. À propos / About : bio courte
3. Compétences / Skills : groupées par catégorie
4. Expériences / Experience : chronologie inversée (plus récente en premier)
5. Formation / Education : liste des diplômes
6. Numéros de page en pied

**Palette de couleurs**
- Titres sections : `#1E40AF` (bleu profond)
- Texte principal : `#111111`
- Texte secondaire : `#555555`
- Séparateurs : `#DDDDDD`

**Erreurs**
| Code | Condition                              |
|------|----------------------------------------|
| 400  | Paramètre lang invalide (hors fr/en)   |
| 404  | Aucun profil en base                   |
| 500  | Erreur de génération PDF               |

---

## Codes d'erreur

| Code | Signification                            |
|------|------------------------------------------|
| 200  | Succès                                   |
| 201  | Ressource créée                          |
| 204  | Succès sans contenu                      |
| 400  | Requête invalide (validation échouée)    |
| 401  | Authentification requise                 |
| 403  | Accès interdit                           |
| 404  | Ressource introuvable                    |
| 409  | Conflit (ex : slug déjà existant)        |
| 422  | Données sémantiquement incorrectes       |
| 429  | Trop de requêtes (rate limit)            |
| 500  | Erreur interne du serveur                |

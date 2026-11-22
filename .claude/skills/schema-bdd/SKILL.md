---
name: schema-bdd
description: Modélise un schéma PostgreSQL et écrit les migrations SQL (tables, clés, index, contraintes). À utiliser pour toute nouvelle entité ou évolution de données.
---

# Schéma de base de données

1. Identifier entités, relations (1-1, 1-N, N-N) et volumétrie à partir du ticket.
2. Nommer en `snake_case`, tables au pluriel, clé `id` (UUID ou BIGINT identity), `created_at`/`updated_at`.
3. Poser les contraintes : `NOT NULL`, `UNIQUE`, `CHECK`, clés étrangères avec `ON DELETE` explicite.
4. Indexer les clés étrangères et colonnes de filtrage fréquent.
5. Écrire une migration versionnée `/src/backend/migrations/NNN_description.sql` avec section up et down.
6. Ne jamais stocker de mot de passe en clair ; données sensibles minimisées.
7. Fournir un script de seed de développement sans données réelles.

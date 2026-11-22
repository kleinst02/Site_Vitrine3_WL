-- =============================================================
-- Migration 001 : Schéma initial
-- Site vitrine consultant IT (contacts, articles, profil)
-- =============================================================

-- -----------------------------------------------
-- UP : création des tables et index
-- -----------------------------------------------

-- Table contacts
-- Stocke les soumissions du formulaire de contact.
CREATE TABLE IF NOT EXISTS contacts (
  id         SERIAL       PRIMARY KEY,
  name       VARCHAR(100) NOT NULL CHECK (char_length(name) >= 2),
  email      VARCHAR(255) NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject    VARCHAR(200) NOT NULL CHECK (char_length(subject) >= 3),
  message    TEXT         NOT NULL CHECK (char_length(message) >= 10),
  lang       VARCHAR(2)   NOT NULL DEFAULT 'fr' CHECK (lang IN ('fr', 'en')),
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Table articles
-- Contenus bilingues FR/EN du blog.
CREATE TABLE IF NOT EXISTS articles (
  id          SERIAL       PRIMARY KEY,
  slug        VARCHAR(255) NOT NULL UNIQUE CHECK (slug ~* '^[a-z0-9-]+$'),
  title_fr    VARCHAR(255) NOT NULL,
  title_en    VARCHAR(255),
  content_fr  TEXT         NOT NULL,
  content_en  TEXT,
  excerpt_fr  TEXT,
  excerpt_en  TEXT,
  category    VARCHAR(100),
  published   BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Table profile
-- Profil unique du consultant (données bilingues + JSON structuré).
CREATE TABLE IF NOT EXISTS profile (
  id            SERIAL       PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  title_fr      VARCHAR(255),
  title_en      VARCHAR(255),
  bio_fr        TEXT,
  bio_en        TEXT,
  skills        JSONB        NOT NULL DEFAULT '[]'::jsonb,
  experiences   JSONB        NOT NULL DEFAULT '[]'::jsonb,
  education     JSONB        NOT NULL DEFAULT '[]'::jsonb,
  contact_email VARCHAR(255) CHECK (contact_email IS NULL OR contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  linkedin_url  VARCHAR(500),
  github_url    VARCHAR(500),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Index articles
CREATE INDEX IF NOT EXISTS idx_articles_slug      ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_category  ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created   ON articles(created_at DESC);

-- Index contacts (recherche par date, utile pour l'admin)
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at DESC);

-- -----------------------------------------------
-- DOWN : suppression (rollback)
-- -----------------------------------------------
-- Pour annuler cette migration, exécuter :
--
-- DROP TABLE IF EXISTS contacts;
-- DROP TABLE IF EXISTS articles;
-- DROP TABLE IF EXISTS profile;

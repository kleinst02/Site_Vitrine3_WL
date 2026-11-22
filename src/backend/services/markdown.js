/**
 * Service de conversion Markdown vers HTML.
 * Utilise la bibliothèque `marked` avec configuration GFM.
 * Le contenu HTML produit est assaini par `sanitize-html` pour
 * prévenir les injections XSS.
 */
'use strict';

const { marked } = require('marked');
const sanitizeHtml = require('sanitize-html');

// Configuration globale de marked
// GFM : GitHub Flavored Markdown (tableaux, barré, listes de tâches)
marked.setOptions({
  gfm: true,
  breaks: false,
});

/**
 * Configuration de sanitize-html : on autorise uniquement les balises
 * de contenu standard et on supprime tout ce qui est dangereux.
 */
const SANITIZE_OPTIONS = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'strong', 'em', 'del', 's', 'u', 'sub', 'sup',
    'a', 'img',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'figure', 'figcaption',
    'div', 'span',
    'input', // pour les checkboxes GFM
  ],
  allowedAttributes: {
    'a':     ['href', 'title', 'target', 'rel'],
    'img':   ['src', 'alt', 'title', 'width', 'height'],
    'th':    ['align'],
    'td':    ['align'],
    'input': ['type', 'checked', 'disabled'],
    'code':  ['class'], // highlight.js / prism classes
    'pre':   ['class'],
    'div':   ['class', 'id'],
    'span':  ['class', 'id'],
  },
  // Interdire tous les attributs on* (événements JavaScript)
  allowedSchemes: ['http', 'https', 'mailto'],
  // Supprimer (pas encoder) les balises non autorisées
  disallowedTagsMode: 'discard',
};

/**
 * Convertit du contenu Markdown en HTML sécurisé.
 * @param {string} content - Contenu Markdown brut
 * @returns {string} HTML sécurisé
 */
function parseMarkdown(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Conversion Markdown → HTML
  const rawHtml = marked.parse(content);

  // Assainissement via sanitize-html (supprime script, iframe, svg, style, on*, etc.)
  const cleanHtml = sanitizeHtml(rawHtml, SANITIZE_OPTIONS);

  return cleanHtml;
}

module.exports = { parseMarkdown };

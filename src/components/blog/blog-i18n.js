/**
 * Traductions FR/EN pour les composants blog.
 */
'use strict';

var BlogI18n = {
  fr: {
    readMore: 'Lire la suite',
    previous: 'Précédent',
    next: 'Suivant',
    pageOf: 'Page {current} sur {total}',
    noArticles: 'Aucun article pour le moment.',
    loading: 'Chargement des articles...',
    error: 'Impossible de charger les articles.',
    publishedOn: 'Publié le',
    category: 'Catégorie',
    backToList: '\u2190 Retour aux articles',
    prevArticle: 'Article précédent',
    nextArticle: 'Article suivant',
    minRead: 'min de lecture',
    allCategories: 'Toutes les catégories',
  },
  en: {
    readMore: 'Read more',
    previous: 'Previous',
    next: 'Next',
    pageOf: 'Page {current} of {total}',
    noArticles: 'No articles yet.',
    loading: 'Loading articles...',
    error: 'Unable to load articles.',
    publishedOn: 'Published on',
    category: 'Category',
    backToList: '\u2190 Back to articles',
    prevArticle: 'Previous article',
    nextArticle: 'Next article',
    minRead: 'min read',
    allCategories: 'All categories',
  },
};

function blogT(key, lang, params) {
  lang = lang || 'fr';
  params = params || {};
  var str = (BlogI18n[lang] && BlogI18n[lang][key]) || BlogI18n.fr[key] || key;
  return str.replace(/\{(\w+)\}/g, function (_, k) { return params[k] != null ? params[k] : k; });
}

function getBlogLang() {
  var lang = document.documentElement.lang || 'fr';
  return lang.startsWith('en') ? 'en' : 'fr';
}

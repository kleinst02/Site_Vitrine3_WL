/**
 * Composant : Liste d'articles avec pagination.
 * Fetch GET /api/articles, render des cartes, gestion pagination.
 * Dépendances : blog-i18n.js (blogT, getBlogLang)
 */
'use strict';

(function () {

  var ITEMS_PER_PAGE = 9;

  function ArticleList() {
    this.lang = getBlogLang();
    this.page = 1;
    this.totalPages = 1;

    // DOM
    this.grid       = document.getElementById('blog-grid');
    this.loading    = document.getElementById('blog-loading');
    this.errorEl    = document.getElementById('blog-error');
    this.emptyEl    = document.getElementById('blog-empty');
    this.pagination = document.getElementById('blog-pagination');
    this.prevBtn    = document.getElementById('blog-prev');
    this.nextBtn    = document.getElementById('blog-next');
    this.pageInfo   = document.getElementById('blog-page-info');

    if (!this.grid) return;

    this._bindEvents();
    this.loadArticles();
  }

  ArticleList.prototype._bindEvents = function () {
    var self = this;
    this.prevBtn.addEventListener('click', function () {
      if (self.page > 1) { self.page--; self.loadArticles(); }
    });
    this.nextBtn.addEventListener('click', function () {
      if (self.page < self.totalPages) { self.page++; self.loadArticles(); }
    });
  };

  ArticleList.prototype.loadArticles = function () {
    var self = this;
    this._setState('loading');

    var url = '/api/articles?lang=' + this.lang +
              '&page=' + this.page +
              '&limit=' + ITEMS_PER_PAGE;

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var articles = data.articles || data.data || [];
        self.totalPages = data.totalPages || Math.ceil((data.total || 0) / ITEMS_PER_PAGE) || 1;

        if (articles.length === 0) {
          self._setState('empty');
        } else {
          self._renderArticles(articles);
          self._updatePagination();
          self._setState('loaded');
        }
      })
      .catch(function () {
        self._setState('error');
      });
  };

  ArticleList.prototype._renderArticles = function (articles) {
    // Vider la grille
    this.grid.innerHTML = '';

    var self = this;
    articles.forEach(function (article) {
      var card = self._createCard(article);
      self.grid.appendChild(card);
    });
  };

  ArticleList.prototype._createCard = function (article) {
    var el = document.createElement('article');
    el.className = 'article-card card';

    var link = document.createElement('a');
    link.href = '/blog/' + article.slug;
    link.className = 'article-card__link';
    link.setAttribute('aria-label', blogT('readMore', this.lang) + ' : ' + article.title);

    // Image
    var imageDiv = document.createElement('div');
    imageDiv.className = 'article-card__image';

    if (article.image_url) {
      var img = document.createElement('img');
      img.src = article.image_url;
      img.alt = '';
      img.loading = 'lazy';
      img.className = 'article-card__img';
      imageDiv.appendChild(img);
    } else {
      var placeholder = document.createElement('div');
      placeholder.className = 'article-card__placeholder';
      placeholder.setAttribute('role', 'img');
      placeholder.setAttribute('aria-label', 'Image');
      placeholder.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';
      imageDiv.appendChild(placeholder);
    }
    link.appendChild(imageDiv);

    // Body
    var body = document.createElement('div');
    body.className = 'article-card__body';

    // Meta
    var meta = document.createElement('div');
    meta.className = 'article-card__meta';

    var date = document.createElement('time');
    date.className = 'article-card__date';
    date.dateTime = article.published_at || '';
    date.textContent = this._formatDate(article.published_at);
    meta.appendChild(date);

    if (article.category) {
      var badge = document.createElement('span');
      badge.className = 'badge badge-sm';
      badge.textContent = article.category;
      meta.appendChild(badge);
    }
    body.appendChild(meta);

    // Titre
    var title = document.createElement('h3');
    title.className = 'article-card__title';
    title.textContent = article.title;
    body.appendChild(title);

    // Extrait
    var excerpt = document.createElement('p');
    excerpt.className = 'article-card__excerpt';
    excerpt.textContent = article.excerpt || '';
    body.appendChild(excerpt);

    // Lire la suite
    var readMore = document.createElement('span');
    readMore.className = 'article-card__read-more';
    readMore.textContent = blogT('readMore', this.lang) + ' \u2192';
    body.appendChild(readMore);

    link.appendChild(body);
    el.appendChild(link);
    return el;
  };

  ArticleList.prototype._formatDate = function (dateStr) {
    if (!dateStr) return '';
    try {
      var d = new Date(dateStr);
      return d.toLocaleDateString(this.lang === 'en' ? 'en-GB' : 'fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  ArticleList.prototype._updatePagination = function () {
    this.prevBtn.disabled = this.page <= 1;
    this.nextBtn.disabled = this.page >= this.totalPages;
    this.pageInfo.textContent = blogT('pageOf', this.lang, {
      current: this.page,
      total: this.totalPages
    });

    // Labels i18n
    this.prevBtn.querySelector('.pagination-label').textContent = blogT('previous', this.lang);
    this.nextBtn.querySelector('.pagination-label').textContent = blogT('next', this.lang);
  };

  ArticleList.prototype._setState = function (state) {
    this.loading.hidden    = state !== 'loading';
    this.errorEl.hidden    = state !== 'error';
    this.emptyEl.hidden    = state !== 'empty';
    this.grid.hidden       = state !== 'loaded';
    this.pagination.hidden = state !== 'loaded';
  };

  /* --- Auto-init ----------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    new ArticleList();
  });

})();

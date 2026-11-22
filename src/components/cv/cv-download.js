/**
 * Composant : Téléchargement CV PDF.
 * Fetch GET /api/cv?lang=xx → blob → téléchargement automatique.
 * Dépendances : profile-i18n.js (profileT)
 */
'use strict';

(function () {

  function CVDownload(btn) {
    this.btn = btn;
    this.textEl = btn.querySelector('.cv-download__text');
    this.errorEl = document.getElementById('cv-download-error');
    this.isLoading = false;

    this.lang = btn.getAttribute('data-lang') ||
                (document.documentElement.lang || 'fr').substring(0, 2);
    if (this.lang !== 'en') this.lang = 'fr';

    var self = this;
    btn.addEventListener('click', function () { self.download(); });
  }

  CVDownload.prototype.download = function () {
    if (this.isLoading) return;

    var self = this;
    this._setLoading(true);
    this._hideError();

    fetch('/api/cv?lang=' + this.lang)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.blob();
      })
      .then(function (blob) {
        // Créer un lien de téléchargement temporaire
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'CV_Wilfried_Langry_' + self.lang.toUpperCase() + '.pdf';
        document.body.appendChild(a);
        a.click();

        // Nettoyage
        setTimeout(function () {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);

        self._setLoading(false);
      })
      .catch(function () {
        self._setLoading(false);
        self._showError(profileT('downloadError', self.lang));
      });
  };

  CVDownload.prototype._setLoading = function (loading) {
    this.isLoading = loading;
    this.btn.disabled = loading;

    if (loading) {
      this.btn.classList.add('cv-download--loading');
      this.textEl.textContent = profileT('generating', this.lang);
    } else {
      this.btn.classList.remove('cv-download--loading');
      this.textEl.textContent = profileT('downloadCV', this.lang);
    }
  };

  CVDownload.prototype._showError = function (message) {
    this.errorEl.textContent = message;
    this.errorEl.hidden = false;

    // Masquer après 5 secondes
    var self = this;
    setTimeout(function () { self._hideError(); }, 5000);
  };

  CVDownload.prototype._hideError = function () {
    this.errorEl.textContent = '';
    this.errorEl.hidden = true;
  };

  /* --- Auto-init ----------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('cv-download-btn');
    if (btn) new CVDownload(btn);
  });

})();

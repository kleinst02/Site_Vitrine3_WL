/**
 * Composant : Formulaire de contact interactif
 * Validation front-end temps réel, gestion d'états, appel API.
 * Dépendances : contact-i18n.js (contactT, getContactLang)
 */
'use strict';

(function () {

  /* ============================================================
   * Règles de validation (identiques au back-end)
   * ============================================================ */

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var RULES = {
    name: function (v, lang) {
      if (!v) return contactT('required', lang);
      if (v.length < 2 || v.length > 100) return contactT('nameLength', lang);
      return null;
    },
    email: function (v, lang) {
      if (!v) return contactT('required', lang);
      if (!EMAIL_RE.test(v)) return contactT('emailInvalid', lang);
      return null;
    },
    subject: function (v, lang) {
      if (!v) return contactT('required', lang);
      if (v.length < 5 || v.length > 200) return contactT('subjectLength', lang);
      return null;
    },
    message: function (v, lang) {
      if (!v) return contactT('required', lang);
      if (v.length < 10 || v.length > 5000) return contactT('messageLength', lang);
      return null;
    }
  };

  /* ============================================================
   * Classe ContactForm
   * ============================================================ */

  function ContactForm(formEl) {
    this.form = formEl;
    this.lang = getContactLang();
    this.isSubmitting = false;

    // Références DOM
    this.fields = {
      name:    formEl.querySelector('#contact-name'),
      email:   formEl.querySelector('#contact-email'),
      subject: formEl.querySelector('#contact-subject'),
      message: formEl.querySelector('#contact-message')
    };

    this.errors = {
      name:    formEl.querySelector('#contact-name-error'),
      email:   formEl.querySelector('#contact-email-error'),
      subject: formEl.querySelector('#contact-subject-error'),
      message: formEl.querySelector('#contact-message-error')
    };

    this.submitBtn     = formEl.querySelector('#contact-submit');
    this.btnText       = this.submitBtn.querySelector('.btn-text');
    this.charCount     = formEl.querySelector('#contact-message-count');
    this.successEl     = document.getElementById('contact-success');
    this.errorEl       = document.getElementById('contact-error');

    this._bindEvents();
  }

  /* --- Événements ---------------------------------------- */

  ContactForm.prototype._bindEvents = function () {
    var self = this;

    // Validation on blur
    Object.keys(this.fields).forEach(function (name) {
      self.fields[name].addEventListener('blur', function () {
        self._validateField(name);
      });
    });

    // Compteur de caractères
    this.fields.message.addEventListener('input', function () {
      var len = self.fields.message.value.length;
      self.charCount.textContent = contactT('charCount', self.lang, { count: len });
    });

    // Soumission
    this.form.addEventListener('submit', function (e) {
      e.preventDefault();
      self._handleSubmit();
    });
  };

  /* --- Validation par champ ------------------------------ */

  ContactForm.prototype._validateField = function (name) {
    var value = this.fields[name].value.trim();
    var error = RULES[name](value, this.lang);

    if (error) {
      this._showError(name, error);
      return false;
    }
    this._clearError(name);
    return true;
  };

  ContactForm.prototype._showError = function (name, message) {
    this.fields[name].classList.add('form-input--error');
    this.fields[name].setAttribute('aria-invalid', 'true');
    this.errors[name].textContent = message;
    this.errors[name].classList.add('field-error--visible');
  };

  ContactForm.prototype._clearError = function (name) {
    this.fields[name].classList.remove('form-input--error');
    this.fields[name].removeAttribute('aria-invalid');
    this.errors[name].textContent = '';
    this.errors[name].classList.remove('field-error--visible');
  };

  /* --- Soumission ---------------------------------------- */

  ContactForm.prototype._handleSubmit = function () {
    if (this.isSubmitting) return;

    // Valider tous les champs
    var self = this;
    var valid = true;
    var firstInvalid = null;

    Object.keys(RULES).forEach(function (name) {
      if (!self._validateField(name)) {
        valid = false;
        if (!firstInvalid) firstInvalid = name;
      }
    });

    if (!valid) {
      this.fields[firstInvalid].focus();
      return;
    }

    this._setLoading(true);
    this._hideServerError();

    var body = {
      name:    this.fields.name.value.trim(),
      email:   this.fields.email.value.trim(),
      subject: this.fields.subject.value.trim(),
      message: this.fields.message.value.trim(),
      lang:    this.lang
    };

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(function (res) {
      return res.json().then(function (data) {
        return { status: res.status, data: data };
      });
    })
    .then(function (result) {
      self._setLoading(false);

      if (result.status === 201) {
        self._showSuccess();
      } else if (result.status === 400 && result.data.error && result.data.error.fields) {
        // Erreurs de validation serveur → mapper sur les champs
        result.data.error.fields.forEach(function (f) {
          if (self.errors[f.field]) {
            self._showError(f.field, f.message);
          }
        });
        var first = result.data.error.fields[0];
        if (first && self.fields[first.field]) {
          self.fields[first.field].focus();
        }
      } else if (result.status === 429) {
        self._showServerError(contactT('errorRateLimit', self.lang));
      } else {
        self._showServerError(contactT('errorGeneric', self.lang));
      }
    })
    .catch(function () {
      self._setLoading(false);
      self._showServerError(contactT('errorGeneric', self.lang));
    });
  };

  /* --- États visuels ------------------------------------- */

  ContactForm.prototype._setLoading = function (loading) {
    this.isSubmitting = loading;
    this.submitBtn.disabled = loading;

    if (loading) {
      this.submitBtn.classList.add('contact-submit--loading');
      this.btnText.textContent = contactT('sending', this.lang);
    } else {
      this.submitBtn.classList.remove('contact-submit--loading');
      this.btnText.textContent = contactT('submit', this.lang);
    }
  };

  ContactForm.prototype._showSuccess = function () {
    this.form.hidden = true;
    this.form.reset();
    this.charCount.textContent = contactT('charCount', this.lang, { count: 0 });

    // Mettre à jour le texte de succès dans la bonne langue
    this.successEl.querySelector('.contact-success__title').textContent = contactT('successTitle', this.lang);
    this.successEl.querySelector('.contact-success__text').textContent = contactT('successText', this.lang);
    this.successEl.hidden = false;
    this.successEl.focus();
  };

  ContactForm.prototype._showServerError = function (message) {
    this.errorEl.textContent = message;
    this.errorEl.hidden = false;
  };

  ContactForm.prototype._hideServerError = function () {
    this.errorEl.textContent = '';
    this.errorEl.hidden = true;
  };

  /* --- Auto-init ----------------------------------------- */

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contact-form');
    if (form) new ContactForm(form);
  });

})();

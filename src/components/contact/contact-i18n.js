/**
 * Traductions FR/EN pour le formulaire de contact.
 */
'use strict';

const ContactI18n = {
  fr: {
    heading: 'Contactez-moi',
    nameLabel: 'Nom',
    namePlaceholder: 'Votre nom complet',
    emailLabel: 'Email',
    emailPlaceholder: 'votre@email.com',
    subjectLabel: 'Sujet',
    subjectPlaceholder: "L'objet de votre message",
    messageLabel: 'Message',
    messagePlaceholder: 'Votre message...',
    submit: 'Envoyer',
    sending: 'Envoi en cours...',
    successTitle: 'Message envoyé !',
    successText: 'Merci, je vous répondrai dans les plus brefs délais.',
    errorGeneric: 'Une erreur est survenue. Veuillez réessayer.',
    errorRateLimit: 'Trop de tentatives. Veuillez patienter avant de réessayer.',
    required: 'Ce champ est requis.',
    nameLength: 'Le nom doit comporter entre 2 et 100 caractères.',
    emailInvalid: "L'adresse e-mail n'est pas valide.",
    subjectLength: 'Le sujet doit comporter entre 5 et 200 caractères.',
    messageLength: 'Le message doit comporter entre 10 et 5\u202F000 caractères.',
    charCount: '{count} / 5\u202F000',
  },
  en: {
    heading: 'Contact me',
    nameLabel: 'Name',
    namePlaceholder: 'Your full name',
    emailLabel: 'Email',
    emailPlaceholder: 'your@email.com',
    subjectLabel: 'Subject',
    subjectPlaceholder: 'What is this about?',
    messageLabel: 'Message',
    messagePlaceholder: 'Your message...',
    submit: 'Send',
    sending: 'Sending...',
    successTitle: 'Message sent!',
    successText: 'Thank you, I will get back to you shortly.',
    errorGeneric: 'An error occurred. Please try again.',
    errorRateLimit: 'Too many attempts. Please wait before trying again.',
    required: 'This field is required.',
    nameLength: 'Name must be between 2 and 100 characters.',
    emailInvalid: 'Email address is not valid.',
    subjectLength: 'Subject must be between 5 and 200 characters.',
    messageLength: 'Message must be between 10 and 5,000 characters.',
    charCount: '{count} / 5,000',
  },
};

/**
 * Retourne la traduction pour une clé donnée.
 * @param {string} key
 * @param {string} [lang='fr']
 * @param {object} [params={}]
 * @returns {string}
 */
function contactT(key, lang, params) {
  lang = lang || 'fr';
  params = params || {};
  var str = (ContactI18n[lang] && ContactI18n[lang][key]) || ContactI18n.fr[key] || key;
  return str.replace(/\{(\w+)\}/g, function (_, k) { return params[k] != null ? params[k] : k; });
}

/**
 * Détecte la langue courante du document.
 * @returns {string} 'fr' ou 'en'
 */
function getContactLang() {
  var lang = document.documentElement.lang || 'fr';
  return lang.startsWith('en') ? 'en' : 'fr';
}

/**
 * Service d'envoi d'e-mails via nodemailer (transport SMTP configurable).
 * Toutes les valeurs sensibles proviennent exclusivement des variables d'environnement.
 *
 * Variables requises dans .env :
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS
 *   SITE_OWNER_EMAIL  — adresse du propriétaire du site
 *   SITE_NAME         — nom affiché dans les e-mails (défaut : "Mon Site")
 */
'use strict';

const nodemailer = require('nodemailer');

// ---------------------------------------------------------------------------
// Transport SMTP
// ---------------------------------------------------------------------------

/**
 * Crée le transport nodemailer à partir des variables d'environnement.
 * En mode test (NODE_ENV=test) on utilise un faux transport JSON pour éviter
 * tout envoi réel pendant les tests unitaires.
 */
function createTransport() {
  if (process.env.NODE_ENV === 'test') {
    // Transport "jsonTransport" : capture les emails sans les envoyer
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'localhost',
    port:   parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true = port 465, false = STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const transporter = createTransport();

// ---------------------------------------------------------------------------
// Helpers de localisation
// ---------------------------------------------------------------------------

const SITE_NAME = process.env.SITE_NAME || 'Mon Site';

const TEMPLATES = {
  notification: {
    fr: {
      subject: (d) => `[${SITE_NAME}] Nouveau message de contact — ${d.subject}`,
      html: (d) => `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${escapeHtml(d.name)}</p>
        <p><strong>E-mail :</strong> ${escapeHtml(d.email)}</p>
        <p><strong>Sujet :</strong> ${escapeHtml(d.subject)}</p>
        <p><strong>Langue :</strong> ${d.lang === 'en' ? 'Anglais' : 'Français'}</p>
        <hr>
        <p><strong>Message :</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(d.message)}</p>
        <hr>
        <p style="color:#666;font-size:12px">Reçu le ${new Date().toLocaleString('fr-FR')} via le formulaire de contact de ${SITE_NAME}.</p>
      `,
    },
    en: {
      subject: (d) => `[${SITE_NAME}] New contact message — ${d.subject}`,
      html: (d) => `
        <h2>New contact message</h2>
        <p><strong>Name:</strong> ${escapeHtml(d.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(d.email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(d.subject)}</p>
        <p><strong>Language:</strong> ${d.lang === 'en' ? 'English' : 'French'}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(d.message)}</p>
        <hr>
        <p style="color:#666;font-size:12px">Received on ${new Date().toLocaleString('en-GB')} via the contact form of ${SITE_NAME}.</p>
      `,
    },
  },
  confirmation: {
    fr: {
      subject: (d) => `[${SITE_NAME}] Votre message a bien été reçu`,
      html: (d) => `
        <h2>Bonjour ${escapeHtml(d.name)},</h2>
        <p>Votre message concernant <strong>${escapeHtml(d.subject)}</strong> a bien été reçu.</p>
        <p>Je vous répondrai dans les meilleurs délais.</p>
        <hr>
        <p><em>Récapitulatif de votre message :</em></p>
        <p style="white-space:pre-wrap;color:#444">${escapeHtml(d.message)}</p>
        <hr>
        <p style="color:#666;font-size:12px">Cet e-mail a été envoyé automatiquement par ${SITE_NAME}. Merci de ne pas y répondre directement.</p>
      `,
    },
    en: {
      subject: (d) => `[${SITE_NAME}] Your message has been received`,
      html: (d) => `
        <h2>Hello ${escapeHtml(d.name)},</h2>
        <p>Your message about <strong>${escapeHtml(d.subject)}</strong> has been received.</p>
        <p>I will get back to you as soon as possible.</p>
        <hr>
        <p><em>Summary of your message:</em></p>
        <p style="white-space:pre-wrap;color:#444">${escapeHtml(d.message)}</p>
        <hr>
        <p style="color:#666;font-size:12px">This email was sent automatically by ${SITE_NAME}. Please do not reply to this message.</p>
      `,
    },
  },
};

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

/**
 * Échappe les caractères HTML sensibles pour prévenir tout XSS dans les templates.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Résout la langue : 'fr' ou 'en', défaut 'fr'.
 * @param {string} lang
 * @returns {'fr'|'en'}
 */
function resolveLang(lang) {
  return lang === 'en' ? 'en' : 'fr';
}

// ---------------------------------------------------------------------------
// Fonctions publiques
// ---------------------------------------------------------------------------

/**
 * Envoie un e-mail de notification au propriétaire du site.
 *
 * @param {{ name: string, email: string, subject: string, message: string, lang: string }} contactData
 * @returns {Promise<void>}
 */
async function sendContactNotification(contactData) {
  const ownerEmail = process.env.SITE_OWNER_EMAIL;
  if (!ownerEmail) {
    console.warn('[MAILER] SITE_OWNER_EMAIL non défini — notification ignorée.');
    return;
  }

  const lang = resolveLang(contactData.lang);
  const tpl  = TEMPLATES.notification[lang];

  await transporter.sendMail({
    from:    `"${SITE_NAME}" <${process.env.SMTP_USER || ownerEmail}>`,
    to:      ownerEmail,
    replyTo: contactData.email,
    subject: tpl.subject(contactData),
    html:    tpl.html(contactData),
  });
}

/**
 * Envoie un e-mail de confirmation à l'expéditeur.
 *
 * @param {{ name: string, email: string, subject: string, message: string, lang: string }} contactData
 * @returns {Promise<void>}
 */
async function sendContactConfirmation(contactData) {
  const lang = resolveLang(contactData.lang);
  const tpl  = TEMPLATES.confirmation[lang];

  await transporter.sendMail({
    from:    `"${SITE_NAME}" <${process.env.SMTP_USER || process.env.SITE_OWNER_EMAIL}>`,
    to:      contactData.email,
    subject: tpl.subject(contactData),
    html:    tpl.html(contactData),
  });
}

module.exports = { sendContactNotification, sendContactConfirmation };

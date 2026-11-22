/**
 * Contrôleur pour les opérations sur les messages de contact.
 * Orchestre : validation (faite en amont par le middleware), stockage BDD, envoi e-mails.
 */
'use strict';

const contactModel = require('../models/contact');
const mailer       = require('../services/mailer');

// Messages de succès localisés
const SUCCESS_MESSAGES = {
  fr: 'Votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais.',
  en: 'Your message has been sent successfully. We will get back to you as soon as possible.',
};

// Messages d'erreur interne localisés
const ERROR_MESSAGES = {
  fr: 'Une erreur interne est survenue. Veuillez réessayer plus tard.',
  en: 'An internal error occurred. Please try again later.',
};

/**
 * POST /api/contact
 * Enregistre le message en BDD et déclenche les e-mails de notification et de confirmation.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function submitContact(req, res, next) {
  const lang = req.body.lang === 'en' ? 'en' : 'fr';

  try {
    // 1. Données validées et nettoyées par les middlewares validators
    const { name, email, subject, message } = req.body;
    const contactData = { name, email, subject, message, lang };

    // 2. Persistance en base de données
    const saved = await contactModel.create(contactData);

    // 3. E-mails : on ne bloque pas la réponse en cas d'échec d'envoi
    //    Les erreurs d'e-mail sont loguées mais ne retournent pas d'erreur 500 au client.
    Promise.all([
      mailer.sendContactNotification(contactData),
      mailer.sendContactConfirmation(contactData),
    ]).catch((mailErr) => {
      console.error('[CONTACT] Erreur lors de l\'envoi des e-mails :', mailErr.message);
    });

    // 4. Réponse 201
    return res.status(201).json({
      data: {
        id:         saved.id,
        created_at: saved.created_at,
      },
      message: SUCCESS_MESSAGES[lang],
    });

  } catch (err) {
    console.error('[CONTACT] Erreur lors de la création du contact :', err.message);

    // Passe au gestionnaire d'erreurs centralisé
    const error = new Error(ERROR_MESSAGES[lang]);
    error.status  = 500;
    error.expose  = true;
    return next(error);
  }
}

module.exports = { submitContact };

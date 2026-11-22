/**
 * Traductions FR/EN pour les composants profil & portfolio.
 */
'use strict';

var ProfileI18n = {
  fr: {
    experience: 'Expériences',
    skills: 'Compétences',
    portfolio: 'Réalisations',
    portfolioSubtitle: 'Quelques projets représentatifs de mon parcours.',
    education: 'Formation & Certifications',
    downloadCV: 'Télécharger mon CV',
    generating: 'Génération...',
    downloadError: 'Erreur lors du téléchargement. Veuillez réessayer.',
    present: 'Présent',
    viewProject: 'Voir le projet',
    categoryCRM: 'CRM & Marketing',
    categoryData: 'Data & ETL',
    categoryWeb: 'Développement Web',
    categoryMethod: 'Méthodologie',
  },
  en: {
    experience: 'Experience',
    skills: 'Skills',
    portfolio: 'Projects',
    portfolioSubtitle: 'Some representative projects from my career.',
    education: 'Education & Certifications',
    downloadCV: 'Download my CV',
    generating: 'Generating...',
    downloadError: 'Download error. Please try again.',
    present: 'Present',
    viewProject: 'View project',
    categoryCRM: 'CRM & Marketing',
    categoryData: 'Data & ETL',
    categoryWeb: 'Web Development',
    categoryMethod: 'Methodology',
  },
};

function profileT(key, lang) {
  lang = lang || 'fr';
  return (ProfileI18n[lang] && ProfileI18n[lang][key]) || ProfileI18n.fr[key] || key;
}

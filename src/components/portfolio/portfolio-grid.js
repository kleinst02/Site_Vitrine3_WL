/**
 * Composant : Grille portfolio.
 * Génère dynamiquement les cartes de projets.
 * Les données sont statiques pour le moment (à remplacer par un appel API si besoin).
 */
'use strict';

(function () {

  var PROJECTS = [
    {
      title_fr: 'Migration CRM Salesforce',
      title_en: 'Salesforce CRM Migration',
      description_fr: 'Migration complète vers Salesforce pour une entreprise internationale. Support N3, analyse d\'anomalies, gestion des accès et suivi KPI.',
      description_en: 'Complete migration to Salesforce for an international company. L3 support, anomaly analysis, access management and KPI monitoring.',
      technologies: ['Salesforce', 'SOQL', 'ETL'],
      image: null
    },
    {
      title_fr: 'Plateforme Selligent CDM',
      title_en: 'Selligent CDM Platform',
      description_fr: 'Développement et maintenance sur Selligent CDM. Migrations techniques et montées de version de la plateforme marketing.',
      description_en: 'Development and maintenance on Selligent CDM. Technical migrations and marketing platform version upgrades.',
      technologies: ['Selligent', 'SQL Server', 'Marketing Automation'],
      image: null
    },
    {
      title_fr: 'Flux de données ETL',
      title_en: 'ETL Data Flows',
      description_fr: 'Conception et implémentation de flux de données avec Talend, DataStage et Pentaho. Requêtes complexes SQL Server et Oracle.',
      description_en: 'Design and implementation of data flows with Talend, DataStage and Pentaho. Complex SQL Server and Oracle queries.',
      technologies: ['Talend', 'DataStage', 'Pentaho', 'Oracle'],
      image: null
    },
    {
      title_fr: 'Transformation Agile',
      title_en: 'Agile Transformation',
      description_fr: 'Animation d\'ateliers Scrum, rédaction de spécifications fonctionnelles et de cahiers de test. Certification PSM I.',
      description_en: 'Scrum workshop facilitation, functional specifications and test documentation writing. PSM I certified.',
      technologies: ['Scrum', 'Agilité', 'Documentation'],
      image: null
    },
    {
      title_fr: 'Site Vitrine Personnel',
      title_en: 'Personal Portfolio Website',
      description_fr: 'Conception et développement du présent site vitrine avec Node.js, Express et PostgreSQL. Design responsive et accessible.',
      description_en: 'Design and development of this portfolio website with Node.js, Express and PostgreSQL. Responsive and accessible design.',
      technologies: ['HTML/CSS', 'JavaScript', 'Node.js', 'PostgreSQL'],
      image: null
    }
  ];

  function getLang() {
    var lang = document.documentElement.lang || 'fr';
    return lang.startsWith('en') ? 'en' : 'fr';
  }

  function renderGrid() {
    var grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    var lang = getLang();

    PROJECTS.forEach(function (project) {
      var card = document.createElement('article');
      card.className = 'project-card card';

      // Image ou placeholder
      var imageDiv = document.createElement('div');
      imageDiv.className = 'project-card__image';
      var placeholder = document.createElement('div');
      placeholder.className = 'project-card__placeholder';
      placeholder.setAttribute('role', 'img');
      placeholder.setAttribute('aria-label', 'Illustration');
      placeholder.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>';
      imageDiv.appendChild(placeholder);
      card.appendChild(imageDiv);

      // Body
      var body = document.createElement('div');
      body.className = 'project-card__body';

      var title = document.createElement('h3');
      title.className = 'project-card__title';
      title.textContent = lang === 'en' ? project.title_en : project.title_fr;
      body.appendChild(title);

      var desc = document.createElement('p');
      desc.className = 'project-card__description';
      desc.textContent = lang === 'en' ? project.description_en : project.description_fr;
      body.appendChild(desc);

      var tags = document.createElement('div');
      tags.className = 'project-card__tags';
      project.technologies.forEach(function (tech) {
        var badge = document.createElement('span');
        badge.className = 'badge badge-sm';
        badge.textContent = tech;
        tags.appendChild(badge);
      });
      body.appendChild(tags);

      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  document.addEventListener('DOMContentLoaded', renderGrid);

})();

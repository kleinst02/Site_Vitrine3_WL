# T-018 — Rapport de revue intégration & écrans

**Date** : 2026-11-22  
**Auditeur** : Agent Reviewer QA  
**Verdict** : CORRECTIONS REQUISES (9 majeurs, 13 mineurs)

## Résumé des défauts

| ID | Sévérité | Fichier | Description |
|----|----------|---------|-------------|
| M-01 | MAJEUR | nav.html:41 | Logo "ConseilIT" (placeholder) |
| M-02 | MAJEUR | nav.html:37 | aria-label logo placeholder |
| M-03 | MAJEUR | nav.html:76 | Bouton langue affiche "FR" au lieu de "EN" |
| M-04 | MAJEUR | footer.html:69,78,88 | Coordonnées placeholders |
| M-05 | MAJEUR | footer.html:165 | Copyright "ConseilIT" |
| M-06 | MAJEUR | 404.html | router.js absent |
| M-07 | MAJEUR | home/index.html:7 | data-i18n-content non supporté |
| M-08 | MAJEUR | blog/article.html | canonical + hreflang manquants |
| M-09 | MAJEUR | i18n/index.js:76 | innerHTML avec traductions |
| m-01 | MINEUR | footer.html:169-172 | Liens légaux → routes inexistantes |
| m-02 | MINEUR | blog/article.html:84 | Lien retour en dur |
| m-03 | MINEUR | home/index.html:7 | data-i18n-content sans effet |
| m-04 | MINEUR | blog/article.html:9 | Meta desc vide par défaut |
| m-05 | MINEUR | 404.html | router.js absent (cohérence) |
| m-06 | MINEUR | sitemap.xml:14 | Trailing slash inconsistant |
| m-07 | MINEUR | nav.html:67 | aria-label sur div sans role |
| m-08 | MINEUR | nav.html:109 | nav imbriqué dans nav |
| m-09 | MINEUR | footer.html:69-91 | aria-labels réfèrent placeholders |
| m-10 | MINEUR | Toutes pages:2 | lang="fr" en dur |
| m-11 | MINEUR | blog/article.html:82 | innerHTML contenu API |
| m-12 | MINEUR | layout.js:50 | console.warn expose structure |
| m-13 | MINEUR | layout.js:220 | 2 requêtes HTTP pour nav/footer |

## Statut : corrections en cours

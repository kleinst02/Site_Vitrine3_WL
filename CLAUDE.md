# Contexte Projet : Création de Site Web

## Présentation & Objectifs
Développement d'un site Web vitrine et applicatif, moderne, responsive et accessible.

## Stack Technique & Standards
- Front-end : HTML5, Tailwind CSS, JavaScript ES6
- Back-end : Node.js (Express) et base de données PostgreSQL
- Qualité : Accessibilité WCAG AA, design Mobile-First, zéro dépendance inutile.

## Structure des Répertoires
- `/src/backend/` : Code serveur, API et base de données
- `/src/ui/` : Design system et composants génériques
- `/src/components/` : Composants métiers front-end
- `/src/pages/` : Assemblage des vues et pages finales
- `/.claude/agents/` : Fiches de définition des agents
- `/.claude/skills/` : Compétences métier réutilisables
- `/.tasks/` : Tableau de tâches partagé (un fichier par ticket)
- `/.mailboxes/` : Boîtes aux lettres des agents (`<agent>.md`)

## Équipe d'agents
| Agent | Fichier | Modèle |
|---|---|---|
| Orchestrateur | `agents/orchestrateur.md` | opus |
| Back-end | `agents/agent-backend.md` | sonnet |
| Design System / UI | `agents/agent-ui.md` | sonnet |
| Composants métiers | `agents/agent-composants.md` | sonnet |
| Écrans & Layout | `agents/agent-ecrans.md` | sonnet |
| Reviewer / QA | `agents/agent-reviewer.md` | opus |

## Workflow
Cadrage → Design UI → Back-end → Assemblage écrans → Revue/QA → Validation humaine.

## Directives de Sécurité
- Interdiction de modifier les variables d'environnement `.env`.
- Toute modification du code doit être validée par l'agent Reviewer.
- L'approbation humaine est obligatoire avant toute mise en ligne.

## Hygiène de contexte
- Rester sous 300 000 tokens par session ; réinitialiser un agent après chaque sous-tâche enregistrée sur disque.
- Divulgation progressive : transmettre des chemins de fichiers, pas de longs copier-coller.
- Chaque agent travaille dans son propre git worktree ; fusion uniquement après validation du Reviewer.

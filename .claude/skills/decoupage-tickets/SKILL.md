---
name: decoupage-tickets
description: Découpe une feuille de route en tickets atomiques assignés à un agent, avec dépendances et critères d'acceptation, dans /.tasks/.
---

# Découpage en tickets

1. Partir de `/.tasks/ROADMAP.md`.
2. Créer un fichier `/.tasks/T-NNN.md` par ticket, modèle :

```
# T-NNN : <titre>
Agent : agent-ui | agent-backend | agent-composants | agent-ecrans | agent-reviewer
Dépend de : T-xxx (ou aucun)
Fichiers autorisés : <chemins>
Objectif : <1-2 phrases>
Critères d'acceptation :
- [ ] ...
Statut : à faire
```

3. Règles : un ticket = un agent = un périmètre de fichiers disjoint ; réalisable en une session (< 300 000 tokens) ; testable.
4. Chaque lot fonctionnel se termine par un ticket de revue pour `agent-reviewer`.
5. Créer un worktree par ticket parallèle : `git worktree add ../wt-T-NNN branche-T-NNN`.
6. Écrire dans `/.mailboxes/<agent>.md` le chemin du ticket assigné.

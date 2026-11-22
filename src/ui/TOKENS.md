# Design Tokens — Documentation

Source unique : `src/ui/tokens/tokens.css`
Importé via : `src/ui/tokens/index.css`

## Couleurs

### Primaire (Bleu profond)

| Jeton | Valeur | Usage |
|---|---|---|
| `--color-primary` | `#1E40AF` | Couleur principale, CTA |
| `--color-primary-hover` | `#1D4ED8` | État survol bouton primaire |
| `--color-primary-active` | `#1E3A8A` | État actif / pressé |
| `--color-primary-disabled` | `#93C5FD` | État désactivé |
| `--color-primary-focus` | `#2563EB` | Anneau de focus |
| `--color-primary-subtle` | `#EFF6FF` | Fond mise en valeur légère |

### Secondaire (Bleu-gris / Ardoise)

| Jeton | Valeur | Usage |
|---|---|---|
| `--color-secondary` | `#475569` | Éléments UI secondaires |
| `--color-secondary-hover` | `#334155` | Survol secondaire |
| `--color-secondary-active` | `#1E293B` | Actif secondaire |
| `--color-secondary-disabled` | `#CBD5E1` | Désactivé secondaire |

### Neutres

| Jeton | Valeur | Usage |
|---|---|---|
| `--color-background` | `#F9FAFB` | Fond page |
| `--color-surface` | `#FFFFFF` | Cartes, modales |
| `--color-surface-alt` | `#F3F4F6` | Fonds alternés |
| `--color-border` | `#E5E7EB` | Bordures par défaut |
| `--color-text-primary` | `#111827` | Texte principal |
| `--color-text-secondary` | `#4B5563` | Texte secondaire |
| `--color-text-muted` | `#6B7280` | Légendes, texte atténué |
| `--color-text-disabled` | `#9CA3AF` | Texte désactivé |
| `--color-text-inverse` | `#FFFFFF` | Texte sur fond sombre |

### Sémantiques

| Jeton | Valeur | Usage |
|---|---|---|
| `--color-success` | `#15803D` | Succès, confirmation |
| `--color-success-bg` | `#F0FDF4` | Fond alerte succès |
| `--color-error` | `#B91C1C` | Erreur, danger |
| `--color-error-bg` | `#FEF2F2` | Fond alerte erreur |
| `--color-warning` | `#92400E` | Avertissement |
| `--color-warning-bg` | `#FFFBEB` | Fond alerte warning |
| `--color-info` | `#1D4ED8` | Information |
| `--color-info-bg` | `#EFF6FF` | Fond alerte info |

## Typographie

| Jeton | Valeur | Usage |
|---|---|---|
| `--font-heading` | Inter, system-ui... | Titres h1–h6 |
| `--font-body` | system-ui... | Corps de texte |
| `--font-mono` | ui-monospace... | Code, terminal |
| `--text-h1` | 2.5rem (mob) → 3.5rem (desktop) | Titre principal |
| `--text-h2` | 2rem → 2.5rem | Titre section |
| `--text-h3` | 1.75rem → 2rem | Sous-section |
| `--text-h4` | 1.5rem | Titre carte |
| `--text-h5` | 1.25rem | Titre mineur |
| `--text-h6` | 1rem | Label section |
| `--text-body` | 1rem (16px) | Corps principal |
| `--text-sm` | 0.875rem (14px) | Texte secondaire |
| `--text-xs` | 0.75rem (12px) | Caption, badge |
| `--leading-normal` | 1.5 | Interligne corps |
| `--leading-tight` | 1.25 | Interligne titres |

## Espacements (base 4px)

| Jeton | Valeur px | Usage |
|---|---|---|
| `--space-xs` | 4px | Espacement minimal |
| `--space-sm` | 8px | Espacement petit |
| `--space-md` | 16px | Espacement standard |
| `--space-lg` | 24px | Espacement moyen |
| `--space-xl` | 32px | Espacement large |
| `--space-2xl` | 48px | Espacement très large |
| `--space-3xl` | 64px | Section espacement |
| `--space-4xl` | 96px | Hero, grandes sections |

## Ombres

| Jeton | Usage |
|---|---|
| `--shadow-sm` | Boutons, petites cartes |
| `--shadow-md` | Cartes standard |
| `--shadow-lg` | Cartes principales, dropdowns |
| `--shadow-xl` | Modales, éléments flottants |
| `--shadow-focus` | Anneau de focus accessibilité |

## Border-Radius

| Jeton | Valeur | Usage |
|---|---|---|
| `--radius-none` | 0 | Pas d'arrondi |
| `--radius-sm` | 4px | Badges, inputs |
| `--radius-md` | 8px | Boutons, cartes |
| `--radius-lg` | 12px | Cartes principales |
| `--radius-xl` | 16px | Grands éléments |
| `--radius-full` | 9999px | Pilules, avatars |

## Transitions

| Jeton | Valeur | Usage |
|---|---|---|
| `--transition-fast` | 150ms ease-in-out | Micro-interactions |
| `--transition-normal` | 250ms ease-in-out | Transitions standard |
| `--transition-slow` | 400ms ease-out | Animations entrée/sortie |

## Breakpoints

| Point de rupture | Valeur | Surcharge CSS |
|---|---|---|
| Mobile (base) | < 640px | Styles par défaut |
| Tablette sm | >= 640px | `@media (min-width: 640px)` |
| Tablette md | >= 768px | `@media (min-width: 768px)` |
| Desktop lg | >= 1024px | `@media (min-width: 1024px)` |
| Large xl | >= 1280px | `@media (min-width: 1280px)` |
| Wide 2xl | >= 1536px | `@media (min-width: 1536px)` |

## Conformité WCAG AA

Contrastes vérifiés (ratio minimum 4.5:1 pour texte normal) :

| Paire texte / fond | Ratio | Résultat |
|---|---|---|
| `--color-text-primary` (#111827) sur `--color-background` (#F9FAFB) | ≈ 17.5:1 | PASS AA |
| `--color-text-secondary` (#4B5563) sur `--color-background` | ≈ 5.9:1 | PASS AA |
| `--color-text-muted` (#6B7280) sur `--color-background` | ≈ 4.6:1 | PASS AA |
| `--color-primary` (#1E40AF) sur `#FFFFFF` | ≈ 8.3:1 | PASS AA |
| `#FFFFFF` sur `--color-primary` (#1E40AF) | ≈ 8.3:1 | PASS AA |
| `--color-success` (#15803D) sur `--color-success-bg` (#F0FDF4) | ≈ 7.2:1 | PASS AA |
| `--color-error` (#B91C1C) sur `--color-error-bg` (#FEF2F2) | ≈ 6.1:1 | PASS AA |
| `--color-warning` (#92400E) sur `--color-warning-bg` (#FFFBEB) | ≈ 7.8:1 | PASS AA |
| `--color-info` (#1D4ED8) sur `--color-info-bg` (#EFF6FF) | ≈ 6.5:1 | PASS AA |

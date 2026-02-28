# Design System Zypta BTP

Application annexe de **zypta.be** — cohérence visuelle avec l'écosystème Zypta.

## Palette (thème supernova par défaut)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | #0a0a0f | Fond principal (quasi noir) |
| `--bg-elevated` | #12121a | Surfaces élevées |
| `--bg-card` | #1a1a24 | Cartes, panels |
| `--text` | #f8fafc | Texte principal |
| `--text-muted` | #94a3b8 | Texte secondaire |
| `--supernova` | #FFD54F | Accent principal (or) |
| `--supernova-dim` | #FFD54F20 | Supernova glow |
| `--violet` | #8B5CF6 | Accent violet |
| `--violet-glow` | #8B5CF640 | Violet glow |
| `--blue` | #6366F1 | Accent bleu |
| `--blue-glow` | #6366F140 | Bleu glow |
| `--border` | #2a2a3a | Bordures |

## Typographie

- **Sans** : Inter (variable), fallback system-ui
- **Titres** : font-semibold à font-bold, tracking-tight
- **Corps** : text-base (16px), line-height 1.6
- **Labels** : text-sm, text-muted

## Composants

### Boutons
- Primary : supernova bg, texte sombre, hover glow
- Secondary : bordure violet/bleu, fond transparent
- Ghost : transparent, hover bg subtle

### Cards
- Glassmorphism : backdrop-blur-xl, bg avec opacité
- Border : 1px subtle
- Shadow : glow supernova/violet au hover

### Inputs
- Fond dark, bordure subtle
- Focus : ring violet/bleu glow

## Effets

- **Glassmorphism** : `backdrop-blur-xl bg-white/5`
- **Glow** : `box-shadow: 0 0 40px var(--violet-glow)`
- **Border-radius** : 12px (cards), 8px (inputs), 9999px (pills)

## Animations (Framer Motion)

- Page : fade + slide up
- Cards : stagger children
- Boutons : scale on tap
- Transitions : 200–300ms ease-out

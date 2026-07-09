# Strixhaven Draft Academy — Design System

How to build any screen in this app so it looks like it belongs. Two sources of truth:

1. **Color/font tokens** — `src/index.css` (`@theme` block). Use them as Tailwind
   utilities (`text-gold`, `bg-verdant/8`, `border-parchment-light/12`, …).
   **Never hardcode hex values in components.**
2. **Composed recipes** — `src/lib/designSystem.ts` (gradient text, panels,
   buttons, headings). Import and combine with layout/spacing utilities.

## Visual identity in one paragraph

A dark arcane academy (deep navy backdrop with the Strixhaven artwork) written on
**parchment**. Two accent families carry everything: **gold** (structure, primary
actions, finished/celebratory states) and **verdant green** — the hero-title
gradient family (life, activity, success, tips). Violet/teal arcana exist only as
decoration (confetti, floating orbs) and must never be used for UI chrome.

## Color tokens

| Token | Hex | Use for |
|---|---|---|
| `background-main` | `#101522` | Page background (set on `body`) |
| `background-panel` | `#1a2133` | Panel/card fills (usually with `/30`–`/70` opacity + `backdrop-blur`) |
| `parchment-light` | `#f0e6d0` | Glass-button text/borders, brightest neutral |
| `parchment` | `#e9d8b4` | Body text (dim with `/85`, `/60`, `/45`, `/25` for hierarchy) |
| `parchment-dark` | `#c8ad7f` | Muted neutral, parchment-gradient tail |
| `gold-bright` / `gold` / `gold-dark` / `gold-deep` | `#d4af37` / `#c89b3c` / `#a07d2e` / `#b8960c` | Primary actions, borders (`border-gold/12`–`/25`), finished state. `gold-bright→gold-deep` is the CTA gradient |
| `ink` | `#16120d` | Text on gold buttons |
| `verdant-lime` / `verdant-light` / `verdant` / `verdant-dark` | `#e8d44d` / `#8cc63f` / `#3ea33e` / `#2d7a2e` | The hero-title family. Accents, dividers, tinted panels, bullet markers |
| `success` / `success-dark` | `#4e9f3d` / `#3a7e2e` | Active status, positive confirmations |
| `danger` / `danger-dark` | `#b74134` / `#9e372d` | Destructive actions, losses |
| `silver` / `bronze` | `#c0c0c0` / `#cd7f32` | Standings medals (2nd/3rd; 1st is gold) |
| `arcane-blue` / `arcane-violet` | `#3fa7ff` / `#9d6bff` | **Decorative only** (confetti). Not for panels, badges, headings or text |
| `mana-*` | see `@theme` | Custom mana chips only (never official WotC symbols) |

### Status → color mapping

| Status | Accent | Badge | Section heading |
|---|---|---|---|
| Activo | success green | `bg-success/15 text-success` | `GRADIENT_TEXT_SUCCESS` |
| En preparación | neutral parchment | `bg-parchment/12 text-parchment/85` | `GRADIENT_TEXT_PARCHMENT` |
| Finalizado | gold | `bg-gold/15 text-gold` | `GRADIENT_TEXT_GOLD` |

## Typography

| Font token | Family | Use |
|---|---|---|
| `font-heading-decorative` | Cinzel Decorative | Page titles, card titles, section headings |
| `font-heading` | Cinzel | Buttons, small emphatic labels |
| `font-garamond` | Cormorant Garamond | Subtitles, elegant secondary copy |
| `font-body` | Crimson Text | Long-form reading text |
| `font-sans` | system sans | Metadata, stats, tips, form labels — anything small/utilitarian |

Hierarchy pattern for a page header: eyebrow kicker (`EYEBROW` + `text-gold`) →
hero title (`GRADIENT_TEXT_HERO` + `font-heading-decorative`, optionally
`animate-[heroTitleGlow_4s_ease-in-out_infinite]`) → verdant divider
(`h-0.5 bg-gradient-to-r from-transparent via-verdant-light to-transparent`) →
subtitle (`font-garamond text-parchment/85`).

## Recipes (`src/lib/designSystem.ts`)

### Gradient text
`GRADIENT_TEXT_HERO` (page titles) · `GRADIENT_TEXT_SUCCESS` (active/green headings)
· `GRADIENT_TEXT_GOLD` (card titles, finished) · `GRADIENT_TEXT_PARCHMENT` (pending/neutral).
Combine with a font + size: `` className={`${GRADIENT_TEXT_GOLD} font-heading-decorative text-xl font-bold`} ``.

### Surfaces
- `PANEL` — default neutral glass card.
- `PANEL_VERDANT` — green-tinted panel for informative/positive content (e.g. draft tips).
- `PANEL_GOLD` — gold-tinted highlight/link panel.
- `NOTE_VERDANT` — small inline hint box (add `px-3 py-2.5`).

Recipes carry color/border/blur/radius; **you add spacing** (`p-6`, `mt-10`, …).

### Buttons
- Page-level: `BTN_CTA` (gold gradient hero action), `BTN_GLASS` (secondary next to a CTA),
  `BTN_GLASS_MUTED` (quiet corner/nav). Add padding + text size per context
  (e.g. `px-5 py-3 text-sm`).
- Inside cards/forms/modals: use the shared `<Button>` component
  (`src/components/shared/Button.tsx`) with variants `primary | success | secondary | danger | ghost`.

### Headings
- `EYEBROW` — small uppercase kicker; add a color (`text-gold`, `text-gold/60`).
- `SECTION_HEADING` — decorative uppercase section title; pair with a `GRADIENT_TEXT_*`
  and a size (`text-base`, `text-sm`).

## Rules of thumb

- Opacity modifiers do the shading work: borders live at `/8`–`/25`, tinted fills at
  `/5`–`/15`, text hierarchy at `parchment/85 → /60 → /45 → /25`.
- Radius: `rounded-xl` for panels/cards, `rounded-lg` for inner boxes, `rounded-md` for buttons.
- Every floating surface over the backdrop gets `backdrop-blur-sm` (panels) or
  `backdrop-blur-md` (sticky headers, glass buttons) — the recipes already include it.
- Spanish for all user-facing strings; English for code/comments.
- Wizards Fan Content Policy: keep `FAN_CONTENT_NOTICE` in every page footer; no official
  Magic logos or real mana symbols (see CLAUDE.md).

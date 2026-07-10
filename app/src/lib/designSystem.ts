// Strixhaven Draft Academy design system — reusable class recipes.
//
// Color tokens live in src/index.css (@theme); this file holds the composed
// recipes (gradient text, panels, buttons, headings) so every page pulls the
// same visual language from one place. Full usage guide: app/DESIGN_SYSTEM.md.
//
// Palette in one line: parchment/gold carries structure and actions, the
// verdant-green hero family carries life/activity accents. Violet/blue arcana
// are decorative-only (confetti, orbs) and must not appear in UI chrome.

/* ------------------------------------------------------------------ */
/* Gradient text                                                       */
/* ------------------------------------------------------------------ */

// Built from Tailwind's own bg-clip-text/text-transparent utilities rather
// than a hand-written CSS class: a plain `-webkit-background-clip: text`
// custom rule gets its vendor prefix stripped by the build's CSS processor,
// which silently breaks the clip (the gradient renders as a solid block
// instead of being masked to the glyphs). Tailwind's own utilities survive
// that pass intact.
const clip = "bg-clip-text text-transparent";

/** Hero titles (page-level H1/H2). Gold-lime into deep green — the app's signature. */
export const GRADIENT_TEXT_HERO = `bg-[linear-gradient(180deg,#e8d44d_0%,#8cc63f_35%,#3ea33e_70%,#2d7a2e_100%)] ${clip}`;

/** Green accent headings: active tournaments, tips, anything "alive". */
export const GRADIENT_TEXT_SUCCESS = `bg-[linear-gradient(180deg,#baf7a0_0%,#4ade80_55%,#22c55e_100%)] ${clip}`;

/** Gold headings: card titles, finished tournaments, celebratory copy. */
export const GRADIENT_TEXT_GOLD = `bg-[linear-gradient(180deg,#f5ecd8_0%,#e9d8b4_45%,#c89b3c_100%)] ${clip}`;

/** Neutral cream headings: pending/in-preparation states. */
export const GRADIENT_TEXT_PARCHMENT = `bg-[linear-gradient(180deg,#ffffff_0%,#e9d8b4_55%,#c8ad7f_100%)] ${clip}`;

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

/** Default glass panel: neutral card over the academy backdrop. */
export const PANEL = "rounded-xl border border-gold/12 bg-background-panel/40 backdrop-blur-sm";

/** Verdant-tinted panel: informative/positive content (tips, active-state callouts). */
export const PANEL_VERDANT = "rounded-xl border border-verdant/20 bg-verdant/8 backdrop-blur-sm";

/** Gold-tinted panel: highlighted calls to action (external links, featured blocks). */
export const PANEL_GOLD = "rounded-xl border border-gold/25 bg-gold/10 backdrop-blur-sm";

/** Small inline note/hint box (e.g. player-count guidance). */
export const NOTE_VERDANT =
  "rounded-lg border border-verdant/15 bg-verdant/6 font-sans text-xs leading-relaxed text-verdant-light/80";

/** Toggle chip for filter/sort pickers (search filters, leaderboard sort). */
export const filterChipClass = (active: boolean) =>
  `cursor-pointer rounded-lg border px-3 py-1.5 font-sans text-xs font-semibold whitespace-nowrap transition-colors ${
    active ? "border-gold bg-gold/12 text-gold" : "border-white/12 bg-transparent text-parchment/45 hover:border-white/25"
  }`;

/* ------------------------------------------------------------------ */
/* Headings                                                            */
/* ------------------------------------------------------------------ */

/** Small uppercase kicker above titles (add a text color per context). */
export const EYEBROW = "font-sans text-[11px] font-bold tracking-[2px] uppercase";

/** Section heading base (H2/H3): decorative serif, wide tracking. Pair with a GRADIENT_TEXT_*. */
export const SECTION_HEADING = "font-heading-decorative font-bold tracking-[2px] uppercase";

/* ------------------------------------------------------------------ */
/* Page-level buttons                                                  */
/* (in-card actions use the shared <Button> component instead)         */
/* ------------------------------------------------------------------ */

/** Primary hero CTA: gold gradient, glowing. Add padding/text-size per context. */
export const BTN_CTA =
  "cursor-pointer rounded-md border-2 border-gold/60 bg-gradient-to-br from-gold-bright to-gold-deep font-heading font-bold tracking-[1.5px] text-ink uppercase shadow-[0_4px_20px_rgba(212,175,55,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_30px_rgba(212,175,55,0.45)]";

/** Secondary glass button next to a CTA. Add padding/text-size per context. */
export const BTN_GLASS =
  "cursor-pointer rounded-md border border-gold/25 bg-parchment-light/8 font-heading font-semibold tracking-wide text-parchment-light backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:bg-parchment-light/15";

/** Quiet corner/nav button (rules, manual). Add padding/text-size per context. */
export const BTN_GLASS_MUTED =
  "cursor-pointer rounded-md border border-parchment-light/12 bg-parchment-light/8 font-heading font-semibold tracking-wide text-parchment-light/60 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-parchment-light/30 hover:bg-parchment-light/12 hover:text-parchment-light";

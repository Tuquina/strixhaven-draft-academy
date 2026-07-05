// Gradient-filled text, same visual language as the dashboard hero title,
// tinted per context. Built from Tailwind's own bg-clip-text/text-transparent
// utilities rather than a hand-written CSS class: a plain
// `-webkit-background-clip: text` custom rule gets its vendor prefix
// stripped by the build's CSS processor, which silently breaks the clip
// (the gradient renders as a solid block instead of being masked to the
// glyphs). Tailwind's own utilities survive that pass intact.
const base = "bg-clip-text text-transparent";

export const GRADIENT_TEXT_HERO = `bg-[linear-gradient(180deg,#e8d44d_0%,#8cc63f_35%,#3ea33e_70%,#2d7a2e_100%)] ${base}`;
export const GRADIENT_TEXT_SUCCESS = `bg-[linear-gradient(180deg,#baf7a0_0%,#4ade80_55%,#22c55e_100%)] ${base}`;
export const GRADIENT_TEXT_VIOLET = `bg-[linear-gradient(180deg,#e4d1ff_0%,#b18aff_55%,#7c3aed_100%)] ${base}`;
export const GRADIENT_TEXT_GOLD = `bg-[linear-gradient(180deg,#f5ecd8_0%,#e9d8b4_45%,#c89b3c_100%)] ${base}`;

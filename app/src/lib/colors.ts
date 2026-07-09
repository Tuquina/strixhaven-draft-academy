import type { ManaColor } from "../types";

export const WUBRG: ManaColor[] = ["W", "U", "B", "R", "G"];

export const MANA_NAMES: Record<ManaColor, string> = {
  W: "Blanco",
  U: "Azul",
  B: "Negro",
  R: "Rojo",
  G: "Verde",
};

export const MANA_CHIP_COLORS: Record<
  ManaColor,
  { bg: string; text: string; border: string }
> = {
  W: { bg: "#F9FAF4", text: "#333333", border: "#D4C9A8" },
  U: { bg: "#0E68AB", text: "#FFFFFF", border: "#0A4F82" },
  B: { bg: "#2B2027", text: "#C8B8C0", border: "#444444" },
  R: { bg: "#D3202A", text: "#FFFFFF", border: "#A01820" },
  G: { bg: "#00733E", text: "#FFFFFF", border: "#005A30" },
};

export type StrixhavenCollege =
  | "Silverquill"
  | "Prismari"
  | "Witherbloom"
  | "Lorehold"
  | "Quandrix";

export const COLLEGE_THEMES: Record<
  StrixhavenCollege,
  { accent: string; bg: string }
> = {
  Silverquill: { accent: "#A8A8B0", bg: "rgba(168,168,176,0.16)" },
  Prismari: { accent: "#D3202A", bg: "rgba(63,167,255,0.14)" },
  Witherbloom: { accent: "#00733E", bg: "rgba(0,115,62,0.16)" },
  Lorehold: { accent: "#C89B3C", bg: "rgba(200,155,60,0.16)" },
  Quandrix: { accent: "#0E9AAB", bg: "rgba(14,154,171,0.16)" },
};

interface TwoColorInfo {
  name: string;
  college: StrixhavenCollege | null;
  collegeName?: string;
}

const TWO_COLOR: Record<string, TwoColorInfo> = {
  WU: { name: "Azorius", college: null },
  WB: { name: "Orzhov", college: "Silverquill", collegeName: "Silverquill — Orzhov" },
  WR: { name: "Boros", college: "Lorehold", collegeName: "Lorehold — Boros" },
  WG: { name: "Selesnya", college: null },
  UB: { name: "Dimir", college: null },
  UR: { name: "Izzet", college: "Prismari", collegeName: "Prismari — Izzet" },
  UG: { name: "Simic", college: "Quandrix", collegeName: "Quandrix — Simic" },
  BR: { name: "Rakdos", college: null },
  BG: { name: "Golgari", college: "Witherbloom", collegeName: "Witherbloom — Golgari" },
  RG: { name: "Gruul", college: null },
};

const THREE_COLOR: Record<string, string> = {
  WUB: "Esper",
  UBR: "Grixis",
  BRG: "Jund",
  WRG: "Naya",
  WUG: "Bant",
  WBG: "Abzan",
  WUR: "Jeskai",
  UBG: "Sultai",
  WBR: "Mardu",
  URG: "Temur",
};

const FOUR_COLOR: Record<string, string> = {
  WUBR: "Sin Verde",
  UBRG: "Sin Blanco",
  WBRG: "Sin Azul",
  WURG: "Sin Negro",
  WUBG: "Sin Rojo",
};

export interface ColorCombo {
  name: string;
  college: StrixhavenCollege | null;
}

export function sortColors(colors: ManaColor[]): ManaColor[] {
  return [...new Set(colors)].sort(
    (a, b) => WUBRG.indexOf(a) - WUBRG.indexOf(b)
  );
}

/**
 * `includeCollege` gates the Strixhaven college flavor (name prefix + theming) —
 * it only makes sense for Draft (a Strixhaven-limited-set mode). Standard/Pioneer/
 * Brawl/Commander players still get their guild name (e.g. "Golgari"), just without
 * the "Witherbloom — " college prefix.
 */
export function getColorCombo(colors: ManaColor[], includeCollege = true): ColorCombo {
  const sorted = sortColors(colors);
  const key = sorted.join("");

  if (sorted.length === 0) {
    return { name: "Sin colores definidos", college: null };
  }
  if (sorted.length === 1) {
    return { name: "Mono " + MANA_NAMES[sorted[0]], college: null };
  }
  if (sorted.length === 2) {
    const info = TWO_COLOR[key];
    if (!info) return { name: key, college: null };
    if (!includeCollege) return { name: info.name, college: null };
    return { name: info.collegeName || info.name, college: info.college };
  }
  if (sorted.length === 3) {
    return { name: THREE_COLOR[key] || key, college: null };
  }
  if (sorted.length === 4) {
    const label = FOUR_COLOR[key];
    return {
      name: label ? "Cuatro colores (" + label + ")" : key,
      college: null,
    };
  }
  return { name: "WUBRG — Cinco colores", college: null };
}

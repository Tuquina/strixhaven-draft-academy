import type { GameFormat } from "../types";

// Format names stay untranslated, matching how Wizards' own Spanish site and
// Scryfall's legality chips show them (Standard, Pioneer, Commander, ...).
export const GAME_FORMAT_LABELS: Record<GameFormat, string> = {
  draft: "Draft",
  standard: "Standard",
  pioneer: "Pioneer",
  brawl: "Brawl",
  commander: "Commander",
};

// No entry for "draft" — it has its own in-app "Reglas del Draft" page instead of
// linking out.
export const GAME_FORMAT_RULES_URL: Partial<Record<GameFormat, string>> = {
  standard: "https://magic.wizards.com/es/formats/standard",
  pioneer: "https://magic.wizards.com/es/formats/pioneer",
  brawl: "https://magic.wizards.com/es/formats/brawl",
  commander: "https://magic.wizards.com/es/formats/commander",
};

export function isMultiplayerFormat(format: GameFormat): boolean {
  return format === "commander";
}

export const DEFAULT_POD_SIZE = 4;
export const MIN_POD_SIZE = 3;
export const DEFAULT_COMMANDER_ROUNDS = 3;

/**
 * Splits `playerCount` players into balanced Commander tables around `idealSize`
 * (default 4). Sizes differ by at most 1 so nobody ends up alone at a 1- or
 * 2-player "table" — e.g. 10 players @ 4 → [4, 3, 3], not [4, 4, 2].
 */
export function distributePodSizes(playerCount: number, idealSize = DEFAULT_POD_SIZE): number[] {
  if (playerCount <= 0) return [];
  if (playerCount < MIN_POD_SIZE) return [playerCount];

  const podCount = Math.max(1, Math.round(playerCount / idealSize));
  const base = Math.floor(playerCount / podCount);
  const remainder = playerCount % podCount;

  return Array.from({ length: podCount }, (_, i) => base + (i < remainder ? 1 : 0));
}

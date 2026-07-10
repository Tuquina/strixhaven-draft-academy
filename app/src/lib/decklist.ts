import type { DeckCard } from "../types";

export interface ParsedDeckList {
  cards: DeckCard[];
  warnings: string[];
}

// Trailing "(SET) 123" is exactly what Moxfield/MTGO exports append to pin an
// exact printing — captured (not discarded) so lib/scryfall.ts can resolve the
// precise card instead of Scryfall's default printing for that name.
const LINE_RE = /^(\d+)\s*x?\s+(.+?)(?:\s*\(([a-z0-9]{2,5})\)\s*([a-z0-9]+))?$/i;
const SIDEBOARD_RE = /^sideboard\b/i;

/**
 * Parses a pasted decklist — "4 Lightning Bolt", "4x Lightning Bolt", or the
 * Moxfield/MTGO-style "2 Preordain (TDC) 161". Unrecognized lines are skipped
 * with a warning instead of rejecting the whole paste, since this is a casual
 * paste box, not a strict deck-file format.
 */
export function parseDeckList(text: string): ParsedDeckList {
  const cards: DeckCard[] = [];
  const warnings: string[] = [];
  let section: DeckCard["section"] = "mainboard";

  for (const rawLine of text.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    const line = trimmed.replace(/\s+(#|\/\/).*$/, "").trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) continue;

    if (SIDEBOARD_RE.test(line)) {
      section = "sideboard";
      continue;
    }

    const match = line.match(LINE_RE);
    const quantity = match ? Number(match[1]) : 0;
    const name = match?.[2].trim() ?? "";
    if (!match || quantity <= 0 || !name) {
      warnings.push(`No se pudo interpretar la línea: "${trimmed}"`);
      continue;
    }

    cards.push({
      quantity,
      name,
      set: match[3]?.toUpperCase(),
      collectorNumber: match[4],
      section,
    });
  }

  return { cards, warnings };
}

/** Inverse of parseDeckList — reconstructs pasteable text from stored cards, to prefill the edit textarea. */
export function formatDeckList(cards: DeckCard[]): string {
  const lineFor = (c: DeckCard) =>
    `${c.quantity} ${c.name}${c.set && c.collectorNumber ? ` (${c.set}) ${c.collectorNumber}` : ""}`;

  const main = cards.filter((c) => c.section === "mainboard").map(lineFor);
  const side = cards.filter((c) => c.section === "sideboard").map(lineFor);

  return side.length === 0 ? main.join("\n") : [...main, "", "Sideboard", ...side].join("\n");
}

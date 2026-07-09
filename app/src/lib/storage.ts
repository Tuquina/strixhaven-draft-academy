import type { Tournament } from "../types";

const STORAGE_KEY = "strixhaven-draft-tournaments";

/**
 * Backfills fields added after a tournament may have been created/saved (e.g.
 * gameFormat, added when Standard/Pioneer/Brawl/Commander support was introduced).
 * Applied to every tournament coming from localStorage, Supabase, or an imported
 * JSON file, so the rest of the app can assume the field always exists.
 */
export function normalizeTournament(t: Tournament): Tournament {
  return { ...t, gameFormat: t.gameFormat ?? "draft" };
}

export function loadTournaments(): Tournament[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? (JSON.parse(saved) as Tournament[]) : [];
    return parsed.map(normalizeTournament);
  } catch {
    return [];
  }
}

export function saveTournaments(tournaments: Tournament[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
  } catch {
    // storage unavailable (e.g. private browsing quota) — ignore
  }
}

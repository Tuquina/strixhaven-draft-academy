import { calculateStandings } from "./standings";
import type { GameFormat, Tournament } from "../types";

export type LeaderboardSort = "tournamentsWon" | "matchesWon" | "points";

export interface LeaderboardEntry {
  name: string;
  tournamentsPlayed: number;
  tournamentsWon: number;
  matchesPlayed: number;
  matchesWon: number;
  points: number;
}

/**
 * Cross-tournament totals, grouped by player name — the app has no global player
 * identity, only per-tournament ids, so name (trimmed, case-insensitive) is the
 * only thing that can link the same person across separate rosters.
 *
 * Includes tournaments of every status: matches already played count as real wins
 * even mid-draft, and "tournamentsWon" only credits a champion once a tournament
 * is actually `finished` (same definition TournamentCard uses for "Campeón").
 */
export function calculateLeaderboard(
  tournaments: Tournament[],
  formatFilter: GameFormat | "all" = "all"
): LeaderboardEntry[] {
  const relevant =
    formatFilter === "all" ? tournaments : tournaments.filter((t) => t.gameFormat === formatFilter);

  const table = new Map<string, LeaderboardEntry>();
  const entryFor = (name: string): LeaderboardEntry => {
    const key = name.trim().toLowerCase();
    let entry = table.get(key);
    if (!entry) {
      entry = { name: name.trim(), tournamentsPlayed: 0, tournamentsWon: 0, matchesPlayed: 0, matchesWon: 0, points: 0 };
      table.set(key, entry);
    }
    return entry;
  };

  relevant.forEach((t) => {
    if (t.players.length === 0) return;
    const standings = calculateStandings(t);

    standings.forEach((row) => {
      const entry = entryFor(row.name);
      entry.tournamentsPlayed++;
      entry.matchesPlayed += row.pj;
      entry.matchesWon += row.pg;
      entry.points += row.pts;
    });

    const champion = standings[0];
    if (t.status === "finished" && champion && champion.pts > 0) {
      entryFor(champion.name).tournamentsWon++;
    }
  });

  return Array.from(table.values());
}

export function sortLeaderboard(entries: LeaderboardEntry[], sort: LeaderboardSort): LeaderboardEntry[] {
  const metrics: Record<LeaderboardSort, (e: LeaderboardEntry) => number> = {
    tournamentsWon: (e) => e.tournamentsWon,
    matchesWon: (e) => e.matchesWon,
    points: (e) => e.points,
  };
  const order = [...new Set<LeaderboardSort>([sort, "points", "matchesWon", "tournamentsWon"])];

  return [...entries].sort((a, b) => {
    for (const key of order) {
      const diff = metrics[key](b) - metrics[key](a);
      if (diff !== 0) return diff;
    }
    return a.name.localeCompare(b.name);
  });
}

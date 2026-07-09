import { getColorCombo } from "./colors";
import type { StrixhavenCollege } from "./colors";
import { isMultiplayerFormat } from "./gameFormats";
import type { ManaColor, Tournament } from "../types";

export interface StandingRow {
  id: string;
  name: string;
  colors: ManaColor[];
  comboName: string;
  college: StrixhavenCollege | null;
  position: number;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  jg: number;
  jp: number;
  diff: number;
  pts: number;
}

export function calculateStandings(tournament: Tournament): StandingRow[] {
  if (isMultiplayerFormat(tournament.gameFormat)) {
    return calculateCommanderStandings(tournament);
  }

  const table: Record<string, Omit<StandingRow, "position" | "diff">> = {};

  tournament.players.forEach((p) => {
    const combo = getColorCombo(p.colors, true);
    table[p.id] = {
      id: p.id,
      name: p.name,
      colors: [...p.colors],
      comboName: combo.name,
      college: combo.college,
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      jg: 0,
      jp: 0,
      pts: 0,
    };
  });

  tournament.rounds.forEach((round) => {
    round.matches.forEach((m) => {
      if (m.status !== "completed" || !m.result || !m.playerBId) return;
      const a = table[m.playerAId];
      const b = table[m.playerBId];
      if (!a || !b) return;
      const r = m.result;

      a.pj++;
      b.pj++;
      a.jg += r.gamesPlayerA;
      a.jp += r.gamesPlayerB;
      b.jg += r.gamesPlayerB;
      b.jp += r.gamesPlayerA;

      if (r.isDraw) {
        a.pe++;
        b.pe++;
        a.pts += 1;
        b.pts += 1;
      } else if (r.winnerPlayerId === m.playerAId) {
        a.pg++;
        b.pp++;
        a.pts += 3;
      } else {
        b.pg++;
        a.pp++;
        b.pts += 3;
      }
    });
  });

  const headToHead = (x: string, y: string): number => {
    for (const round of tournament.rounds) {
      for (const m of round.matches) {
        if (m.status !== "completed" || !m.result) continue;
        const isPair =
          (m.playerAId === x && m.playerBId === y) ||
          (m.playerAId === y && m.playerBId === x);
        if (!isPair) continue;
        if (m.result.isDraw) return 0;
        return m.result.winnerPlayerId === x ? -1 : 1;
      }
    }
    return 0;
  };

  const rows = Object.values(table);
  rows.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.pg !== a.pg) return b.pg - a.pg;
    const aPct = a.jg + a.jp > 0 ? a.jg / (a.jg + a.jp) : 0;
    const bPct = b.jg + b.jp > 0 ? b.jg / (b.jg + b.jp) : 0;
    if (Math.abs(bPct - aPct) > 0.001) return bPct - aPct;
    const aDiff = a.jg - a.jp;
    const bDiff = b.jg - b.jp;
    if (bDiff !== aDiff) return bDiff - aDiff;
    const h2h = headToHead(a.id, b.id);
    if (h2h !== 0) return h2h;
    return a.name.localeCompare(b.name);
  });

  return rows.map((row, i) => ({
    ...row,
    position: i + 1,
    diff: row.jg - row.jp,
  }));
}

/**
 * Commander standings: pj/pg/pe are pods played/won/drawn (no jg/jp/diff — a pod
 * has no game score). Points follow the same 3/1/0 scale as 1v1 matches: pod
 * winner gets 3, a group draw gives everyone in that pod 1, everyone else 0.
 */
function calculateCommanderStandings(tournament: Tournament): StandingRow[] {
  const table: Record<string, Omit<StandingRow, "position" | "diff">> = {};

  tournament.players.forEach((p) => {
    const combo = getColorCombo(p.colors, false);
    table[p.id] = {
      id: p.id,
      name: p.name,
      colors: [...p.colors],
      comboName: combo.name,
      college: null,
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      jg: 0,
      jp: 0,
      pts: 0,
    };
  });

  tournament.rounds.forEach((round) => {
    (round.pods ?? []).forEach((pod) => {
      if (pod.status !== "completed" || !pod.result) return;
      pod.playerIds.forEach((playerId) => {
        const row = table[playerId];
        if (!row) return;
        row.pj++;
        if (pod.result!.isDraw) {
          row.pe++;
          row.pts += 1;
        } else if (pod.result!.winnerPlayerId === playerId) {
          row.pg++;
          row.pts += 3;
        } else {
          row.pp++;
        }
      });
    });
  });

  const rows = Object.values(table).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.pg !== a.pg) return b.pg - a.pg;
    return a.name.localeCompare(b.name);
  });

  return rows.map((row, i) => ({ ...row, position: i + 1, diff: 0 }));
}

export function formatStandingsClipboardText(
  tournamentName: string,
  standings: StandingRow[]
): string {
  const lines = standings.map(
    (s) => `${s.position}. ${s.name} — ${s.pts} pts (${s.pg}V/${s.pe}E/${s.pp}D)`
  );
  return `📊 ${tournamentName}\n${lines.join("\n")}\n\nHosted by Fernando Tuquina`;
}

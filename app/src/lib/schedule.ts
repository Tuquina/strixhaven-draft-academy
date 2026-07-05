import { genId } from "./id";
import type { Player, Round } from "../types";

const BYE = "BYE" as const;

/**
 * Circle method: fix the first participant, pair first half against the
 * reversed second half, then rotate everyone except the first each round.
 * A player paired with BYE gets a free round instead of a match.
 */
export function generateRoundRobin(players: Player[]): Round[] {
  if (players.length < 2) return [];

  const parts: string[] = players.map((p) => p.id);
  if (parts.length % 2 !== 0) parts.push(BYE);

  const n = parts.length;
  const rounds: Round[] = [];

  for (let r = 0; r < n - 1; r++) {
    const matches = [];
    for (let i = 0; i < n / 2; i++) {
      const a = parts[i];
      const b = parts[n - 1 - i];
      if (a === BYE || b === BYE) {
        matches.push({
          id: genId(),
          roundNumber: r + 1,
          playerAId: a === BYE ? b : a,
          playerBId: null,
          status: "bye" as const,
        });
      } else {
        matches.push({
          id: genId(),
          roundNumber: r + 1,
          playerAId: a,
          playerBId: b,
          status: "pending" as const,
        });
      }
    }
    rounds.push({ id: genId(), roundNumber: r + 1, matches });

    // Rotate all participants except the first.
    const last = parts.pop()!;
    parts.splice(1, 0, last);
  }

  return rounds;
}

import { genId } from "./id";
import { distributePodSizes, MIN_POD_SIZE } from "./gameFormats";
import type { Player, Pod, Round } from "../types";

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

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Commander has no clean round-robin — instead, each round shuffles the whole
 * roster and splits it into balanced tables (see distributePodSizes), so players
 * mix with different people round to round. One winner (or a group draw) per pod,
 * no game score.
 */
export function generatePods(players: Player[], roundsCount: number, podSize?: number): Round[] {
  if (players.length < MIN_POD_SIZE || roundsCount < 1) return [];

  const podSizes = distributePodSizes(players.length, podSize);

  return Array.from({ length: roundsCount }, (_, r) => {
    const order = shuffled(players.map((p) => p.id));
    const pods: Pod[] = [];
    let cursor = 0;
    for (const size of podSizes) {
      pods.push({
        id: genId(),
        roundNumber: r + 1,
        playerIds: order.slice(cursor, cursor + size),
        status: "pending",
      });
      cursor += size;
    }
    return { id: genId(), roundNumber: r + 1, matches: [], pods };
  });
}

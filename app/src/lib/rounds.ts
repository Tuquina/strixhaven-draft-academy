import { formatResultText } from "./format";
import type { Match, Tournament } from "../types";

export interface MatchDisplay {
  id: string;
  isBye: boolean;
  playerAId: string;
  playerBId: string | null;
  playerAName: string;
  playerBName: string;
  byePlayerName: string;
  isCompleted: boolean;
  isPending: boolean;
  resultText: string;
  match: Match;
}

export interface RoundDisplay {
  id: string;
  number: number;
  matches: MatchDisplay[];
}

export function describeRounds(tournament: Tournament): RoundDisplay[] {
  const nameOf = (id: string | null) =>
    (id && tournament.players.find((p) => p.id === id)?.name) || "";

  return tournament.rounds.map((round) => ({
    id: round.id,
    number: round.roundNumber,
    matches: round.matches.map((m) => {
      const isBye = m.status === "bye";
      const isCompleted = m.status === "completed";
      let resultText = "Pendiente";
      if (isCompleted && m.result) {
        const winnerName = m.result.isDraw ? null : nameOf(m.result.winnerPlayerId);
        resultText = formatResultText(m.result.isDraw, winnerName, m.result.gamesPlayerA, m.result.gamesPlayerB);
      }
      return {
        id: m.id,
        isBye,
        playerAId: m.playerAId,
        playerBId: m.playerBId,
        playerAName: nameOf(m.playerAId),
        playerBName: nameOf(m.playerBId),
        byePlayerName: nameOf(m.playerAId),
        isCompleted,
        isPending: m.status === "pending",
        resultText,
        match: m,
      };
    }),
  }));
}

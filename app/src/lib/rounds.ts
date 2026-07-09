import { formatResultText, formatPodResultText } from "./format";
import type { Match, Pod, Tournament } from "../types";

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

export interface PodDisplay {
  id: string;
  playerIds: string[];
  playerNames: string[];
  isCompleted: boolean;
  isPending: boolean;
  resultText: string;
  pod: Pod;
}

export interface PodRoundDisplay {
  id: string;
  number: number;
  pods: PodDisplay[];
}

export function describePods(tournament: Tournament): PodRoundDisplay[] {
  const nameOf = (id: string) => tournament.players.find((p) => p.id === id)?.name || "";

  return tournament.rounds.map((round) => ({
    id: round.id,
    number: round.roundNumber,
    pods: (round.pods ?? []).map((pod) => {
      const isCompleted = pod.status === "completed";
      let resultText = "Pendiente";
      if (isCompleted && pod.result) {
        const winnerName = pod.result.isDraw || !pod.result.winnerPlayerId ? null : nameOf(pod.result.winnerPlayerId);
        resultText = formatPodResultText(pod.result.isDraw, winnerName);
      }
      return {
        id: pod.id,
        playerIds: pod.playerIds,
        playerNames: pod.playerIds.map(nameOf),
        isCompleted,
        isPending: pod.status === "pending",
        resultText,
        pod,
      };
    }),
  }));
}

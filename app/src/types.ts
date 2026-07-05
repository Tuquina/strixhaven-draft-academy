export type TournamentStatus = "drafting" | "active" | "finished";

export type ManaColor = "W" | "U" | "B" | "R" | "G";

export type MatchStatus = "pending" | "completed" | "bye";

export type MatchFormat = "bo3" | "bo1";

export interface MatchResult {
  winnerPlayerId: string | null;
  isDraw: boolean;
  gamesPlayerA: number;
  gamesPlayerB: number;
}

export interface Player {
  id: string;
  name: string;
  colors: ManaColor[];
  colorCombinationName: string;
  strixhavenCollegeName?: string | null;
  deckNotes?: string;
  createdAt: string;
}

export interface Match {
  id: string;
  roundNumber: number;
  playerAId: string;
  playerBId: string | null;
  status: MatchStatus;
  result?: MatchResult;
}

export interface Round {
  id: string;
  roundNumber: number;
  matches: Match[];
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  host: "Fernando Tuquina";
  status: TournamentStatus;
  format: MatchFormat;
  allowDraws: boolean;
  players: Player[];
  rounds: Round[];
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string;
}

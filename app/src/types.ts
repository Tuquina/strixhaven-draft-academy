export type TournamentStatus = "drafting" | "active" | "finished";

export type ManaColor = "W" | "U" | "B" | "R" | "G";

export type MatchStatus = "pending" | "completed" | "bye";

export type MatchFormat = "bo3" | "bo1";

/**
 * "draft" is the app's original mode (round-robin 1v1). standard/pioneer/brawl are
 * also 1v1 and reuse the exact same Match/Round/standings engine. commander is
 * multiplayer and uses Pod/Round.pods instead — see lib/gameFormats.ts.
 */
export type GameFormat = "draft" | "standard" | "pioneer" | "brawl" | "commander";

export interface MatchResult {
  winnerPlayerId: string | null;
  isDraw: boolean;
  gamesPlayerA: number;
  gamesPlayerB: number;
}

/** Result of a multiplayer Commander pod: a single winner (or a group draw), no game score. */
export interface PodResult {
  winnerPlayerId: string | null;
  isDraw: boolean;
}

/**
 * A single decklist line as pasted by the user. Only the reference (name +
 * optional exact printing) is persisted — no Scryfall data is stored on the
 * tournament itself, since that's resolved live (and cached) by lib/scryfall.ts
 * whenever the deck is actually viewed. Keeps tournament JSON small and the
 * deck data always fresh.
 */
export interface DeckCard {
  quantity: number;
  name: string;
  /** Set code, e.g. "TDC" — present when the pasted line included one (e.g. Moxfield exports). */
  set?: string;
  collectorNumber?: string;
  section: "mainboard" | "sideboard";
}

export interface Player {
  id: string;
  name: string;
  colors: ManaColor[];
  colorCombinationName: string;
  strixhavenCollegeName?: string | null;
  deckNotes?: string;
  deckName?: string;
  deck?: DeckCard[];
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

/** A Commander table: 3-6 players, one winner (or a group draw), no game score. */
export interface Pod {
  id: string;
  roundNumber: number;
  playerIds: string[];
  status: "pending" | "completed";
  result?: PodResult;
}

export interface Round {
  id: string;
  roundNumber: number;
  matches: Match[];
  /** Only present for Commander rounds; matches stays [] in that case. */
  pods?: Pod[];
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  host: "Fernando Tuquina";
  status: TournamentStatus;
  format: MatchFormat;
  gameFormat: GameFormat;
  allowDraws: boolean;
  players: Player[];
  rounds: Round[];
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string;
}

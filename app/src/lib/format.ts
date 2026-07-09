import type { MatchFormat, TournamentStatus } from "../types";

export const STATUS_LABELS: Record<TournamentStatus, string> = {
  drafting: "Preparación",
  active: "Activo",
  finished: "Finalizado",
};

export function playerCountMessage(count: number): string {
  if (count > 0 && count < 5) {
    return "Se puede jugar, pero para draft suele ser más divertido con 5, 6 u 8 personas.";
  }
  if (count === 5) {
    return "Formato recomendado: round robin con una persona libre por ronda.";
  }
  if (count === 6) {
    return "Buen número para un draft casual.";
  }
  if (count === 8) {
    return "¡Pod clásico ideal para draft!";
  }
  return "";
}

export interface ScoreOption {
  label: string;
  gamesA: number;
  gamesB: number;
}

/** Score choices offered once a winner (or draw) is picked in the result modal. */
export function getScoreOptions(
  format: MatchFormat,
  winnerIsPlayerA: boolean | null,
  isDraw: boolean
): ScoreOption[] {
  const bo3 = format !== "bo1";
  const options: ScoreOption[] = [];

  if (winnerIsPlayerA !== null) {
    if (bo3) {
      options.push({
        label: "2–0",
        gamesA: winnerIsPlayerA ? 2 : 0,
        gamesB: winnerIsPlayerA ? 0 : 2,
      });
      options.push({
        label: "2–1",
        gamesA: winnerIsPlayerA ? 2 : 1,
        gamesB: winnerIsPlayerA ? 1 : 2,
      });
    } else {
      options.push({
        label: "1–0",
        gamesA: winnerIsPlayerA ? 1 : 0,
        gamesB: winnerIsPlayerA ? 0 : 1,
      });
    }
  } else if (isDraw) {
    options.push(bo3 ? { label: "1–1", gamesA: 1, gamesB: 1 } : { label: "0–0", gamesA: 0, gamesB: 0 });
  }

  return options;
}

export function formatResultText(
  isDraw: boolean,
  winnerName: string | null,
  gamesA: number,
  gamesB: number
): string {
  if (isDraw) return `Empate ${gamesA}–${gamesB}`;
  return `${winnerName ?? "?"} ganó ${gamesA}–${gamesB}`;
}

/** Commander pods have no game score — just a winner or a group draw. */
export function formatPodResultText(isDraw: boolean, winnerName: string | null): string {
  if (isDraw) return "Empate";
  return `${winnerName ?? "?"} ganó`;
}

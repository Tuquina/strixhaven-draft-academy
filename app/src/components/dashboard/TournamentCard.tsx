import type { Tournament } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";
import { Button } from "../shared/Button";
import { GRADIENT_TEXT_GOLD } from "../../lib/designSystem";
import { GAME_FORMAT_LABELS } from "../../lib/gameFormats";

const BORDER_CLASSES: Record<Tournament["status"], string> = {
  active: "border-success/25",
  drafting: "border-parchment/20",
  finished: "border-gold/20",
};

interface TournamentCardProps {
  tournament: Tournament;
  playerCount: number;
  roundCount: number;
  leaderName: string | null;
  createdDate: string;
  onOpen: () => void;
  onDelete: () => void;
}

export function TournamentCard({
  tournament,
  playerCount,
  roundCount,
  leaderName,
  createdDate,
  onOpen,
  onDelete,
}: TournamentCardProps) {
  const isDrafting = tournament.status === "drafting";
  const isFinished = tournament.status === "finished";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={`animate-fade-in cursor-pointer rounded-xl border bg-background-panel/30 p-4 backdrop-blur-sm transition-colors hover:border-gold/40 sm:p-6 ${BORDER_CLASSES[tournament.status]}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className={`${GRADIENT_TEXT_GOLD} m-0 line-clamp-2 min-w-0 font-heading-decorative text-xl font-bold leading-tight`}>
          {tournament.name}
        </h3>
        <div className="flex shrink-0 items-start gap-1.5">
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={tournament.status} />
            {tournament.gameFormat !== "draft" && (
              <span className="rounded px-2 py-1 font-sans text-[11px] font-bold tracking-wide text-parchment/50 uppercase">
                {GAME_FORMAT_LABELS[tournament.gameFormat]}
              </span>
            )}
          </div>
          <button
            aria-label="Eliminar torneo"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="cursor-pointer rounded-lg border border-danger/30 bg-transparent px-2 py-1 text-sm text-danger sm:hidden"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="mb-2 flex flex-wrap gap-4 font-sans text-[13px] text-parchment/50">
        <span>{playerCount} jugadores</span>
        {!isDrafting && <span>{roundCount} rondas</span>}
        <span>{createdDate}</span>
      </div>

      {leaderName && (
        <div className="mb-3 font-sans text-[13px] font-semibold text-gold">
          {isFinished ? "Campeón" : "Líder"}: {leaderName}
        </div>
      )}

      <div className="mt-3 hidden gap-2 sm:flex">
        <Button
          variant="secondary"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          Abrir torneo
        </Button>
        <Button
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="px-3.5 text-xs"
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
}

import type { Tournament } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";
import { Button } from "../shared/Button";
import { GRADIENT_TEXT_GOLD } from "../../lib/designSystem";

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
      className={`animate-fade-in rounded-xl border bg-background-panel/30 p-4 backdrop-blur-sm sm:p-6 ${BORDER_CLASSES[tournament.status]}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className={`${GRADIENT_TEXT_GOLD} m-0 line-clamp-2 min-w-0 font-heading-decorative text-xl font-bold leading-tight`}>
          {tournament.name}
        </h3>
        <StatusBadge status={tournament.status} />
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

      <div className="mt-3 flex gap-2">
        <Button variant="secondary" fullWidth onClick={onOpen}>
          Abrir torneo
        </Button>
        <Button variant="danger" onClick={onDelete} className="px-3.5 text-xs">
          Eliminar
        </Button>
      </div>
    </div>
  );
}

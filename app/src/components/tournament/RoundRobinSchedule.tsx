import type { Tournament } from "../../types";
import { describeRounds } from "../../lib/rounds";
import { RoundCard } from "./RoundCard";

interface RoundRobinScheduleProps {
  tournament: Tournament;
  hasResults: boolean;
  onRegenerate: () => void;
  onOpenResult: (matchId: string) => void;
}

export function RoundRobinSchedule({
  tournament,
  hasResults,
  onRegenerate,
  onOpenResult,
}: RoundRobinScheduleProps) {
  const rounds = describeRounds(tournament);
  const canEdit = tournament.status !== "finished";
  const canRegenerate = rounds.length > 0 && !hasResults && canEdit;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h2 className="m-0 font-sans text-sm font-bold tracking-[2px] text-gold uppercase">Rondas</h2>
        {canRegenerate && (
          <button
            onClick={onRegenerate}
            className="cursor-pointer rounded border border-white/8 bg-transparent px-2.5 py-1 font-sans text-[11px] font-semibold text-parchment/35 hover:border-white/15"
          >
            Regenerar
          </button>
        )}
      </div>

      {rounds.length === 0 && (
        <div className="rounded-lg border border-dashed border-white/6 px-4 py-9 text-center font-sans text-[13px] text-parchment/30">
          <p className="m-0 mb-1">Generá el fixture para comenzar las rondas.</p>
          <p className="m-0 text-[11px] text-parchment/20">Necesitás al menos 2 jugadores.</p>
        </div>
      )}

      {rounds.map((round) => (
        <RoundCard key={round.id} round={round} canEdit={canEdit} onOpenResult={onOpenResult} />
      ))}
    </div>
  );
}

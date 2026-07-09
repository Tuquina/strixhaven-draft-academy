import type { MatchResult, Tournament } from "../../types";
import { describePods, describeRounds } from "../../lib/rounds";
import { isMultiplayerFormat } from "../../lib/gameFormats";
import { RoundCard } from "./RoundCard";
import { PodCard } from "./PodCard";

interface RoundRobinScheduleProps {
  tournament: Tournament;
  hasResults: boolean;
  onRegenerate: () => void;
  onOpenResult: (matchId: string) => void;
  onSaveResult: (matchId: string, result: MatchResult) => void;
  onOpenPodResult: (podId: string) => void;
}

export function RoundRobinSchedule({
  tournament,
  hasResults,
  onRegenerate,
  onOpenResult,
  onSaveResult,
  onOpenPodResult,
}: RoundRobinScheduleProps) {
  const canEdit = tournament.status !== "finished";

  if (isMultiplayerFormat(tournament.gameFormat)) {
    const podRounds = describePods(tournament);
    const canRegenerate = podRounds.length > 0 && !hasResults && canEdit;

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

        {podRounds.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/6 px-4 py-9 text-center font-sans text-[13px] text-parchment/30">
            <p className="m-0 mb-1">Generá el fixture para comenzar las rondas.</p>
            <p className="m-0 text-[11px] text-parchment/20">Necesitás al menos 3 jugadores.</p>
          </div>
        )}

        {podRounds.map((round) => (
          <PodCard key={round.id} round={round} canEdit={canEdit} onOpenResult={onOpenPodResult} />
        ))}
      </div>
    );
  }

  const rounds = describeRounds(tournament);
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
        <RoundCard
          key={round.id}
          round={round}
          canEdit={canEdit}
          format={tournament.format}
          allowDraws={tournament.allowDraws}
          onOpenResult={onOpenResult}
          onSaveResult={onSaveResult}
        />
      ))}
    </div>
  );
}


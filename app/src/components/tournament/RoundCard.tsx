import type { RoundDisplay } from "../../lib/rounds";
import type { MatchFormat, MatchResult } from "../../types";
import { MatchCard } from "./MatchCard";

interface RoundCardProps {
  round: RoundDisplay;
  canEdit: boolean;
  format: MatchFormat;
  allowDraws: boolean;
  onOpenResult: (matchId: string) => void;
  onSaveResult: (matchId: string, result: MatchResult) => void;
}

export function RoundCard({ round, canEdit, format, allowDraws, onOpenResult, onSaveResult }: RoundCardProps) {
  return (
    <div className="animate-fade-in rounded-[10px] border border-gold/8 bg-white/2.5 p-4">
      <h3 className="m-0 mb-2.5 border-b border-gold/6 pb-2 font-heading text-sm font-bold text-parchment">
        Ronda {round.number}
      </h3>
      <div className="flex flex-col gap-1.5">
        {round.matches.map((m) => (
          <MatchCard
            key={m.id}
            match={m}
            canEdit={canEdit}
            format={format}
            allowDraws={allowDraws}
            onOpenResult={() => onOpenResult(m.id)}
            onSaveResult={onSaveResult}
          />
        ))}
      </div>
    </div>
  );
}

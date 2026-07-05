import type { RoundDisplay } from "../../lib/rounds";
import { MatchCard } from "./MatchCard";

interface RoundCardProps {
  round: RoundDisplay;
  canEdit: boolean;
  onOpenResult: (matchId: string) => void;
}

export function RoundCard({ round, canEdit, onOpenResult }: RoundCardProps) {
  return (
    <div className="animate-fade-in rounded-[10px] border border-gold/8 bg-white/2.5 p-4">
      <h3 className="m-0 mb-2.5 border-b border-gold/6 pb-2 font-heading text-sm font-bold text-parchment">
        Ronda {round.number}
      </h3>
      <div className="flex flex-col gap-1.5">
        {round.matches.map((m) => (
          <MatchCard key={m.id} match={m} canEdit={canEdit} onOpenResult={() => onOpenResult(m.id)} />
        ))}
      </div>
    </div>
  );
}

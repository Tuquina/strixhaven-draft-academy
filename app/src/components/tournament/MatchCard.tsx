import { useState } from "react";
import type { MatchDisplay } from "../../lib/rounds";
import type { MatchFormat, MatchResult } from "../../types";
import { MatchTimerModal } from "../shared/MatchTimerModal";
import { LiveMatchModal } from "./LiveMatchModal";

interface MatchCardProps {
  match: MatchDisplay;
  canEdit: boolean;
  format: MatchFormat;
  allowDraws: boolean;
  onOpenResult: () => void;
  onSaveResult: (matchId: string, result: MatchResult) => void;
}

export function MatchCard({ match, canEdit, format, allowDraws, onOpenResult, onSaveResult }: MatchCardProps) {
  const [showTimer, setShowTimer] = useState(false);
  const [showLiveMatch, setShowLiveMatch] = useState(false);

  if (match.isBye) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-md bg-black/12 px-3 py-2.5">
        <span className="font-sans text-[13px] text-parchment/40 italic">
          Libre: {match.byePlayerName}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-md bg-black/12 px-3 py-2.5">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        <span className="font-body text-sm font-semibold text-parchment">{match.playerAName}</span>
        <span className="font-sans text-[11px] text-parchment/25">vs</span>
        <span className="font-body text-sm font-semibold text-parchment">{match.playerBName}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {match.isCompleted && (
          <>
            <span className="font-sans text-xs font-semibold text-success">{match.resultText}</span>
            {canEdit && (
              <button
                onClick={onOpenResult}
                className="cursor-pointer rounded border border-gold/15 bg-transparent px-2 py-1 font-sans text-[10px] font-semibold text-gold hover:bg-gold/8"
              >
                Editar
              </button>
            )}
          </>
        )}
        {match.isPending && (
          <>
            <button
              onClick={() => setShowLiveMatch(true)}
              className="cursor-pointer rounded-[5px] border border-gold/25 bg-transparent px-3 py-1.5 font-sans text-xs font-semibold text-gold hover:bg-gold/10"
            >
              ⚔️ Comenzar partida
            </button>
            <button
              onClick={onOpenResult}
              className="cursor-pointer rounded-[5px] border-none bg-gold/12 px-3 py-1.5 font-sans text-xs font-semibold text-gold hover:bg-gold/20"
            >
              Cargar resultado
            </button>
          </>
        )}
        <button
          onClick={() => setShowTimer(true)}
          title="Temporizador de partida"
          className="cursor-pointer rounded border border-gold/15 bg-transparent px-2 py-1 font-sans text-xs text-gold/70 hover:bg-gold/8 hover:text-gold"
        >
          ⏱
        </button>
      </div>

      {showTimer && (
        <MatchTimerModal
          playerAName={match.playerAName}
          playerBName={match.playerBName}
          onClose={() => setShowTimer(false)}
        />
      )}

      {showLiveMatch && match.playerBId && (
        <LiveMatchModal
          playerAId={match.playerAId}
          playerBId={match.playerBId}
          playerAName={match.playerAName}
          playerBName={match.playerBName}
          format={format}
          allowDraws={allowDraws}
          onSave={(result) => onSaveResult(match.id, result)}
          onClose={() => setShowLiveMatch(false)}
        />
      )}
    </div>
  );
}

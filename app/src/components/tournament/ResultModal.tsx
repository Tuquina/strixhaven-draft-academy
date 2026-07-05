import { useState } from "react";
import { Modal } from "../shared/Modal";
import { getScoreOptions } from "../../lib/format";
import type { MatchFormat, MatchResult } from "../../types";

interface ResultModalProps {
  playerAId: string;
  playerBId: string;
  playerAName: string;
  playerBName: string;
  format: MatchFormat;
  allowDraws: boolean;
  initialResult?: MatchResult;
  onSave: (result: MatchResult) => void;
  onClose: () => void;
}

const selectedStyle =
  "border-2 border-gold bg-gold/15 text-gold";
const unselectedStyle =
  "border-2 border-white/12 bg-transparent text-parchment";

export function ResultModal({
  playerAId,
  playerBId,
  playerAName,
  playerBName,
  format,
  allowDraws,
  initialResult,
  onSave,
  onClose,
}: ResultModalProps) {
  const [winnerId, setWinnerId] = useState<string | null>(
    initialResult && !initialResult.isDraw ? initialResult.winnerPlayerId : null
  );
  const [isDraw, setIsDraw] = useState(initialResult?.isDraw ?? false);
  const [gamesA, setGamesA] = useState(initialResult?.gamesPlayerA ?? 0);
  const [gamesB, setGamesB] = useState(initialResult?.gamesPlayerB ?? 0);

  const winnerIsPlayerA = winnerId === null ? null : winnerId === playerAId;
  const scoreOptions = getScoreOptions(format, winnerIsPlayerA, isDraw);
  const isValid = (!!winnerId || isDraw) && (gamesA + gamesB > 0 || isDraw);

  const selectWinner = (id: string) => {
    setWinnerId(id);
    setIsDraw(false);
    setGamesA(0);
    setGamesB(0);
  };

  const selectDraw = () => {
    setWinnerId(null);
    setIsDraw(true);
    setGamesA(0);
    setGamesB(0);
  };

  return (
    <Modal onClose={onClose} maxWidth="420px">
      <h2 className="m-0 mb-5 font-heading text-xl font-bold text-parchment">Cargar resultado</h2>
      <div className="flex flex-col gap-3.5">
        <label className="font-sans text-[11px] font-semibold tracking-wide text-parchment/40 uppercase">
          Ganador
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => selectWinner(playerAId)}
            className={`flex-1 cursor-pointer rounded-lg py-3 font-heading text-sm font-semibold hover:opacity-90 ${
              winnerId === playerAId ? selectedStyle : unselectedStyle
            }`}
          >
            {playerAName}
          </button>
          <button
            onClick={() => selectWinner(playerBId)}
            className={`flex-1 cursor-pointer rounded-lg py-3 font-heading text-sm font-semibold hover:opacity-90 ${
              winnerId === playerBId ? selectedStyle : unselectedStyle
            }`}
          >
            {playerBName}
          </button>
        </div>
        {allowDraws && (
          <button
            onClick={selectDraw}
            className={`w-full cursor-pointer rounded-lg py-3 font-heading text-sm font-semibold hover:opacity-90 ${
              isDraw ? selectedStyle : unselectedStyle
            }`}
          >
            Empate
          </button>
        )}
        {scoreOptions.length > 0 && (
          <>
            <label className="font-sans text-[11px] font-semibold tracking-wide text-parchment/40 uppercase">
              Marcador
            </label>
            <div className="flex flex-wrap gap-2">
              {scoreOptions.map((opt) => {
                const selected = opt.gamesA === gamesA && opt.gamesB === gamesB;
                return (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setGamesA(opt.gamesA);
                      setGamesB(opt.gamesB);
                    }}
                    className={`cursor-pointer rounded-lg px-5 py-2.5 font-sans text-sm font-bold hover:opacity-90 ${
                      selected ? selectedStyle : unselectedStyle
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
      <div className="mt-6 flex gap-2.5">
        <button
          disabled={!isValid}
          onClick={() =>
            onSave({
              winnerPlayerId: isDraw ? null : winnerId,
              isDraw,
              gamesPlayerA: gamesA,
              gamesPlayerB: gamesB,
            })
          }
          className="flex-1 cursor-pointer rounded-lg border-none bg-gradient-to-br from-success to-success-dark py-3 font-heading text-sm font-bold text-white hover:shadow-[0_4px_20px_rgba(78,159,61,0.4)] disabled:opacity-40"
        >
          Guardar resultado
        </button>
        <button
          onClick={onClose}
          className="cursor-pointer rounded-lg border border-white/12 bg-transparent px-4.5 py-3 font-sans text-sm font-semibold text-parchment/45 hover:bg-white/4"
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
}

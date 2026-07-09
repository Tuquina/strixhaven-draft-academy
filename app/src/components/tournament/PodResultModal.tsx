import { useState } from "react";
import { Modal } from "../shared/Modal";
import type { PodResult } from "../../types";

interface PodResultModalProps {
  playerIds: string[];
  playerNames: string[];
  allowDraws: boolean;
  initialResult?: PodResult;
  onSave: (result: PodResult) => void;
  onClose: () => void;
}

const selectedStyle = "border-2 border-gold bg-gold/15 text-gold";
const unselectedStyle = "border-2 border-white/12 bg-transparent text-parchment";

export function PodResultModal({
  playerIds,
  playerNames,
  allowDraws,
  initialResult,
  onSave,
  onClose,
}: PodResultModalProps) {
  const [winnerId, setWinnerId] = useState<string | null>(
    initialResult && !initialResult.isDraw ? initialResult.winnerPlayerId : null
  );
  const [isDraw, setIsDraw] = useState(initialResult?.isDraw ?? false);

  const isValid = !!winnerId || isDraw;

  const selectWinner = (id: string) => {
    setWinnerId(id);
    setIsDraw(false);
  };

  const selectDraw = () => {
    setWinnerId(null);
    setIsDraw(true);
  };

  return (
    <Modal onClose={onClose} maxWidth="420px">
      <h2 className="m-0 mb-5 font-heading text-xl font-bold text-parchment">Cargar resultado de la mesa</h2>
      <div className="flex flex-col gap-2.5">
        <label className="font-sans text-[11px] font-semibold tracking-wide text-parchment/40 uppercase">
          Ganador
        </label>
        {playerIds.map((id, i) => (
          <button
            key={id}
            onClick={() => selectWinner(id)}
            className={`w-full cursor-pointer rounded-lg py-3 font-heading text-sm font-semibold hover:opacity-90 ${
              winnerId === id ? selectedStyle : unselectedStyle
            }`}
          >
            {playerNames[i]}
          </button>
        ))}
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
      </div>
      <div className="mt-6 flex gap-2.5">
        <button
          disabled={!isValid}
          onClick={() => onSave({ winnerPlayerId: isDraw ? null : winnerId, isDraw })}
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

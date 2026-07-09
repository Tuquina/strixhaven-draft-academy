import { useState } from "react";
import { Modal } from "../shared/Modal";
import { Button } from "../shared/Button";
import { GAME_FORMAT_LABELS } from "../../lib/gameFormats";
import type { GameFormat, MatchFormat } from "../../types";
import type { CreateTournamentInput } from "../../hooks/useTournaments";

interface CreateTournamentModalProps {
  defaultName: string;
  defaultFormat: MatchFormat;
  defaultAllowDraws: boolean;
  onCreate: (input: CreateTournamentInput) => void;
  onClose: () => void;
}

const OTHER_FORMATS: GameFormat[] = ["standard", "pioneer", "brawl", "commander"];

const formatButtonClass = (active: boolean) =>
  `cursor-pointer rounded-lg border-2 px-4 py-2.5 font-sans text-xs font-semibold ${
    active
      ? "border-gold bg-gold/12 text-gold"
      : "border-white/12 bg-transparent text-parchment/45"
  }`;

export function CreateTournamentModal({
  defaultName,
  defaultFormat,
  defaultAllowDraws,
  onCreate,
  onClose,
}: CreateTournamentModalProps) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState<MatchFormat>(defaultFormat);
  const [allowDraws, setAllowDraws] = useState(defaultAllowDraws);
  const [gameFormat, setGameFormat] = useState<GameFormat>("draft");
  const [showOtherFormats, setShowOtherFormats] = useState(false);

  return (
    <Modal onClose={onClose} maxWidth="460px">
      <h2 className="m-0 mb-5 font-heading text-[22px] font-bold text-parchment">
        Crear nuevo torneo
      </h2>
      <div className="flex flex-col gap-3.5">
        <div>
          <label className="mb-1.5 block font-sans text-[11px] font-semibold tracking-wide text-parchment/40 uppercase">
            Nombre del torneo
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 font-body text-base text-parchment"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-sans text-[11px] font-semibold tracking-wide text-parchment/40 uppercase">
            Descripción (opcional)
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-white/6 bg-black/20 px-3.5 py-2.5 font-body text-base text-parchment sm:text-sm"
          />
        </div>
        {gameFormat !== "commander" && (
          <div>
            <label className="mb-2 block font-sans text-[11px] font-semibold tracking-wide text-parchment/40 uppercase">
              Formato de partida
            </label>
            <div className="flex gap-2">
              <button className={formatButtonClass(format === "bo3")} onClick={() => setFormat("bo3")}>
                Mejor de 3
              </button>
              <button className={formatButtonClass(format === "bo1")} onClick={() => setFormat("bo1")}>
                Partida única
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <label className="font-sans text-xs font-semibold text-parchment/40">
            Permitir empates
          </label>
          <button
            onClick={() => setAllowDraws((v) => !v)}
            className={`cursor-pointer rounded-md border-2 px-3.5 py-1.5 font-sans text-xs font-semibold ${
              allowDraws
                ? "border-gold bg-gold/12 text-gold"
                : "border-white/12 bg-transparent text-parchment/40"
            }`}
          >
            {allowDraws ? "Activado" : "Desactivado"}
          </button>
        </div>

        <div className="border-t border-white/8 pt-3.5">
          <button
            type="button"
            onClick={() => setShowOtherFormats((v) => !v)}
            className="cursor-pointer border-none bg-transparent p-0 text-left font-sans text-xs font-semibold text-gold/70 underline decoration-dotted underline-offset-2 hover:text-gold"
          >
            {gameFormat === "draft"
              ? "¿Buscás otro tipo de torneo?"
              : `Tipo de torneo: ${GAME_FORMAT_LABELS[gameFormat]} — cambiar`}
          </button>

          {showOtherFormats && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {OTHER_FORMATS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setGameFormat((current) => (current === f ? "draft" : f))}
                  className={formatButtonClass(gameFormat === f)}
                >
                  {GAME_FORMAT_LABELS[f]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex gap-2.5">
        <Button
          variant="primary"
          fullWidth
          className="py-3.5 font-heading text-sm"
          disabled={!name.trim()}
          onClick={() => onCreate({ name, description, format, gameFormat, allowDraws })}
        >
          Crear torneo
        </Button>
        <Button variant="ghost" className="border-white/12 px-4.5 py-3.5 text-parchment/45 hover:bg-white/4" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </Modal>
  );
}

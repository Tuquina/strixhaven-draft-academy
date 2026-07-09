import { useState } from "react";
import type { ManaColor, Tournament } from "../../types";
import type { PlayerFormInput } from "../../hooks/useTournaments";
import { getColorCombo } from "../../lib/colors";
import { playerCountMessage } from "../../lib/format";
import { NOTE_VERDANT } from "../../lib/designSystem";
import { DEFAULT_COMMANDER_ROUNDS, DEFAULT_POD_SIZE, distributePodSizes, isMultiplayerFormat, MIN_POD_SIZE } from "../../lib/gameFormats";
import { PlayerForm } from "./PlayerForm";
import { PlayerCard } from "./PlayerCard";
import { Button } from "../shared/Button";
import { ConfirmDialog } from "../shared/ConfirmDialog";

const EMPTY_FORM: PlayerFormInput = { editingId: null, name: "", colors: [], notes: "" };

interface PlayerRosterProps {
  tournament: Tournament;
  onAddOrUpdatePlayer: (form: PlayerFormInput) => void;
  onRemovePlayer: (playerId: string) => void;
  onGenerateSchedule: (roundsCount?: number) => void;
  notify: (text: string) => void;
}

function podSizeHint(playerCount: number): string {
  const sizes = distributePodSizes(playerCount, DEFAULT_POD_SIZE);
  if (sizes.length <= 1) return `Con ${playerCount} jugadores se arma una sola mesa.`;
  return `Con ${playerCount} jugadores se armarán mesas de ${sizes.join(", ")}.`;
}

export function PlayerRoster({
  tournament,
  onAddOrUpdatePlayer,
  onRemovePlayer,
  onGenerateSchedule,
  notify,
}: PlayerRosterProps) {
  const [form, setForm] = useState<PlayerFormInput>(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [roundsCount, setRoundsCount] = useState(DEFAULT_COMMANDER_ROUNDS);

  const canEdit = tournament.status !== "finished";
  const playerCount = tournament.players.length;
  const isCommander = isMultiplayerFormat(tournament.gameFormat);
  const countMsg = tournament.gameFormat === "draft" ? playerCountMessage(playerCount) : "";
  const commanderHint = isCommander && playerCount >= MIN_POD_SIZE ? podSizeHint(playerCount) : "";
  const canGenerate = isCommander ? playerCount >= MIN_POD_SIZE : playerCount >= 2;
  const formCombo = getColorCombo(form.colors, tournament.gameFormat === "draft");

  const toggleColor = (c: ManaColor) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.includes(c) ? f.colors.filter((x) => x !== c) : [...f.colors, c],
    }));
  };

  const handleSave = () => {
    onAddOrUpdatePlayer(form);
    notify(form.editingId ? "Jugador actualizado" : "Jugador agregado");
    setForm(EMPTY_FORM);
  };

  return (
    <div className="flex flex-col gap-3.5">
      <h2 className="m-0 flex items-center gap-2 font-sans text-sm font-bold tracking-[2px] text-gold uppercase">
        Jugadores <span className="font-sans text-xs font-normal text-parchment/35">({playerCount})</span>
      </h2>

      {canEdit && (
        <PlayerForm
          name={form.name}
          colors={form.colors}
          notes={form.notes}
          comboName={formCombo.name}
          isEditing={!!form.editingId}
          onNameChange={(name) => setForm((f) => ({ ...f, name }))}
          onToggleColor={toggleColor}
          onNotesChange={(notes) => setForm((f) => ({ ...f, notes }))}
          onSave={handleSave}
          onCancel={() => setForm(EMPTY_FORM)}
        />
      )}

      {(countMsg || commanderHint) && (
        <div className={`${NOTE_VERDANT} px-3 py-2.5`}>
          {countMsg || commanderHint}
        </div>
      )}

      {tournament.players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          comboName={player.colorCombinationName}
          canEdit={canEdit}
          onEdit={() =>
            setForm({ editingId: player.id, name: player.name, colors: [...player.colors], notes: player.deckNotes || "" })
          }
          onRemove={() => setDeleteConfirmId(player.id)}
        />
      ))}

      {canEdit && canGenerate && tournament.status === "drafting" && (
        <div className="flex flex-col gap-2">
          {isCommander && (
            <label className="flex items-center justify-between gap-2 font-sans text-xs font-semibold text-parchment/40">
              Rondas
              <input
                type="number"
                min={1}
                max={10}
                value={roundsCount}
                onChange={(e) => setRoundsCount(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                className="w-16 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-center font-body text-sm text-parchment"
              />
            </label>
          )}
          <Button
            variant="success"
            fullWidth
            className="mt-1 py-3.5 font-heading text-sm tracking-wide"
            onClick={() => onGenerateSchedule(isCommander ? roundsCount : undefined)}
          >
            Generar fixture
          </Button>
        </div>
      )}

      {playerCount === 0 && (
        <div className="px-4 py-7 text-center font-sans text-[13px] text-parchment/30">
          Agregá jugadores para comenzar.
        </div>
      )}

      {deleteConfirmId && (
        <ConfirmDialog
          title="Eliminar jugador"
          message="Modificar jugadores puede regenerar el fixture y borrar resultados. ¿Continuar?"
          confirmLabel="Eliminar"
          danger
          onCancel={() => setDeleteConfirmId(null)}
          onConfirm={() => {
            onRemovePlayer(deleteConfirmId);
            notify("Jugador eliminado — regenerá el fixture");
            setDeleteConfirmId(null);
          }}
        />
      )}
    </div>
  );
}

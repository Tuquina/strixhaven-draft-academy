import { useEffect, useState } from "react";
import { ColorSelector } from "./ColorSelector";
import { ColorCombinationBadge } from "./ColorCombinationBadge";
import { Button } from "../shared/Button";
import type { ManaColor } from "../../types";

interface PlayerFormProps {
  name: string;
  colors: ManaColor[];
  notes: string;
  comboName: string;
  isEditing: boolean;
  deckName: string;
  deckListText: string;
  deckCardCount: number;
  deckWarnings: string[];
  onNameChange: (v: string) => void;
  onToggleColor: (c: ManaColor) => void;
  onNotesChange: (v: string) => void;
  onDeckNameChange: (v: string) => void;
  onDeckListTextChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function PlayerForm({
  name,
  colors,
  notes,
  comboName,
  isEditing,
  deckName,
  deckListText,
  deckCardCount,
  deckWarnings,
  onNameChange,
  onToggleColor,
  onNotesChange,
  onDeckNameChange,
  onDeckListTextChange,
  onSave,
  onCancel,
}: PlayerFormProps) {
  const [showDeckSection, setShowDeckSection] = useState(deckListText.trim() !== "");

  // Editing a different player can swap deckListText under this same form
  // instance — auto-reveal the section so an existing deck isn't hidden.
  useEffect(() => {
    if (deckListText.trim() !== "") setShowDeckSection(true);
  }, [deckListText]);

  return (
    <div className="flex flex-col gap-2.5 rounded-[10px] border border-gold/12 bg-background-panel/45 p-4.5 backdrop-blur-sm">
      <input
        placeholder="Nombre del jugador"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 font-body text-base text-parchment"
      />
      <ColorSelector selected={colors} onToggle={onToggleColor} />
      {colors.length > 0 && <ColorCombinationBadge comboName={comboName} />}
      <input
        placeholder="Notas del mazo (opcional)"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        className="w-full rounded-lg border border-white/6 bg-black/20 px-3.5 py-2 font-body text-base text-parchment sm:text-sm"
      />

      <div className="border-t border-white/8 pt-2.5">
        <button
          type="button"
          onClick={() => setShowDeckSection((v) => !v)}
          className="cursor-pointer border-none bg-transparent p-0 text-left font-sans text-xs font-semibold text-gold/70 underline decoration-dotted underline-offset-2 hover:text-gold"
        >
          {showDeckSection ? "🃏 Ocultar mazo" : "🃏 Cargar mazo (opcional)"}
        </button>

        {showDeckSection && (
          <div className="mt-2.5 flex flex-col gap-2">
            <input
              placeholder="Nombre del mazo (opcional)"
              value={deckName}
              onChange={(e) => onDeckNameChange(e.target.value)}
              className="w-full rounded-lg border border-white/6 bg-black/20 px-3.5 py-2 font-body text-base text-parchment sm:text-sm"
            />
            <textarea
              placeholder={"Pegá la decklist, una carta por línea:\n4 Lightning Bolt\n2 Preordain (TDC) 161"}
              value={deckListText}
              onChange={(e) => onDeckListTextChange(e.target.value)}
              rows={6}
              className="w-full resize-y rounded-lg border border-white/6 bg-black/20 px-3.5 py-2 font-body text-sm text-parchment"
            />
            {deckListText.trim() !== "" && (
              <p className="m-0 font-sans text-[11px] text-parchment/40">
                {deckCardCount > 0 ? `${deckCardCount} carta${deckCardCount === 1 ? "" : "s"} reconocidas` : "Ninguna carta reconocida todavía"}
                {deckWarnings.length > 0 && ` · ${deckWarnings.length} línea${deckWarnings.length === 1 ? "" : "s"} no interpretada${deckWarnings.length === 1 ? "" : "s"}`}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="primary"
          fullWidth
          disabled={!name.trim()}
          onClick={onSave}
          className="py-2.5 font-sans text-[13px]"
        >
          {isEditing ? "Actualizar jugador" : "Agregar jugador"}
        </Button>
        {isEditing && (
          <Button variant="ghost" className="border-white/12 py-2.5 px-3.5 text-[13px] text-parchment/50 hover:bg-white/4" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}

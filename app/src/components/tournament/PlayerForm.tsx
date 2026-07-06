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
  onNameChange: (v: string) => void;
  onToggleColor: (c: ManaColor) => void;
  onNotesChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function PlayerForm({
  name,
  colors,
  notes,
  comboName,
  isEditing,
  onNameChange,
  onToggleColor,
  onNotesChange,
  onSave,
  onCancel,
}: PlayerFormProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[10px] border border-gold/10 bg-white/2.5 p-4.5">
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

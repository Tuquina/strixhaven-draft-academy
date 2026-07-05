import { WUBRG, MANA_NAMES, MANA_CHIP_COLORS } from "../../lib/colors";
import type { ManaColor } from "../../types";

interface ColorSelectorProps {
  selected: ManaColor[];
  onToggle: (color: ManaColor) => void;
}

export function ColorSelector({ selected, onToggle }: ColorSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {WUBRG.map((c) => {
        const isSelected = selected.includes(c);
        const mc = MANA_CHIP_COLORS[c];
        return (
          <button
            key={c}
            type="button"
            onClick={() => onToggle(c)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border-2 px-3 py-1.5 font-sans text-xs font-semibold transition-opacity hover:opacity-85"
            style={
              isSelected
                ? {
                    borderColor: mc.border,
                    background: mc.bg,
                    color: mc.text,
                    boxShadow: `0 0 10px ${mc.bg}40`,
                  }
                : {
                    borderColor: "rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(233,216,180,0.45)",
                  }
            }
          >
            {c} {MANA_NAMES[c]}
          </button>
        );
      })}
    </div>
  );
}

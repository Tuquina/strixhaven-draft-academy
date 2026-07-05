import { MANA_CHIP_COLORS } from "../../lib/colors";
import type { ManaColor } from "../../types";

export function ManaLetterBadge({ color }: { color: ManaColor }) {
  const mc = MANA_CHIP_COLORS[color];
  return (
    <span
      className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full font-sans text-[11px] font-bold"
      style={{ background: mc.bg, color: mc.text, border: `1px solid ${mc.border}` }}
    >
      {color}
    </span>
  );
}

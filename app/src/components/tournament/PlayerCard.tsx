import { COLLEGE_THEMES } from "../../lib/colors";
import type { Player } from "../../types";
import { ManaLetterBadge } from "./ManaLetterBadge";

interface PlayerCardProps {
  player: Player;
  comboName: string;
  canEdit: boolean;
  onEdit: () => void;
  onRemove: () => void;
}

export function PlayerCard({ player, comboName, canEdit, onEdit, onRemove }: PlayerCardProps) {
  const theme = player.strixhavenCollegeName
    ? COLLEGE_THEMES[player.strixhavenCollegeName as keyof typeof COLLEGE_THEMES]
    : null;

  return (
    <div
      className="animate-fade-in rounded-lg p-3.5"
      style={
        theme
          ? {
              background: theme.bg,
              border: `1px solid ${theme.accent}`,
              borderLeft: `4px solid ${theme.accent}`,
            }
          : {
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(200,155,60,0.1)",
            }
      }
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-heading text-base font-bold text-parchment">{player.name}</span>
        {canEdit && (
          <div className="flex shrink-0 gap-1">
            <button
              onClick={onEdit}
              className="cursor-pointer rounded border border-gold/20 bg-transparent px-2.5 py-1 font-sans text-[11px] font-semibold text-gold hover:bg-gold/8"
            >
              Editar
            </button>
            <button
              onClick={onRemove}
              className="cursor-pointer rounded border border-danger/20 bg-transparent px-2.5 py-1 font-sans text-[11px] font-semibold text-danger hover:bg-danger/8"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {player.colors.map((c) => (
            <ManaLetterBadge key={c} color={c} />
          ))}
        </div>
        <span className="font-sans text-[13px] font-semibold text-parchment/55">{comboName}</span>
      </div>
      {player.deckNotes && (
        <div className="mt-1.5 font-body text-xs leading-relaxed text-parchment/35 italic">
          {player.deckNotes}
        </div>
      )}
    </div>
  );
}

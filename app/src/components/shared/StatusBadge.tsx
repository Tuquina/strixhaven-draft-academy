import type { TournamentStatus } from "../../types";
import { STATUS_LABELS } from "../../lib/format";

const STATUS_CLASSES: Record<TournamentStatus, string> = {
  drafting: "bg-parchment/12 text-parchment/85",
  active: "bg-success/15 text-success",
  finished: "bg-gold/15 text-gold",
};

export function StatusBadge({ status }: { status: TournamentStatus }) {
  return (
    <span
      className={`shrink-0 rounded px-2.5 py-1 font-sans text-[11px] font-bold tracking-wide uppercase ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

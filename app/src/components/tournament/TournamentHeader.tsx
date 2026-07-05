import type { Tournament } from "../../types";
import { STATUS_LABELS } from "../../lib/format";
import { Button } from "../shared/Button";

interface TournamentHeaderProps {
  tournament: Tournament;
  onBack: () => void;
  onFinalize: () => void;
  onReopen: () => void;
  onExport: () => void;
}

export function TournamentHeader({
  tournament,
  onBack,
  onFinalize,
  onReopen,
  onExport,
}: TournamentHeaderProps) {
  return (
    <header className="sticky top-0 z-[100] border-b border-gold/12 bg-background-panel px-6 py-4">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          <button
            onClick={onBack}
            className="cursor-pointer rounded-md border border-gold/20 bg-transparent px-3 py-2 font-sans text-[13px] font-semibold whitespace-nowrap text-gold hover:bg-gold/10"
          >
            ← Volver
          </button>
          <div className="min-w-0">
            <h1 className="m-0 overflow-hidden font-heading text-[clamp(16px,3vw,22px)] font-bold text-ellipsis whitespace-nowrap text-parchment">
              {tournament.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2.5 font-sans text-xs text-parchment/45">
              <span className="rounded bg-gold/10 px-2 py-0.5 font-sans text-[10px] font-bold tracking-wide text-gold uppercase">
                {STATUS_LABELS[tournament.status]}
              </span>
              <span>{tournament.players.length} jugadores</span>
              <span className="text-parchment/30">Hosted by Fernando Tuquina</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {tournament.status === "active" && (
            <Button variant="primary" className="px-4 py-2.5 text-xs" onClick={onFinalize}>
              Finalizar torneo
            </Button>
          )}
          {tournament.status === "finished" && (
            <Button variant="secondary" className="px-4 py-2.5 text-xs" onClick={onReopen}>
              Reabrir torneo
            </Button>
          )}
          <Button variant="ghost" className="border-white/8 px-3 py-2.5 text-xs" onClick={onExport}>
            Exportar
          </Button>
        </div>
      </div>
    </header>
  );
}

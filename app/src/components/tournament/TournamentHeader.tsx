import type { Tournament } from "../../types";
import { STATUS_LABELS } from "../../lib/format";
import { GAME_FORMAT_LABELS, GAME_FORMAT_RULES_URL } from "../../lib/gameFormats";
import { GRADIENT_TEXT_GOLD } from "../../lib/designSystem";
import { Button } from "../shared/Button";

interface TournamentHeaderProps {
  tournament: Tournament;
  onBack: () => void;
  onFinalize: () => void;
  onReopen: () => void;
  onExport: () => void;
  onOpenTimer: () => void;
}

export function TournamentHeader({
  tournament,
  onBack,
  onFinalize,
  onReopen,
  onExport,
  onOpenTimer,
}: TournamentHeaderProps) {
  return (
    <header className="sticky top-0 z-[100] border-b border-gold/10 bg-background-panel/70 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-[1440px] flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2.5 sm:flex-1 sm:gap-3.5">
          <button
            onClick={onBack}
            className="cursor-pointer rounded-md border border-gold/20 bg-transparent px-3 py-2.5 font-sans text-[13px] font-semibold whitespace-nowrap text-gold hover:bg-gold/10"
          >
            ← Volver
          </button>
          <div className="min-w-0">
            <h1 className={`${GRADIENT_TEXT_GOLD} m-0 overflow-hidden font-heading-decorative text-[clamp(16px,3vw,22px)] font-bold text-ellipsis whitespace-nowrap`}>
              {tournament.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2.5 font-sans text-xs text-parchment/45">
              <span className="rounded bg-gold/10 px-2 py-0.5 font-sans text-[10px] font-bold tracking-wide text-gold uppercase">
                {STATUS_LABELS[tournament.status]}
              </span>
              <span>{tournament.players.length} jugadores</span>
              {tournament.gameFormat !== "draft" && (
                <>
                  <span className="rounded bg-parchment/10 px-2 py-0.5 font-sans text-[10px] font-bold tracking-wide text-parchment/70 uppercase">
                    {GAME_FORMAT_LABELS[tournament.gameFormat]}
                  </span>
                  {GAME_FORMAT_RULES_URL[tournament.gameFormat] && (
                    <a
                      href={GAME_FORMAT_RULES_URL[tournament.gameFormat]}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gold/70 underline decoration-dotted underline-offset-2 hover:text-gold"
                    >
                      📖 Reglas ↗
                    </a>
                  )}
                </>
              )}
              <span className="hidden text-parchment/30 sm:inline">Hosted by Fernando Tuquina</span>
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
          <Button variant="ghost" className="border-white/8 px-3 py-2.5 text-xs" onClick={onOpenTimer}>
            ⏱ Temporizador
          </Button>
          <Button variant="ghost" className="border-white/8 px-3 py-2.5 text-xs" onClick={onExport}>
            Exportar
          </Button>
        </div>
      </div>
    </header>
  );
}

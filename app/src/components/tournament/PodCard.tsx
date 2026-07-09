import type { PodRoundDisplay } from "../../lib/rounds";

interface PodCardProps {
  round: PodRoundDisplay;
  canEdit: boolean;
  onOpenResult: (podId: string) => void;
}

export function PodCard({ round, canEdit, onOpenResult }: PodCardProps) {
  return (
    <div className="animate-fade-in rounded-[10px] border border-gold/10 bg-background-panel/45 p-4 backdrop-blur-sm">
      <h3 className="m-0 mb-2.5 border-b border-gold/6 pb-2 font-heading text-sm font-bold text-parchment">
        Ronda {round.number}
      </h3>
      <div className="flex flex-col gap-1.5">
        {round.pods.map((pod) => (
          <div
            key={pod.id}
            className="flex flex-col items-stretch gap-2 rounded-md bg-black/25 px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2.5"
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {pod.playerNames.map((name, i) => (
                <span key={pod.playerIds[i]} className="font-body text-sm font-semibold text-parchment">
                  {name}
                  {i < pod.playerNames.length - 1 && (
                    <span className="ml-1.5 font-sans text-[11px] text-parchment/25">·</span>
                  )}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1.5 sm:shrink-0">
              {pod.isCompleted && (
                <>
                  <span className="font-sans text-xs font-semibold text-success">{pod.resultText}</span>
                  {canEdit && (
                    <button
                      onClick={() => onOpenResult(pod.id)}
                      className="cursor-pointer rounded border border-gold/15 bg-transparent px-2.5 py-2 font-sans text-[10px] font-semibold text-gold hover:bg-gold/8 sm:py-1.5"
                    >
                      Editar
                    </button>
                  )}
                </>
              )}
              {pod.isPending && canEdit && (
                <button
                  onClick={() => onOpenResult(pod.id)}
                  className="cursor-pointer rounded-[5px] border-none bg-gold/12 px-3 py-2 font-sans text-xs font-semibold text-gold hover:bg-gold/20 sm:py-1.5"
                >
                  Cargar resultado
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import type { MatchFormat, MatchResult } from "../../types";
import { genId } from "../../lib/id";
import { playAlarmBeep } from "../../lib/timerSound";
import { Modal } from "../shared/Modal";
import { MatchTimerModal } from "../shared/MatchTimerModal";

interface LiveMatchModalProps {
  playerAId: string;
  playerBId: string;
  playerAName: string;
  playerBName: string;
  format: MatchFormat;
  allowDraws: boolean;
  onSave: (result: MatchResult) => void;
  onClose: () => void;
}

interface Counter {
  id: string;
  name: string;
  value: number;
}

const STARTING_LIFE = 20;

function CounterAdder({ onAdd }: { onAdd: (name: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div className="mt-1.5 flex gap-1.5">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Otro contador (ej: Veneno)"
        className="min-w-0 flex-1 rounded border border-white/12 bg-transparent px-2 py-1 font-sans text-xs text-parchment placeholder:text-parchment/30 focus:border-gold"
      />
      <button
        type="button"
        onClick={() => {
          if (!text.trim()) return;
          onAdd(text.trim());
          setText("");
        }}
        className="cursor-pointer rounded border border-gold/25 bg-gold/8 px-2.5 py-1 font-sans text-xs font-semibold text-gold hover:bg-gold/15"
      >
        +
      </button>
    </div>
  );
}

export function LiveMatchModal({
  playerAId,
  playerBId,
  playerAName,
  playerBName,
  format,
  allowDraws,
  onSave,
  onClose,
}: LiveMatchModalProps) {
  const winsNeeded = format === "bo1" ? 1 : 2;

  const [lifeA, setLifeA] = useState(STARTING_LIFE);
  const [lifeB, setLifeB] = useState(STARTING_LIFE);
  const [countersA, setCountersA] = useState<Counter[]>([]);
  const [countersB, setCountersB] = useState<Counter[]>([]);
  const [gamesWonA, setGamesWonA] = useState(0);
  const [gamesWonB, setGamesWonB] = useState(0);
  const [gameNumber, setGameNumber] = useState(1);
  const [showTimer, setShowTimer] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [finished, setFinished] = useState<{ winnerName: string | null; isDraw: boolean } | null>(null);

  const resetGameState = () => {
    setLifeA(STARTING_LIFE);
    setLifeB(STARTING_LIFE);
    setCountersA([]);
    setCountersB([]);
  };

  const recordGameWin = (winner: "A" | "B") => {
    const newGamesA = winner === "A" ? gamesWonA + 1 : gamesWonA;
    const newGamesB = winner === "B" ? gamesWonB + 1 : gamesWonB;
    setGamesWonA(newGamesA);
    setGamesWonB(newGamesB);

    if (newGamesA >= winsNeeded || newGamesB >= winsNeeded) {
      const aWinsMatch = newGamesA >= winsNeeded;
      playAlarmBeep();
      setFinished({ winnerName: aWinsMatch ? playerAName : playerBName, isDraw: false });
      onSave({
        winnerPlayerId: aWinsMatch ? playerAId : playerBId,
        isDraw: false,
        gamesPlayerA: newGamesA,
        gamesPlayerB: newGamesB,
      });
    } else {
      setBanner(`${winner === "A" ? playerAName : playerBName} ganó el juego ${gameNumber}`);
      setGameNumber((n) => n + 1);
      resetGameState();
      window.setTimeout(() => setBanner(null), 2500);
    }
  };

  // Detect life hitting zero (functional updates above keep this correct even
  // with fast repeated clicks) and turn it into a game win for the opponent.
  useEffect(() => {
    if (finished) return;
    if (lifeA <= 0) recordGameWin("B");
    else if (lifeB <= 0) recordGameWin("A");
  }, [lifeA, lifeB]);

  const adjustLife = (player: "A" | "B", delta: number) => {
    if (finished) return;
    if (player === "A") setLifeA((l) => l + delta);
    else setLifeB((l) => l + delta);
  };

  const addCounter = (player: "A" | "B", name: string) => {
    const counter: Counter = { id: genId(), name, value: 0 };
    if (player === "A") setCountersA((c) => [...c, counter]);
    else setCountersB((c) => [...c, counter]);
  };

  const adjustCounter = (player: "A" | "B", id: string, delta: number) => {
    const updater = (list: Counter[]) => list.map((c) => (c.id === id ? { ...c, value: c.value + delta } : c));
    if (player === "A") setCountersA(updater);
    else setCountersB(updater);
  };

  const removeCounter = (player: "A" | "B", id: string) => {
    if (player === "A") setCountersA((c) => c.filter((x) => x.id !== id));
    else setCountersB((c) => c.filter((x) => x.id !== id));
  };

  const declareDraw = () => {
    if (finished) return;
    playAlarmBeep();
    setFinished({ winnerName: null, isDraw: true });
    onSave({
      winnerPlayerId: null,
      isDraw: true,
      gamesPlayerA: gamesWonA,
      gamesPlayerB: gamesWonB,
    });
  };

  return (
    <>
      <Modal onClose={onClose} maxWidth="640px">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="m-0 font-heading text-xl font-bold text-parchment">⚔️ Comenzar partida</h2>
          <span className="rounded bg-gold/10 px-2 py-1 font-sans text-[11px] font-bold uppercase tracking-wide text-gold">
            {format === "bo1" ? "Partida única" : `Mejor de 3 · Juego ${gameNumber}`}
          </span>
        </div>

        {!finished && format !== "bo1" && (
          <div className="mb-4 flex items-center justify-center gap-3 font-sans text-xs text-parchment/50">
            <span>{playerAName}: {gamesWonA}</span>
            <span>·</span>
            <span>{playerBName}: {gamesWonB}</span>
          </div>
        )}

        {banner && (
          <div className="animate-fade-in mb-4 rounded-lg border border-gold/30 bg-gold/10 px-4 py-2 text-center font-sans text-sm font-semibold text-gold">
            {banner}
          </div>
        )}

        {finished ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="text-5xl">🏆</div>
            <p className="m-0 font-heading text-2xl font-bold text-gold">
              {finished.isDraw ? "Empate" : `¡Ganó ${finished.winnerName}!`}
            </p>
            <p className="m-0 font-sans text-sm text-parchment/50">Resultado guardado automáticamente.</p>
            <button
              onClick={onClose}
              className="mt-2 cursor-pointer rounded-lg border-none bg-gradient-to-br from-gold to-gold-dark px-6 py-2.5 font-heading text-sm font-bold text-ink hover:shadow-[0_4px_20px_rgba(200,155,60,0.4)]"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(["A", "B"] as const).map((p) => {
                const name = p === "A" ? playerAName : playerBName;
                const life = p === "A" ? lifeA : lifeB;
                const counters = p === "A" ? countersA : countersB;
                return (
                  <div key={p} className="rounded-xl border border-gold/12 bg-black/20 p-4">
                    <p className="m-0 mb-2 truncate text-center font-body text-base font-semibold text-parchment">
                      {name}
                    </p>
                    <p className={`m-0 mb-2 text-center font-heading text-5xl font-black ${life <= 0 ? "text-danger" : "text-gold"}`}>
                      {life}
                    </p>
                    <div className="mb-3 flex justify-center gap-1.5">
                      {[-5, -1, 1, 5].map((delta) => (
                        <button
                          key={delta}
                          onClick={() => adjustLife(p, delta)}
                          className="cursor-pointer rounded-md border border-white/12 bg-white/4 px-2.5 py-1.5 font-sans text-xs font-bold text-parchment/70 hover:bg-white/8"
                        >
                          {delta > 0 ? `+${delta}` : delta}
                        </button>
                      ))}
                    </div>

                    {counters.map((c) => (
                      <div key={c.id} className="mb-1.5 flex items-center justify-between gap-2 rounded bg-white/4 px-2 py-1">
                        <span className="truncate font-sans text-xs text-parchment/60">{c.name}</span>
                        <div className="flex shrink-0 items-center gap-1">
                          <button onClick={() => adjustCounter(p, c.id, -1)} className="cursor-pointer px-1 text-parchment/60 hover:text-parchment">
                            −
                          </button>
                          <span className="w-5 text-center font-sans text-xs font-bold text-parchment">{c.value}</span>
                          <button onClick={() => adjustCounter(p, c.id, 1)} className="cursor-pointer px-1 text-parchment/60 hover:text-parchment">
                            +
                          </button>
                          <button onClick={() => removeCounter(p, c.id)} className="cursor-pointer px-1 text-danger/60 hover:text-danger">
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    <CounterAdder onAdd={(name) => addCounter(p, name)} />

                    <button
                      onClick={() => recordGameWin(p)}
                      className="mt-3 w-full cursor-pointer rounded-lg border border-success/30 bg-success/10 py-2 font-sans text-xs font-bold uppercase tracking-wide text-success hover:bg-success/20"
                    >
                      Ganó {name}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                onClick={() => setShowTimer(true)}
                className="cursor-pointer rounded-lg border border-gold/25 bg-gold/8 px-4 py-2.5 font-sans text-sm font-semibold text-gold hover:bg-gold/15"
              >
                ⏱ Agregar cronómetro
              </button>
              {allowDraws && (
                <button
                  onClick={declareDraw}
                  className="cursor-pointer rounded-lg border border-white/12 bg-transparent px-4 py-2.5 font-sans text-sm font-semibold text-parchment/50 hover:bg-white/5"
                >
                  Declarar empate
                </button>
              )}
              <button
                onClick={resetGameState}
                className="cursor-pointer rounded-lg border border-white/12 bg-transparent px-4 py-2.5 font-sans text-sm font-semibold text-parchment/50 hover:bg-white/5"
              >
                Reiniciar juego
              </button>
              <button
                onClick={onClose}
                className="cursor-pointer rounded-lg border border-white/12 bg-transparent px-4 py-2.5 font-sans text-sm font-semibold text-parchment/50 hover:bg-white/5"
              >
                Cerrar
              </button>
            </div>
          </>
        )}
      </Modal>

      {showTimer && (
        <MatchTimerModal playerAName={playerAName} playerBName={playerBName} onClose={() => setShowTimer(false)} />
      )}
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import { Modal } from "./Modal";
import { RadialTimer } from "./RadialTimer";
import { playAlarmBeep } from "../../lib/timerSound";

interface MatchTimerModalProps {
  playerAName?: string;
  playerBName?: string;
  onClose: () => void;
}

type TimerMode = "total" | "chess" | "both";

const MODE_OPTIONS: { value: TimerMode; label: string }[] = [
  { value: "total", label: "Tiempo total máximo" },
  { value: "chess", label: "Tiempo máximo por jugador (estilo ajedrez)" },
  { value: "both", label: "Tiempo total + tiempo máximo por turno" },
];

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function MatchTimerModal({
  playerAName = "Jugador 1",
  playerBName = "Jugador 2",
  onClose,
}: MatchTimerModalProps) {
  const [phase, setPhase] = useState<"config" | "running">("config");
  const [mode, setMode] = useState<TimerMode>("total");
  const [matchMinutes, setMatchMinutes] = useState(20);
  const [playerMinutes, setPlayerMinutes] = useState(10);

  const [matchSeconds, setMatchSeconds] = useState(0);
  const [playerASeconds, setPlayerASeconds] = useState(0);
  const [playerBSeconds, setPlayerBSeconds] = useState(0);
  const [activePlayer, setActivePlayer] = useState<"A" | "B" | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [matchDone, setMatchDone] = useState(false);
  const [alarming, setAlarming] = useState(false);

  const hasTotal = mode !== "chess";
  const hasPlayers = mode !== "total";

  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAlarm = () => {
    setAlarming(false);
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  };

  const startAlarm = () => {
    setAlarming(true);
    playAlarmBeep();
    alarmIntervalRef.current = setInterval(playAlarmBeep, 1500);
  };

  useEffect(() => () => stopAlarm(), []);

  // Tick every second while running.
  useEffect(() => {
    if (phase !== "running" || isPaused || matchDone) return;
    const id = setInterval(() => {
      if (hasTotal) setMatchSeconds((s) => Math.max(0, s - 1));
      if (hasPlayers) {
        if (activePlayer === "A") setPlayerASeconds((s) => Math.max(0, s - 1));
        if (activePlayer === "B") setPlayerBSeconds((s) => Math.max(0, s - 1));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [phase, isPaused, matchDone, hasTotal, hasPlayers, activePlayer]);

  // Total match clock ran out.
  useEffect(() => {
    if (!hasTotal || phase !== "running" || matchDone) return;
    if (matchSeconds === 0) {
      setMatchDone(true);
      setIsPaused(true);
      startAlarm();
    }
  }, [matchSeconds, phase, matchDone, hasTotal]);

  // A player's clock ran out.
  useEffect(() => {
    if (!hasPlayers || phase !== "running" || matchDone) return;
    const outOfTime = (activePlayer === "A" && playerASeconds === 0) || (activePlayer === "B" && playerBSeconds === 0);
    if (outOfTime) {
      setIsPaused(true);
      startAlarm();
    }
  }, [playerASeconds, playerBSeconds, activePlayer, hasPlayers, phase, matchDone]);

  const handleStart = () => {
    stopAlarm();
    if (hasTotal) setMatchSeconds(matchMinutes * 60);
    if (hasPlayers) {
      setPlayerASeconds(playerMinutes * 60);
      setPlayerBSeconds(playerMinutes * 60);
      setActivePlayer("A");
    } else {
      setActivePlayer(null);
    }
    setMatchDone(false);
    setIsPaused(false);
    setPhase("running");
  };

  const handleReset = () => {
    stopAlarm();
    setIsPaused(false);
    setMatchDone(false);
    setActivePlayer(null);
    setPhase("config");
  };

  const switchTo = (player: "A" | "B") => {
    if (matchDone) return;
    stopAlarm();
    setActivePlayer(player);
    setIsPaused(false);
  };

  const matchProgress = matchMinutes > 0 ? matchSeconds / (matchMinutes * 60) : 0;
  const playerProgress = (seconds: number) => (playerMinutes > 0 ? seconds / (playerMinutes * 60) : 0);
  const playerFieldLabel = mode === "both" ? "Tiempo máximo por turno (minutos)" : "Tiempo por jugador (minutos)";

  return (
    <Modal onClose={onClose} maxWidth={hasPlayers && phase === "running" ? "520px" : "400px"}>
      <h2 className="m-0 mb-5 font-heading text-xl font-bold text-parchment">⏱ Temporizador de partida</h2>

      {phase === "config" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="font-sans text-[11px] font-semibold tracking-wide text-parchment/40 uppercase">
              Tipo de reloj
            </span>
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMode(opt.value)}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left font-sans text-sm font-semibold transition-colors ${
                  mode === opt.value
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-white/12 bg-transparent text-parchment/55 hover:bg-white/4"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    mode === opt.value ? "border-gold" : "border-white/25"
                  }`}
                >
                  {mode === opt.value && <span className="h-2 w-2 rounded-full bg-gold" />}
                </span>
                {opt.label}
              </button>
            ))}
          </div>

          {hasTotal && (
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-[11px] font-semibold tracking-wide text-parchment/40 uppercase">
                Tiempo de partida (minutos)
              </span>
              <input
                type="number"
                min={1}
                max={240}
                value={matchMinutes}
                onChange={(e) => setMatchMinutes(Math.min(240, Math.max(1, Number(e.target.value) || 1)))}
                className="rounded-lg border border-white/12 bg-transparent px-3 py-2.5 font-body text-parchment focus:border-gold"
              />
            </label>
          )}

          {hasPlayers && (
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-[11px] font-semibold tracking-wide text-parchment/40 uppercase">
                {playerFieldLabel}
              </span>
              <input
                type="number"
                min={1}
                max={240}
                value={playerMinutes}
                onChange={(e) => setPlayerMinutes(Math.min(240, Math.max(1, Number(e.target.value) || 1)))}
                className="rounded-lg border border-white/12 bg-transparent px-3 py-2.5 font-body text-parchment focus:border-gold"
              />
            </label>
          )}

          <div className="mt-2 flex gap-2.5">
            <button
              onClick={handleStart}
              className="flex-1 cursor-pointer rounded-lg border-none bg-gradient-to-br from-gold to-gold-dark py-3 font-heading text-sm font-bold text-ink hover:shadow-[0_4px_20px_rgba(200,155,60,0.4)]"
            >
              Iniciar reloj
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-white/12 bg-transparent px-4.5 py-3 font-sans text-sm font-semibold text-parchment/45 hover:bg-white/4"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {phase === "running" && (
        <div className="flex flex-col items-center gap-5">
          {hasTotal && (
            <RadialTimer size={160} progress={matchProgress} secondsRemaining={matchSeconds} label={formatClock(matchSeconds)} danger={matchDone} />
          )}

          {alarming && (
            <div className="animate-fade-in flex flex-wrap items-center justify-center gap-2 rounded-lg border border-danger/40 bg-danger/15 px-4 py-2 text-center font-sans text-sm font-bold text-danger">
              ¡Tiempo cumplido!
              <button onClick={stopAlarm} className="cursor-pointer underline">
                Detener sonido
              </button>
            </div>
          )}

          {hasPlayers && (
            <div className="grid w-full grid-cols-2 gap-3">
              {(["A", "B"] as const).map((p) => {
                const seconds = p === "A" ? playerASeconds : playerBSeconds;
                const name = p === "A" ? playerAName : playerBName;
                const isActive = activePlayer === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => switchTo(p)}
                    disabled={matchDone}
                    className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-4 transition-all disabled:cursor-not-allowed ${
                      isActive
                        ? "border-gold/50 bg-gold/10 shadow-[0_0_20px_rgba(200,155,60,0.25)]"
                        : "border-white/10 bg-white/2 opacity-55 hover:opacity-80"
                    }`}
                  >
                    <span className="max-w-full truncate font-body text-sm font-semibold text-parchment">{name}</span>
                    <RadialTimer size={90} progress={playerProgress(seconds)} secondsRemaining={seconds} label={formatClock(seconds)} danger={seconds === 0} />
                    <span className="h-3 font-sans text-[10px] font-bold uppercase tracking-wide text-gold/80">
                      {isActive ? "● Activo" : "Tocar para activar"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex w-full gap-2.5">
            <button
              onClick={() => setIsPaused((v) => !v)}
              disabled={matchDone}
              className="flex-1 cursor-pointer rounded-lg border border-gold/30 bg-transparent py-2.5 font-sans text-sm font-semibold text-gold hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {isPaused ? "Reanudar" : "Pausar"}
            </button>
            <button
              onClick={handleReset}
              className="cursor-pointer rounded-lg border border-white/12 bg-transparent px-4 py-2.5 font-sans text-sm font-semibold text-parchment/50 hover:bg-white/5"
            >
              Reiniciar
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-white/12 bg-transparent px-4 py-2.5 font-sans text-sm font-semibold text-parchment/50 hover:bg-white/5"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

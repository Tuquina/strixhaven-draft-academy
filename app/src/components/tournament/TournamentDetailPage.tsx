import { useState } from "react";
import type { Tournament, MatchResult } from "../../types";
import type { PlayerFormInput } from "../../hooks/useTournaments";
import { calculateStandings } from "../../lib/standings";
import { FAN_CONTENT_NOTICE } from "../../lib/legal";
import { useIsMobile } from "../../hooks/useIsMobile";
import { TournamentHeader } from "./TournamentHeader";
import { PodiumSummary } from "./PodiumSummary";
import { PlayerRoster } from "./PlayerRoster";
import { RoundRobinSchedule } from "./RoundRobinSchedule";
import { StandingsTable } from "./StandingsTable";
import { ResultModal } from "./ResultModal";
import { FinalizeTournamentModal } from "./FinalizeTournamentModal";
import { Confetti } from "../shared/Confetti";
import { MatchTimerModal } from "../shared/MatchTimerModal";

type MobileTab = "players" | "rounds" | "standings";

interface TournamentDetailPageProps {
  tournament: Tournament;
  onBack: () => void;
  onAddOrUpdatePlayer: (form: PlayerFormInput) => void;
  onRemovePlayer: (playerId: string) => void;
  onGenerateSchedule: () => void;
  onSaveResult: (matchId: string, result: MatchResult) => void;
  onFinalize: () => void;
  onReopen: () => void;
  onExport: () => void;
  notify: (text: string) => void;
}

const TAB_LABELS: Record<MobileTab, string> = {
  players: "Jugadores",
  rounds: "Rondas",
  standings: "Tabla",
};

export function TournamentDetailPage({
  tournament,
  onBack,
  onAddOrUpdatePlayer,
  onRemovePlayer,
  onGenerateSchedule,
  onSaveResult,
  onFinalize,
  onReopen,
  onExport,
  notify,
}: TournamentDetailPageProps) {
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<MobileTab>("players");
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [resultModalMatchId, setResultModalMatchId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);

  const hasResults = tournament.rounds.some((r) =>
    r.matches.some((m) => m.status === "completed")
  );
  const standings = calculateStandings(tournament);
  const podium =
    tournament.status === "finished" && standings.length > 0 && standings[0].pts > 0
      ? standings.slice(0, 3)
      : [];

  const activeMatch = resultModalMatchId
    ? tournament.rounds.flatMap((r) => r.matches).find((m) => m.id === resultModalMatchId) ?? null
    : null;
  const playerA = activeMatch ? tournament.players.find((p) => p.id === activeMatch.playerAId) : null;
  const playerB = activeMatch?.playerBId
    ? tournament.players.find((p) => p.id === activeMatch.playerBId)
    : null;

  const handleFinalize = () => {
    onFinalize();
    setShowFinalizeModal(false);
    setShowConfetti(true);
    notify("¡Torneo finalizado!");
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const showPlayers = !isMobile || mobileTab === "players";
  const showRounds = !isMobile || mobileTab === "rounds";
  const showStandings = !isMobile || mobileTab === "standings";

  return (
    <div className="flex min-h-screen flex-col">
      <TournamentHeader
        tournament={tournament}
        onBack={onBack}
        onFinalize={() => setShowFinalizeModal(true)}
        onReopen={() => {
          onReopen();
          notify("Torneo reabierto");
        }}
        onExport={() => {
          onExport();
          notify("Torneo exportado");
        }}
        onOpenTimer={() => setShowTimerModal(true)}
      />

      {podium.length > 0 && <PodiumSummary podium={podium} />}

      {isMobile && (
        <div className="flex border-b border-gold/12 bg-background-panel">
          {(Object.keys(TAB_LABELS) as MobileTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 cursor-pointer border-none border-b-2 bg-transparent py-3 font-sans text-[13px] font-semibold ${
                mobileTab === tab ? "border-gold text-gold" : "border-transparent text-parchment/40"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      )}

      <div
        className={
          isMobile
            ? "flex flex-col gap-5 p-4"
            : "mx-auto grid w-full max-w-[1440px] grid-cols-[340px_1fr_360px] gap-6 px-8 py-6"
        }
      >
        {showPlayers && (
          <PlayerRoster
            tournament={tournament}
            onAddOrUpdatePlayer={onAddOrUpdatePlayer}
            onRemovePlayer={onRemovePlayer}
            onGenerateSchedule={() => {
              onGenerateSchedule();
              setMobileTab("rounds");
              notify("Fixture generado — ¡a jugar!");
            }}
            notify={notify}
          />
        )}

        {showRounds && (
          <RoundRobinSchedule
            tournament={tournament}
            hasResults={hasResults}
            onRegenerate={() => {
              onGenerateSchedule();
              notify("Fixture generado — ¡a jugar!");
            }}
            onOpenResult={(matchId) => setResultModalMatchId(matchId)}
            onSaveResult={(matchId, result) => {
              onSaveResult(matchId, result);
              notify("Resultado guardado");
            }}
          />
        )}

        {showStandings && (
          <StandingsTable tournament={tournament} hasResults={hasResults} notify={notify} />
        )}
      </div>

      <footer className="mt-auto border-t border-gold/6 px-5 py-7 text-center">
        <p className="m-0 font-sans text-xs text-parchment/20">
          Hosted by Fernando Tuquina · {FAN_CONTENT_NOTICE}
        </p>
      </footer>

      {activeMatch && playerA && playerB && (
        <ResultModal
          playerAId={playerA.id}
          playerBId={playerB.id}
          playerAName={playerA.name}
          playerBName={playerB.name}
          format={tournament.format}
          allowDraws={tournament.allowDraws}
          initialResult={activeMatch.result}
          onClose={() => setResultModalMatchId(null)}
          onSave={(result) => {
            onSaveResult(activeMatch.id, result);
            setResultModalMatchId(null);
            notify("Resultado guardado");
          }}
        />
      )}

      {showFinalizeModal && (
        <FinalizeTournamentModal
          onConfirm={handleFinalize}
          onCancel={() => setShowFinalizeModal(false)}
        />
      )}

      <Confetti active={showConfetti} />

      {showTimerModal && <MatchTimerModal onClose={() => setShowTimerModal(false)} />}
    </div>
  );
}

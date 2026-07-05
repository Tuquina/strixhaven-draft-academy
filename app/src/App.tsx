import { useState } from "react";
import { useTournaments } from "./hooks/useTournaments";
import { useNotification } from "./hooks/useNotification";
import { TournamentDashboard } from "./components/dashboard/TournamentDashboard";
import { TournamentDetailPage } from "./components/tournament/TournamentDetailPage";
import { RulesPage } from "./components/rules/RulesPage";
import { Notification } from "./components/shared/Notification";

function App() {
  const {
    tournaments,
    syncStatus,
    createTournament,
    deleteTournament,
    addOrUpdatePlayer,
    removePlayer,
    generateSchedule,
    saveResult,
    finalizeTournament,
    reopenTournament,
    exportTournament,
    importTournament,
  } = useTournaments();
  const { message, notify } = useNotification();
  const [currentTournamentId, setCurrentTournamentId] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);

  const currentTournament = currentTournamentId
    ? tournaments.find((t) => t.id === currentTournamentId) ?? null
    : null;

  return (
    <div className="relative min-h-screen font-body text-parchment">
      <div className="app-backdrop" aria-hidden="true" />
      <Notification message={message} />

      {showRules && <RulesPage onBack={() => setShowRules(false)} />}

      {!showRules && !currentTournament && (
        <TournamentDashboard
          tournaments={tournaments}
          syncStatus={syncStatus}
          onOpenTournament={setCurrentTournamentId}
          onCreateTournament={createTournament}
          onDeleteTournament={(id) => {
            deleteTournament(id);
            if (currentTournamentId === id) setCurrentTournamentId(null);
          }}
          onImportTournament={importTournament}
          onShowRules={() => setShowRules(true)}
          notify={notify}
        />
      )}

      {!showRules && currentTournament && (
        <TournamentDetailPage
          tournament={currentTournament}
          onBack={() => setCurrentTournamentId(null)}
          onAddOrUpdatePlayer={(form) => addOrUpdatePlayer(currentTournament.id, form)}
          onRemovePlayer={(playerId) => removePlayer(currentTournament.id, playerId)}
          onGenerateSchedule={() => generateSchedule(currentTournament.id)}
          onSaveResult={(matchId, result) => saveResult(currentTournament.id, matchId, result)}
          onFinalize={() => finalizeTournament(currentTournament.id)}
          onReopen={() => reopenTournament(currentTournament.id)}
          onExport={() => exportTournament(currentTournament)}
          notify={notify}
        />
      )}
    </div>
  );
}

export default App;

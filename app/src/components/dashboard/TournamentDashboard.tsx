import { useRef, useState } from "react";
import type { Tournament } from "../../types";
import type { CreateTournamentInput } from "../../hooks/useTournaments";
import { calculateStandings } from "../../lib/standings";
import { TournamentCard } from "./TournamentCard";
import { CreateTournamentModal } from "./CreateTournamentModal";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { EmptyState } from "../shared/EmptyState";
import { Button } from "../shared/Button";

interface TournamentDashboardProps {
  tournaments: Tournament[];
  onOpenTournament: (id: string) => void;
  onCreateTournament: (input: CreateTournamentInput) => string;
  onDeleteTournament: (id: string) => void;
  onImportTournament: (file: File) => Promise<boolean>;
  notify: (text: string) => void;
}

function leaderNameOf(t: Tournament): string | null {
  const standings = calculateStandings(t);
  return standings.length > 0 && standings[0].pts > 0 ? standings[0].name : null;
}

const SECTIONS: {
  status: Tournament["status"];
  title: string;
  dotClass: string;
  titleClass: string;
}[] = [
  { status: "active", title: "Torneos activos", dotClass: "bg-success", titleClass: "text-success" },
  { status: "drafting", title: "Torneos en preparación", dotClass: "bg-arcane-violet", titleClass: "text-arcane-violet" },
  { status: "finished", title: "Torneos finalizados", dotClass: "bg-gold", titleClass: "text-gold" },
];

export function TournamentDashboard({
  tournaments,
  onOpenTournament,
  onCreateTournament,
  onDeleteTournament,
  onImportTournament,
  notify,
}: TournamentDashboardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const ok = await onImportTournament(file);
    notify(ok ? "Torneo importado exitosamente" : "Error al importar el torneo");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-gradient-to-b from-background-panel/80 to-transparent px-5 pt-15 pb-10 text-center">
        <div className="mb-4 font-sans text-xs tracking-[6px] text-gold/60 uppercase">
          ✦ Organizador casual de torneos Draft ✦
        </div>
        <h1 className="m-0 font-heading text-[clamp(32px,6vw,52px)] leading-[1.1] font-extrabold tracking-wide text-parchment [text-shadow:0_2px_20px_rgba(200,155,60,0.3)]">
          Strixhaven Draft Academy
        </h1>
        <div className="mx-auto my-5 h-0.5 w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
        <p className="m-0 font-body text-base text-parchment/60">
          Hosted by Fernando Tuquina
        </p>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-15">
        <div className="mb-8 flex flex-wrap gap-3">
          <Button variant="primary" className="px-7 py-3.5 font-heading text-[15px] tracking-wide" onClick={() => setShowCreateModal(true)}>
            ✦ Crear nuevo torneo
          </Button>
          <Button variant="secondary" className="px-5 py-3.5 text-sm" onClick={handleImportClick}>
            Importar JSON
          </Button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
        </div>

        {tournaments.length === 0 && (
          <EmptyState
            icon="📜"
            title="Todavía no hay torneos"
            subtitle="Creá tu primer draft de Strixhaven."
          />
        )}

        {SECTIONS.map((section) => {
          const list = tournaments.filter((t) => t.status === section.status);
          if (list.length === 0) return null;
          return (
            <div key={section.status} className="mb-8">
              <h2 className={`m-0 mb-4 flex items-center gap-2 font-sans text-[13px] font-bold tracking-[3px] uppercase ${section.titleClass}`}>
                <span className={`inline-block h-2 w-2 rounded-full ${section.dotClass}`} />
                {section.title}
              </h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
                {list.map((t) => (
                  <TournamentCard
                    key={t.id}
                    tournament={t}
                    playerCount={t.players.length}
                    roundCount={t.rounds.length}
                    leaderName={leaderNameOf(t)}
                    createdDate={new Date(t.createdAt).toLocaleDateString("es-AR")}
                    onOpen={() => onOpenTournament(t.id)}
                    onDelete={() => setDeleteConfirmId(t.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        <div className="mt-10 rounded-xl border border-arcane-violet/12 bg-arcane-violet/4 p-6">
          <h3 className="m-0 mb-3 font-sans text-[13px] font-bold tracking-[2px] text-arcane-violet uppercase">
            Tips para el draft
          </h3>
          <div className="flex flex-col gap-1.5 font-sans text-sm leading-relaxed text-parchment/45">
            <span>✦ Mazo recomendado: 40 cartas.</span>
            <span>✦ Base típica: 17 tierras y 23 hechizos.</span>
            <span>✦ Las tierras no básicas solo cuentan si las drafteaste.</span>
            <span>✦ En draft casual, 5 jugadores funciona bien con round robin.</span>
            <span>✦ 8 jugadores es el pod clásico ideal.</span>
          </div>
        </div>
      </main>

      <footer className="border-t border-gold/8 px-5 py-8 text-center">
        <p className="m-0 font-sans text-xs text-parchment/25">
          Fan-made casual tournament tracker. Not affiliated with Wizards of the Coast.
        </p>
      </footer>

      {showCreateModal && (
        <CreateTournamentModal
          defaultName={`Draft de Strixhaven #${tournaments.length + 1}`}
          defaultFormat="bo3"
          defaultAllowDraws={false}
          onClose={() => setShowCreateModal(false)}
          onCreate={(input) => {
            const id = onCreateTournament(input);
            setShowCreateModal(false);
            notify("Torneo creado exitosamente");
            onOpenTournament(id);
          }}
        />
      )}

      {deleteConfirmId && (
        <ConfirmDialog
          title="Eliminar torneo"
          message="Esta acción no se puede deshacer. ¿Estás seguro?"
          confirmLabel="Eliminar"
          danger
          onCancel={() => setDeleteConfirmId(null)}
          onConfirm={() => {
            onDeleteTournament(deleteConfirmId);
            setDeleteConfirmId(null);
            notify("Torneo eliminado");
          }}
        />
      )}
    </div>
  );
}

import { useRef, useState } from "react";
import type { Tournament } from "../../types";
import type { CreateTournamentInput, SyncStatus } from "../../hooks/useTournaments";
import { calculateStandings } from "../../lib/standings";
import { FAN_CONTENT_NOTICE } from "../../lib/legal";
import { TournamentCard } from "./TournamentCard";
import { CreateTournamentModal } from "./CreateTournamentModal";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { EmptyState } from "../shared/EmptyState";

interface TournamentDashboardProps {
  tournaments: Tournament[];
  syncStatus: SyncStatus;
  onOpenTournament: (id: string) => void;
  onCreateTournament: (input: CreateTournamentInput) => string;
  onDeleteTournament: (id: string) => void;
  onImportTournament: (file: File) => Promise<boolean>;
  onShowRules: () => void;
  notify: (text: string) => void;
}

const SYNC_STATUS_INFO: Record<SyncStatus, { label: string; dotClass: string }> = {
  disabled: { label: "Guardado en este dispositivo", dotClass: "bg-parchment/30" },
  syncing: { label: "Sincronizando con la nube…", dotClass: "bg-gold animate-pulse" },
  synced: { label: "Sincronizado con la nube", dotClass: "bg-success" },
  offline: { label: "Sin conexión — guardado localmente", dotClass: "bg-parchment/30" },
};

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
  syncStatus,
  onOpenTournament,
  onCreateTournament,
  onDeleteTournament,
  onImportTournament,
  onShowRules,
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
      <button
        onClick={onShowRules}
        className="fixed top-5 left-5 z-40 cursor-pointer rounded-md border border-[#f0e6d0]/12 bg-[#f0e6d0]/8 px-5 py-3 font-heading text-[13px] font-semibold tracking-wide text-[#f0e6d0]/60 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#f0e6d0]/30 hover:bg-[#f0e6d0]/12 hover:text-[#f0e6d0]"
      >
        📋 Reglas del Draft
      </button>

      <header className="relative px-5 pt-15 pb-10 text-center">
        <div className="mb-4 font-sans text-[13px] font-semibold tracking-[4px] text-gold uppercase [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">
          ✦ Organizador Casual de Torneos Draft ✦
        </div>
        <h1 className="m-0 bg-[linear-gradient(180deg,#e8d44d_0%,#8cc63f_35%,#3ea33e_70%,#2d7a2e_100%)] bg-clip-text font-heading-decorative text-[clamp(32px,6vw,56px)] leading-[1.15] font-black tracking-wide text-transparent animate-[heroTitleGlow_4s_ease-in-out_infinite]">
          Strixhaven Draft Academy
        </h1>
        <div className="mx-auto my-5 h-0.5 w-15 bg-gradient-to-r from-transparent via-[#5cb338] to-transparent" />
        <p className="m-0 font-garamond text-xl font-semibold text-parchment/85 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
          Hosted by Fernando Tuquina
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className={`h-2 w-2 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)] ${SYNC_STATUS_INFO[syncStatus].dotClass}`} />
          <span className="font-garamond text-[15px] text-parchment/55 [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
            {SYNC_STATUS_INFO[syncStatus].label}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-15">
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="cursor-pointer rounded-md border-2 border-gold/60 bg-[linear-gradient(135deg,#d4af37,#b8960c)] px-8 py-3.5 font-heading text-sm font-bold tracking-[1.5px] text-[#1a1535] uppercase shadow-[0_4px_20px_rgba(212,175,55,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_30px_rgba(212,175,55,0.45)]"
          >
            ✦ Crear Nuevo Torneo
          </button>
          <button
            onClick={handleImportClick}
            className="cursor-pointer rounded-md border border-gold/25 bg-[#f0e6d0]/8 px-7 py-3.5 font-heading text-[13px] font-semibold tracking-wide text-[#f0e6d0] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:bg-[#f0e6d0]/15"
          >
            Importar JSON
          </button>
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

        <div className="mt-10 rounded-xl border border-arcane-violet/12 bg-arcane-violet/8 p-6 backdrop-blur-sm">
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
        <p className="m-0 font-sans text-xs text-parchment/25">{FAN_CONTENT_NOTICE}</p>
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

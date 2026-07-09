import { useRef, useState } from "react";
import type { Tournament } from "../../types";
import type { CreateTournamentInput, SyncStatus } from "../../hooks/useTournaments";
import { calculateStandings } from "../../lib/standings";
import { FAN_CONTENT_NOTICE } from "../../lib/legal";
import {
  BTN_CTA,
  BTN_GLASS,
  BTN_GLASS_MUTED,
  GRADIENT_TEXT_GOLD,
  GRADIENT_TEXT_HERO,
  GRADIENT_TEXT_PARCHMENT,
  GRADIENT_TEXT_SUCCESS,
  PANEL_VERDANT,
  SECTION_HEADING,
} from "../../lib/designSystem";
import { TournamentCard } from "./TournamentCard";
import { CreateTournamentModal } from "./CreateTournamentModal";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { EmptyState } from "../shared/EmptyState";
import { MatchTimerModal } from "../shared/MatchTimerModal";

interface TournamentDashboardProps {
  tournaments: Tournament[];
  syncStatus: SyncStatus;
  onOpenTournament: (id: string) => void;
  onCreateTournament: (input: CreateTournamentInput) => string;
  onDeleteTournament: (id: string) => void;
  onImportTournament: (file: File) => Promise<boolean>;
  onShowRules: () => void;
  onShowRulebook: () => void;
  onShowCardSearch: () => void;
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
  titleGradient: string;
}[] = [
  { status: "active", title: "Torneos activos", dotClass: "bg-success", titleGradient: GRADIENT_TEXT_SUCCESS },
  { status: "drafting", title: "Torneos en preparación", dotClass: "bg-parchment", titleGradient: GRADIENT_TEXT_PARCHMENT },
  { status: "finished", title: "Torneos finalizados", dotClass: "bg-gold", titleGradient: GRADIENT_TEXT_GOLD },
];

export function TournamentDashboard({
  tournaments,
  syncStatus,
  onOpenTournament,
  onCreateTournament,
  onDeleteTournament,
  onImportTournament,
  onShowRules,
  onShowRulebook,
  onShowCardSearch,
  notify,
}: TournamentDashboardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showTimerModal, setShowTimerModal] = useState(false);
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
      <div className="fixed top-3 left-3 z-40 flex flex-wrap gap-2 sm:top-5 sm:left-5 sm:gap-3">
        <button
          onClick={onShowRules}
          className={`${BTN_GLASS_MUTED} px-3 py-2 text-xs sm:px-5 sm:py-3 sm:text-[13px]`}
        >
          <span className="sm:hidden">📋</span>
          <span className="hidden sm:inline">📋 Reglas del Draft</span>
        </button>
        <button
          onClick={onShowCardSearch}
          className={`${BTN_GLASS_MUTED} px-3 py-2 text-xs sm:px-5 sm:py-3 sm:text-[13px]`}
        >
          <span className="sm:hidden">🔍</span>
          <span className="hidden sm:inline">🔍 Consultar Cartas</span>
        </button>
      </div>

      <button
        onClick={onShowRulebook}
        className={`${BTN_GLASS_MUTED} fixed top-3 right-3 z-40 px-3 py-2 text-xs sm:top-5 sm:right-5 sm:px-5 sm:py-3 sm:text-[13px]`}
      >
        <span className="sm:hidden">📘</span>
        <span className="hidden sm:inline">📘 Manual de Magic</span>
      </button>

      <header className="relative px-4 pt-16 pb-8 text-center sm:px-5 sm:pt-15 sm:pb-10">
        <div className="mb-4 font-sans text-[11px] font-semibold tracking-[2px] text-gold uppercase [text-shadow:0_1px_8px_rgba(0,0,0,0.8)] sm:text-[13px] sm:tracking-[4px]">
          ✦ Organizador Casual de Torneos Draft ✦
        </div>
        <h1 className={`${GRADIENT_TEXT_HERO} m-0 font-heading-decorative text-[clamp(28px,7vw,56px)] leading-[1.15] font-black tracking-wide animate-[heroTitleGlow_4s_ease-in-out_infinite]`}>
          Strixhaven Draft Academy
        </h1>
        <div className="mx-auto my-5 h-0.5 w-15 bg-gradient-to-r from-transparent via-verdant-light to-transparent" />
        <p className="m-0 font-garamond text-lg font-semibold text-parchment/85 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)] sm:text-xl">
          Hosted by Fernando Tuquina
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className={`h-2 w-2 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)] ${SYNC_STATUS_INFO[syncStatus].dotClass}`} />
          <span className="font-garamond text-[15px] text-parchment/55 [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
            {SYNC_STATUS_INFO[syncStatus].label}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-15 sm:px-6">
        <div className="mb-8 flex flex-wrap justify-center gap-2 sm:gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className={`${BTN_CTA} px-5 py-3 text-sm sm:px-8 sm:py-3.5`}
          >
            ✦ Crear Nuevo Torneo
          </button>
          <button
            onClick={handleImportClick}
            className={`${BTN_GLASS} px-4 py-3 text-[13px] sm:px-7 sm:py-3.5`}
          >
            Importar JSON
          </button>
          <button
            onClick={() => setShowTimerModal(true)}
            className={`${BTN_GLASS} px-4 py-3 text-[13px] sm:px-7 sm:py-3.5`}
          >
            ⏱ Temporizador
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
              <h2 className={`${section.titleGradient} ${SECTION_HEADING} m-0 mb-4 flex items-center gap-2 text-base`}>
                <span className={`inline-block h-2 w-2 rounded-full ${section.dotClass}`} />
                {section.title}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
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

        <div className={`${PANEL_VERDANT} mt-10 p-6`}>
          <h3 className={`${GRADIENT_TEXT_SUCCESS} ${SECTION_HEADING} m-0 mb-3 text-sm`}>
            Tips para el draft
          </h3>
          <div className="flex flex-col gap-1.5 font-sans text-sm leading-relaxed text-parchment/60">
            {[
              "Mazo recomendado: 40 cartas.",
              "Base típica: 17 tierras y 23 hechizos.",
              "Las tierras no básicas solo cuentan si las drafteaste.",
              "En draft casual, 5 jugadores funciona bien con round robin.",
              "8 jugadores es el pod clásico ideal.",
            ].map((tip) => (
              <span key={tip}>
                <span className="text-verdant-light/80">✦</span> {tip}
              </span>
            ))}
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

      {showTimerModal && <MatchTimerModal onClose={() => setShowTimerModal(false)} />}
    </div>
  );
}

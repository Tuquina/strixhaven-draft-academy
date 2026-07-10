import { useMemo, useState } from "react";
import type { Tournament, GameFormat } from "../../types";
import { calculateLeaderboard, sortLeaderboard, type LeaderboardSort } from "../../lib/leaderboard";
import { ALL_GAME_FORMATS, GAME_FORMAT_LABELS } from "../../lib/gameFormats";
import { filterChipClass, GRADIENT_TEXT_GOLD, PANEL_GOLD, SECTION_HEADING } from "../../lib/designSystem";
import { EmptyState } from "../shared/EmptyState";

const SORT_OPTIONS: { key: LeaderboardSort; label: string; icon: string }[] = [
  { key: "tournamentsWon", label: "Torneos ganados", icon: "🏆" },
  { key: "matchesWon", label: "Partidos ganados", icon: "⚔️" },
  { key: "points", label: "Puntos", icon: "⭐" },
];

// Same gold/silver/bronze rank motif used in StandingsTable/PodiumSummary.
const RANK_BADGE = [
  "border-gold/50 bg-gold/15 text-gold",
  "border-silver/50 bg-silver/15 text-silver",
  "border-bronze/50 bg-bronze/15 text-bronze",
];
const RANK_ROW_ACCENT = ["var(--color-gold)", "var(--color-silver)", "var(--color-bronze)"];

const COLLAPSED_ROWS = 10;

interface GlobalLeaderboardProps {
  tournaments: Tournament[];
}

export function GlobalLeaderboard({ tournaments }: GlobalLeaderboardProps) {
  const [sort, setSort] = useState<LeaderboardSort>("tournamentsWon");
  const [formatFilter, setFormatFilter] = useState<GameFormat | "all">("all");
  const [showAll, setShowAll] = useState(false);

  const entries = useMemo(() => {
    const leaderboard = calculateLeaderboard(tournaments, formatFilter);
    return sortLeaderboard(leaderboard, sort);
  }, [tournaments, formatFilter, sort]);

  const visibleEntries = showAll ? entries : entries.slice(0, COLLAPSED_ROWS);

  if (tournaments.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className={`${GRADIENT_TEXT_GOLD} ${SECTION_HEADING} m-0 mb-4 flex items-center gap-2 text-base`}>
        <span className="text-lg">🏆</span> Salón de la Fama
      </h2>

      <div className={`${PANEL_GOLD} p-4 sm:p-6`}>
        <p className="m-0 mb-4 font-sans text-[11px] font-semibold tracking-wide text-parchment/40 uppercase">
          Ordenar por
        </p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button key={opt.key} className={filterChipClass(sort === opt.key)} onClick={() => setSort(opt.key)}>
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        <p className="m-0 mb-1.5 font-sans text-[11px] font-semibold tracking-wide text-parchment/40 uppercase">
          Tipo de torneo
        </p>
        <div className="mb-5 flex flex-wrap gap-1.5">
          <button className={filterChipClass(formatFilter === "all")} onClick={() => setFormatFilter("all")}>
            Todos
          </button>
          {ALL_GAME_FORMATS.map((f) => (
            <button key={f} className={filterChipClass(formatFilter === f)} onClick={() => setFormatFilter(f)}>
              {GAME_FORMAT_LABELS[f]}
            </button>
          ))}
        </div>

        {entries.length === 0 ? (
          <EmptyState compact title="Todavía no hay estadísticas para este filtro" />
        ) : (
          <div className="flex flex-col gap-2">
            {visibleEntries.map((entry, i) => {
              const isRanked = i < 3;
              return (
                <div
                  key={entry.name}
                  className="flex items-center gap-3 rounded-lg border border-white/8 bg-black/15 px-3 py-2.5 sm:px-4"
                  style={isRanked ? { boxShadow: `inset 3px 0 0 0 ${RANK_ROW_ACCENT[i]}` } : undefined}
                >
                  <span
                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                      isRanked ? RANK_BADGE[i] : "border-white/10 bg-white/5 text-parchment/45"
                    }`}
                  >
                    {i + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-body text-sm font-semibold text-parchment">{entry.name}</div>
                    <div className="font-sans text-[11px] text-parchment/40">
                      {entry.tournamentsPlayed} torneo{entry.tournamentsPlayed === 1 ? "" : "s"} · {entry.matchesPlayed} partido
                      {entry.matchesPlayed === 1 ? "" : "s"}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-3 text-center sm:gap-5">
                    <Stat icon="🏆" value={entry.tournamentsWon} highlighted={sort === "tournamentsWon"} />
                    <Stat icon="⚔️" value={entry.matchesWon} highlighted={sort === "matchesWon"} />
                    <Stat icon="⭐" value={entry.points} highlighted={sort === "points"} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {entries.length > COLLAPSED_ROWS && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="mt-3 w-full cursor-pointer border-none bg-transparent p-0 text-center font-sans text-xs font-semibold text-gold/70 underline decoration-dotted underline-offset-2 hover:text-gold"
          >
            {showAll ? "Mostrar menos" : `Mostrar todos (${entries.length})`}
          </button>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, value, highlighted }: { icon: string; value: number; highlighted: boolean }) {
  return (
    <div className={`flex flex-col items-center ${highlighted ? "" : "opacity-45"}`}>
      <span className="text-xs">{icon}</span>
      <span className={`font-sans text-sm font-bold ${highlighted ? "text-gold" : "text-parchment/70"}`}>{value}</span>
    </div>
  );
}

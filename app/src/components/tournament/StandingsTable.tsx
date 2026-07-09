import { useState } from "react";
import type { Tournament } from "../../types";
import { calculateStandings, formatStandingsClipboardText } from "../../lib/standings";
import { downloadImageBlob, generateTournamentRecapImage, shareOrDownloadImage } from "../../lib/tournamentImage";
import { Button } from "../shared/Button";
import { PANEL } from "../../lib/designSystem";

// Top-3 rank chip colors, sampled from the same gold/silver/bronze tokens
// used for podium medals elsewhere (PodiumSummary).
const RANK_BADGE = [
  "border-gold/50 bg-gold/15 text-gold",
  "border-silver/50 bg-silver/15 text-silver",
  "border-bronze/50 bg-bronze/15 text-bronze",
];
const RANK_ROW_ACCENT = ["var(--color-gold)", "var(--color-silver)", "var(--color-bronze)"];

interface StandingsTableProps {
  tournament: Tournament;
  hasResults: boolean;
  notify: (text: string) => void;
}

export function StandingsTable({ tournament, hasResults, notify }: StandingsTableProps) {
  const standings = calculateStandings(tournament);
  const leader = standings.length > 0 && standings[0].pts > 0 ? standings[0] : null;
  const [generatingImage, setGeneratingImage] = useState<"share" | "download" | null>(null);

  const copyStandings = async () => {
    const text = formatStandingsClipboardText(tournament.name, standings);
    await navigator.clipboard.writeText(text);
    notify("Tabla copiada al portapapeles");
  };

  const recapFilename = () => `${tournament.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-recap.png`;

  const shareImage = async () => {
    setGeneratingImage("share");
    try {
      const blob = await generateTournamentRecapImage(tournament);
      const result = await shareOrDownloadImage(blob, recapFilename(), tournament.name);
      notify(result === "shared" ? "Imagen compartida" : "Imagen descargada — ¡listo para compartir!");
    } catch {
      notify("No se pudo generar la imagen");
    } finally {
      setGeneratingImage(null);
    }
  };

  const downloadImage = async () => {
    setGeneratingImage("download");
    try {
      const blob = await generateTournamentRecapImage(tournament);
      downloadImageBlob(blob, recapFilename());
      notify("Imagen descargada");
    } catch {
      notify("No se pudo generar la imagen");
    } finally {
      setGeneratingImage(null);
    }
  };

  const canCopy = hasResults && standings.length > 0;

  return (
    <div className="flex flex-col gap-3.5">
      <h2 className="m-0 font-sans text-sm font-bold tracking-[2px] text-gold uppercase">
        Tabla de posiciones
      </h2>

      <div className={`${PANEL} flex flex-col gap-3.5 p-4`}>
        {leader && (
          <div className="animate-glow-pulse flex items-center gap-2 rounded-lg border border-gold/20 bg-gold/8 px-3.5 py-3">
            <span className="text-base">👑</span>
            <div className="font-sans text-[13px] font-bold text-gold">
              Líder actual: {leader.name} — {leader.pts} pts
            </div>
          </div>
        )}

        {!hasResults && (
          <div className="rounded-lg border border-dashed border-white/8 px-4 py-7 text-center font-sans text-[13px] text-parchment/35">
            Todavía no hay resultados cargados.
          </div>
        )}

        {hasResults && standings.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gold/15">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b border-gold/20 bg-gold/12">
                    <th className="px-2 py-2.5 text-center text-[10px] font-bold tracking-wider text-gold uppercase">#</th>
                    <th className="px-2 py-2.5 text-left text-[10px] font-bold tracking-wider text-gold uppercase">Jugador</th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold tracking-wide text-parchment/50" title="Partidos jugados">PJ</th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold tracking-wide text-success/80" title="Partidos ganados">PG</th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold tracking-wide text-parchment/50" title="Empates">PE</th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold tracking-wide text-danger/80" title="Partidos perdidos">PP</th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold tracking-wide text-parchment/50" title="Juegos ganados">JG</th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold tracking-wide text-parchment/50" title="Juegos perdidos">JP</th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold tracking-wide text-parchment/50" title="Diferencia">Dif</th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-bold tracking-wider text-gold uppercase">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/8">
                  {standings.map((row, i) => {
                    const isRanked = i < 3 && row.pts > 0;
                    return (
                      <tr
                        key={row.id}
                        className="even:bg-white/[0.02]"
                        style={isRanked ? { boxShadow: `inset 3px 0 0 0 ${RANK_ROW_ACCENT[i]}` } : undefined}
                      >
                        <td className="px-2 py-2.5 text-center">
                          <span
                            className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                              isRanked ? RANK_BADGE[i] : "border-white/10 bg-white/5 text-parchment/45"
                            }`}
                          >
                            {row.position}
                          </span>
                        </td>
                        <td className="px-2 py-2.5 text-left font-body text-[13px] font-semibold whitespace-nowrap text-parchment">
                          {row.name}
                        </td>
                        <td className="px-2 py-2.5 text-center text-parchment/45">{row.pj}</td>
                        <td className="px-2 py-2.5 text-center font-semibold text-success">{row.pg}</td>
                        <td className="px-2 py-2.5 text-center text-parchment/35">{row.pe}</td>
                        <td className="px-2 py-2.5 text-center font-semibold text-danger">{row.pp}</td>
                        <td className="px-2 py-2.5 text-center text-parchment/45">{row.jg}</td>
                        <td className="px-2 py-2.5 text-center text-parchment/45">{row.jp}</td>
                        <td className="px-2 py-2.5 text-center text-parchment/45">{row.diff}</td>
                        <td className="px-2 py-2.5 text-center text-sm font-bold text-gold">{row.pts}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            fullWidth
            className="border-gold/30 bg-gold/8 py-2.5 text-xs hover:bg-gold/14"
            onClick={shareImage}
            disabled={generatingImage !== null}
          >
            {generatingImage === "share" ? "Generando imagen…" : "🖼️ Compartir imagen"}
          </Button>
          <div className="flex gap-2">
            {canCopy && (
              <Button variant="secondary" fullWidth className="py-2.5 text-xs" onClick={copyStandings}>
                📋 Copiar tabla
              </Button>
            )}
            <Button
              variant="secondary"
              fullWidth
              className="py-2.5 text-xs"
              onClick={downloadImage}
              disabled={generatingImage !== null}
            >
              {generatingImage === "download" ? "Generando…" : "⬇️ Descargar imagen"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

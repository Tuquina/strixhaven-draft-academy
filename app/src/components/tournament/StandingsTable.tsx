import { useState } from "react";
import type { Tournament } from "../../types";
import { calculateStandings, formatStandingsClipboardText } from "../../lib/standings";
import { downloadImageBlob, generateTournamentRecapImage, shareOrDownloadImage } from "../../lib/tournamentImage";
import { Button } from "../shared/Button";

const RANK_BORDER = ["#C89B3C", "#C0C0C0", "#CD7F32"];

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

  return (
    <div className="flex flex-col gap-3.5">
      <h2 className="m-0 font-sans text-sm font-bold tracking-[2px] text-gold uppercase">
        Tabla de posiciones
      </h2>

      {leader && (
        <div className="animate-glow-pulse rounded-lg border border-gold/15 bg-gold/6 px-3.5 py-3">
          <div className="font-sans text-[13px] font-bold text-gold">
            Líder actual: {leader.name} — {leader.pts} pts
          </div>
        </div>
      )}

      {!hasResults && (
        <div className="px-4 py-7 text-center font-sans text-[13px] text-parchment/30">
          Todavía no hay resultados cargados.
        </div>
      )}

      {hasResults && standings.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gold/8">
            <table className="w-full min-w-[560px] border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-gold/6">
                  <th className="px-1.5 py-2.5 text-center text-[10px] font-bold tracking-wide text-gold uppercase">#</th>
                  <th className="px-1.5 py-2.5 text-left text-[10px] font-bold tracking-wide text-gold uppercase">Jugador</th>
                  <th className="px-1.5 py-2.5 text-center text-[10px] font-semibold text-parchment/40" title="Partidos jugados">PJ</th>
                  <th className="px-1.5 py-2.5 text-center text-[10px] font-semibold text-parchment/40" title="Partidos ganados">PG</th>
                  <th className="px-1.5 py-2.5 text-center text-[10px] font-semibold text-parchment/40" title="Empates">PE</th>
                  <th className="px-1.5 py-2.5 text-center text-[10px] font-semibold text-parchment/40" title="Partidos perdidos">PP</th>
                  <th className="px-1.5 py-2.5 text-center text-[10px] font-semibold text-parchment/40" title="Juegos ganados">JG</th>
                  <th className="px-1.5 py-2.5 text-center text-[10px] font-semibold text-parchment/40" title="Juegos perdidos">JP</th>
                  <th className="px-1.5 py-2.5 text-center text-[10px] font-semibold text-parchment/40" title="Diferencia">Dif</th>
                  <th className="px-1.5 py-2.5 text-center text-[10px] font-bold text-gold uppercase">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, i) => (
                  <tr
                    key={row.id}
                    style={{
                      borderLeft: `3px solid ${i < 3 && row.pts > 0 ? RANK_BORDER[i] : "transparent"}`,
                    }}
                  >
                    <td className="px-1.5 py-2.5 text-center font-semibold text-parchment/40">{row.position}</td>
                    <td className="px-1.5 py-2.5 text-left font-body text-[13px] font-semibold whitespace-nowrap text-parchment">
                      {row.name}
                    </td>
                    <td className="px-1.5 py-2.5 text-center text-parchment/45">{row.pj}</td>
                    <td className="px-1.5 py-2.5 text-center text-success">{row.pg}</td>
                    <td className="px-1.5 py-2.5 text-center text-parchment/35">{row.pe}</td>
                    <td className="px-1.5 py-2.5 text-center text-danger">{row.pp}</td>
                    <td className="px-1.5 py-2.5 text-center text-parchment/45">{row.jg}</td>
                    <td className="px-1.5 py-2.5 text-center text-parchment/45">{row.jp}</td>
                    <td className="px-1.5 py-2.5 text-center text-parchment/45">{row.diff}</td>
                    <td className="px-1.5 py-2.5 text-center text-sm font-bold text-gold">{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {hasResults && standings.length > 0 && (
          <Button variant="secondary" className="px-3.5 py-2.5 text-xs" onClick={copyStandings}>
            Copiar tabla
          </Button>
        )}
        <Button
          variant="secondary"
          className="px-3.5 py-2.5 text-xs"
          onClick={shareImage}
          disabled={generatingImage !== null}
        >
          {generatingImage === "share" ? "Generando imagen…" : "🖼️ Compartir imagen"}
        </Button>
        <Button
          variant="secondary"
          className="px-3.5 py-2.5 text-xs"
          onClick={downloadImage}
          disabled={generatingImage !== null}
        >
          {generatingImage === "download" ? "Generando imagen…" : "⬇️ Descargar imagen"}
        </Button>
      </div>
    </div>
  );
}

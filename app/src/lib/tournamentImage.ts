import type { Tournament } from "../types";
import { calculateStandings } from "./standings";
import { describeRounds } from "./rounds";
import { MANA_CHIP_COLORS } from "./colors";

const WIDTH = 1000;
const MARGIN_X = 60;
const RIGHT_EDGE = WIDTH - MARGIN_X;

const HEADER_H = 150;
const SECTION_LABEL_H = 44;
const PLAYER_ROW_H = 32;
const ROUND_LABEL_H = 36;
const MATCH_ROW_H = 28;
const TABLE_HEADER_H = 36;
const TABLE_ROW_H = 34;
const SECTION_GAP = 40;
const FOOTER_H = 50;
const PADDING_Y = 50;

const COLOR = {
  bgTop: "#141a2b",
  bgBottom: "#181109",
  frame: "rgba(200,155,60,0.35)",
  divider: "rgba(200,155,60,0.15)",
  gold: "#c89b3c",
  goldDark: "#a07d2e",
  parchment: "#e9d8b4",
  parchmentDim: "rgba(233,216,180,0.55)",
  parchmentFaint: "rgba(233,216,180,0.3)",
  success: "#4e9f3d",
  danger: "#b74134",
  rowAlt: "rgba(255,255,255,0.02)",
};

const RANK_BORDER = ["#c89b3c", "#c0c0c0", "#cd7f32"];

async function ensureFontsReady(): Promise<void> {
  try {
    await document.fonts.ready;
  } catch {
    // Best-effort — canvas falls back to serif/sans-serif if custom fonts aren't ready.
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawDivider(ctx: CanvasRenderingContext2D, y: number) {
  ctx.strokeStyle = COLOR.divider;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN_X, y);
  ctx.lineTo(RIGHT_EDGE, y);
  ctx.stroke();
}

/** Builds a single shareable PNG recapping the whole tournament: roster + decks,
 * head-to-head results, and the final standings table. */
export async function generateTournamentRecapImage(tournament: Tournament): Promise<Blob> {
  await ensureFontsReady();

  const standings = calculateStandings(tournament);
  const rounds = describeRounds(tournament)
    .map((round) => ({ ...round, matches: round.matches.filter((m) => m.isCompleted) }))
    .filter((round) => round.matches.length > 0);
  const hasResults = rounds.length > 0;
  const standingsRowCount = Math.max(standings.length, 1);

  const playersHeight = SECTION_LABEL_H + tournament.players.length * PLAYER_ROW_H;
  const resultsHeight =
    SECTION_LABEL_H +
    (hasResults
      ? rounds.reduce((acc, r) => acc + ROUND_LABEL_H + r.matches.length * MATCH_ROW_H, 0)
      : MATCH_ROW_H);
  const standingsHeight = SECTION_LABEL_H + TABLE_HEADER_H + standingsRowCount * TABLE_ROW_H;

  const height =
    PADDING_Y * 2 +
    HEADER_H +
    SECTION_GAP +
    playersHeight +
    SECTION_GAP +
    resultsHeight +
    SECTION_GAP +
    standingsHeight +
    SECTION_GAP +
    FOOTER_H;

  const canvas = document.createElement("canvas");
  const scale = 2; // draw at 2x for crisp text on high-DPI phone screens
  canvas.width = WIDTH * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el contexto de canvas");
  ctx.scale(scale, scale);

  // Background + frame.
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, COLOR.bgTop);
  bgGradient.addColorStop(1, COLOR.bgBottom);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, WIDTH, height);
  ctx.strokeStyle = COLOR.frame;
  ctx.lineWidth = 2;
  roundRect(ctx, 8, 8, WIDTH - 16, height - 16, 14);
  ctx.stroke();

  let y = PADDING_Y;

  // Header.
  ctx.textAlign = "center";
  ctx.fillStyle = COLOR.gold;
  ctx.font = "bold 34px 'Cinzel', serif";
  ctx.fillText(`🏆 ${tournament.name}`, WIDTH / 2, y + 40);

  ctx.fillStyle = COLOR.parchmentDim;
  ctx.font = "16px 'Cormorant Garamond', serif";
  ctx.fillText("Strixhaven Draft Academy", WIDTH / 2, y + 70);

  ctx.fillStyle = COLOR.parchmentFaint;
  ctx.font = "13px 'Crimson Text', serif";
  const dateLabel = new Date(tournament.updatedAt).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  ctx.fillText(`Hosted by Fernando Tuquina · ${dateLabel}`, WIDTH / 2, y + 95);

  y += HEADER_H;
  drawDivider(ctx, y);
  y += SECTION_GAP;

  // Jugadores y mazos.
  ctx.textAlign = "left";
  ctx.fillStyle = COLOR.gold;
  ctx.font = "bold 15px 'Crimson Text', serif";
  ctx.fillText("JUGADORES Y MAZOS", MARGIN_X, y + 14);
  y += SECTION_LABEL_H;

  tournament.players.forEach((p, i) => {
    if (i % 2 === 1) {
      ctx.fillStyle = COLOR.rowAlt;
      ctx.fillRect(MARGIN_X - 10, y, RIGHT_EDGE - MARGIN_X + 20, PLAYER_ROW_H);
    }
    let dotX = MARGIN_X;
    p.colors.forEach((c) => {
      ctx.fillStyle = MANA_CHIP_COLORS[c].bg;
      ctx.strokeStyle = MANA_CHIP_COLORS[c].border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(dotX + 6, y + PLAYER_ROW_H / 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      dotX += 16;
    });
    const textX = MARGIN_X + Math.max(p.colors.length * 16, 4) + 10;
    ctx.fillStyle = COLOR.parchment;
    ctx.font = "bold 15px 'Crimson Text', serif";
    ctx.fillText(p.name, textX, y + PLAYER_ROW_H / 2 + 5);
    const nameWidth = ctx.measureText(p.name).width;
    ctx.fillStyle = COLOR.parchmentDim;
    ctx.font = "14px 'Crimson Text', serif";
    ctx.fillText(`— ${p.colorCombinationName}`, textX + nameWidth + 10, y + PLAYER_ROW_H / 2 + 5);
    y += PLAYER_ROW_H;
  });

  drawDivider(ctx, y);
  y += SECTION_GAP;

  // Resultados 1 a 1.
  ctx.fillStyle = COLOR.gold;
  ctx.font = "bold 15px 'Crimson Text', serif";
  ctx.fillText("RESULTADOS", MARGIN_X, y + 14);
  y += SECTION_LABEL_H;

  if (hasResults) {
    rounds.forEach((round) => {
      ctx.fillStyle = COLOR.gold;
      ctx.font = "bold 14px 'Cinzel', serif";
      ctx.fillText(`Ronda ${round.number}`, MARGIN_X, y + 14);
      y += ROUND_LABEL_H;
      round.matches.forEach((m, i) => {
        if (i % 2 === 1) {
          ctx.fillStyle = COLOR.rowAlt;
          ctx.fillRect(MARGIN_X - 10, y, RIGHT_EDGE - MARGIN_X + 20, MATCH_ROW_H);
        }
        ctx.textAlign = "left";
        ctx.fillStyle = COLOR.parchment;
        ctx.font = "14px 'Crimson Text', serif";
        ctx.fillText(`${m.playerAName} vs ${m.playerBName}`, MARGIN_X + 10, y + MATCH_ROW_H / 2 + 5);
        ctx.textAlign = "right";
        ctx.fillStyle = COLOR.success;
        ctx.font = "bold 14px 'Crimson Text', serif";
        ctx.fillText(m.resultText, RIGHT_EDGE - 10, y + MATCH_ROW_H / 2 + 5);
        y += MATCH_ROW_H;
      });
    });
  } else {
    ctx.textAlign = "left";
    ctx.fillStyle = COLOR.parchmentFaint;
    ctx.font = "italic 14px 'Crimson Text', serif";
    ctx.fillText("Todavía no hay resultados cargados.", MARGIN_X, y + MATCH_ROW_H / 2 + 5);
    y += MATCH_ROW_H;
  }

  drawDivider(ctx, y);
  y += SECTION_GAP;

  // Tabla de posiciones.
  ctx.textAlign = "left";
  ctx.fillStyle = COLOR.gold;
  ctx.font = "bold 15px 'Crimson Text', serif";
  ctx.fillText("TABLA DE POSICIONES", MARGIN_X, y + 14);
  y += SECTION_LABEL_H;

  const colRank = MARGIN_X + 15;
  const colName = MARGIN_X + 55;
  const colPJ = RIGHT_EDGE - 280;
  const colPG = RIGHT_EDGE - 210;
  const colPE = RIGHT_EDGE - 140;
  const colPP = RIGHT_EDGE - 70;
  const colPts = RIGHT_EDGE;

  ctx.textAlign = "center";
  ctx.fillStyle = COLOR.parchmentFaint;
  ctx.font = "bold 11px 'Crimson Text', serif";
  ctx.fillText("PJ", colPJ, y + 10);
  ctx.fillText("PG", colPG, y + 10);
  ctx.fillText("PE", colPE, y + 10);
  ctx.fillText("PP", colPP, y + 10);
  ctx.textAlign = "right";
  ctx.fillStyle = COLOR.gold;
  ctx.fillText("PTS", colPts, y + 10);
  y += TABLE_HEADER_H;

  if (standings.length === 0) {
    ctx.textAlign = "left";
    ctx.fillStyle = COLOR.parchmentFaint;
    ctx.font = "italic 14px 'Crimson Text', serif";
    ctx.fillText("Sin datos de posiciones todavía.", MARGIN_X, y + TABLE_ROW_H / 2 + 5);
    y += TABLE_ROW_H;
  } else {
    standings.forEach((row, i) => {
      if (i % 2 === 1) {
        ctx.fillStyle = COLOR.rowAlt;
        ctx.fillRect(MARGIN_X - 10, y, RIGHT_EDGE - MARGIN_X + 20, TABLE_ROW_H);
      }
      if (i < 3 && row.pts > 0) {
        ctx.fillStyle = RANK_BORDER[i];
        ctx.fillRect(MARGIN_X - 10, y, 3, TABLE_ROW_H);
      }
      ctx.textAlign = "center";
      ctx.fillStyle = COLOR.parchmentDim;
      ctx.font = "bold 13px 'Crimson Text', serif";
      ctx.fillText(String(row.position), colRank, y + TABLE_ROW_H / 2 + 5);

      ctx.textAlign = "left";
      ctx.fillStyle = COLOR.parchment;
      ctx.font = "bold 15px 'Crimson Text', serif";
      ctx.fillText(row.name, colName, y + TABLE_ROW_H / 2 + 5);

      ctx.textAlign = "center";
      ctx.font = "13px 'Crimson Text', serif";
      ctx.fillStyle = COLOR.parchmentDim;
      ctx.fillText(String(row.pj), colPJ, y + TABLE_ROW_H / 2 + 5);
      ctx.fillStyle = COLOR.success;
      ctx.fillText(String(row.pg), colPG, y + TABLE_ROW_H / 2 + 5);
      ctx.fillStyle = COLOR.parchmentDim;
      ctx.fillText(String(row.pe), colPE, y + TABLE_ROW_H / 2 + 5);
      ctx.fillStyle = COLOR.danger;
      ctx.fillText(String(row.pp), colPP, y + TABLE_ROW_H / 2 + 5);

      ctx.textAlign = "right";
      ctx.fillStyle = COLOR.gold;
      ctx.font = "bold 16px 'Crimson Text', serif";
      ctx.fillText(String(row.pts), colPts, y + TABLE_ROW_H / 2 + 5);

      y += TABLE_ROW_H;
    });
  }

  drawDivider(ctx, y);
  y += SECTION_GAP;

  // Footer.
  ctx.textAlign = "center";
  ctx.fillStyle = COLOR.goldDark;
  ctx.font = "bold 13px 'Cinzel', serif";
  ctx.fillText("STRIXHAVEN DRAFT ACADEMY", WIDTH / 2, y + 20);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("No se pudo generar la imagen"));
    }, "image/png");
  });
}

export function downloadImageBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Tries the Web Share API (great for sharing straight to WhatsApp on mobile);
 * falls back to a plain download when file sharing isn't supported. */
export async function shareOrDownloadImage(blob: Blob, filename: string, title: string): Promise<"shared" | "downloaded"> {
  const file = new File([blob], filename, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return "shared";
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return "shared";
      // Fall through to download on any other share failure.
    }
  }
  downloadImageBlob(blob, filename);
  return "downloaded";
}

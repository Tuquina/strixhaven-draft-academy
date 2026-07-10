import { useState } from "react";
import { MANA_CHIP_COLORS } from "../../lib/colors";
import { PANEL } from "../../lib/designSystem";
import type { NormalizedCard } from "../../lib/scryfall";

const WUBRG = new Set(["W", "U", "B", "R", "G"]);

export function ManaCostPips({ cost }: { cost?: string }) {
  const symbols = cost?.match(/\{[^}]+\}/g) ?? [];
  if (symbols.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {symbols.map((raw, i) => {
        const symbol = raw.slice(1, -1);
        const mana = WUBRG.has(symbol) ? MANA_CHIP_COLORS[symbol as "W" | "U" | "B" | "R" | "G"] : null;
        return (
          <span
            key={`${symbol}-${i}`}
            className="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 font-sans text-[11px] font-bold"
            style={
              mana
                ? { background: mana.bg, color: mana.text, border: `1px solid ${mana.border}` }
                : { background: "rgba(255,255,255,0.08)", color: "#e9d8b4", border: "1px solid rgba(255,255,255,0.15)" }
            }
          >
            {symbol}
          </span>
        );
      })}
    </div>
  );
}

const LEGALITY_CLASSES: Record<string, string> = {
  legal: "bg-success/12 text-success",
  banned: "bg-danger/12 text-danger",
  restricted: "bg-gold/12 text-gold",
  not_legal: "bg-white/5 text-parchment/35",
};

interface CardDetailPanelProps {
  card: NormalizedCard;
  className?: string;
}

/**
 * Full card detail view (image + oracle text + legalities) — shared by the
 * "Consultar Cartas" tab and the deck viewer's card lightbox, so both stay in
 * sync automatically. Pass `key={card.id}` from the caller when the card prop
 * can change, so the internal face toggle resets for a newly shown card.
 */
export function CardDetailPanel({ card, className = "" }: CardDetailPanelProps) {
  const [faceIndex, setFaceIndex] = useState(0);
  const face = card.faces[faceIndex] ?? card.faces[0];
  if (!face) return null;

  return (
    <div className={`${PANEL} flex flex-col gap-6 p-5 sm:flex-row sm:p-7 ${className}`}>
      <div className="mx-auto w-full max-w-[280px] shrink-0 sm:mx-0">
        {face.imageUrl ? (
          <img
            src={face.imageUrl}
            alt={face.displayName}
            className="w-full rounded-xl border border-gold/20 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-[5/7] items-center justify-center rounded-xl border border-dashed border-white/10 font-sans text-sm text-parchment/30">
            Sin imagen
          </div>
        )}
        {card.faces.length > 1 && (
          <button
            type="button"
            onClick={() => setFaceIndex((i) => (i + 1) % card.faces.length)}
            className="mt-2 w-full cursor-pointer rounded-md border border-gold/25 bg-gold/8 py-2 font-sans text-xs font-semibold text-gold hover:bg-gold/14"
          >
            🔄 Ver otra cara
          </button>
        )}
        {!card.isSpanish && (
          <p className="mt-2 text-center font-sans text-[11px] text-parchment/35">
            Sin impresión en español disponible — mostrando texto en inglés.
          </p>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="m-0 font-heading text-xl font-bold text-parchment">{face.displayName}</h3>
          <ManaCostPips cost={face.manaCost} />
        </div>
        <p className="mt-1 font-body text-sm text-parchment/60 italic">{face.typeLine}</p>

        {face.oracleText && (
          <div className="mt-3 space-y-2 font-body text-[15px] leading-relaxed whitespace-pre-line text-parchment/85">
            {face.oracleText}
          </div>
        )}

        {(face.power || face.toughness) && (
          <div className="mt-3 inline-block rounded-md border border-gold/20 bg-gold/8 px-3 py-1 font-heading text-sm font-bold text-gold">
            {face.power}/{face.toughness}
          </div>
        )}
        {face.loyalty && (
          <div className="mt-3 inline-block rounded-md border border-gold/20 bg-gold/8 px-3 py-1 font-heading text-sm font-bold text-gold">
            Lealtad: {face.loyalty}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-sans text-xs text-parchment/45">
          <span>
            Rareza: <span className="font-semibold text-parchment/70">{card.rarityLabel}</span>
          </span>
          {card.setName && (
            <span>
              Set: <span className="font-semibold text-parchment/70">{card.setName}</span>
            </span>
          )}
          {card.artist && <span>Ilustrado por {card.artist}</span>}
        </div>

        {card.legalities.length > 0 && (
          <div className="mt-4">
            <h4 className="m-0 mb-2 font-sans text-[11px] font-bold tracking-wide text-gold uppercase">Legalidad</h4>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {card.legalities.map((l) => (
                <div
                  key={l.format}
                  className={`rounded px-2 py-1 text-center font-sans text-[11px] font-semibold ${LEGALITY_CLASSES[l.status] ?? LEGALITY_CLASSES.not_legal}`}
                  title={l.statusLabel}
                >
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { FAN_CONTENT_NOTICE } from "../../lib/legal";
import { BTN_CTA, GRADIENT_TEXT_GOLD, GRADIENT_TEXT_HERO, PANEL } from "../../lib/designSystem";
import { MANA_CHIP_COLORS } from "../../lib/colors";
import {
  autocompleteCardName,
  autocompleteSpanishCardName,
  fetchCardByName,
  ScryfallNotFoundError,
  type NormalizedCard,
} from "../../lib/scryfall";

interface CardSearchPageProps {
  onBack: () => void;
}

const SCRYFALL_ATTRIBUTION =
  "Los datos e imágenes de cartas son provistos por Scryfall y pueden no reflejar precios ni disponibilidad oficial.";

const WUBRG = new Set(["W", "U", "B", "R", "G"]);

function ManaCostPips({ cost }: { cost?: string }) {
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

export function CardSearchPage({ onBack }: CardSearchPageProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [card, setCard] = useState<NormalizedCard | null>(null);
  const [faceIndex, setFaceIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      Promise.all([
        autocompleteCardName(query, controller.signal).catch(() => []),
        autocompleteSpanishCardName(query, controller.signal).catch(() => []),
      ]).then(([enNames, esNames]) => {
        setSuggestions(Array.from(new Set([...esNames, ...enNames])).slice(0, 10));
      });
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const runSearch = async (name: string) => {
    if (!name.trim()) return;
    const thisRequest = ++requestId.current;
    setShowSuggestions(false);
    setLoading(true);
    setError(null);
    setFaceIndex(0);
    try {
      const result = await fetchCardByName(name);
      if (requestId.current !== thisRequest) return;
      setCard(result);
    } catch (e) {
      if (requestId.current !== thisRequest) return;
      setCard(null);
      setError(
        e instanceof ScryfallNotFoundError
          ? `No encontramos "${name}". Probá con el nombre en inglés, que suele ser más preciso.`
          : "No se pudo consultar Scryfall en este momento. Probá de nuevo en unos segundos."
      );
    } finally {
      if (requestId.current === thisRequest) setLoading(false);
    }
  };

  const face = card?.faces[faceIndex] ?? card?.faces[0];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-[100] border-b border-gold/10 bg-background-panel/70 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-[900px] items-center gap-3.5">
          <button
            onClick={onBack}
            className="cursor-pointer rounded-md border border-gold/20 bg-transparent px-3 py-2.5 font-sans text-[13px] font-semibold whitespace-nowrap text-gold hover:bg-gold/10"
          >
            ← Volver
          </button>
          <h1 className={`${GRADIENT_TEXT_GOLD} m-0 font-heading-decorative text-[clamp(16px,3vw,22px)] font-bold`}>
            Consultar Cartas
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[900px] flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 text-center">
          <div className="mb-3 font-sans text-[10px] tracking-[3px] text-gold/60 uppercase sm:text-xs sm:tracking-[6px]">
            ✦ Base de datos Scryfall ✦
          </div>
          <h2 className={`${GRADIENT_TEXT_HERO} m-0 font-heading-decorative text-[clamp(28px,5vw,40px)] font-black animate-[heroTitleGlow_4s_ease-in-out_infinite]`}>
            Buscar Cartas
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query);
          }}
          className="relative mb-8 flex gap-2"
        >
          <div className="relative min-w-0 flex-1">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Nombre de la carta, en inglés o español"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 font-body text-base text-parchment"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className={`${PANEL} absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto bg-background-panel/95 p-1.5`}>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => {
                      setQuery(s);
                      runSearch(s);
                    }}
                    className="block w-full cursor-pointer rounded-lg px-3 py-2 text-left font-body text-sm text-parchment hover:bg-gold/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className={`${BTN_CTA} px-5 py-2.5 text-xs sm:px-7`}>
            Buscar
          </button>
        </form>

        {loading && (
          <div className="py-16 text-center font-sans text-sm text-parchment/40">Consultando Scryfall…</div>
        )}

        {error && !loading && (
          <div className="rounded-lg border border-danger/25 bg-danger/8 px-4 py-3 text-center font-sans text-sm text-danger">
            {error}
          </div>
        )}

        {!card && !loading && !error && (
          <div className="rounded-lg border border-dashed border-white/8 px-4 py-16 text-center font-sans text-sm text-parchment/30">
            Buscá una carta por nombre para ver su imagen, texto y legalidad.
          </div>
        )}

        {card && face && !loading && (
          <div className={`${PANEL} flex flex-col gap-6 p-5 sm:flex-row sm:p-7`}>
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
                  <h4 className="m-0 mb-2 font-sans text-[11px] font-bold tracking-wide text-gold uppercase">
                    Legalidad
                  </h4>
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
        )}

        <p className="mt-8 text-center font-sans text-xs text-parchment/25">{SCRYFALL_ATTRIBUTION}</p>
        <p className="mt-2 text-center font-sans text-xs text-parchment/25">{FAN_CONTENT_NOTICE}</p>
      </main>
    </div>
  );
}

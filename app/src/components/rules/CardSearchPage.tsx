import { useEffect, useRef, useState } from "react";
import { FAN_CONTENT_NOTICE, SCRYFALL_ATTRIBUTION } from "../../lib/legal";
import { BTN_CTA, GRADIENT_TEXT_GOLD, GRADIENT_TEXT_HERO, PANEL } from "../../lib/designSystem";
import { CardDetailPanel } from "../shared/CardDetailPanel";
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

export function CardSearchPage({ onBack }: CardSearchPageProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [card, setCard] = useState<NormalizedCard | null>(null);
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

        {card && !loading && <CardDetailPanel key={card.id} card={card} />}

        <p className="mt-8 text-center font-sans text-xs text-parchment/25">{SCRYFALL_ATTRIBUTION}</p>
        <p className="mt-2 text-center font-sans text-xs text-parchment/25">{FAN_CONTENT_NOTICE}</p>
      </main>
    </div>
  );
}

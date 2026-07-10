import { useEffect, useState } from "react";
import type { DeckCard } from "../../types";
import { resolveDeckCards, type NormalizedCard, type ResolvedDeckCard } from "../../lib/scryfall";
import { SCRYFALL_ATTRIBUTION } from "../../lib/legal";
import { filterChipClass, GRADIENT_TEXT_GOLD } from "../../lib/designSystem";
import { Modal } from "../shared/Modal";
import { CardDetailPanel, ManaCostPips } from "../shared/CardDetailPanel";

interface DeckViewerModalProps {
  deckName: string | undefined;
  playerName: string;
  cards: DeckCard[];
  onClose: () => void;
}

type ViewMode = "list" | "grid";

// Moxfield-style type grouping. Checked in this order so a card with multiple
// types (e.g. "Artifact Creature") lands in the more specific bucket.
const TYPE_BUCKETS: { key: string; label: string; test: (typeLine: string) => boolean }[] = [
  { key: "creature", label: "Criaturas", test: (t) => t.includes("Creature") },
  { key: "planeswalker", label: "Planeswalkers", test: (t) => t.includes("Planeswalker") },
  { key: "battle", label: "Batallas", test: (t) => t.includes("Battle") },
  { key: "instant", label: "Instantáneos", test: (t) => t.includes("Instant") },
  { key: "sorcery", label: "Conjuros", test: (t) => t.includes("Sorcery") },
  { key: "artifact", label: "Artefactos", test: (t) => t.includes("Artifact") },
  { key: "enchantment", label: "Encantamientos", test: (t) => t.includes("Enchantment") },
  { key: "land", label: "Tierras", test: (t) => t.includes("Land") },
];
const OTHER_BUCKET = { key: "other", label: "Otros" };
const UNRESOLVED_BUCKET = { key: "unresolved", label: "Sin resolver" };
const BUCKET_ORDER = [...TYPE_BUCKETS.map((b) => b.key), OTHER_BUCKET.key, UNRESOLVED_BUCKET.key];

interface Group {
  key: string;
  label: string;
  count: number;
  cards: ResolvedDeckCard[];
}

function groupCards(cards: ResolvedDeckCard[]): Group[] {
  const groups = new Map<string, Group>();
  cards.forEach((rc) => {
    const bucket = !rc.card
      ? UNRESOLVED_BUCKET
      : (TYPE_BUCKETS.find((b) => b.test(rc.card!.faces[0]?.typeLine ?? "")) ?? OTHER_BUCKET);
    if (!groups.has(bucket.key)) groups.set(bucket.key, { key: bucket.key, label: bucket.label, count: 0, cards: [] });
    const g = groups.get(bucket.key)!;
    g.cards.push(rc);
    g.count += rc.quantity;
  });
  groups.forEach((g) => g.cards.sort((a, b) => a.name.localeCompare(b.name)));
  return BUCKET_ORDER.map((k) => groups.get(k)).filter((g): g is Group => !!g);
}

/**
 * Shows a player's decklist Moxfield-style: resolves every card against
 * Scryfall (batched + cached, see lib/scryfall.ts), groups by type, and lets
 * the user switch between a compact list and a visual card grid. Cards are
 * only ever loaded live here — the tournament itself only stores name/qty/
 * printing, never Scryfall data.
 */
export function DeckViewerModal({ deckName, playerName, cards, onClose }: DeckViewerModalProps) {
  const [resolved, setResolved] = useState<ResolvedDeckCard[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [detailCard, setDetailCard] = useState<NormalizedCard | null>(null);

  useEffect(() => {
    let cancelled = false;
    setResolved(null);
    setLoadError(false);
    resolveDeckCards(cards)
      .then((r) => {
        if (!cancelled) setResolved(r);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [cards]);

  const mainCards = resolved?.filter((c) => c.section === "mainboard") ?? [];
  const sideCards = resolved?.filter((c) => c.section === "sideboard") ?? [];
  const main = groupCards(mainCards);
  const side = groupCards(sideCards);
  const mainCount = cards.filter((c) => c.section === "mainboard").reduce((s, c) => s + c.quantity, 0);
  const sideCount = cards.filter((c) => c.section === "sideboard").reduce((s, c) => s + c.quantity, 0);
  const unresolvedCount = resolved ? resolved.filter((c) => !c.card).length : 0;

  return (
    <>
      <Modal onClose={onClose} maxWidth="960px">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className={`${GRADIENT_TEXT_GOLD} m-0 font-heading-decorative text-2xl font-bold`}>
              {deckName || `Mazo de ${playerName}`}
            </h2>
            <p className="m-0 mt-1 font-sans text-xs text-parchment/45">
              {playerName} · {mainCount} carta{mainCount === 1 ? "" : "s"}
              {sideCount > 0 ? ` + ${sideCount} en banca` : ""}
            </p>
          </div>
          <div className="flex gap-1.5">
            <button className={filterChipClass(view === "list")} onClick={() => setView("list")}>
              📋 Lista
            </button>
            <button className={filterChipClass(view === "grid")} onClick={() => setView("grid")}>
              🖼️ Cuadrícula
            </button>
          </div>
        </div>

        {!resolved && !loadError && (
          <div className="py-16 text-center font-sans text-sm text-parchment/40">Consultando Scryfall…</div>
        )}
        {loadError && (
          <div className="rounded-lg border border-danger/25 bg-danger/8 px-4 py-3 text-center font-sans text-sm text-danger">
            No se pudo consultar Scryfall en este momento. Probá de nuevo en unos segundos.
          </div>
        )}

        {resolved && (
          <div className="flex flex-col gap-6">
            {main.length === 0 && side.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/8 px-4 py-10 text-center font-sans text-sm text-parchment/30">
                Este mazo todavía no tiene cartas cargadas.
              </div>
            ) : (
              <>
                <DeckSections groups={main} view={view} onSelectCard={setDetailCard} />
                {side.length > 0 && (
                  <div>
                    <h3 className="m-0 mb-3 font-sans text-sm font-bold tracking-[2px] text-gold uppercase">
                      Banca ({sideCount})
                    </h3>
                    <DeckSections groups={side} view={view} onSelectCard={setDetailCard} />
                  </div>
                )}
              </>
            )}

            {unresolvedCount > 0 && (
              <p className="m-0 font-sans text-xs text-parchment/40">
                ⚠️ {unresolvedCount} carta{unresolvedCount === 1 ? "" : "s"} no se {unresolvedCount === 1 ? "encontró" : "encontraron"} en
                Scryfall — revisá el nombre.
              </p>
            )}

            <p className="m-0 text-center font-sans text-[11px] text-parchment/25">{SCRYFALL_ATTRIBUTION}</p>
          </div>
        )}
      </Modal>

      {detailCard && (
        <Modal onClose={() => setDetailCard(null)} maxWidth="720px">
          <CardDetailPanel key={detailCard.id} card={detailCard} />
        </Modal>
      )}
    </>
  );
}

function DeckSections({
  groups,
  view,
  onSelectCard,
}: {
  groups: Group[];
  view: ViewMode;
  onSelectCard: (card: NormalizedCard) => void;
}) {
  if (view === "grid") {
    return (
      <div className="flex flex-col gap-5">
        {groups.map((g) => (
          <div key={g.key}>
            <h4 className="m-0 mb-2 font-sans text-xs font-bold tracking-wide text-parchment/50 uppercase">
              {g.label} ({g.count})
            </h4>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
              {g.cards.map((rc, i) => (
                <button
                  key={`${rc.name}-${i}`}
                  type="button"
                  disabled={!rc.card}
                  onClick={() => rc.card && onSelectCard(rc.card)}
                  className="group relative aspect-[5/7] overflow-hidden rounded-lg border border-white/10 bg-black/20 text-left disabled:cursor-default"
                >
                  {rc.card?.faces[0]?.imageUrl ? (
                    <img
                      src={rc.card.faces[0].imageUrl}
                      alt={rc.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-1.5 text-center font-sans text-[10px] text-parchment/35">
                      {rc.name}
                    </div>
                  )}
                  <span className="absolute right-1 bottom-1 rounded bg-black/80 px-1.5 py-0.5 font-sans text-[10px] font-bold text-parchment">
                    x{rc.quantity}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((g) => (
        <div key={g.key}>
          <h4 className="m-0 mb-1.5 font-sans text-xs font-bold tracking-wide text-parchment/50 uppercase">
            {g.label} ({g.count})
          </h4>
          <div className="flex flex-col">
            {g.cards.map((rc, i) => (
              <button
                key={`${rc.name}-${i}`}
                type="button"
                disabled={!rc.card}
                onClick={() => rc.card && onSelectCard(rc.card)}
                className={`flex items-center justify-between gap-2 rounded px-1.5 py-1 text-left font-body text-[13px] disabled:cursor-default ${
                  rc.card ? "cursor-pointer text-parchment hover:bg-white/5" : "text-parchment/35 italic"
                }`}
              >
                <span className="truncate">
                  <span className="text-parchment/45">{rc.quantity}×</span> {rc.name}
                </span>
                {rc.card?.faces[0]?.manaCost && (
                  <span className="shrink-0">
                    <ManaCostPips cost={rc.card.faces[0].manaCost} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

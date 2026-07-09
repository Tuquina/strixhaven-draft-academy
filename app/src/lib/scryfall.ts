// Client for the public Scryfall API (https://scryfall.com/docs/api), used by the
// card-lookup tab (CardSearchPage). Calls go straight from each player's browser to
// Scryfall — there's no backend in this app, and doing it this way means card lookups
// never touch our own Vercel/Supabase free-tier quota, however many people are looking
// up cards during a draft. Results are cached in localStorage (see app/DESIGN_SYSTEM.md
// note in CLAUDE.md) so repeat lookups of the same card are instant and don't re-hit
// Scryfall at all.
//
// Design follows project/scryfall-mtg-card-api-guide.md: prefer /cards/collection for
// bulk decklists (not needed here — this is a single-card lookup tool), dedupe/cache
// aggressively, and handle 429 with backoff.

const AUTOCOMPLETE_URL = "https://api.scryfall.com/cards/autocomplete";
const NAMED_URL = "https://api.scryfall.com/cards/named";
const SEARCH_URL = "https://api.scryfall.com/cards/search";

const CACHE_KEY = "sda-scryfall-cache-v1";
const CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days — cards rarely change, per the guide's 7-30 day recommendation

export class ScryfallNotFoundError extends Error {
  query: string;

  constructor(query: string) {
    super(`No se encontró ninguna carta para "${query}".`);
    this.name = "ScryfallNotFoundError";
    this.query = query;
  }
}

interface ScryfallImageUris {
  small?: string;
  normal?: string;
  large?: string;
}

interface ScryfallCardFace {
  name: string;
  printed_name?: string;
  mana_cost?: string;
  type_line?: string;
  printed_type_line?: string;
  oracle_text?: string;
  printed_text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  colors?: string[];
  artist?: string;
  image_uris?: ScryfallImageUris;
}

interface ScryfallCard {
  id: string;
  oracle_id?: string;
  name: string;
  printed_name?: string;
  mana_cost?: string;
  type_line?: string;
  printed_type_line?: string;
  oracle_text?: string;
  printed_text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  colors?: string[];
  rarity?: string;
  set?: string;
  set_name?: string;
  collector_number?: string;
  artist?: string;
  image_uris?: ScryfallImageUris;
  card_faces?: ScryfallCardFace[];
  legalities?: Record<string, string>;
}

interface ScryfallList<T> {
  object: "list" | "catalog";
  data: T[];
}

export interface NormalizedFace {
  name: string;
  displayName: string;
  manaCost?: string;
  typeLine: string;
  oracleText?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  imageUrl?: string;
}

export interface NormalizedLegality {
  format: string;
  label: string;
  status: string;
  statusLabel: string;
}

export interface NormalizedCard {
  id: string;
  oracleId?: string;
  name: string;
  displayName: string;
  isSpanish: boolean;
  faces: NormalizedFace[];
  rarity: string;
  rarityLabel: string;
  setName?: string;
  collectorNumber?: string;
  artist?: string;
  legalities: NormalizedLegality[];
  scryfallUrl?: string;
}

// Scryfall's Spanish prints don't always populate printed_type_line even when
// printed_text is translated (a known gap in their localization data), so the
// English type line leaks through. Best-effort translate the common supertype/type
// words as a fallback; creature subtypes (Human, Wizard, ...) are left as-is since
// Scryfall doesn't expose a reliable translated subtype list separately.
const TYPE_WORD_TRANSLATIONS: Record<string, string> = {
  Creature: "Criatura",
  Instant: "Instantáneo",
  Sorcery: "Conjuro",
  Artifact: "Artefacto",
  Enchantment: "Encantamiento",
  Land: "Tierra",
  Planeswalker: "Planeswalker",
  Battle: "Batalla",
  Legendary: "Legendaria",
  Basic: "Básica",
  Kindred: "Tribal",
  Tribal: "Tribal",
  Snow: "Nieve",
  World: "Mundo",
};

function translateTypeLineFallback(typeLine: string): string {
  const [left, right] = typeLine.split(" — ");
  const translatedLeft = left
    .split(" ")
    .map((word) => TYPE_WORD_TRANSLATIONS[word] ?? word)
    .join(" ");
  return right ? `${translatedLeft} — ${right}` : translatedLeft;
}

const RARITY_LABELS: Record<string, string> = {
  common: "Común",
  uncommon: "Infrecuente",
  rare: "Rara",
  mythic: "Mítica",
  special: "Especial",
  bonus: "Bonus",
};

const LEGALITY_LABELS: Record<string, string> = {
  legal: "Legal",
  not_legal: "No legal",
  banned: "Prohibida",
  restricted: "Restringida",
};

// Curated, ordered subset of Scryfall's format keys — the ones a casual group
// actually cares about, in the order Scryfall's own site shows them.
const FORMAT_ORDER: { key: string; label: string }[] = [
  { key: "standard", label: "Standard" },
  { key: "pioneer", label: "Pioneer" },
  { key: "modern", label: "Modern" },
  { key: "legacy", label: "Legacy" },
  { key: "vintage", label: "Vintage" },
  { key: "commander", label: "Commander" },
  { key: "pauper", label: "Pauper" },
  { key: "brawl", label: "Brawl" },
  { key: "historic", label: "Historic" },
  { key: "alchemy", label: "Alchemy" },
  { key: "timeless", label: "Timeless" },
  { key: "oathbreaker", label: "Oathbreaker" },
  { key: "penny", label: "Penny" },
];

// Retries a Scryfall request on 429, per the guide's backoff schedule.
async function scryfallFetch(url: string): Promise<Response> {
  const delaysMs = [0, 500, 1500, 3000];
  let response: Response | null = null;
  for (const delay of delaysMs) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    response = await fetch(url, { headers: { Accept: "application/json" } });
    if (response.status !== 429) return response;
  }
  return response!;
}

function normalizeCard(card: ScryfallCard, isSpanish: boolean): NormalizedCard {
  const facesSource: (ScryfallCard | ScryfallCardFace)[] =
    card.card_faces && card.card_faces.length > 0 ? card.card_faces : [card];

  const faces: NormalizedFace[] = facesSource.map((face) => ({
    name: face.name ?? card.name,
    displayName: (isSpanish && face.printed_name) || face.name || card.name,
    manaCost: face.mana_cost,
    typeLine:
      (isSpanish && face.printed_type_line) ||
      (isSpanish && face.type_line && translateTypeLineFallback(face.type_line)) ||
      face.type_line ||
      "",
    oracleText: (isSpanish && face.printed_text) || face.oracle_text,
    power: face.power,
    toughness: face.toughness,
    loyalty: face.loyalty,
    imageUrl: face.image_uris?.normal ?? card.image_uris?.normal,
  }));

  const legalities: NormalizedLegality[] = FORMAT_ORDER.filter(({ key }) => card.legalities?.[key]).map(
    ({ key, label }) => {
      const status = card.legalities![key];
      return { format: key, label, status, statusLabel: LEGALITY_LABELS[status] ?? status };
    }
  );

  return {
    id: card.id,
    oracleId: card.oracle_id,
    name: card.name,
    displayName: (isSpanish && card.printed_name) || card.name,
    isSpanish,
    faces,
    rarity: card.rarity ?? "common",
    rarityLabel: RARITY_LABELS[card.rarity ?? "common"] ?? card.rarity ?? "",
    setName: card.set_name,
    collectorNumber: card.collector_number,
    artist: card.artist ?? card.card_faces?.[0]?.artist,
    legalities,
    scryfallUrl: card.set && card.collector_number ? `https://scryfall.com/card/${card.set}/${card.collector_number}` : undefined,
  };
}

interface CacheEntry {
  card: NormalizedCard;
  cachedAt: number;
}
type CacheStore = Record<string, CacheEntry>;

function normalizeKey(name: string): string {
  return name.trim().toLowerCase();
}

function readCacheStore(): CacheStore {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheStore) : {};
  } catch {
    return {};
  }
}

function writeCacheStore(store: CacheStore): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch {
    // storage unavailable (private browsing, quota) — degrade to no cache
  }
}

function readCache(name: string): NormalizedCard | null {
  const entry = readCacheStore()[normalizeKey(name)];
  if (!entry || Date.now() - entry.cachedAt > CACHE_TTL_MS) return null;
  return entry.card;
}

function writeCache(name: string, card: NormalizedCard): void {
  const store = readCacheStore();
  store[normalizeKey(name)] = { card, cachedAt: Date.now() };
  writeCacheStore(store);
}

/** Lightweight as-you-type suggestions. Cheap enough to call on every debounced keystroke. */
export async function autocompleteCardName(query: string, signal?: AbortSignal): Promise<string[]> {
  if (query.trim().length < 2) return [];
  const response = await fetch(`${AUTOCOMPLETE_URL}?q=${encodeURIComponent(query)}`, { signal });
  if (!response.ok) return [];
  const json = (await response.json()) as ScryfallList<string>;
  return json.data ?? [];
}

/**
 * Resolves a card by name, preferring a Spanish-language print (so oracle text/type
 * line show in Spanish) and falling back to the English default when no Spanish print
 * exists. Checks localStorage first; every successful lookup is cached for 14 days.
 */
export async function fetchCardByName(rawName: string): Promise<NormalizedCard> {
  const name = rawName.trim();
  if (!name) throw new Error("Ingresá un nombre de carta.");

  const cached = readCache(name);
  if (cached) return cached;

  const esQuery = `!"${name}" lang:es`;
  const esResponse = await scryfallFetch(`${SEARCH_URL}?q=${encodeURIComponent(esQuery)}`);
  if (esResponse.ok) {
    const json = (await esResponse.json()) as ScryfallList<ScryfallCard>;
    if (json.data?.length) {
      const normalized = normalizeCard(json.data[0], true);
      writeCache(name, normalized);
      writeCache(normalized.name, normalized);
      return normalized;
    }
  }

  let enResponse = await scryfallFetch(`${NAMED_URL}?exact=${encodeURIComponent(name)}`);
  if (enResponse.status === 404) {
    enResponse = await scryfallFetch(`${NAMED_URL}?fuzzy=${encodeURIComponent(name)}`);
  }
  if (enResponse.status === 404) {
    throw new ScryfallNotFoundError(name);
  }
  if (!enResponse.ok) {
    throw new Error(`Scryfall respondió con error ${enResponse.status}.`);
  }

  const card = (await enResponse.json()) as ScryfallCard;
  const normalized = normalizeCard(card, false);
  writeCache(name, normalized);
  writeCache(normalized.name, normalized);
  return normalized;
}

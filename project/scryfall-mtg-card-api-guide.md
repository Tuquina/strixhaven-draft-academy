# Guía IA-friendly para obtener y mostrar cartas de Magic: The Gathering usando Scryfall

Última revisión: 2026-07-09  
Objetivo: permitir que una IA o un desarrollador implemente en una web app la función de cargar una decklist de Magic: The Gathering, resolver los nombres de las cartas, obtener sus datos e imágenes y mostrarlas en pantalla.

---

## 1. Resumen ejecutivo

Para una web app que necesita buscar y mostrar cartas de Magic: The Gathering, la opción recomendada es usar **Scryfall API**.

Scryfall ofrece una API REST pública para consultar cartas, imágenes, sets, símbolos de maná, legalidades, texto Oracle, tipos, colores, rareza, precios y datos bulk.

No se recomienda scrapear Gatherer ni páginas oficiales de Wizards. Wizards of the Coast tiene contenido oficial y políticas legales, pero para datos de cartas en aplicaciones fan/deckbuilders la opción práctica y ampliamente usada es Scryfall.

### Recomendación principal

Usar esta arquitectura:

```txt
Frontend
  └── Usuario pega decklist o escribe nombres de cartas
        ↓
Backend propio
  └── POST /api/decks/preview
        ↓
Parser de decklist
        ↓
Cliente Scryfall
        ↓
Cache local / base de datos
        ↓
Respuesta normalizada para renderizar cartas
```

Evitar que el frontend consulte directamente Scryfall carta por carta sin control. Es mejor centralizar las llamadas en el backend para poder cachear, deduplicar, controlar errores, respetar límites y mantener el modelo de datos estable.

---

## 2. Fuentes oficiales que debe consultar una IA

Usar estas URLs como fuente primaria de verdad:

### Scryfall

- Documentación principal de la API:  
  `https://scryfall.com/docs/api`

- Buscar carta exacta o aproximada por nombre:  
  `https://scryfall.com/docs/api/cards/named`

- Buscar muchas cartas a la vez por colección:  
  `https://scryfall.com/docs/api/cards/collection`

- Buscar cartas con query avanzada:  
  `https://scryfall.com/docs/api/cards/search`

- Card Objects / estructura de una carta:  
  `https://scryfall.com/docs/api/cards`

- Imágenes de cartas:  
  `https://scryfall.com/docs/api/images`

- Bulk Data:  
  `https://scryfall.com/docs/api/bulk-data`

- Rate limits:  
  `https://scryfall.com/docs/api/rate-limits`

- Términos de Scryfall:  
  `https://scryfall.com/docs/terms`

### Wizards of the Coast

- Fan Content Policy:  
  `https://company.wizards.com/en/legal/fancontentpolicy`

Usar esta política para entender cómo declarar que la aplicación no es oficial y cómo tratar imágenes, logos, marcas y propiedad intelectual de Wizards.

---

## 3. Casos de uso que debe cubrir la implementación

La función debería permitir:

1. El usuario pega una decklist.
2. El sistema parsea cantidad y nombre de cada carta.
3. El sistema deduplica nombres.
4. El backend consulta Scryfall.
5. El backend resuelve nombres ambiguos o no encontrados.
6. El backend devuelve un modelo normalizado.
7. El frontend muestra:
   - Nombre de la carta.
   - Cantidad.
   - Imagen.
   - Coste de maná.
   - Tipo.
   - Texto Oracle.
   - Colores.
   - Rareza.
   - Set.
   - Legalidades si son necesarias.

Ejemplo de entrada:

```txt
4 Lightning Bolt
4 Counterspell
2 Opt
1 Sol Ring
```

Ejemplo de salida esperada para frontend:

```json
{
  "cards": [
    {
      "quantity": 4,
      "name": "Lightning Bolt",
      "scryfallId": "...",
      "oracleId": "...",
      "manaCost": "{R}",
      "typeLine": "Instant",
      "oracleText": "Lightning Bolt deals 3 damage to any target.",
      "colors": ["R"],
      "imageUrl": "https://cards.scryfall.io/normal/...",
      "set": "...",
      "collectorNumber": "...",
      "rarity": "..."
    }
  ],
  "notFound": [],
  "warnings": []
}
```

---

## 4. Endpoints principales de Scryfall

### 4.1 Obtener una carta por nombre exacto

Usar cuando el usuario escribió un nombre exacto y se quiere una única carta.

```http
GET https://api.scryfall.com/cards/named?exact=Lightning%20Bolt
```

Ventajas:

- Simple.
- Útil para autocompletado o vista rápida.
- Menos ambiguo que una búsqueda general.

Desventajas:

- Una request por carta si se usa individualmente.
- No es ideal para resolver un mazo completo.

---

### 4.2 Obtener una carta por nombre aproximado

Usar cuando puede haber errores de tipeo.

```http
GET https://api.scryfall.com/cards/named?fuzzy=lightnig%20bolt
```

Ventajas:

- Tolera errores leves.
- Buena experiencia de usuario.

Desventajas:

- Puede resolver a una carta no deseada si el input es muy ambiguo.
- Conviene mostrar advertencia cuando se usó fuzzy matching.

---

### 4.3 Resolver muchas cartas de un mazo

Para decklists, este es el endpoint recomendado.

```http
POST https://api.scryfall.com/cards/collection
Content-Type: application/json

{
  "identifiers": [
    { "name": "Lightning Bolt" },
    { "name": "Counterspell" },
    { "name": "Opt" },
    { "name": "Sol Ring" }
  ]
}
```

Importante:

- Scryfall permite un máximo de **75 identificadores por request** en este endpoint.
- Si el mazo tiene más de 75 nombres únicos, dividir en batches.
- Una decklist puede tener más de 75 cartas totales, pero normalmente tiene menos de 75 nombres únicos si se deduplican antes.

Ejemplo:

```txt
Entrada total: 100 cartas
Nombres únicos: 48 cartas
Requests necesarias a /cards/collection: 1
```

---

### 4.4 Búsqueda avanzada

Usar para filtros, explorador de cartas o buscador avanzado.

```http
GET https://api.scryfall.com/cards/search?q=type%3Acreature%20color%3Duw
```

Ejemplos útiles de queries:

```txt
name:bolt
set:stx
color>=uw
id<=esper
format:commander
legal:modern
type:legendary type:creature
oracle:draw oracle:card
```

Para una app de torneos o decklists simples, no es obligatorio implementar búsqueda avanzada al principio.

---

### 4.5 Bulk Data

Usar Bulk Data si se quiere:

- Trabajar offline.
- Tener una copia local de muchas cartas.
- Evitar muchas llamadas HTTP.
- Hacer búsquedas internas muy rápidas.
- Construir un autocompletado local.

Documentación:

```txt
https://scryfall.com/docs/api/bulk-data
```

Estrategia recomendada para apps medianas/grandes:

```txt
Job programado cada 12 o 24 horas
  ↓
Descargar bulk data de Scryfall
  ↓
Guardar cartas normalizadas en DB propia
  ↓
Frontend/backend consultan DB propia
  ↓
Scryfall queda como fuente de sincronización, no como dependencia por cada request de usuario
```

Para una app chica, empezar con `/cards/collection` + cache es suficiente.

---

## 5. Rate limits y comportamiento responsable

Consultar siempre la página oficial:

```txt
https://scryfall.com/docs/api/rate-limits
```

Reglas prácticas de implementación:

1. No hacer una request por carta si se puede usar `/cards/collection`.
2. Deduplicar nombres antes de llamar a Scryfall.
3. Cachear resultados por `scryfallId`, `oracleId` y nombre normalizado.
4. Manejar `429 Too Many Requests`.
5. Implementar retry con backoff exponencial.
6. No hacer polling innecesario.
7. No descargar imágenes para rehostearlas salvo que haya una razón clara y se respeten términos/licencias.
8. Preferir usar las URLs de imagen provistas por Scryfall.

Ejemplo de política de retry:

```txt
Intento 1: request normal
Intento 2: esperar 500 ms
Intento 3: esperar 1500 ms
Intento 4: esperar 3000 ms
Si falla: devolver error controlado al usuario
```

---

## 6. Modelo de datos recomendado

### 6.1 Entidad Deck

```ts
export interface Deck {
  id: string;
  name: string;
  format?: string;
  cards: DeckCard[];
  createdAt: string;
  updatedAt: string;
}
```

### 6.2 Entidad DeckCard

```ts
export interface DeckCard {
  quantity: number;
  inputName: string;
  resolvedName: string;
  scryfallId: string;
  oracleId?: string;
  set?: string;
  collectorNumber?: string;
  imageUrl?: string;
  manaCost?: string;
  typeLine?: string;
  oracleText?: string;
  colors?: string[];
  colorIdentity?: string[];
  rarity?: string;
}
```

### 6.3 Cache de carta

```ts
export interface CachedMagicCard {
  scryfallId: string;
  oracleId?: string;
  name: string;
  normalizedName: string;
  manaCost?: string;
  cmc?: number;
  typeLine?: string;
  oracleText?: string;
  colors?: string[];
  colorIdentity?: string[];
  imageNormal?: string;
  imageSmall?: string;
  imageLarge?: string;
  set?: string;
  setName?: string;
  collectorNumber?: string;
  rarity?: string;
  legalities?: Record<string, string>;
  rawScryfall?: unknown;
  lastSyncedAt: string;
}
```

Recomendación:

- Guardar `scryfallId` para identificar una impresión específica.
- Guardar `oracleId` para agrupar distintas impresiones de la misma carta funcional.
- Guardar `rawScryfall` opcionalmente si se quiere evitar perder campos útiles para futuras features.
- No depender solamente del nombre como clave primaria.

---

## 7. Parser de decklist

Formato mínimo a soportar:

```txt
4 Lightning Bolt
2 Opt
1 Sol Ring
```

Formatos adicionales útiles:

```txt
4x Lightning Bolt
4 Lightning Bolt (STA) 42
1 Sol Ring # comentario
Sideboard
2 Negate
```

### Reglas recomendadas

1. Ignorar líneas vacías.
2. Ignorar comentarios que comiencen con `//` o `#`.
3. Detectar sección `Sideboard`.
4. Soportar cantidad con o sin `x`.
5. Remover metadata opcional como set y número si todavía no se va a usar.
6. Preservar el texto original para mostrar advertencias.

Ejemplo de parser en TypeScript:

```ts
/**
 * Representa una línea parseada de una decklist de Magic.
 */
export interface ParsedDeckLine {
  quantity: number;
  name: string;
  section: 'mainboard' | 'sideboard';
  originalLine: string;
}

/**
 * Parsea una decklist simple de Magic: The Gathering.
 *
 * Soporta formatos como:
 * - "4 Lightning Bolt"
 * - "4x Lightning Bolt"
 * - "Sideboard"
 * - Comentarios con "#" o "//"
 */
export function parseDeckList(deckList: string): ParsedDeckLine[] {
  const result: ParsedDeckLine[] = [];
  let currentSection: 'mainboard' | 'sideboard' = 'mainboard';

  const lines = deckList.split(/\r?\n/);

  for (const rawLine of lines) {
    const originalLine = rawLine;
    const line = rawLine.trim();

    if (!line || line.startsWith('#') || line.startsWith('//')) {
      continue;
    }

    if (/^sideboard:?$/i.test(line)) {
      currentSection = 'sideboard';
      continue;
    }

    const sanitizedLine = line
      .replace(/\s+#.*$/, '')
      .replace(/\s+\/\/.*$/, '')
      .trim();

    const match = sanitizedLine.match(/^(\d+)\s*x?\s+(.+)$/i);

    if (!match) {
      throw new Error(`Formato inválido en la línea: "${originalLine}"`);
    }

    const quantity = Number(match[1]);
    const name = match[2]
      .replace(/\s+\([A-Z0-9]{2,5}\)\s+\d+[a-z]?$/i, '')
      .trim();

    if (quantity <= 0) {
      throw new Error(`Cantidad inválida en la línea: "${originalLine}"`);
    }

    result.push({
      quantity,
      name,
      section: currentSection,
      originalLine,
    });
  }

  return result;
}
```

---

## 8. Cliente Scryfall recomendado

### 8.1 Resolución por colección

```ts
/**
 * Identificador aceptado por el endpoint /cards/collection de Scryfall.
 */
export interface ScryfallCollectionIdentifier {
  name?: string;
  id?: string;
  oracle_id?: string;
  set?: string;
  collector_number?: string;
}

/**
 * Resultado mínimo esperado desde Scryfall para el endpoint collection.
 */
export interface ScryfallCollectionResponse {
  object: 'list';
  data: ScryfallCard[];
  not_found: ScryfallCollectionIdentifier[];
}

/**
 * Representación parcial de una carta de Scryfall.
 * Agregar campos según necesidad de la app.
 */
export interface ScryfallCard {
  id: string;
  oracle_id?: string;
  name: string;
  mana_cost?: string;
  cmc?: number;
  type_line?: string;
  oracle_text?: string;
  colors?: string[];
  color_identity?: string[];
  rarity?: string;
  set?: string;
  set_name?: string;
  collector_number?: string;
  image_uris?: ScryfallImageUris;
  card_faces?: Array<{
    name: string;
    mana_cost?: string;
    type_line?: string;
    oracle_text?: string;
    image_uris?: ScryfallImageUris;
  }>;
  legalities?: Record<string, string>;
}

/**
 * URLs de imágenes provistas por Scryfall.
 */
export interface ScryfallImageUris {
  small?: string;
  normal?: string;
  large?: string;
  png?: string;
  art_crop?: string;
  border_crop?: string;
}

/**
 * Consulta cartas en Scryfall usando el endpoint de colección.
 *
 * Notas:
 * - El endpoint acepta hasta 75 identificadores por request.
 * - El caller debe dividir en batches si hay más de 75 nombres únicos.
 * - El caller debe cachear resultados para evitar requests repetidas.
 */
export async function fetchScryfallCollection(
  identifiers: ScryfallCollectionIdentifier[],
): Promise<ScryfallCollectionResponse> {
  if (identifiers.length === 0) {
    return {
      object: 'list',
      data: [],
      not_found: [],
    };
  }

  if (identifiers.length > 75) {
    throw new Error('Scryfall /cards/collection acepta como máximo 75 identificadores por request.');
  }

  const response = await fetch('https://api.scryfall.com/cards/collection', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifiers }),
  });

  if (response.status === 429) {
    throw new Error('Scryfall rate limit alcanzado. Reintentar con backoff.');
  }

  if (!response.ok) {
    throw new Error(`Error consultando Scryfall: HTTP ${response.status}`);
  }

  return response.json() as Promise<ScryfallCollectionResponse>;
}
```

---

## 9. Manejo de imágenes

Scryfall puede devolver imágenes en dos formas principales:

### Carta normal

```json
{
  "image_uris": {
    "small": "...",
    "normal": "...",
    "large": "...",
    "png": "...",
    "art_crop": "...",
    "border_crop": "..."
  }
}
```

### Carta de doble cara, split card o variantes similares

```json
{
  "card_faces": [
    {
      "name": "Face A",
      "image_uris": {
        "normal": "..."
      }
    },
    {
      "name": "Face B",
      "image_uris": {
        "normal": "..."
      }
    }
  ]
}
```

Función recomendada:

```ts
/**
 * Obtiene la mejor URL de imagen disponible para renderizar una carta.
 *
 * Soporta:
 * - Cartas normales con image_uris.
 * - Cartas de doble cara con card_faces[].image_uris.
 */
export function getPreferredCardImageUrl(card: ScryfallCard): string | null {
  if (card.image_uris?.normal) {
    return card.image_uris.normal;
  }

  const firstFaceImage = card.card_faces?.[0]?.image_uris?.normal;

  if (firstFaceImage) {
    return firstFaceImage;
  }

  return null;
}
```

Para mostrar doble cara correctamente:

```ts
/**
 * Obtiene todas las imágenes disponibles de una carta.
 * Útil para cartas transform, modal double-faced cards o split cards.
 */
export function getAllCardImageUrls(card: ScryfallCard): string[] {
  if (card.image_uris?.normal) {
    return [card.image_uris.normal];
  }

  return card.card_faces
    ?.map(face => face.image_uris?.normal)
    .filter((url): url is string => Boolean(url)) ?? [];
}
```

---

## 10. Flujo completo recomendado

```txt
1. Recibir decklist como texto.
2. Parsear líneas.
3. Validar cantidades.
4. Deduplicar nombres.
5. Buscar primero en cache local.
6. Para las cartas no cacheadas, llamar a Scryfall /cards/collection.
7. Guardar resultados encontrados en cache.
8. Combinar resultados con cantidades originales.
9. Devolver DTO normalizado al frontend.
10. Mostrar advertencias si hubo cartas no encontradas o resueltas de forma aproximada.
```

### DTO de respuesta recomendado

```ts
export interface DeckPreviewResponse {
  mainboard: ResolvedDeckCard[];
  sideboard: ResolvedDeckCard[];
  notFound: string[];
  warnings: string[];
}

export interface ResolvedDeckCard {
  quantity: number;
  inputName: string;
  name: string;
  scryfallId: string;
  oracleId?: string;
  manaCost?: string;
  typeLine?: string;
  oracleText?: string;
  colors?: string[];
  colorIdentity?: string[];
  imageUrls: string[];
  set?: string;
  setName?: string;
  collectorNumber?: string;
  rarity?: string;
}
```

---

## 11. Ejemplo de endpoint propio

```http
POST /api/decks/preview
Content-Type: application/json

{
  "deckList": "4 Lightning Bolt\n4 Counterspell\n2 Opt\n1 Sol Ring"
}
```

Respuesta:

```json
{
  "mainboard": [
    {
      "quantity": 4,
      "inputName": "Lightning Bolt",
      "name": "Lightning Bolt",
      "scryfallId": "...",
      "oracleId": "...",
      "manaCost": "{R}",
      "typeLine": "Instant",
      "oracleText": "Lightning Bolt deals 3 damage to any target.",
      "colors": ["R"],
      "colorIdentity": ["R"],
      "imageUrls": ["https://cards.scryfall.io/normal/..."]
    }
  ],
  "sideboard": [],
  "notFound": [],
  "warnings": []
}
```

---

## 12. Manejo de cartas no encontradas

Scryfall `/cards/collection` devuelve una sección `not_found` para identificadores no encontrados.

La app debería:

1. Mostrar la carta como no resuelta.
2. Permitir editar el nombre manualmente.
3. Opcionalmente hacer una búsqueda fuzzy individual.
4. No guardar el mazo como definitivo si hay cartas inválidas, salvo que la app permita mazos incompletos.

Ejemplo de advertencia:

```txt
No se encontró la carta "Lightnig Bolt". ¿Quisiste decir "Lightning Bolt"?
```

---

## 13. Manejo de ambigüedad: carta vs impresión

Magic tiene muchas reimpresiones. El mismo nombre puede existir en múltiples sets.

### Conceptos importantes

- `name`: nombre de la carta.
- `id`: ID de una impresión específica en Scryfall.
- `oracle_id`: ID funcional que agrupa impresiones equivalentes.
- `set`: código del set.
- `collector_number`: número de colección.

### Reglas recomendadas

Si el usuario solo escribe:

```txt
4 Lightning Bolt
```

Resolver por nombre y aceptar la impresión que Scryfall devuelva por defecto.

Si el usuario escribe:

```txt
4 Lightning Bolt (STA) 42
```

Intentar resolver por:

```json
{
  "set": "sta",
  "collector_number": "42"
}
```

Si la app no necesita impresión exacta, guardar igualmente `oracleId` y mostrar imagen de una impresión representativa.

---

## 14. Cache recomendado

### Cache mínima

Clave:

```txt
normalized-card-name
```

Valor:

```json
{
  "scryfallId": "...",
  "oracleId": "...",
  "name": "Lightning Bolt",
  "imageNormal": "...",
  "lastSyncedAt": "2026-07-09T00:00:00Z"
}
```

### Cache más robusta

Índices:

```txt
scryfallId
oracleId
normalizedName
set + collectorNumber
```

TTL sugerido:

```txt
Cartas normales: 7 a 30 días
Datos de legalidad: 1 a 7 días
Bulk sync: cada 12 a 24 horas
```

Para una app de torneo de amigos, una cache de 7 días es suficiente.

---

## 15. Consideraciones legales y atribución

Consultar siempre:

```txt
https://company.wizards.com/en/legal/fancontentpolicy
https://scryfall.com/docs/terms
```

### Disclaimer recomendado

Incluir en el footer o pantalla de créditos:

```txt
This app is unofficial Fan Content permitted under the Wizards of the Coast Fan Content Policy.
Not approved or endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast.
Card data and images are provided by Scryfall.
```

También se puede traducir al español:

```txt
Esta aplicación es Fan Content no oficial permitido bajo la Fan Content Policy de Wizards of the Coast.
No está aprobada ni respaldada por Wizards. Parte de los materiales utilizados son propiedad de Wizards of the Coast.
Los datos e imágenes de cartas son provistos por Scryfall.
```

### Reglas prácticas

1. No presentar la app como oficial.
2. No usar logos de Wizards como branding principal.
3. No remover avisos legales de las imágenes de cartas.
4. No deformar, recortar de forma engañosa ni tapar créditos de artista/copyright.
5. No vender cartas proxy ni representar imágenes como cartas imprimibles oficiales.
6. Revisar la política si la app será comercial, tendrá pagos, suscripciones o acceso restringido.

---

## 16. Checklist de implementación para una IA

Una IA que implemente esta función debe seguir estos pasos:

### Backend

- [ ] Crear endpoint `POST /api/decks/preview`.
- [ ] Recibir `{ deckList: string }`.
- [ ] Parsear líneas de la decklist.
- [ ] Separar mainboard y sideboard.
- [ ] Deduplicar nombres.
- [ ] Buscar cartas en cache.
- [ ] Consultar Scryfall `/cards/collection` para nombres faltantes.
- [ ] Dividir en batches de máximo 75 identificadores.
- [ ] Manejar `not_found`.
- [ ] Manejar errores HTTP y `429`.
- [ ] Guardar resultados en cache.
- [ ] Normalizar la respuesta.

### Frontend

- [ ] Crear textarea para pegar decklist.
- [ ] Enviar decklist al backend.
- [ ] Mostrar loading state.
- [ ] Mostrar cartas agrupadas por mainboard/sideboard.
- [ ] Mostrar imagen normal.
- [ ] Soportar cartas con múltiples caras.
- [ ] Mostrar cantidad.
- [ ] Mostrar errores de cartas no encontradas.
- [ ] Incluir footer de atribución.

### Calidad

- [ ] Tests unitarios para parser.
- [ ] Tests unitarios para normalización de cartas.
- [ ] Tests de errores de Scryfall.
- [ ] Tests para cartas de doble cara.
- [ ] Tests para decklist con sideboard.
- [ ] Tests para nombres duplicados.

---

## 17. Errores comunes a evitar

1. Hacer una request HTTP por cada línea del mazo.
2. No deduplicar nombres antes de llamar a Scryfall.
3. No manejar cartas de doble cara.
4. Asumir que todas las cartas tienen `image_uris` en la raíz.
5. Usar el nombre como único identificador persistente.
6. No manejar `not_found`.
7. No manejar rate limits.
8. No poner disclaimer de Fan Content.
9. Rehostear imágenes sin revisar términos.
10. Scrapear páginas HTML en vez de usar la API.

---

## 18. Versión mínima viable

Para una primera versión, implementar solo esto:

```txt
1. Textarea para pegar decklist.
2. Parser simple: "cantidad + nombre".
3. Endpoint backend /api/decks/preview.
4. Scryfall /cards/collection.
5. Mostrar nombre, cantidad e imagen.
6. Manejar cartas no encontradas.
7. Footer de atribución.
```

No implementar todavía:

```txt
- Precios.
- Legalidades.
- Compra de cartas.
- Ediciones exactas.
- Bulk data.
- Autocompletado avanzado.
- Sincronización local completa.
```

---

## 19. Roadmap sugerido

### Fase 1: Preview básico

- Pegar decklist.
- Resolver nombres.
- Mostrar imágenes.
- Mostrar errores.

### Fase 2: Guardado de mazos

- Guardar deck en DB.
- Guardar `scryfallId` y `oracleId`.
- Asociar deck a usuario o torneo.

### Fase 3: Mejor UX

- Autocompletado.
- Corrección fuzzy.
- Vista compacta/lista/grid.
- Cartas de doble cara con flip.

### Fase 4: Análisis de mazo

- Curva de maná.
- Distribución por colores.
- Tipos de carta.
- Rarezas.
- Legalidad por formato.

### Fase 5: Optimización

- Bulk data.
- Cache persistente.
- Job de sincronización.
- Búsqueda local.

---

## 20. Prompt recomendado para pedir implementación a una IA

Usar este prompt si se quiere que otra IA implemente la feature:

```txt
Implementa una feature para una web app de Magic: The Gathering que permita pegar una decklist, resolver las cartas usando Scryfall API y mostrarlas con imágenes.

Requisitos:
- Backend con endpoint POST /api/decks/preview.
- Input: { deckList: string }.
- Parsear líneas con formato "4 Lightning Bolt" y "4x Lightning Bolt".
- Soportar sección Sideboard.
- Deduplicar nombres antes de llamar a Scryfall.
- Usar POST https://api.scryfall.com/cards/collection.
- Dividir en batches de máximo 75 identificadores.
- Manejar cartas no encontradas.
- Manejar cartas normales y cartas con card_faces.
- Devolver DTO normalizado con quantity, name, scryfallId, oracleId, manaCost, typeLine, oracleText, colors, imageUrls, set, rarity.
- Agregar cache para no consultar repetidamente la misma carta.
- Manejar HTTP 429 con retry/backoff.
- Incluir disclaimer de Fan Content y atribución a Scryfall.
- Escribir código limpio, testeable y separado por responsabilidades.

Consultar estas fuentes:
- https://scryfall.com/docs/api
- https://scryfall.com/docs/api/cards/collection
- https://scryfall.com/docs/api/cards/named
- https://scryfall.com/docs/api/images
- https://scryfall.com/docs/api/rate-limits
- https://company.wizards.com/en/legal/fancontentpolicy
```

---

## 21. Decisión final

Para una web app de mazos de Magic, usar:

```txt
Scryfall API + backend propio + cache local
```

No usar scraping. No depender solamente del frontend. No guardar solo nombres. Guardar IDs de Scryfall y preparar el modelo para soportar cartas con múltiples caras, reimpresiones y cambios futuros.

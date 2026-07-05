# Strixhaven Draft Academy

_Started 2026-07-04 18:51 UTC_

---

## User

Create a polished, responsive, front-end web application for managing casual Magic: The Gathering draft tournaments themed around Strixhaven / Secrets of Strixhaven.

The application must be designed for a private group of friends who bought a Strixhaven booster box and want to draft, register players, track deck colors, generate round-robin pairings, enter results, view standings, and finalize tournaments.

The visual identity must feel like a magical university tournament dashboard: enchanted academy, parchment, spellbooks, ink, arcane geometry, glowing mana symbols, college banners, old library atmosphere, and a fantasy school-of-mages aesthetic. The design should be clearly inspired by Strixhaven’s magical academy concept, but do not copy official Magic artwork, official logos, exact card frames, or copyrighted illustrations. Use original fantasy-academy visuals, abstract magical motifs, and custom UI elements.

All visible UI text must be in Spanish, but the internal implementation, component names, comments, and structure may be in English.

The app title should be:

Strixhaven Draft Academy

Somewhere visible in the main header or footer, always include:

Hosted by Fernando Tuquina

Add a small disclaimer in the footer:

Fan-made casual tournament tracker. Not affiliated with Wizards of the Coast.

1. Product Goal

Build a local-first tournament manager for one or more casual Strixhaven draft tournaments.

The app must allow the user to:

Create multiple draft tournaments.
View current, active, and finished tournaments.
Open a tournament detail page.
Add players by name.
Assign deck colors to each player.
Automatically detect and display the MTG color combination name.
Highlight Strixhaven college names when the color pair matches a Strixhaven college.
Generate a round-robin schedule automatically.
Support odd player counts with a bye/free round.
Record match results.
Automatically calculate standings.
Show the current leader and full ranking table.
Finalize a tournament and show a final podium.

The target use case is casual play, especially 5 friends playing round robin, but the system should support any player count of 2 or more.

For UX guidance:

Show that 8 players is the most traditional draft pod size.
Show that 6 players is good.
Show that 5 players is valid for casual round robin, with one player resting each round.
Do not block 5-player tournaments.
2. Technical Scope

Create a single-page responsive web application.

Preferred implementation:

React
TypeScript
Tailwind CSS or equivalent utility-first styling
Local storage persistence
No backend required
No authentication required

The app must persist tournaments in browser local storage so that refreshing the page does not delete data.

The app should be cleanly structured with reusable components.

Suggested component structure:

App
TournamentDashboard
TournamentCard
CreateTournamentModal
TournamentDetailPage
TournamentHeader
PlayerRoster
PlayerForm
PlayerCard
ColorSelector
ColorCombinationBadge
RoundRobinSchedule
RoundCard
MatchCard
ResultModal
StandingsTable
FinalizeTournamentModal
PodiumSummary
EmptyState
ConfirmDialog

Use clear separation between:

UI components
tournament state
schedule generation logic
standings calculation logic
color-combination naming logic
3. Core Data Model

Use this conceptual model.

type TournamentStatus = "drafting" | "active" | "finished";

type ManaColor = "W" | "U" | "B" | "R" | "G";

type MatchStatus = "pending" | "completed" | "bye";

type MatchResult = {
  winnerPlayerId: string | null;
  isDraw: boolean;
  gamesPlayerA: number;
  gamesPlayerB: number;
};

type Player = {
  id: string;
  name: string;
  colors: ManaColor[];
  colorCombinationName: string;
  strixhavenCollegeName?: string;
  deckNotes?: string;
  createdAt: string;
};

type Match = {
  id: string;
  roundNumber: number;
  playerAId: string;
  playerBId: string | null;
  status: MatchStatus;
  result?: MatchResult;
};

type Round = {
  id: string;
  roundNumber: number;
  matches: Match[];
};

type Tournament = {
  id: string;
  name: string;
  host: "Fernando Tuquina";
  status: TournamentStatus;
  players: Player[];
  rounds: Round[];
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string;
};
4. Color Combination Rules

The app must let each player select one or more deck colors using clear mana-color chips.

Use these color labels in Spanish:

W = Blanco
U = Azul
B = Negro
R = Rojo
G = Verde

Do not rely only on color. Always show the letter and Spanish name for accessibility.

4.1 Mono-color names
W = Mono White / Mono Blanco
U = Mono Blue / Mono Azul
B = Mono Black / Mono Negro
R = Mono Red / Mono Rojo
G = Mono Green / Mono Verde
4.2 Two-color names

The app must normalize selected colors regardless of click order.

Two-color combinations:

WU = Azorius
UB = Dimir
BR = Rakdos
RG = Gruul
GW = Selesnya
WB = Orzhov / Silverquill
UR = Izzet / Prismari
BG = Golgari / Witherbloom
RW = Boros / Lorehold
GU = Simic / Quandrix

When a deck matches a Strixhaven college, the UI should prioritize the Strixhaven identity visually.

Examples:

White + Black should show: Silverquill — Orzhov
Blue + Red should show: Prismari — Izzet
Black + Green should show: Witherbloom — Golgari
Red + White should show: Lorehold — Boros
Green + Blue should show: Quandrix — Simic

For non-Strixhaven two-color pairs, show only the common MTG name:

Blue + White = Azorius
Red + Green = Gruul
Black + Red = Rakdos
4.3 Three-color names

Include support for three-color decks, even if two-color decks are recommended for draft.

WUB = Esper
UBR = Grixis
BRG = Jund
RGW = Naya
GWU = Bant
WBG = Abzan
URW = Jeskai
BGU = Sultai
RWB = Mardu
GUR = Temur

Important: if the user selects red, white, and black, show Mardu.

4.4 Four-color and five-color names

Four-color decks are rare in draft but should not break the UI.

Use practical names:

WUBR = Four-color, no Green
UBRG = Four-color, no White
BRGW = Four-color, no Blue
RGWU = Four-color, no Black
GWUB = Four-color, no Red
WUBRG = Five-color / WUBRG

If no colors are selected, show:

Sin colores definidos

5. Strixhaven College Visual Mapping

When a player’s deck matches a Strixhaven college, style the player card with that college’s theme.

Silverquill — White/Black

Spanish UI label:

Silverquill — Blanco/Negro

Visual style:

Ivory parchment
Black ink
Silver highlights
Elegant calligraphy strokes
Quill icon motif
Sophisticated, sharp, charismatic
Prismari — Blue/Red

Spanish UI label:

Prismari — Azul/Rojo

Visual style:

Sapphire blue
Crimson red
Electric arcane glow
Performance stage energy
Flame and water magic
Expressive, artistic, dramatic
Witherbloom — Black/Green

Spanish UI label:

Witherbloom — Negro/Verde

Visual style:

Deep green
Moss
Black shadows
Herbal potion motifs
Life/death alchemy
Swamp, roots, pest-like shapes
Lorehold — Red/White

Spanish UI label:

Lorehold — Rojo/Blanco

Visual style:

Warm sandstone
Ruby red
Antique gold
Archaeology, ruins, scrolls
Spirits and relics
Historical magical society feel
Quandrix — Green/Blue

Spanish UI label:

Quandrix — Verde/Azul

Visual style:

Emerald green
Teal blue
Mathematical glyphs
Fractal lines
Geometric runes
Academic, analytical, elegant
6. Tournament Flow
6.1 Dashboard

The dashboard must show:

Header:

App name: Strixhaven Draft Academy
Subtitle: Organizador casual de torneos Draft
Text: Hosted by Fernando Tuquina

Primary action:

Crear nuevo torneo

Tournament list sections:

Torneos activos
Torneos en preparación
Torneos finalizados

Each tournament card should show:

Tournament name
Status badge: Preparación / Activo / Finalizado
Number of players
Number of rounds
Current leader if active
Creation date
Button: Abrir torneo
Button: Finalizar if active
Button: Reabrir if finished, optional
Button: Eliminar, with confirmation

Empty state:

“Todavía no hay torneos. Creá tu primer draft de Strixhaven.”
6.2 Create Tournament

When creating a tournament, request:

Tournament name
Optional description
Match format:
Best of 3, default
Single game
Draws:
Disabled by default
Can be enabled if the group uses a time limit
Notes:
Optional free text

Default tournament name suggestion:

Draft de Strixhaven #1

After creation, redirect to the tournament detail page.

6.3 Tournament Detail Page

The page should have three main columns or sections depending on screen size:

Player roster
Round-robin pairings
Standings

On desktop:

Use a dashboard layout with cards.
Roster on the left.
Pairings in the center.
Standings on the right.

On mobile:

Use tabs:
Jugadores
Rondas
Tabla

Tournament header must show:

Tournament name
Status
Player count
Round count
Current leader
Hosted by Fernando Tuquina
Buttons:
Volver
Regenerar fixture
Finalizar torneo
7. Player Management

The roster section must allow adding players.

Player form fields:

Nombre del jugador
Colores del mazo
Notas del mazo, optional

Color selector:

Five selectable chips:
Blanco W
Azul U
Negro B
Rojo R
Verde G

After selecting colors, immediately show:

Combination name
Strixhaven college if applicable
Small visual preview badge

Examples:

Player: Pichi
Colors: Azul + Blanco
Output: Azorius
Player: Fernando
Colors: Verde + Rojo
Output: Gruul
Player: Ana
Colors: Blanco + Negro
Output: Silverquill — Orzhov
Player: Nico
Colors: Rojo + Blanco + Negro
Output: Mardu

Player cards must show:

Player name
Mana colors
Combination name
Strixhaven college banner if applicable
Deck notes if present
Edit button
Remove button

Validation:

Player name is required.
Duplicate names should show a warning, but do not necessarily block if the user confirms.
Colors are optional at first, but show “Sin colores definidos.”
At least 2 players are required to generate a tournament.
If fewer than 5 players, show a soft warning:
“Se puede jugar, pero para draft suele ser más divertido con 5, 6 u 8 personas.”
If exactly 5 players, show:
“Formato recomendado: round robin con una persona libre por ronda.”
If 8 players, show:
“Pod clásico ideal para draft.”

Roster locking:

Before any result is entered, players can be edited freely.
Once a match has a result, changing players should show a confirmation:
“Modificar jugadores puede regenerar el fixture y borrar resultados. ¿Continuar?”
Prefer not to delete results automatically without confirmation.
8. Round Robin Schedule Generation

Generate a complete round-robin schedule.

Algorithm:

Take all players.
If player count is odd, add a virtual BYE player.
Let n be the even number of participants including BYE if needed.
Total rounds = n - 1.
Matches per round = n / 2.
Use the circle method:
Keep the first participant fixed.
Pair first half against reversed second half.
Rotate all participants except the first after each round.
If a match contains BYE:
Display it as “Libre”
Do not count it as a match win
Do not award points by default, because in odd-player round robin every player receives one bye

For a 5-player tournament:

Generate 5 rounds.
Each round has 2 matches.
One player is free each round.
Every player plays 4 matches total.

The UI should call the schedule “fixture” or “rondas”, not necessarily “bracket”, because this is round robin.

Round card:

Title: Ronda 1, Ronda 2, etc.
Match rows:
Player A vs Player B
Result status
Button: Cargar resultado
Bye row:
“Libre: Player Name”
9. Result Entry

For each match, allow entering a result.

Default match format: best of 3.

Result modal fields:

Select winner:
Player A
Player B
Empate, only if draws are enabled
Select game score:
2–0
2–1
1–0, if single-game format
1–1, only if draws are enabled
Custom score, optional
Notes, optional

Rules:

If winner is Player A, gamesPlayerA must be greater than gamesPlayerB.
If winner is Player B, gamesPlayerB must be greater than gamesPlayerA.
If draw is selected, both players receive 1 point.
If no result is entered, the match remains pending.
Allow editing results after saving.

Casual scoring:

Match win = 3 points
Draw = 1 point
Loss = 0 points
Bye = 0 points by default

Display result examples:

Fernando ganó 2–1
Pichi ganó 2–0
Empate 1–1
Pendiente
10. Standings Calculation

The standings table must update automatically every time a result is saved.

Columns:

Posición
Jugador
Colores
Mazo
PJ = Partidos jugados
PG = Partidos ganados
PE = Partidos empatados
PP = Partidos perdidos
JG = Juegos ganados
JP = Juegos perdidos
Dif. = Game difference
Pts = Points

Ranking order:

Points descending
Match wins descending
Game win percentage descending
Game difference descending
Head-to-head result if only two players are tied
Player name alphabetical as final fallback

Highlight:

1st place with a golden magical border
2nd place with silver border
3rd place with bronze border

Show current leader above the table:

“Líder actual: Fernando — 9 pts”

If no results exist yet:

“Todavía no hay resultados cargados.”
11. Tournament Finalization

The user can finalize an active tournament.

When clicking Finalizar torneo, show confirmation:

“¿Querés finalizar este torneo? Podrás ver el podio y conservar los resultados.”

After finalization:

Status becomes Finalizado
Results remain visible
Roster remains visible
Fixture remains visible
Show final podium:
1st place
2nd place
3rd place
Show college/deck badges for podium players
Provide button:
Volver al panel
Reabrir torneo, optional

Final summary card:

Tournament name
Date
Total players
Total matches completed
Champion
Champion deck colors
Champion color combination name
Hosted by Fernando Tuquina
12. Visual Design Requirements

The app must feel premium, magical, and thematic.

Overall style:

Dark enchanted academy background
Parchment cards
Gold separators
Ink-like borders
Arcane glowing hover states
Subtle magical particles or glyphs
Decorative but readable

Do not make the UI too busy. Prioritize clarity because users will enter results during a real game night.

12.1 Color palette

Global colors:

Deep navy / dark academy blue
Dark emerald
Warm parchment
Antique gold
Ink black
Soft silver
Arcane violet accents

Suggested CSS variables:

--background-main: #101522;
--background-panel: #1A2133;
--parchment: #E9D8B4;
--parchment-dark: #C8AD7F;
--gold: #C89B3C;
--ink: #16120D;
--arcane-blue: #3FA7FF;
--arcane-violet: #9D6BFF;
--success-green: #4E9F3D;
--danger-red: #B74134;

Mana color visual chips:

White: warm ivory
Blue: arcane blue
Black: charcoal/ink
Red: ember red
Green: emerald green

Each chip must include both symbol letter and Spanish name.

12.2 Typography

Use:

Fantasy-academy heading font, such as Cinzel, Cormorant Garamond, or similar.
Clean readable body font, such as Inter, Source Sans, or system sans-serif.

Headings should feel like academy plaques or book titles.
Body text must remain highly readable.

12.3 Layout

Desktop:

Max-width centered layout
Dashboard cards grid
Tournament detail uses 3-column dashboard
Sticky tournament header if useful

Mobile:

Header compacts cleanly
Use tabs for Jugadores / Rondas / Tabla
Buttons must be large enough for touch
Result entry must be easy on a phone
12.4 UI Elements

Cards:

Rounded corners
Parchment or dark-glass effect
Thin gold borders
Subtle inner shadow

Buttons:

Primary button: gold magical CTA
Secondary button: dark academy style
Danger button: red but elegant
Hover states should glow softly

Badges:

Status badges
College badges
Color-combination badges
Leader badge

Animations:

Subtle hover glow
Soft fade-in for cards
Avoid heavy animations
Keep performance smooth
13. Required Spanish UI Copy

Use Spanish text in the interface.

Important labels:

Crear nuevo torneo
Torneos activos
Torneos en preparación
Torneos finalizados
Abrir torneo
Finalizar torneo
Reabrir torneo
Eliminar torneo
Jugadores
Agregar jugador
Nombre del jugador
Colores del mazo
Notas del mazo
Guardar jugador
Editar
Eliminar
Rondas
Ronda 1
Libre
Cargar resultado
Editar resultado
Pendiente
Completado
Tabla de posiciones
Líder actual
Partidos jugados
Partidos ganados
Empates
Partidos perdidos
Puntos
Campeón
Podio final
Hosted by Fernando Tuquina
14. Acceptance Criteria

The app is complete only if these scenarios work:

Scenario 1: Create tournament

Given no tournaments exist
When the user creates “Draft de Strixhaven #1”
Then the tournament appears in the dashboard
And the app navigates to the tournament detail page
And the header shows “Hosted by Fernando Tuquina”

Scenario 2: Add players and detect deck names

Given a tournament exists
When the user adds Pichi with colors Blue and White
Then the player card shows “Azorius”

When the user adds Fernando with colors Green and Red
Then the player card shows “Gruul”

When the user adds a player with White and Black
Then the player card shows “Silverquill — Orzhov”

When the user adds a player with Red, White, and Black
Then the player card shows “Mardu”

Scenario 3: Generate 5-player round robin

Given 5 players are added
When the schedule is generated
Then the app creates 5 rounds
And each round has 2 matches
And each round has 1 free player
And every player has exactly 1 bye/free round

Scenario 4: Enter results

Given a match exists
When the user enters Fernando wins 2–1
Then the match shows “Fernando ganó 2–1”
And Fernando receives 3 points
And the opponent receives 0 points
And the standings update immediately

Scenario 5: Standings

Given several results are entered
When the user opens the standings table
Then players are sorted by points
And ties are resolved by match wins, game win percentage, game difference, head-to-head, then name

Scenario 6: Finalize tournament

Given all matches are completed
When the user finalizes the tournament
Then the tournament status becomes Finalizado
And the final podium appears
And the dashboard shows the tournament under Torneos finalizados

15. Extra Nice-to-Have Features

Add these if possible:

Export tournament as JSON.
Import tournament from JSON.
Copy standings to clipboard as plain text.
Share summary text:
“Campeón del Draft de Strixhaven: Fernando con Gruul — Hosted by Fernando Tuquina.”
Confetti or magical sparkle animation when finalizing the tournament.
Small “draft tips” panel:
“Mazo recomendado: 40 cartas.”
“Base típica: 17 tierras y 23 hechizos.”
“Las tierras no básicas solo cuentan si las drafteaste.”
“En draft casual, 5 jugadores funciona bien con round robin.”
16. Final Design Direction

Make the final result feel like a magical academy scoreboard created for a private Strixhaven draft night.

It should be elegant, readable, fun, and practical.

The app should not feel like a generic sports bracket. It should feel like:

a tournament ledger from a wizard university,
a magical academic scoreboard,
a Strixhaven-inspired draft control panel,
a premium casual tool for friends playing Magic.

The final UI must clearly communicate:

Strixhaven Draft Academy
Hosted by Fernando Tuquina
Create tournaments, add players, assign deck colors, generate round-robin rounds, enter results, view standings, and crown the champion.

## Assistant

_[tool: set_project_title]_

_[tool: update_todos]_

Building the full tournament manager now — comprehensive DC with all features specified.

_[tool: dc_write]_

_[tool: update_todos]_

_[tool: ready_for_verification]_

## User

Check didn’t complete

## Assistant


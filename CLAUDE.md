# CLAUDE.md

Guidance for Claude Code (or any coding agent) working in this repository.

## What this repo is

**Strixhaven Draft Academy** — a local-first web app for a private group of friends to
run casual Magic: The Gathering draft tournaments (Strixhaven-themed). It handles player
registration, deck color tracking, round-robin pairing generation, result entry, standings,
and tournament finalization. UI copy is in Spanish; code/comments are in English.

## Repo layout

```
app/        The real implementation: React + TypeScript + Vite + Tailwind. Work happens here.
project/    Original Claude Design (claude.ai/design) export — HTML/CSS/JS prototype used
            as the visual/behavioral reference. Not production code, do not build features here.
chats/      Chat transcript(s) with the design assistant. Read chats/chat1.md for full product
            intent and decisions if requirements are ever unclear from the code alone.
README.md   Project overview.
```

`project/` and `chats/` are historical design source, kept for reference — treat them as
read-only unless the user explicitly asks to update the design bundle itself.

## Working in `app/`

- Stack: React 19, TypeScript, Vite, Tailwind CSS v4, oxlint.
- State/persistence: tournaments are managed client-side via `src/hooks/useTournaments.ts`
  and persisted through `src/lib/storage.ts` (local-first, no backend).
- Key domain types live in `src/types.ts` (`Tournament`, `Player`, `Round`, `Match`, ...).
- Structure: `src/components/dashboard` (tournament list/creation), `src/components/tournament`
  (in-tournament views: roster, schedule, standings, results), `src/components/shared`
  (generic UI primitives).
- Scheduling/standings/color logic is isolated in `src/lib/` (`rounds.ts`, `schedule.ts`,
  `standings.ts`, `colors.ts`) — keep pairing/scoring logic there, not in components.

### Commands (run from `app/`)

```
npm install
npm run dev       # start dev server
npm run build      # tsc -b && vite build
npm run lint        # oxlint
npm run preview      # preview production build
```

## Conventions

- Keep all user-facing strings in Spanish; identifiers, comments, and commit messages in English.
- Match the visual language already established (parchment/ink/arcane academy theme) — see
  `project/Strixhaven Draft Academy.dc.html` and `src/index.css` for the design tokens.
- Don't copy official Magic: The Gathering artwork, logos, or card frames — original/abstract
  fantasy-academy visuals only.

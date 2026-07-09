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
- State/persistence: tournaments are managed client-side via `src/hooks/useTournaments.ts`.
  `localStorage` (via `src/lib/storage.ts`) is always the source of truth and works fully
  offline; Supabase (via `src/lib/supabaseClient.ts` and `src/lib/cloudSync.ts`) is an
  optional sync layer on top — see "Cloud sync (Supabase)" below.
- Key domain types live in `src/types.ts` (`Tournament`, `Player`, `Round`, `Match`, ...).
- Structure: `src/components/dashboard` (tournament list/creation), `src/components/tournament`
  (in-tournament views: roster, schedule, standings, results), `src/components/shared`
  (generic UI primitives).
- Scheduling/standings/color logic is isolated in `src/lib/` (`rounds.ts`, `schedule.ts`,
  `standings.ts`, `colors.ts`) — keep pairing/scoring logic there, not in components.
- `src/components/shared/MatchTimerModal.tsx` (match countdown + optional chess-clock per-player
  timers, opened per-match from `MatchCard` or generally from `TournamentHeader`) is deliberately
  session-only local state — it's a live utility clock, not tournament data, so it isn't part of
  `Tournament`/`localStorage`/Supabase and resets on refresh.

### Cloud sync (Supabase)

- Project: `strixhaven-draft-academy` (org `Fernando-Personal`, region `sa-east-1`).
- Single table `public.tournaments` (`id text primary key`, `data jsonb`, `updated_at timestamptz`)
  — each row is one tournament stored whole as JSON, keyed by the same id the client generates.
  RLS is enabled with a permissive `anon` policy (no auth system in this app); don't copy that
  policy pattern onto a table with sensitive data.
- `src/lib/supabaseClient.ts` builds the client from `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` (see `.env.example`); if either is missing, `supabase` is `null` and
  the app runs local-only.
- `src/lib/cloudSync.ts` has the fetch/upsert/delete helpers plus `mergeTournaments`
  (last-write-wins per tournament by `updatedAt`), used once on load to reconcile local vs. cloud.
- `useTournaments` writes to `localStorage` synchronously on every change (never blocked by the
  network) and separately fires cloud upserts/deletes, exposing a `syncStatus`
  (`disabled | syncing | synced | offline`) shown in the dashboard header.

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
- Match the visual language already established (parchment/gold/verdant arcane academy theme).
  The design system is documented in `app/DESIGN_SYSTEM.md`: color/font tokens live in
  `app/src/index.css` (`@theme`), composed class recipes (gradient text, panels, buttons,
  headings) in `app/src/lib/designSystem.ts`. Build new UI from those — never hardcode hex
  colors in components; violet/blue arcana are decorative-only (confetti/orbs), not UI chrome.

### Use of official Wizards of the Coast artwork/documents

The app's background (`public/backgrounds/strixhaven-academy.jpg`) is official Wizards of the
Coast concept art, and `public/rules/magic-guia-inicio-rapido.pdf` is the official Magic: The
Gathering Quick Start Guide (embedded read-only in `RulebookPage.tsx` via `<iframe>`), both used
under Wizards'
[Fan Content Policy](https://company.wizards.com/es/legal/fancontentpolicy) — the user (host of
this private, free, non-commercial fan project) explicitly opted into this. That policy requires:
- The app stays free with no paywall, subscription, or ad/payment gate of any kind.
- The exact attribution notice in `src/lib/legal.ts` (`FAN_CONTENT_NOTICE`) stays visible in the
  footer of every page — don't reword or drop it.
- Any copyright/artist notices baked into an incorporated asset (e.g. the watermark in the
  background image) must not be cropped out or edited away.
- Don't add official Wizards logos (Magic logo, Planeswalker symbol, real mana
  symbols) as UI elements — those need separate
  written permission the policy doesn't grant. The app's mana-color badges are original,
  custom-drawn UI, not the official symbols — keep it that way.

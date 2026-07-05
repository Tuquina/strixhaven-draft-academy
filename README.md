# Strixhaven Draft Academy

A local-first web app for running casual Magic: The Gathering draft tournaments with a
private group of friends, themed around Strixhaven. It handles player registration, deck
color tracking (with Strixhaven college detection), automatic round-robin pairing, result
entry, live standings, and tournament finalization with a final podium.

Hosted by Fernando Tuquina. Strixhaven Draft Academy is unofficial fan content permitted under
Wizards of the Coast's [Fan Content Policy](https://company.wizards.com/es/legal/fancontentpolicy);
it is not approved or endorsed by Wizards. Some materials used are property of Wizards of the
Coast. ©Wizards of the Coast LLC.

## Repository structure

```
app/        Production app: React + TypeScript + Vite + Tailwind CSS. This is what runs.
project/    Original Claude Design (claude.ai/design) export — the HTML/CSS/JS prototype
            used as the design reference for app/. Kept for historical/visual reference.
chats/      Design chat transcript(s) documenting the product requirements and decisions.
```

See [CLAUDE.md](CLAUDE.md) for details on working in this codebase.

## Getting started

```bash
cd app
npm install
npm run dev
```

Then open the printed local URL in your browser.

Other useful commands (run from `app/`):

```bash
npm run build     # type-check and build for production
npm run lint       # run oxlint
npm run preview     # preview the production build locally
```

### Cloud sync (optional)

Tournaments are always saved to the browser's `localStorage` first, so the app works fully
offline. If you also want them backed up/synced through Supabase, copy `app/.env.example` to
`app/.env` and fill in your Supabase project's URL and anon key (Project Settings > API). Without
those set, the app simply stays in local-only mode — nothing else changes.

## Features

- Create and manage multiple draft tournaments.
- Register players and assign their deck colors; automatically shows the MTG color
  combination and highlights the matching Strixhaven college.
- Generate a round-robin schedule automatically, with bye/free-round support for odd
  player counts.
- Enter match results and see standings update automatically.
- Finalize a tournament to lock it in and reveal the final podium.
- Import/export tournaments as JSON.

## Design origin

The visual design was created in Claude Design and is preserved in
[`project/Strixhaven Draft Academy.dc.html`](project/Strixhaven%20Draft%20Academy.dc.html),
with the full design conversation in [`chats/chat1.md`](chats/chat1.md).

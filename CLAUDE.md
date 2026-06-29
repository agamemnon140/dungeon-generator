# dungeon

Procedural **D&D 5e dungeon generator** — a local React + TypeScript + Vite web app.
From a few inputs (environment, party level/size, dungeon size, difficulty, seed, tone,
objective, topology) it generates a **map** (node-link diagram), a **room/encounter list**,
and a **connecting story** (premise, antagonist = boss monster, clue chain, resolution).
Everything is procedural and deterministic from the seed.

## Development

> ⚠️ This repo lives on **Google Drive** (`G:\Meu Drive\Claude\dungeon`), which **cannot host
> `node_modules`** (its virtual filesystem breaks `npm install` and rejects junctions/symlinks).

The code stays on Drive (synced, source of truth). Builds/tests run from a **local mirror**:

- Mirror: `C:\Users\Henrique\Documents\Claude\Dungeon`
- The mirror's `src/` and `public/` are **directory junctions** back to the Drive folder, so
  editing files here (or via the IDE on Drive) edits the same files. `node_modules` is real and
  local to the mirror.
- Root config files (`package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`) are
  **copies** in the mirror. **If you change one on Drive, copy it to the mirror** before building.
- `vite.config.ts` sets `resolve.preserveSymlinks: true` so Vite keeps the mirror's paths and
  resolves `node_modules` locally (without it, junctions resolve back to `G:\` and fail).

Run everything from the mirror:

```sh
cd "C:\Users\Henrique\Documents\Claude\Dungeon"
npm run dev        # Vite dev server (http://localhost:5173)
npm run test       # Vitest (pure generation logic)
npm run build      # tsc -b && vite build
npm run vendor:srd # re-vendor SRD monster/item JSON (network)
```

## Architecture (three seams)

- **Model ↔ Renderer** — `src/domain` graph model is renderer-agnostic; `src/render` has the
  `DungeonRenderer` interface (SVG node-link today; a tile/battlemap renderer plugs in later).
- **Generation ↔ Narrative** — `src/narrative` `NarrativeGenerator` interface produces a
  structured `NarrativeSpec`. `TemplateNarrativeGenerator` (grammars) fills it now; an LLM impl
  fills the same shape later. Map/encounter code never imports narrative.
- **Determinism boundary** — all randomness flows through `src/rng` (seeded mulberry32 + per-room
  sub-seeds); never `Math.random` in generation. This is what makes seeds reproducible and
  single-room re-roll possible.

Pipeline (`src/generation/pipeline.ts`): topology → room typing → encounters (DMG XP-budget) →
hazards (traps/treasure/puzzles) → narrative. SRD 5.1 data is vendored under `src/data/srd`.

## Agent skills

### Issue tracker

Issues and PRDs are tracked as GitHub issues via the `gh` CLI. External PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

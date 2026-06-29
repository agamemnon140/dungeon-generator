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

## Deployment

- Repo: **https://github.com/agamemnon140/dungeon-generator**
- Live (GitHub Pages): **https://agamemnon140.github.io/dungeon-generator/** — installable as a PWA
  (Safari → Share → Add to Home Screen) with the red-dragon icon.
- Pages serves the **`gh-pages` branch** (root). The available token lacks the `workflow` scope, so
  GitHub Actions deploy isn't used; an Actions workflow is kept as
  `docs/github-pages-deploy.yml.reference` for when a workflow-scoped token is available.
- Vite `base` is `/dungeon-generator/` in build mode (root in dev) — keep this in sync with the repo
  name if it ever changes, or the Pages asset paths break.

**Redeploy** after changes (build in the mirror, then publish `dist` to `gh-pages` via a local
worktree so Google Drive isn't churned):

```sh
# 1) build (from the mirror)
cd "C:\Users\Henrique\Documents\Claude\Dungeon" && npm run build
# 2) publish (from the Drive repo, in Git Bash)
cd "/g/Meu Drive/Claude/dungeon"
git worktree add -B gh-pages /c/Users/Henrique/Documents/Claude/ghpages
git -C /c/Users/Henrique/Documents/Claude/ghpages rm -rf . >/dev/null 2>&1
cp -r /c/Users/Henrique/Documents/Claude/Dungeon/dist/. /c/Users/Henrique/Documents/Claude/ghpages/
touch /c/Users/Henrique/Documents/Claude/ghpages/.nojekyll
git -C /c/Users/Henrique/Documents/Claude/ghpages add -A
git -C /c/Users/Henrique/Documents/Claude/ghpages commit -q -m "Deploy"
git -C /c/Users/Henrique/Documents/Claude/ghpages push origin gh-pages
git worktree remove /c/Users/Henrique/Documents/Claude/ghpages --force
```

App icons are generated from `public/icon.svg` with `node --preserve-symlinks --preserve-symlinks-main
scripts/make-icons.mjs` (requires `sharp`, a local-only devDependency in the mirror).

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

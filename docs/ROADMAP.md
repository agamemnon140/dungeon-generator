# Roadmap — post-MVP

The MVP is complete: procedural generation (topology → rooms → DMG encounters → hazards →
narrative), SRD 5.1 data, SVG map, save/load, single-room re-roll, printable sheet, and a PWA
(red-dragon icon) installable on iOS/Android. This is the backlog of what comes next.

## Architecture-ready (the seams are already in place)

- **LLM narrative layer** — swap `TemplateNarrativeGenerator` for an `LlmNarrativeGenerator`
  behind the existing `NarrativeGenerator` interface. Same `NarrativeSpec` shape; richer premise,
  clues, and per-room prose. Needs a tiny serverless proxy to keep the API key off the client.
  (Map/encounter code is untouched — this is the whole point of the seam.)
- **Tile / battlemap renderer** — add a `TileGridRenderer` implementing `DungeonRenderer` over the
  same `DungeonGraph`: place rooms on a square grid, draw corridors/doors, export a table-ready
  battlemap. Selectable alongside the node diagram.

## Content & generation quality

- Per-room prose for **combat rooms** (currently only flavor/clue rooms get description).
- **Faction / twist** narrative tier (conflicting factions, a third-act reveal).
- Encounter shapes: themed minion squads, ambushes, elite/solo tuning, mixed-CR bands.
- Boss flair: legendary actions / lair actions / regional effects from the SRD.
- Expand the curated **environment → monster-type** table; optional 2024 SRD data set.
- Traps: more templates, environment-specific hazards, skill-check scaffolding.
- Treasure: full DMG hoard tables, art objects & gems, attunement notes.

## Inputs & UX

- **JSON export / import** (deferred from MVP) and shareable seed links.
- Re-roll the **boss / whole narrative** (today boss re-roll is disabled to keep the story
  consistent — would re-run the narrative spec).
- Edit-in-place: rename rooms, nudge monster counts, lock a room against re-roll.
- Map interactions: zoom/pan, draggable nodes, connection-kind legend.
- Adventure sheet polish: paginated room layout, separate GM vs. player versions.
- Encounter knobs: target XP per room, monster-count caps, per-room difficulty override.

## Platform & distribution

- **Deploy** (GitHub Pages / Vercel / Netlify) → a real URL → installable PWA on iPhone.
- **Offline support** via a service worker so the installed app works with no network.
- Optional native shell (Capacitor / Tauri) if a store presence is wanted beyond a PWA.
- CI: typecheck + tests on every push.

## Engineering

- Revisit the Drive + local-mirror workflow once a git remote is in place (could move fully local).
- UI smoke/component tests; accessibility pass.

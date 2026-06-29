# Attribution

## Monsters — Open5e

Monster data is sourced from the [Open5e API](https://open5e.com/) (`/v1/monsters`), which
aggregates openly-licensed 5e bestiaries. The data is trimmed to a combat-essential subset and
de-duplicated by name by `scripts/vendor-srd.mjs`; the source document is recorded on each monster
(shown in its stat block) and the full source list is in `src/data/srd/meta.json`.

These documents are published under open licenses — the **Open Game License v1.0a (OGL)**, the
**Creative Commons Attribution 4.0 license (CC-BY-4.0)**, and/or the **ORC License** — including
the WotC SRD (5.1 / 5.2), Kobold Press's _Tome of Beasts_, _Creature Codex_, and _Tome of Beasts 2_,
the _Black Flag SRD_ (Kobold Press), and the _Level Up: Advanced 5e_ SRD, among others. Each
document remains the property of its respective copyright holder; this project redistributes the
trimmed data under those same open licenses. See https://open5e.com/legal for Open5e's license
details and the per-document license URLs returned by the API.

## D&D 5e SRD 5.1

This application includes monster, item, and rules data derived from the
**Systems Reference Document 5.1 ("SRD 5.1")** by Wizards of the Coast LLC.

The SRD 5.1 is licensed under the
[Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/legalcode)
(CC-BY-4.0).

> _"This work includes material taken from the System Reference Document 5.1
> ("SRD 5.1") by Wizards of the Coast LLC and available at
> https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is
> licensed under the Creative Commons Attribution 4.0 International License
> available at https://creativecommons.org/licenses/by/4.0/legalcode."_

### Data source

The structured JSON used to seed `src/data/srd/` is sourced from the
[`5e-bits/5e-database`](https://github.com/5e-bits/5e-database) project
(the dataset behind the D&D 5e API), specifically the `src/2014/` files which
correspond to SRD 5.1. The data is trimmed to a combat-essential subset by
`scripts/vendor-srd.mjs`; the upstream commit SHA is pinned in that script.

## This project

The dungeon-generation algorithms, narrative templates, and application code are
original work and are not covered by the SRD license.

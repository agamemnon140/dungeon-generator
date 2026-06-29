# Attribution

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

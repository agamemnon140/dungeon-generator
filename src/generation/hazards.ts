import type { DungeonInputs } from '../domain/inputs';
import type { DungeonGraph } from '../domain/graph';
import { mulberry32, deriveSubSeed } from '../rng';
import { rollTrap } from '../data/tables/traps';
import { rollTreasure } from '../data/tables/treasure';
import { rollPuzzle } from '../data/tables/puzzles';

/**
 * Stage 4 — fill trap / treasure / puzzle rooms with tier-appropriate content.
 * Each room draws from its own sub-seed so a single room can be re-rolled later
 * without disturbing the others.
 */
export function assignHazards(graph: DungeonGraph, inputs: DungeonInputs): void {
  for (const room of graph.rooms) {
    const content = room.content;
    switch (content.type) {
      case 'trap':
        content.trap = rollTrap(mulberry32(deriveSubSeed(room.subSeed, 'trap')), inputs.partyLevel);
        break;
      case 'treasure':
        content.loot = rollTreasure(mulberry32(deriveSubSeed(room.subSeed, 'treasure')), inputs.partyLevel);
        break;
      case 'puzzle':
        content.puzzle = rollPuzzle(mulberry32(deriveSubSeed(room.subSeed, 'puzzle')));
        break;
      default:
        break;
    }
  }
}

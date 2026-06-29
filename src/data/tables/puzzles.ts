import type { PuzzleSpec } from '../../domain/content';
import type { Rng } from '../../rng';
import { pickOne } from '../../rng';

const PUZZLE_TEMPLATES: PuzzleSpec[] = [
  {
    name: 'The Weighing Plates',
    description: 'Three pressure plates must be pressed in order of increasing weight, hinted by faded murals.',
    solution: 'Feather, coin, then anvil — read the murals left to right.',
  },
  {
    name: 'Riddle of the Sealed Door',
    description: 'An inscribed door asks: "I speak without a mouth and hear without ears. What am I?"',
    solution: 'An echo — speak the word aloud into the chamber.',
  },
  {
    name: 'The Constellation Lock',
    description: 'Rotating rings on the wall depict stars; the door opens when a hidden constellation is aligned.',
    solution: 'Match the pattern etched on the floor beneath the dust.',
  },
  {
    name: 'Elemental Braziers',
    description: 'Four braziers must be lit in the correct elemental sequence or the room floods with gas.',
    solution: 'Air, fire, earth, water — following the carved seasonal wheel.',
  },
  {
    name: 'The Mirrored Glyphs',
    description: 'Glyphs only make sense when reflected; a tarnished mirror lies nearby.',
    solution: 'Use the mirror to read the reversed command word.',
  },
  {
    name: 'Tile Bridge',
    description: 'A floor of runed tiles; stepping on the wrong glyph triggers a fall.',
    solution: 'Only tread tiles bearing the sigil shown on the entry arch.',
  },
];

export function rollPuzzle(rng: Rng): PuzzleSpec {
  return pickOne(rng, PUZZLE_TEMPLATES);
}

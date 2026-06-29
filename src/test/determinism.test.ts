import { describe, it, expect } from 'vitest';
import { generateDungeon } from '../generation';
import { makeInputs } from './helpers';

describe('determinism', () => {
  it('same inputs produce a deep-equal dungeon', () => {
    const inputs = makeInputs({ seed: 'reproducible', roomCount: 11, topology: 'web' });
    const a = generateDungeon(inputs);
    const b = generateDungeon(inputs);
    expect(a).toEqual(b);
  });

  it('different seeds produce different dungeons', () => {
    const a = generateDungeon(makeInputs({ seed: 'alpha', roomCount: 11 }));
    const b = generateDungeon(makeInputs({ seed: 'beta', roomCount: 11 }));
    expect(a).not.toEqual(b);
  });

  it('changing the room count changes the dungeon', () => {
    const a = generateDungeon(makeInputs({ seed: 'same', roomCount: 8 }));
    const b = generateDungeon(makeInputs({ seed: 'same', roomCount: 9 }));
    expect(a.graph.rooms.length).not.toBe(b.graph.rooms.length);
  });

  it('an empty seed falls back to a stable default', () => {
    const a = generateDungeon(makeInputs({ seed: '' }));
    const b = generateDungeon(makeInputs({ seed: '   ' }));
    expect(a.rootSeed).toBe(b.rootSeed);
  });
});

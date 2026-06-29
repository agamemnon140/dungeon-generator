import { describe, it, expect } from 'vitest';
import { generateDungeon } from '../generation';
import { makeInputs } from './helpers';

describe('room content', () => {
  it('fills traps, treasure, and puzzles with concrete specs', () => {
    // Sweep several seeds so every content kind shows up at least once.
    let sawTrap = false;
    let sawTreasure = false;
    let sawPuzzle = false;

    for (let i = 0; i < 10; i++) {
      const d = generateDungeon(makeInputs({ roomCount: 24, partyLevel: 8, seed: `content-${i}` }));
      for (const room of d.graph.rooms) {
        const c = room.content;
        if (c.type === 'trap') {
          sawTrap = true;
          expect(c.trap.name).not.toBe('');
          expect(c.trap.damage).toMatch(/d10/);
          expect(c.trap.detectDC).toBeGreaterThan(0);
        }
        if (c.type === 'treasure') {
          sawTreasure = true;
          expect(c.loot.gp).toBeGreaterThanOrEqual(0);
          expect(Array.isArray(c.loot.items)).toBe(true);
        }
        if (c.type === 'puzzle') {
          sawPuzzle = true;
          expect(c.puzzle.name).not.toBe('');
          expect(c.puzzle.solution).not.toBe('');
        }
      }
    }

    expect(sawTrap).toBe(true);
    expect(sawTreasure).toBe(true);
    expect(sawPuzzle).toBe(true);
  });

  it('higher tiers can yield magic items in treasure', () => {
    let foundItem = false;
    for (let i = 0; i < 12 && !foundItem; i++) {
      const d = generateDungeon(makeInputs({ roomCount: 24, partyLevel: 18, seed: `loot-${i}` }));
      foundItem = d.graph.rooms.some((r) => r.content.type === 'treasure' && r.content.loot.items.length > 0);
    }
    expect(foundItem).toBe(true);
  });
});

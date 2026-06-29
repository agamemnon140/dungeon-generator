import { describe, it, expect } from 'vitest';
import { generateDungeon } from '../generation';
import { buildAdjacency } from '../domain/graph';
import { makeInputs } from './helpers';

describe('room typing', () => {
  it('has exactly one entrance and one boss, matching the graph ids', () => {
    const d = generateDungeon(makeInputs({ roomCount: 14, seed: 'typing' }));
    const entrances = d.graph.rooms.filter((r) => r.kind === 'entrance');
    const bosses = d.graph.rooms.filter((r) => r.kind === 'boss');
    expect(entrances).toHaveLength(1);
    expect(bosses).toHaveLength(1);
    expect(entrances[0].id).toBe(d.graph.entranceId);
    expect(bosses[0].id).toBe(d.graph.bossId);
  });

  it('never places two trap rooms adjacent to each other', () => {
    const adjCheck = (seed: string): void => {
      const d = generateDungeon(makeInputs({ roomCount: 22, seed, difficulty: 'hard' }));
      const adj = buildAdjacency(d.graph);
      const kindOf = new Map(d.graph.rooms.map((r) => [r.id, r.kind]));
      for (const r of d.graph.rooms) {
        if (r.kind !== 'trap') continue;
        for (const nb of adj.get(r.id) ?? []) {
          expect(kindOf.get(nb)).not.toBe('trap');
        }
      }
    };
    for (const seed of ['a', 'b', 'c', 'd', 'e']) adjCheck(seed);
  });

  it('reserves at least one flavor room for clues', () => {
    const d = generateDungeon(makeInputs({ roomCount: 16, seed: 'flavor' }));
    expect(d.graph.rooms.some((r) => r.kind === 'empty')).toBe(true);
  });

  it('deadly difficulty yields more combat rooms than easy on average', () => {
    const countCombat = (difficulty: 'easy' | 'deadly'): number => {
      let total = 0;
      for (let i = 0; i < 20; i++) {
        const d = generateDungeon(makeInputs({ roomCount: 20, difficulty, seed: `mix-${i}` }));
        total += d.graph.rooms.filter((r) => r.kind === 'combat').length;
      }
      return total;
    };
    expect(countCombat('deadly')).toBeGreaterThan(countCombat('easy'));
  });
});

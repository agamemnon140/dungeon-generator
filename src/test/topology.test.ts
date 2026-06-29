import { describe, it, expect } from 'vitest';
import type { Topology } from '../domain/inputs';
import { generateDungeon } from '../generation';
import { makeInputs, reachableCount } from './helpers';

const TOPOLOGIES: Topology[] = ['linear', 'branching', 'web', 'cyclic'];
const SIZES = [3, 4, 7, 12, 25];

describe('topology', () => {
  for (const topology of TOPOLOGIES) {
    for (const roomCount of SIZES) {
      it(`${topology} @ ${roomCount} rooms is fully connected`, () => {
        const d = generateDungeon(makeInputs({ topology, roomCount, seed: `t-${topology}-${roomCount}` }));
        expect(d.graph.rooms).toHaveLength(roomCount);
        expect(reachableCount(d.graph)).toBe(roomCount);
      });
    }
  }

  it('entrance is r0 and boss is the deepest reachable room', () => {
    const d = generateDungeon(makeInputs({ topology: 'branching', roomCount: 14, seed: 'boss-depth' }));
    expect(d.graph.entranceId).toBe('r0');
    const maxDepth = Math.max(...d.graph.rooms.map((r) => r.depth));
    const boss = d.graph.rooms.find((r) => r.id === d.graph.bossId)!;
    expect(boss.depth).toBe(maxDepth);
    expect(boss.kind).toBe('boss');
  });

  it('linear and branching are trees (N-1 edges); web/cyclic add edges', () => {
    const n = 12;
    const linear = generateDungeon(makeInputs({ topology: 'linear', roomCount: n, seed: 's' }));
    const branching = generateDungeon(makeInputs({ topology: 'branching', roomCount: n, seed: 's' }));
    const web = generateDungeon(makeInputs({ topology: 'web', roomCount: n, seed: 's' }));
    const cyclic = generateDungeon(makeInputs({ topology: 'cyclic', roomCount: n, seed: 's' }));

    expect(linear.graph.connections).toHaveLength(n - 1);
    expect(branching.graph.connections).toHaveLength(n - 1);
    expect(web.graph.connections.length).toBeGreaterThan(n - 1);
    expect(cyclic.graph.connections.length).toBeGreaterThan(n - 1);
  });

  it('web/cyclic degrade to a connected tree when too small (N<4)', () => {
    const web = generateDungeon(makeInputs({ topology: 'web', roomCount: 3, seed: 'tiny' }));
    expect(reachableCount(web.graph)).toBe(3);
    expect(web.graph.connections).toHaveLength(2);
  });
});

import { describe, it, expect } from 'vitest';
import type { Topology } from '../domain/inputs';
import { generateDungeon } from '../generation';
import { tileLayout, type TileRoom } from '../render/tile/tileLayout';
import { makeInputs } from './helpers';

function overlap(a: TileRoom, b: TileRoom): boolean {
  return a.gx < b.gx + b.w && b.gx < a.gx + a.w && a.gy < b.gy + b.h && b.gy < a.gy + a.h;
}

describe('tile layout', () => {
  const topologies: Topology[] = ['linear', 'branching', 'web', 'cyclic'];

  for (const topology of topologies) {
    it(`${topology}: rooms never overlap and every connection has a corridor`, () => {
      const d = generateDungeon(makeInputs({ topology, roomCount: 16, seed: `tile-${topology}` }));
      const layout = tileLayout(d.graph);

      expect(layout.rooms).toHaveLength(d.graph.rooms.length);
      expect(layout.corridors).toHaveLength(d.graph.connections.length);
      expect(layout.cols).toBeGreaterThan(0);
      expect(layout.rows).toBeGreaterThan(0);

      for (let i = 0; i < layout.rooms.length; i++) {
        for (let j = i + 1; j < layout.rooms.length; j++) {
          expect(overlap(layout.rooms[i], layout.rooms[j])).toBe(false);
        }
      }
    });
  }

  it('is deterministic for a fixed seed', () => {
    const d = generateDungeon(makeInputs({ seed: 'tile-det', roomCount: 12 }));
    expect(tileLayout(d.graph)).toEqual(tileLayout(d.graph));
  });
});

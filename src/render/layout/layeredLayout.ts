import type { DungeonGraph } from '../../domain/graph';
import { buildAdjacency } from '../../domain/graph';

export interface Point {
  x: number;
  y: number;
}

export interface LayoutResult {
  /** Center position of each room, keyed by room id. */
  positions: Record<string, Point>;
  width: number;
  height: number;
}

export const NODE_W = 132;
export const NODE_H = 60;
const COL_GAP = 168;
const ROW_GAP = 128;
const MARGIN = 48;

/**
 * Deterministic top-down layered layout. Rooms are placed by their BFS distance
 * from the entrance (one row per layer), centered horizontally. No randomness —
 * the same graph always lays out identically, which keeps the map print-stable.
 */
export function layeredLayout(graph: DungeonGraph): LayoutResult {
  const adj = buildAdjacency(graph);

  const layer = new Map<string, number>();
  const queue = [graph.entranceId];
  layer.set(graph.entranceId, 0);
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head];
    for (const v of adj.get(u) ?? []) {
      if (!layer.has(v)) {
        layer.set(v, (layer.get(u) ?? 0) + 1);
        queue.push(v);
      }
    }
  }

  // Place any unreached rooms (shouldn't happen by construction) on a final row.
  let maxLayer = 0;
  for (const l of layer.values()) maxLayer = Math.max(maxLayer, l);
  for (const r of graph.rooms) {
    if (!layer.has(r.id)) layer.set(r.id, maxLayer + 1);
  }
  maxLayer = Math.max(...layer.values());

  // Group rooms by layer, preserving room order for stable within-row placement.
  const byLayer: string[][] = Array.from({ length: maxLayer + 1 }, () => []);
  for (const r of graph.rooms) byLayer[layer.get(r.id)!].push(r.id);

  const maxCount = Math.max(1, ...byLayer.map((row) => row.length));
  const rowWidth = (maxCount - 1) * COL_GAP;

  const positions: Record<string, Point> = {};
  byLayer.forEach((row, l) => {
    const offset = (rowWidth - (row.length - 1) * COL_GAP) / 2;
    row.forEach((id, i) => {
      positions[id] = {
        x: MARGIN + NODE_W / 2 + offset + i * COL_GAP,
        y: MARGIN + NODE_H / 2 + l * ROW_GAP,
      };
    });
  });

  return {
    positions,
    width: MARGIN * 2 + NODE_W + rowWidth,
    height: MARGIN * 2 + NODE_H + maxLayer * ROW_GAP,
  };
}

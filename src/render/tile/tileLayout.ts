import type { DungeonGraph, RoomKind, ConnectionKind } from '../../domain/graph';
import { buildAdjacency } from '../../domain/graph';
import { mulberry32 } from '../../rng';

export interface Cell {
  x: number;
  y: number;
}

export interface TileRoom {
  id: string;
  kind: RoomKind;
  label: string;
  /** Top-left cell and size, in grid cells (one cell = 5 ft). */
  gx: number;
  gy: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

export interface TileCorridor {
  id: string;
  kind: ConnectionKind;
  cells: Cell[];
  doors: Cell[];
}

export interface TileLayout {
  rooms: TileRoom[];
  corridors: TileCorridor[];
  cols: number;
  rows: number;
}

const COL_GAP = 3;
const ROW_GAP = 3;
const MARGIN = 1;

function roomSize(kind: RoomKind, subSeed: number): { w: number; h: number } {
  const r = mulberry32((subSeed ^ 0x9e3779b1) >>> 0);
  if (kind === 'boss') return { w: 6 + r.int(3), h: 6 + r.int(2) };
  if (kind === 'entrance') return { w: 4, h: 4 };
  return { w: 4 + r.int(3), h: 3 + r.int(3) };
}

function bfsLayers(graph: DungeonGraph): string[][] {
  const adj = buildAdjacency(graph);
  const layer = new Map<string, number>([[graph.entranceId, 0]]);
  const queue = [graph.entranceId];
  for (let head = 0; head < queue.length; head++) {
    for (const v of adj.get(queue[head]) ?? []) {
      if (!layer.has(v)) {
        layer.set(v, (layer.get(queue[head]) ?? 0) + 1);
        queue.push(v);
      }
    }
  }
  let maxLayer = 0;
  for (const l of layer.values()) maxLayer = Math.max(maxLayer, l);
  for (const r of graph.rooms) if (!layer.has(r.id)) layer.set(r.id, maxLayer + 1);
  maxLayer = Math.max(...layer.values());

  const layers: string[][] = Array.from({ length: maxLayer + 1 }, () => []);
  for (const r of graph.rooms) layers[layer.get(r.id)!].push(r.id);
  return layers;
}

function inside(room: TileRoom, x: number, y: number): boolean {
  return x >= room.gx && x < room.gx + room.w && y >= room.gy && y < room.gy + room.h;
}

/** L-shaped Manhattan path of unit cells between two centers. */
function lPath(ax: number, ay: number, bx: number, by: number): Cell[] {
  const cells: Cell[] = [];
  const vh = Math.abs(by - ay) >= Math.abs(bx - ax);
  const step = (a: number, b: number): number[] => {
    const out: number[] = [];
    const d = a <= b ? 1 : -1;
    for (let v = a; v !== b + d; v += d) out.push(v);
    return out;
  };
  if (vh) {
    for (const y of step(ay, by)) cells.push({ x: ax, y });
    for (const x of step(ax, bx)) cells.push({ x, y: by });
  } else {
    for (const x of step(ax, bx)) cells.push({ x, y: ay });
    for (const y of step(ay, by)) cells.push({ x: bx, y });
  }
  return cells;
}

/**
 * Lay the dungeon graph out on a square-cell grid: rooms become rectangles
 * placed by BFS layer, connections become L-shaped corridors spanning the gap
 * between rooms. Pure and deterministic (sizes come from each room's sub-seed).
 */
export function tileLayout(graph: DungeonGraph): TileLayout {
  const layers = bfsLayers(graph);
  const sizes = new Map<string, { w: number; h: number }>();
  for (const r of graph.rooms) sizes.set(r.id, roomSize(r.kind, r.subSeed));

  const maxW = Math.max(...[...sizes.values()].map((s) => s.w));
  const maxH = Math.max(...[...sizes.values()].map((s) => s.h));
  const slotW = maxW + COL_GAP;
  const slotH = maxH + ROW_GAP;
  const maxCount = Math.max(1, ...layers.map((l) => l.length));
  const mapCols = maxCount * slotW;

  const roomById = new Map(graph.rooms.map((r) => [r.id, r]));
  const rooms: TileRoom[] = [];
  layers.forEach((layerIds, L) => {
    const startX = MARGIN + Math.floor((mapCols - layerIds.length * slotW) / 2);
    layerIds.forEach((id, i) => {
      const r = roomById.get(id)!;
      const { w, h } = sizes.get(id)!;
      const gx = startX + i * slotW + Math.floor((slotW - w) / 2);
      const gy = MARGIN + L * slotH + Math.floor((maxH - h) / 2);
      rooms.push({ id, kind: r.kind, label: r.label, gx, gy, w, h, cx: gx + (w >> 1), cy: gy + (h >> 1) });
    });
  });

  const roomRect = new Map(rooms.map((r) => [r.id, r]));
  const corridors: TileCorridor[] = graph.connections.map((c) => {
    const a = roomRect.get(c.from)!;
    const b = roomRect.get(c.to)!;
    const path = lPath(a.cx, a.cy, b.cx, b.cy);
    // Keep only the part of the path outside both endpoint rooms (spans the gap).
    const cells = path.filter((p) => !inside(a, p.x, p.y) && !inside(b, p.x, p.y));
    const doors = cells.filter(
      (p) =>
        inside(a, p.x - 1, p.y) || inside(a, p.x + 1, p.y) || inside(a, p.x, p.y - 1) || inside(a, p.x, p.y + 1) ||
        inside(b, p.x - 1, p.y) || inside(b, p.x + 1, p.y) || inside(b, p.x, p.y - 1) || inside(b, p.x, p.y + 1),
    );
    return { id: c.id, kind: c.kind, cells, doors };
  });

  let cols = 0;
  let rows = 0;
  for (const r of rooms) {
    cols = Math.max(cols, r.gx + r.w);
    rows = Math.max(rows, r.gy + r.h);
  }
  for (const c of corridors) {
    for (const cell of c.cells) {
      cols = Math.max(cols, cell.x + 1);
      rows = Math.max(rows, cell.y + 1);
    }
  }

  return { rooms, corridors, cols: cols + MARGIN, rows: rows + MARGIN };
}

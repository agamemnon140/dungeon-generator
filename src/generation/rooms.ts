import type { DungeonInputs, Environment, Difficulty } from '../domain/inputs';
import type { DungeonGraph, Room, RoomKind, Connection } from '../domain/graph';
import type { RoomContent } from '../domain/content';
import type { Skeleton } from './topology';
import { mulberry32, pickOne, pickWeighted, deriveSubSeed } from '../rng';
import type { Rng, Weighted } from '../rng';
import { ROOM_ADJECTIVES, NOUNS_BY_ENV } from '../data/labels';

export function makeLabel(env: Environment, kind: RoomKind, rng: Rng): string {
  const noun = pickOne(rng, NOUNS_BY_ENV[env]);
  const adj = pickOne(rng, ROOM_ADJECTIVES);
  if (kind === 'entrance') return `Entrance — ${noun}`;
  if (kind === 'boss') return `Lair — ${adj} ${noun}`;
  return `${adj} ${noun}`;
}

/** Placeholder content; encounters (F3) and hazards (F4) fill the real specs. */
export function freshContent(kind: RoomKind): RoomContent {
  switch (kind) {
    case 'entrance':
      return { type: 'entrance', flavor: '' };
    case 'boss':
      return { type: 'boss', objectivePayoff: '' };
    case 'combat':
      return { type: 'combat', theme: '' };
    case 'trap':
      return { type: 'trap', trap: { name: '', detectDC: 0, disarmDC: 0, effect: '' } };
    case 'treasure':
      return { type: 'treasure', loot: { cp: 0, sp: 0, gp: 0, items: [] } };
    case 'puzzle':
      return { type: 'puzzle', puzzle: { name: '', description: '', solution: '' } };
    case 'empty':
      return { type: 'empty', flavor: '' };
  }
}

type ContentKind = 'combat' | 'trap' | 'treasure' | 'puzzle' | 'empty';

const COMBAT_WEIGHT_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 3.0,
  medium: 3.5,
  hard: 4.2,
  deadly: 5.0,
};

function baseWeights(difficulty: Difficulty): Record<ContentKind, number> {
  return {
    combat: COMBAT_WEIGHT_BY_DIFFICULTY[difficulty],
    empty: 2.0,
    treasure: 1.5,
    trap: 1.2,
    puzzle: 1.0,
  };
}

function adjacencyOf(connections: Connection[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  const add = (a: string, b: string): void => {
    const list = adj.get(a);
    if (list) list.push(b);
    else adj.set(a, [b]);
  };
  for (const c of connections) {
    add(c.from, c.to);
    add(c.to, c.from);
  }
  return adj;
}

function bfsOrder(skeleton: Skeleton, adj: Map<string, string[]>): string[] {
  const order: string[] = [];
  const seen = new Set<string>([skeleton.entranceId]);
  const queue = [skeleton.entranceId];
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head];
    order.push(u);
    for (const v of adj.get(u) ?? []) {
      if (!seen.has(v)) {
        seen.add(v);
        queue.push(v);
      }
    }
  }
  // Include any unreached nodes for completeness.
  for (const n of skeleton.nodes) if (!seen.has(n.id)) order.push(n.id);
  return order;
}

/**
 * Stage 2 — assign a kind to every room. Entrance and boss are forced; the rest
 * are drawn from a difficulty-weighted distribution, with structural rules:
 *  - a minimum number of flavor rooms is reserved (homes for the clue chain),
 *  - no two trap rooms are adjacent,
 *  - treasure is biased to sit behind combat/trap rooms (reward gating).
 */
function assignKinds(skeleton: Skeleton, inputs: DungeonInputs, rng: Rng): Map<string, RoomKind> {
  const kinds = new Map<string, RoomKind>();
  kinds.set(skeleton.entranceId, 'entrance');
  kinds.set(skeleton.bossId, 'boss');

  const adj = adjacencyOf(skeleton.connections);
  const others = skeleton.nodes.filter(
    (n) => n.id !== skeleton.entranceId && n.id !== skeleton.bossId,
  );

  // Reserve flavor rooms for clues, spread across depth so they pace the dungeon.
  const reserveCount = Math.min(others.length, Math.max(1, Math.floor(skeleton.nodes.length / 5)));
  const byDepth = [...others].sort((a, b) => a.depth - b.depth || (a.id < b.id ? -1 : 1));
  const reserved = new Set<string>();
  for (let k = 0; k < reserveCount && byDepth.length > 0; k++) {
    const idx = Math.min(byDepth.length - 1, Math.floor(((k + 0.5) / reserveCount) * byDepth.length));
    reserved.add(byDepth[idx].id);
  }

  for (const id of bfsOrder(skeleton, adj)) {
    if (id === skeleton.entranceId || id === skeleton.bossId) continue;
    if (reserved.has(id)) {
      kinds.set(id, 'empty');
      continue;
    }
    const neighbors = adj.get(id) ?? [];
    const nearTrap = neighbors.some((nb) => kinds.get(nb) === 'trap');
    const nearCombatOrTrap = neighbors.some((nb) => {
      const k = kinds.get(nb);
      return k === 'combat' || k === 'trap';
    });

    const w = baseWeights(inputs.difficulty);
    if (nearTrap) w.trap = 0; // no adjacent traps
    if (nearCombatOrTrap) w.treasure *= 2; // reward gating

    const weighted: Weighted<ContentKind>[] = (Object.keys(w) as ContentKind[]).map((item) => ({
      item,
      weight: w[item],
    }));
    kinds.set(id, pickWeighted(rng, weighted));
  }

  return kinds;
}

/** Stage 2 — turn the structural skeleton into typed rooms. */
export function populateRooms(
  skeleton: Skeleton,
  inputs: DungeonInputs,
  rootSeed: number,
  rng: Rng,
): DungeonGraph {
  const kinds = assignKinds(skeleton, inputs, rng);

  const rooms: Room[] = skeleton.nodes.map((node) => {
    const kind = kinds.get(node.id)!;
    const subSeed = deriveSubSeed(rootSeed, node.id);
    const labelRng = mulberry32(subSeed);
    return {
      id: node.id,
      kind,
      label: makeLabel(inputs.environment, kind, labelRng),
      content: freshContent(kind),
      depth: node.depth,
      subSeed,
      rerollCount: 0,
    };
  });

  return {
    rooms,
    connections: skeleton.connections,
    entranceId: skeleton.entranceId,
    bossId: skeleton.bossId,
  };
}

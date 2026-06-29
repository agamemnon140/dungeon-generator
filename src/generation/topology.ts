import type { DungeonInputs, Topology } from '../domain/inputs';
import { clampRoomCount } from '../domain/inputs';
import type { Connection, ConnectionKind } from '../domain/graph';
import type { Rng } from '../rng';
import { pickWeighted } from '../rng';

/** Bare structural graph produced by stage 1, before rooms are typed. */
export interface SkeletonNode {
  id: string;
  /** Shortest-path distance from the entrance (BFS over final edges). */
  depth: number;
}

export interface Skeleton {
  nodes: SkeletonNode[];
  connections: Connection[];
  entranceId: string;
  bossId: string;
}

const nodeId = (i: number): string => `r${i}`;
const edgeKey = (a: number, b: number): string => (a < b ? `${a}-${b}` : `${b}-${a}`);

/** web/cyclic need a few nodes to be meaningful; otherwise degrade to branching. */
export function effectiveTopology(t: Topology, n: number): Topology {
  if ((t === 'web' || t === 'cyclic') && n < 4) return 'branching';
  return t;
}

function pickTreeKind(rng: Rng): ConnectionKind {
  return pickWeighted(rng, [
    { item: 'passage' as const, weight: 5 },
    { item: 'door' as const, weight: 4 },
    { item: 'locked' as const, weight: 1 },
  ]);
}

function pickExtraKind(rng: Rng): ConnectionKind {
  return pickWeighted(rng, [
    { item: 'passage' as const, weight: 5 },
    { item: 'secret' as const, weight: 4 },
    { item: 'door' as const, weight: 1 },
  ]);
}

function bfsDepths(n: number, adj: number[][], start: number): number[] {
  const depth = new Array<number>(n).fill(-1);
  const queue = [start];
  depth[start] = 0;
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head];
    for (const v of adj[u]) {
      if (depth[v] === -1) {
        depth[v] = depth[u] + 1;
        queue.push(v);
      }
    }
  }
  // Disconnected nodes (shouldn't happen by construction) fall back to a large depth.
  for (let i = 0; i < n; i++) if (depth[i] === -1) depth[i] = n;
  return depth;
}

/**
 * Stage 1 — build a connected graph of N rooms for the requested topology.
 * Always starts from a spanning tree, so connectivity is guaranteed; extra
 * edges only add redundancy (web) or loops (cyclic).
 */
export function buildSkeleton(inputs: DungeonInputs, rng: Rng): Skeleton {
  const n = clampRoomCount(inputs.roomCount);
  const topology = effectiveTopology(inputs.topology, n);

  // Spanning tree: every node i>0 attaches to an earlier node.
  const parent = new Array<number>(n).fill(-1);
  const treeDepth = new Array<number>(n).fill(0);
  for (let i = 1; i < n; i++) {
    const p = topology === 'linear' ? i - 1 : rng.int(i);
    parent[i] = p;
    treeDepth[i] = treeDepth[p] + 1;
  }

  const edges: { a: number; b: number; kind: ConnectionKind }[] = [];
  const seen = new Set<string>();
  const addEdge = (a: number, b: number, kind: ConnectionKind): void => {
    if (a === b) return;
    const key = edgeKey(a, b);
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ a, b, kind });
  };

  for (let i = 1; i < n; i++) addEdge(parent[i], i, pickTreeKind(rng));

  // Extra edges by topology.
  if (topology === 'web') {
    const extra = Math.floor(n / 3);
    let attempts = 0;
    let added = 0;
    while (added < extra && attempts < extra * 8) {
      attempts++;
      const a = rng.int(n);
      const b = rng.int(n);
      if (a === b || seen.has(edgeKey(a, b))) continue;
      addEdge(a, b, pickExtraKind(rng));
      added++;
    }
  } else if (topology === 'cyclic') {
    const loops = Math.max(1, Math.floor(n / 4));
    let attempts = 0;
    let added = 0;
    while (added < loops && attempts < loops * 12) {
      attempts++;
      const i = 1 + rng.int(n - 1);
      const j = rng.int(n);
      // Close a loop: connect to a strictly-shallower node that isn't the parent.
      if (treeDepth[j] >= treeDepth[i] - 1 || j === parent[i] || seen.has(edgeKey(i, j))) continue;
      addEdge(i, j, pickExtraKind(rng));
      added++;
    }
  }

  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const e of edges) {
    adj[e.a].push(e.b);
    adj[e.b].push(e.a);
  }

  const depth = bfsDepths(n, adj, 0);

  // Boss sits at the end of the longest path from the entrance.
  let bossIdx = 0;
  for (let i = 1; i < n; i++) {
    if (depth[i] > depth[bossIdx] || (depth[i] === depth[bossIdx] && i > bossIdx)) {
      bossIdx = i;
    }
  }

  const nodes: SkeletonNode[] = Array.from({ length: n }, (_, i) => ({
    id: nodeId(i),
    depth: depth[i],
  }));

  const connections: Connection[] = edges.map((e, i) => ({
    id: `c${i}`,
    from: nodeId(e.a),
    to: nodeId(e.b),
    kind: e.kind,
  }));

  return {
    nodes,
    connections,
    entranceId: nodeId(0),
    bossId: nodeId(bossIdx),
  };
}

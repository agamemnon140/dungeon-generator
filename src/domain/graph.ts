import type { RoomContent } from './content';
import type { Encounter } from './encounter';

export type RoomKind =
  | 'entrance'
  | 'boss'
  | 'combat'
  | 'trap'
  | 'treasure'
  | 'puzzle'
  | 'empty';

export interface Room {
  /** Stable id, e.g. "r0". Also used as the namespace for the room's sub-seed. */
  id: string;
  kind: RoomKind;
  label: string;
  content: RoomContent;
  /** Present iff kind is 'combat' or 'boss'. */
  encounter?: Encounter;
  narrative?: { description: string; clueId?: string };
  /** Shortest-path distance (in rooms) from the entrance. */
  depth: number;
  /** Frozen at creation; re-rolling a room derives a fresh one from this room's id. */
  subSeed: number;
  /** How many times this room has been individually re-rolled. */
  rerollCount: number;
}

export type ConnectionKind = 'passage' | 'door' | 'secret' | 'locked';

export interface Connection {
  id: string;
  from: string;
  to: string;
  kind: ConnectionKind;
}

export interface DungeonGraph {
  rooms: Room[];
  connections: Connection[];
  entranceId: string;
  bossId: string;
}

export function roomById(graph: DungeonGraph, id: string): Room | undefined {
  return graph.rooms.find((r) => r.id === id);
}

/** Adjacency map (undirected) keyed by room id. */
export function buildAdjacency(graph: DungeonGraph): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const r of graph.rooms) adj.set(r.id, []);
  for (const c of graph.connections) {
    adj.get(c.from)?.push(c.to);
    adj.get(c.to)?.push(c.from);
  }
  return adj;
}

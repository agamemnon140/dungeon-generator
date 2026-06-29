/** Discriminated union describing what a room actually contains. */

export interface TrapSpec {
  name: string;
  /** Passive Perception / check DC to notice the trap. */
  detectDC: number;
  /** DC to disarm or avoid it (e.g. Thieves' Tools / Dexterity). */
  disarmDC: number;
  effect: string;
  /** Damage expression, e.g. "3d6 piercing". Omitted for non-damaging traps. */
  damage?: string;
}

export interface LootSpec {
  cp: number;
  sp: number;
  gp: number;
  /** Names of items (mundane or magic) found here. */
  items: string[];
}

export interface PuzzleSpec {
  name: string;
  description: string;
  solution: string;
}

export type RoomContent =
  | { type: 'entrance'; flavor: string }
  | { type: 'boss'; objectivePayoff: string }
  | { type: 'combat'; theme: string }
  | { type: 'trap'; trap: TrapSpec }
  | { type: 'treasure'; loot: LootSpec }
  | { type: 'puzzle'; puzzle: PuzzleSpec }
  | { type: 'empty'; flavor: string };

/** User-facing generation parameters. The whole pipeline is a pure function of these + the seed. */

export type Environment =
  | 'cave'
  | 'crypt'
  | 'ruined-castle'
  | 'sewer'
  | 'temple'
  | 'mine'
  | 'dungeon'
  | 'forest-ruins'
  | 'frozen'
  | 'volcanic'
  | 'desert-tomb'
  | 'sunken-ruins'
  | 'astral-plane'
  | 'airship';

export type Tone = 'grim' | 'heroic' | 'comic' | 'mysterious';
export type Objective = 'rescue' | 'retrieve-artifact' | 'eliminate-threat' | 'explore';
export type Topology = 'linear' | 'branching' | 'web' | 'cyclic';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'deadly';

export interface DungeonInputs {
  /** Human-typeable seed; hashed to a uint32 for the PRNG. */
  seed: string;
  environment: Environment;
  /** Average party character level, 1–20. */
  partyLevel: number;
  /** Number of player characters. */
  partySize: number;
  /** Number of rooms in the dungeon, 3–25. */
  roomCount: number;
  difficulty: Difficulty;
  tone: Tone;
  objective: Objective;
  topology: Topology;
}

export const ROOM_COUNT_MIN = 3;
export const ROOM_COUNT_MAX = 25;
export const PARTY_LEVEL_MIN = 1;
export const PARTY_LEVEL_MAX = 20;
export const PARTY_SIZE_MIN = 1;
export const PARTY_SIZE_MAX = 8;

export interface Option<T extends string> {
  value: T;
  label: string;
}

export const ENVIRONMENTS: Option<Environment>[] = [
  { value: 'cave', label: 'Cave' },
  { value: 'crypt', label: 'Crypt' },
  { value: 'ruined-castle', label: 'Ruined Castle' },
  { value: 'sewer', label: 'Sewer' },
  { value: 'temple', label: 'Temple' },
  { value: 'mine', label: 'Mine' },
  { value: 'dungeon', label: 'Dungeon / Prison' },
  { value: 'forest-ruins', label: 'Forest Ruins' },
  { value: 'frozen', label: 'Frozen Cavern' },
  { value: 'volcanic', label: 'Volcanic Depths' },
  { value: 'desert-tomb', label: 'Desert Tomb' },
  { value: 'sunken-ruins', label: 'Sunken Ruins' },
  { value: 'astral-plane', label: 'Astral Plane' },
  { value: 'airship', label: 'Airship' },
];

export const TONES: Option<Tone>[] = [
  { value: 'grim', label: 'Grim' },
  { value: 'heroic', label: 'Heroic' },
  { value: 'comic', label: 'Comic' },
  { value: 'mysterious', label: 'Mysterious' },
];

export const OBJECTIVES: Option<Objective>[] = [
  { value: 'rescue', label: 'Rescue someone' },
  { value: 'retrieve-artifact', label: 'Retrieve an artifact' },
  { value: 'eliminate-threat', label: 'Eliminate a threat' },
  { value: 'explore', label: 'Explore the unknown' },
];

export const TOPOLOGIES: Option<Topology>[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'branching', label: 'Branching' },
  { value: 'web', label: 'Web' },
  { value: 'cyclic', label: 'Cyclic' },
];

export const DIFFICULTIES: Option<Difficulty>[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'deadly', label: 'Deadly' },
];

export function clampRoomCount(n: number): number {
  return Math.max(ROOM_COUNT_MIN, Math.min(ROOM_COUNT_MAX, Math.round(n)));
}

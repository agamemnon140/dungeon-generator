import monstersJson from './monsters.json';
import magicItemsJson from './magic-items.json';

export type MonsterType =
  | 'aberration'
  | 'beast'
  | 'celestial'
  | 'construct'
  | 'dragon'
  | 'elemental'
  | 'fey'
  | 'fiend'
  | 'giant'
  | 'humanoid'
  | 'monstrosity'
  | 'ooze'
  | 'plant'
  | 'undead'
  | 'swarm';

export interface MonsterAction {
  name: string;
  desc: string;
}

export interface Monster {
  index: string;
  name: string;
  type: MonsterType;
  subtype: string | null;
  size: string;
  cr: number;
  xp: number;
  ac: number;
  hp: number;
  hitDice: string;
  speed: string;
  actions: MonsterAction[];
  /** Source document (e.g. "5e Core Rules", "Tome of Beasts"). */
  source: string;
}

interface RawMonster extends Omit<Monster, 'type'> {
  type: string;
}

function normalizeType(t: string): MonsterType {
  if (t.includes('swarm')) return 'swarm';
  return t as MonsterType;
}

export const MONSTERS: Monster[] = (monstersJson as RawMonster[]).map((m) => ({
  ...m,
  type: normalizeType(m.type),
}));

export const MONSTERS_BY_INDEX: Map<string, Monster> = new Map(
  MONSTERS.map((m) => [m.index, m]),
);

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary' | 'Artifact' | 'Varies';

export interface MagicItem {
  index: string;
  name: string;
  rarity: string;
}

export const MAGIC_ITEMS: MagicItem[] = magicItemsJson as MagicItem[];

export function magicItemsByRarity(rarities: readonly string[]): MagicItem[] {
  const set = new Set(rarities);
  return MAGIC_ITEMS.filter((it) => set.has(it.rarity));
}

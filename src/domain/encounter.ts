import type { Difficulty } from './inputs';

export interface EncounterMonster {
  /** FK into the SRD monster table (data/srd/monsters.json). */
  monsterIndex: string;
  name: string;
  cr: number;
  xp: number;
  count: number;
}

export interface Encounter {
  monsters: EncounterMonster[];
  /** Sum of count*xp across monsters, before the encounter-size multiplier. */
  rawXp: number;
  /** rawXp * multiplier — the value compared against the budget. */
  adjustedXp: number;
  multiplier: number;
  /** Target XP threshold for the requested difficulty. */
  budget: number;
  difficultyAchieved: Difficulty;
  /** Set when graceful degradation relaxed the thematic monster filter. */
  note?: string;
}

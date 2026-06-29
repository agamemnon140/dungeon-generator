import type { LootSpec } from '../../domain/content';
import type { Rng } from '../../rng';
import { rollDice, pickOne } from '../../rng';
import { magicItemsByRarity } from '../srd';
import { tierForLevel, type Tier } from './tiers';

interface TierTreasure {
  /** [diceCount, multiplier] applied to a d6 roll for gp. */
  gp: [number, number];
  /** Probability of a magic item appearing. */
  itemChance: number;
  rarities: string[];
}

const TIER_TREASURE: Record<Tier, TierTreasure> = {
  1: { gp: [2, 10], itemChance: 0.25, rarities: ['Common', 'Uncommon'] },
  2: { gp: [4, 25], itemChance: 0.4, rarities: ['Uncommon', 'Rare'] },
  3: { gp: [6, 120], itemChance: 0.55, rarities: ['Rare', 'Very Rare'] },
  4: { gp: [8, 600], itemChance: 0.7, rarities: ['Very Rare', 'Legendary'] },
};

export function rollTreasure(rng: Rng, level: number): LootSpec {
  const tier = tierForLevel(level);
  const cfg = TIER_TREASURE[tier];

  const gp = rollDice(rng, cfg.gp[0], 6) * cfg.gp[1];
  const sp = rollDice(rng, 3, 6) * (tier === 1 ? 5 : 10);
  const cp = tier === 1 ? rollDice(rng, 2, 6) * 10 : 0;

  const items: string[] = [];
  if (rng.next() < cfg.itemChance) {
    const pool = magicItemsByRarity(cfg.rarities);
    if (pool.length > 0) items.push(pickOne(rng, pool).name);
    // Small chance of a second item in higher tiers.
    if (tier >= 3 && rng.next() < 0.3 && pool.length > 1) items.push(pickOne(rng, pool).name);
  }

  return { cp, sp, gp, items };
}

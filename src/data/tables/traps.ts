import type { TrapSpec } from '../../domain/content';
import type { Rng } from '../../rng';
import { pickOne, intBetween } from '../../rng';
import { tierForLevel, type Tier } from './tiers';

interface TrapTemplate {
  name: string;
  effect: string;
  damageType: string;
}

const TRAP_TEMPLATES: TrapTemplate[] = [
  { name: 'Poisoned Dart Trap', effect: 'Darts spring from concealed wall slots.', damageType: 'piercing plus poison' },
  { name: 'Collapsing Pit', effect: 'The floor swings open over a spiked pit.', damageType: 'bludgeoning and piercing' },
  { name: 'Scything Blade', effect: 'A blade sweeps out at chest height.', damageType: 'slashing' },
  { name: 'Flame Jet', effect: 'Hidden nozzles vent a gout of fire.', damageType: 'fire' },
  { name: 'Crushing Walls', effect: 'The walls grind inward once triggered.', damageType: 'bludgeoning' },
  { name: 'Falling Net & Glyph', effect: 'A weighted net drops as a glyph discharges.', damageType: 'force' },
  { name: 'Frost Glyph', effect: 'A rune flares with biting cold.', damageType: 'cold' },
  { name: 'Acid Spray', effect: 'Pressurized acid sprays from the ceiling.', damageType: 'acid' },
];

/** DMG-style damage by tier (number of d10s). */
const DAMAGE_DICE_BY_TIER: Record<Tier, number> = { 1: 2, 2: 4, 3: 10, 4: 18 };
const DC_BASE_BY_TIER: Record<Tier, number> = { 1: 11, 2: 13, 3: 15, 4: 17 };

export function rollTrap(rng: Rng, level: number): TrapSpec {
  const tier = tierForLevel(level);
  const t = pickOne(rng, TRAP_TEMPLATES);
  const detectDC = DC_BASE_BY_TIER[tier] + intBetween(rng, 0, 3);
  const disarmDC = DC_BASE_BY_TIER[tier] + intBetween(rng, 1, 4);
  const dice = DAMAGE_DICE_BY_TIER[tier];
  return {
    name: t.name,
    detectDC,
    disarmDC,
    effect: t.effect,
    damage: `${dice}d10 ${t.damageType}`,
  };
}

/** Four play tiers, used to scale traps and treasure with party level. */
export type Tier = 1 | 2 | 3 | 4;

export function tierForLevel(level: number): Tier {
  if (level <= 4) return 1;
  if (level <= 10) return 2;
  if (level <= 16) return 3;
  return 4;
}

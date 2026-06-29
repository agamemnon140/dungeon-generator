/**
 * DMG encounter-size multiplier: more monsters punch above their raw XP because
 * of action economy. Applied to rawXp to get the adjusted XP compared to budget.
 */
export function encounterMultiplier(monsterCount: number): number {
  if (monsterCount <= 0) return 0;
  if (monsterCount === 1) return 1;
  if (monsterCount === 2) return 1.5;
  if (monsterCount <= 6) return 2;
  if (monsterCount <= 10) return 2.5;
  if (monsterCount <= 14) return 3;
  return 4;
}

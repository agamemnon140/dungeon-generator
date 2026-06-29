import type { Difficulty, Environment } from '../domain/inputs';
import type { Encounter, EncounterMonster } from '../domain/encounter';
import type { Rng } from '../rng';
import { pickOne, pickWeighted } from '../rng';
import { MONSTERS, type Monster, type MonsterType } from '../data/srd';
import { thresholdPerChar, partyBudget } from '../data/tables/xp-thresholds';
import { encounterMultiplier } from '../data/tables/encounter-multiplier';
import { ENVIRONMENT_MONSTERS } from '../data/tables/environment-monsters';

export interface EncounterRequest {
  partyLevel: number;
  partySize: number;
  difficulty: Difficulty;
  environment: Environment;
  rng: Rng;
  isBoss?: boolean;
}

const MAX_GROUP = 8;

function candidates(types: Set<MonsterType>, crCap: number): Monster[] {
  return MONSTERS.filter((m) => m.xp > 0 && m.cr <= crCap && types.has(m.type));
}

/** Build a thematic monster pool, relaxing in steps when the theme is too thin. */
function buildPool(env: Environment, crCap: number): { pool: Monster[]; note?: string } {
  const { primary, secondary } = ENVIRONMENT_MONSTERS[env];
  const prim = new Set(primary);

  let pool = candidates(prim, crCap);
  if (pool.length >= 3) return { pool };

  const both = new Set<MonsterType>([...primary, ...secondary]);
  pool = candidates(both, crCap);
  if (pool.length >= 3) return { pool, note: 'Thematic pool thin — included secondary creature types.' };

  pool = candidates(both, crCap + 3);
  if (pool.length >= 3) {
    return { pool, note: 'Thematic pool thin — included secondary types and raised the CR cap.' };
  }

  const all = new Set<MonsterType>(MONSTERS.map((m) => m.type));
  return { pool: candidates(all, crCap + 3), note: 'Thematic pool too small — drew from all creature types.' };
}

function adjustedOf(rawXp: number, count: number): number {
  return rawXp * encounterMultiplier(count);
}

/**
 * Group fill that lands near budget while favouring variety. Closeness to budget
 * dominates the weight (so the group reliably reaches the target), but each extra
 * copy of the same monster is progressively discounted, so encounters mix
 * creatures instead of stacking one. Among comparably-good candidates the per-room
 * RNG breaks ties, which also varies monster choice across rooms.
 */
function selectGroup(pool: Monster[], budget: number, rng: Rng): Map<string, number> {
  const counts = new Map<string, number>();
  const affordable = pool.filter((m) => m.xp > 0 && m.xp <= budget);
  const choices = affordable.length > 0 ? affordable : [pool.reduce((a, b) => (a.xp <= b.xp ? a : b))];

  let rawXp = 0;
  let total = 0;
  let guard = 0;

  while (guard++ < 400) {
    if (adjustedOf(rawXp, total) >= budget * 0.9) break;
    if (total >= MAX_GROUP) break;

    const viable = choices.filter(
      (m) => total === 0 || adjustedOf(rawXp + m.xp, total + 1) <= budget * 1.25,
    );
    if (viable.length === 0) break;

    // Score each viable monster by how close adding it gets us to budget, then keep
    // only the near-best — this guarantees the group climbs to target even at high
    // budgets. Variety is chosen *within* that near-best set.
    const scored = viable
      .map((m) => {
        const nextAdj = adjustedOf(rawXp + m.xp, total + 1);
        const over = nextAdj - budget;
        const score = over > budget * 0.25 ? 1e9 + over : Math.abs(budget - nextAdj);
        return { m, score };
      })
      .sort((a, b) => a.score - b.score);
    const best = scored[0].score;
    const nearBest = scored.filter((s) => s.score <= best * 1.5 + 1);
    const candidates = nearBest.length >= 3 ? nearBest : scored.slice(0, 3);

    // Among comparably-good picks, discount monsters already used so groups mix.
    const proximity = Math.min(1, adjustedOf(rawXp, total) / Math.max(1, budget));
    const chosen = pickWeighted(
      rng,
      candidates.map((s) => ({ item: s.m, weight: 1 / (1 + (counts.get(s.m.index) ?? 0) * (0.5 + proximity)) })),
    );

    counts.set(chosen.index, (counts.get(chosen.index) ?? 0) + 1);
    rawXp += chosen.xp;
    total += 1;
  }

  if (total === 0) counts.set(choices[0].index, 1);
  return counts;
}

/** Boss: a strong solo creature (varied among the top candidates), plus minions. */
function selectBoss(pool: Monster[], budget: number, rng: Rng): Map<string, number> {
  const counts = new Map<string, number>();
  const byCrDesc = [...pool].sort((a, b) => b.cr - a.cr || b.xp - a.xp);
  const fitting = byCrDesc.filter((m) => m.xp <= budget * 1.1);
  // Pick the solo boss from the strongest few that fit, so it isn't always identical.
  const soloPool = (fitting.length > 0 ? fitting : byCrDesc).slice(0, 5);
  const solo = pickOne(rng, soloPool);
  counts.set(solo.index, 1);

  let rawXp = solo.xp;
  let total = 1;
  // Minions should be meaningful (no CR-0 filler), weaker than the boss, and affordable.
  const minionPool = pool.filter(
    (m) => m.cr < solo.cr && m.xp >= budget * 0.04 && m.xp <= budget * 0.25,
  );

  let guard = 0;
  while (minionPool.length > 0 && total < 4 && guard++ < 12) {
    if (adjustedOf(rawXp, total) >= budget) break;
    const m = pickWeighted(
      rng,
      minionPool.map((mm) => ({ item: mm, weight: (counts.get(mm.index) ?? 0) === 0 ? 1.8 : 0.6 })),
    );
    counts.set(m.index, (counts.get(m.index) ?? 0) + 1);
    rawXp += m.xp;
    total += 1;
  }
  return counts;
}

function achievedDifficulty(level: number, size: number, adjustedXp: number): Difficulty {
  const order: Difficulty[] = ['deadly', 'hard', 'medium', 'easy'];
  for (const d of order) {
    if (adjustedXp >= thresholdPerChar(level, d) * Math.max(1, size)) return d;
  }
  return 'easy';
}

export function buildEncounter(req: EncounterRequest): Encounter {
  const effectiveDifficulty: Difficulty = req.isBoss ? 'deadly' : req.difficulty;
  const budget = partyBudget(req.partyLevel, req.partySize, effectiveDifficulty);
  const crCap = Math.max(1, req.partyLevel + (req.isBoss ? 4 : 2));

  const { pool, note } = buildPool(req.environment, crCap);
  const counts = req.isBoss ? selectBoss(pool, budget, req.rng) : selectGroup(pool, budget, req.rng);

  const byIndex = new Map(pool.map((m) => [m.index, m]));
  const monsters: EncounterMonster[] = [...counts.entries()]
    .map(([index, count]) => {
      const m = byIndex.get(index)!;
      return { monsterIndex: index, name: m.name, cr: m.cr, xp: m.xp, count };
    })
    .sort((a, b) => b.cr - a.cr || a.name.localeCompare(b.name));

  const rawXp = monsters.reduce((sum, em) => sum + em.xp * em.count, 0);
  const totalCount = monsters.reduce((sum, em) => sum + em.count, 0);
  const multiplier = encounterMultiplier(totalCount);
  const adjustedXp = Math.round(rawXp * multiplier);

  return {
    monsters,
    rawXp,
    adjustedXp,
    multiplier,
    budget,
    difficultyAchieved: achievedDifficulty(req.partyLevel, req.partySize, adjustedXp),
    note,
  };
}

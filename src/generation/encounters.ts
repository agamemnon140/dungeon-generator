import type { Difficulty, Environment } from '../domain/inputs';
import type { Encounter, EncounterMonster } from '../domain/encounter';
import type { Rng } from '../rng';
import { pickWeighted } from '../rng';
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
/** Boss gets a budget above the deadly threshold so the climax is the toughest fight. */
const BOSS_BUDGET_FACTOR = 1.5;

type ThemeWeight = (m: Monster) => number;

function candidates(types: Set<MonsterType>, crCap: number): Monster[] {
  return MONSTERS.filter((m) => m.xp > 0 && m.cr <= crCap && types.has(m.type));
}

/**
 * Build the monster pool. Primary AND secondary thematic types are blended in by
 * default (for variety); a per-monster theme weight keeps primary types dominant.
 * Only genuine relaxations (raising the CR cap, or falling back to all types) set a note.
 */
function buildPool(env: Environment, crCap: number): { pool: Monster[]; note?: string } {
  const { primary, secondary } = ENVIRONMENT_MONSTERS[env];
  const both = new Set<MonsterType>([...primary, ...secondary]);

  let pool = candidates(both, crCap);
  if (pool.length >= 4) return { pool };

  pool = candidates(both, crCap + 3);
  if (pool.length >= 4) return { pool, note: 'Thematic pool thin — raised the CR cap.' };

  const all = new Set<MonsterType>(MONSTERS.map((m) => m.type));
  return { pool: candidates(all, crCap + 3), note: 'Thematic pool too small — drew from all creature types.' };
}

function makeThemeWeight(env: Environment): ThemeWeight {
  const { primary, secondary } = ENVIRONMENT_MONSTERS[env];
  const prim = new Set<MonsterType>(primary);
  const sec = new Set<MonsterType>(secondary);
  return (m) => (prim.has(m.type) ? 1 : sec.has(m.type) ? 0.5 : 0.28);
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
function selectGroup(pool: Monster[], budget: number, rng: Rng, theme: ThemeWeight): Map<string, number> {
  const counts = new Map<string, number>();
  // Cap a single monster well under budget so no one creature fills the room alone —
  // this forces groups of 2+ and keeps budget-filling solos for boss rooms. Relax the
  // cap only if it leaves too few candidates (low levels / thin pools).
  const withinCap = (cap: number): Monster[] => pool.filter((m) => m.xp > 0 && m.xp <= cap);
  let choices = withinCap(budget * 0.6);
  if (choices.length < 2) choices = withinCap(budget);
  if (choices.length === 0) choices = [pool.reduce((a, b) => (a.xp <= b.xp ? a : b))];

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
    const pickFrom = nearBest.length >= 3 ? nearBest : scored.slice(0, 3);

    // Among comparably-good picks: discount monsters already used (mixing) and
    // weight by theme (primary types favoured over secondary).
    const proximity = Math.min(1, adjustedOf(rawXp, total) / Math.max(1, budget));
    const chosen = pickWeighted(
      rng,
      pickFrom.map((s) => ({
        item: s.m,
        weight: (1 / (1 + (counts.get(s.m.index) ?? 0) * (0.5 + proximity))) * theme(s.m),
      })),
    );

    counts.set(chosen.index, (counts.get(chosen.index) ?? 0) + 1);
    rawXp += chosen.xp;
    total += 1;
  }

  if (total === 0) counts.set(choices[0].index, 1);
  return counts;
}

/** Boss: a strong solo creature (varied, theme-weighted), plus a few minions. */
function selectBoss(pool: Monster[], budget: number, rng: Rng, theme: ThemeWeight): Map<string, number> {
  const counts = new Map<string, number>();
  const byCrDesc = [...pool].sort((a, b) => b.cr - a.cr || b.xp - a.xp);
  const fitting = byCrDesc.filter((m) => m.xp <= budget * 1.1);
  // Pick the solo boss from the strongest few that fit, theme-weighted, so it varies.
  const soloPool = (fitting.length > 0 ? fitting : byCrDesc).slice(0, 6);
  const solo = pickWeighted(rng, soloPool.map((m) => ({ item: m, weight: theme(m) })));
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
      minionPool.map((mm) => ({ item: mm, weight: ((counts.get(mm.index) ?? 0) === 0 ? 1.8 : 0.6) * theme(mm) })),
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
  const baseBudget = partyBudget(req.partyLevel, req.partySize, effectiveDifficulty);
  const budget = req.isBoss ? Math.round(baseBudget * BOSS_BUDGET_FACTOR) : baseBudget;
  const crCap = Math.max(1, req.partyLevel + (req.isBoss ? 4 : 2));

  const { pool, note } = buildPool(req.environment, crCap);
  const theme = makeThemeWeight(req.environment);
  const counts = req.isBoss ? selectBoss(pool, budget, req.rng, theme) : selectGroup(pool, budget, req.rng, theme);

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

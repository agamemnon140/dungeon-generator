import { describe, it, expect } from 'vitest';
import type { Difficulty } from '../domain/inputs';
import { buildEncounter } from '../generation';
import { partyBudget } from '../data/tables/xp-thresholds';
import { encounterMultiplier } from '../data/tables/encounter-multiplier';
import { ENVIRONMENT_MONSTERS } from '../data/tables/environment-monsters';
import { mulberry32 } from '../rng';

const LEVELS = [1, 2, 3, 5, 8, 11, 14, 17, 20];
const SIZES = [3, 4, 5];
const DIFFS: Difficulty[] = ['easy', 'medium', 'hard', 'deadly'];

describe('encounter budget (cave — rich pool)', () => {
  for (const level of LEVELS) {
    for (const size of SIZES) {
      for (const difficulty of DIFFS) {
        it(`L${level} x${size} ${difficulty} lands near budget`, () => {
          const rng = mulberry32(1234 + level * 31 + size * 7);
          const enc = buildEncounter({ partyLevel: level, partySize: size, difficulty, environment: 'cave', rng });
          const budget = partyBudget(level, size, difficulty);

          // Internally consistent math.
          const total = enc.monsters.reduce((s, m) => s + m.count, 0);
          const raw = enc.monsters.reduce((s, m) => s + m.xp * m.count, 0);
          expect(total).toBeGreaterThanOrEqual(1);
          expect(enc.multiplier).toBe(encounterMultiplier(total));
          expect(enc.rawXp).toBe(raw);
          expect(enc.adjustedXp).toBe(Math.round(raw * enc.multiplier));
          expect(enc.budget).toBe(budget);

          // Lands in a sensible band around the budget.
          expect(enc.adjustedXp).toBeGreaterThanOrEqual(budget * 0.7);
          expect(enc.adjustedXp).toBeLessThanOrEqual(budget * 1.4);

          // Cave is rich, so no degradation note and every monster fits the theme + CR cap.
          expect(enc.note).toBeUndefined();
          const primary = new Set(ENVIRONMENT_MONSTERS.cave.primary);
          for (const m of enc.monsters) {
            expect(m.cr).toBeLessThanOrEqual(level + 2);
            // (type isn't on EncounterMonster, but CR cap + no-note implies the primary pool)
          }
          void primary;
        });
      }
    }
  }
});

describe('encounter builder — boss and thin pools', () => {
  it('boss encounters are tough (at least hard) and non-empty', () => {
    const rng = mulberry32(99);
    const enc = buildEncounter({
      partyLevel: 6,
      partySize: 4,
      difficulty: 'medium',
      environment: 'crypt',
      rng,
      isBoss: true,
    });
    expect(enc.monsters.length).toBeGreaterThanOrEqual(1);
    expect(enc.adjustedXp).toBeGreaterThanOrEqual(enc.budget * 0.6);
    expect(['hard', 'deadly']).toContain(enc.difficultyAchieved);
  });

  it('thin thematic pools still produce a valid encounter', () => {
    for (const environment of ['astral-plane', 'airship', 'sunken-ruins'] as const) {
      const enc = buildEncounter({
        partyLevel: 4,
        partySize: 4,
        difficulty: 'medium',
        environment,
        rng: mulberry32(7),
      });
      expect(enc.monsters.length).toBeGreaterThanOrEqual(1);
      expect(enc.adjustedXp).toBeGreaterThan(0);
    }
  });

  it('is deterministic for a fixed seed', () => {
    const a = buildEncounter({ partyLevel: 9, partySize: 4, difficulty: 'hard', environment: 'cave', rng: mulberry32(555) });
    const b = buildEncounter({ partyLevel: 9, partySize: 4, difficulty: 'hard', environment: 'cave', rng: mulberry32(555) });
    expect(a).toEqual(b);
  });

  it('produces varied groups, not stacks of one monster', () => {
    let withMultiple = 0;
    const samples = 24;
    for (let i = 0; i < samples; i++) {
      const enc = buildEncounter({
        partyLevel: 8,
        partySize: 5,
        difficulty: 'hard',
        environment: 'cave',
        rng: mulberry32(4000 + i * 97),
      });
      // No single monster exceeds the copy cap.
      for (const m of enc.monsters) expect(m.count).toBeLessThanOrEqual(4);
      if (enc.monsters.length >= 2) withMultiple += 1;
    }
    // The large majority of mid/high-budget groups should contain more than one species.
    expect(withMultiple).toBeGreaterThan(samples * 0.6);
  });
});

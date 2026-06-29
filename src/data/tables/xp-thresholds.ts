import type { Difficulty } from '../../domain/inputs';

/** DMG "XP Thresholds by Character Level" — XP per single character, levels 1–20. */
const THRESHOLDS: Record<Difficulty, number>[] = [
  /* L1  */ { easy: 25, medium: 50, hard: 75, deadly: 100 },
  /* L2  */ { easy: 50, medium: 100, hard: 150, deadly: 200 },
  /* L3  */ { easy: 75, medium: 150, hard: 225, deadly: 400 },
  /* L4  */ { easy: 125, medium: 250, hard: 375, deadly: 500 },
  /* L5  */ { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  /* L6  */ { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  /* L7  */ { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  /* L8  */ { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  /* L9  */ { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  /* L10 */ { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
  /* L11 */ { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
  /* L12 */ { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  /* L13 */ { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  /* L14 */ { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  /* L15 */ { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  /* L16 */ { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  /* L17 */ { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  /* L18 */ { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  /* L19 */ { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  /* L20 */ { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
];

/** XP threshold for one character of the given level at the given difficulty. */
export function thresholdPerChar(level: number, difficulty: Difficulty): number {
  const clamped = Math.max(1, Math.min(20, Math.round(level)));
  return THRESHOLDS[clamped - 1][difficulty];
}

/** Total party XP budget for the requested difficulty. */
export function partyBudget(level: number, size: number, difficulty: Difficulty): number {
  return thresholdPerChar(level, difficulty) * Math.max(1, size);
}

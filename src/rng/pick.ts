import type { Rng } from './rng';

export function pickOne<T>(rng: Rng, arr: readonly T[]): T {
  return arr[rng.int(arr.length)];
}

export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface Weighted<T> {
  item: T;
  weight: number;
}

export function pickWeighted<T>(rng: Rng, items: readonly Weighted<T>[]): T {
  const total = items.reduce((sum, w) => sum + Math.max(0, w.weight), 0);
  if (total <= 0) return items[items.length - 1].item;
  let r = rng.next() * total;
  for (const w of items) {
    r -= Math.max(0, w.weight);
    if (r < 0) return w.item;
  }
  return items[items.length - 1].item;
}

/** Roll `count`d`sides` and return the sum. */
export function rollDice(rng: Rng, count: number, sides: number): number {
  let sum = 0;
  for (let i = 0; i < count; i++) sum += rng.int(sides) + 1;
  return sum;
}

/** Integer in [min, max] inclusive. */
export function intBetween(rng: Rng, min: number, max: number): number {
  if (max <= min) return min;
  return min + rng.int(max - min + 1);
}

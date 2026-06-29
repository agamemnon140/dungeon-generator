/**
 * xmur3 string hash → uint32, suitable for seeding mulberry32. Deterministic
 * and dependency-free.
 */
export function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/**
 * Derive an independent sub-seed for a named partition of the generation
 * (e.g. a stage namespace or a room id). Partitioning the RNG this way is what
 * lets a single room be re-rolled without disturbing any other room.
 */
export function deriveSubSeed(rootSeed: number, namespace: string): number {
  return hashSeed(`${namespace}#${rootSeed >>> 0}`);
}

import type { Rng } from '../rng';
import { pickOne } from '../rng';

/** A grammar maps symbol names to their possible expansions. */
export type Grammar = Record<string, readonly string[]>;

const SYMBOL = /#(\w+)#/g;

/**
 * Minimal Tracery-style expander. Replaces every `#symbol#` in `rule` by picking
 * (via our seeded Rng — never Math.random) one of the symbol's options and
 * expanding it recursively. Plain text passes through unchanged.
 */
export function expand(grammar: Grammar, rule: string, rng: Rng, depth = 0): string {
  if (depth > 30) return rule;
  return rule.replace(SYMBOL, (_match, sym: string) => {
    const opts = grammar[sym];
    if (!opts || opts.length === 0) return '';
    return expand(grammar, pickOne(rng, opts), rng, depth + 1);
  });
}

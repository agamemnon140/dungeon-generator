import type { DungeonGraph } from '../domain/graph';
import type { DungeonInputs } from '../domain/inputs';
import type { NarrativeSpec } from '../domain/narrative';
import type { Monster } from '../data/srd';
import type { Rng } from '../rng';

export interface NarrativeContext {
  graph: DungeonGraph;
  inputs: DungeonInputs;
  /** Strongest monster in the boss room; becomes the story's antagonist. */
  bossMonster: Monster | null;
  rng: Rng;
}

/**
 * Produces the structured narrative over a finished dungeon graph. The template
 * implementation fills it now; a future LLM implementation fills the same
 * NarrativeSpec shape — generation/map/encounter code never depends on this.
 *
 * (Kept synchronous for the MVP. Swapping in an async LLM generator is the one
 * place the pipeline would need to await — every other stage is unaffected.)
 */
export interface NarrativeGenerator {
  generate(ctx: NarrativeContext): NarrativeSpec;
}

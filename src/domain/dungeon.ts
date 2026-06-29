import type { DungeonInputs } from './inputs';
import type { DungeonGraph } from './graph';
import type { NarrativeSpec } from './narrative';

/** The fully assembled output of the generation pipeline. */
export interface Dungeon {
  inputs: DungeonInputs;
  rootSeed: number;
  graph: DungeonGraph;
  narrative: NarrativeSpec;
  /** Bumping this invalidates persisted snapshots. */
  generatorVersion: string;
}

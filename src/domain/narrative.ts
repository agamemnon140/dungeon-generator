import type { Tone, Objective } from './inputs';

export interface Clue {
  id: string;
  /** The room that plants this clue (usually a flavor/empty room). */
  roomId: string;
  text: string;
  pointsTo: 'antagonist' | 'objective' | 'hazard';
}

/**
 * Structured narrative. Templates fill these fields in the MVP; a future
 * LLM generator fills the SAME shape with richer prose. Map/encounter code
 * never depends on this — it is produced last, over the finished graph.
 */
export interface NarrativeSpec {
  premise: string;
  antagonist: { monsterIndex: string; name: string; framing: string };
  stakes: string;
  clueChain: Clue[];
  resolution: string;
  tone: Tone;
  objective: Objective;
}

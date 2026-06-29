import type { DungeonInputs } from '../domain/inputs';
import { DEFAULT_INPUTS } from '../state/store';
import type { DungeonGraph } from '../domain/graph';
import { buildAdjacency } from '../domain/graph';

export function makeInputs(partial: Partial<DungeonInputs> = {}): DungeonInputs {
  return { ...DEFAULT_INPUTS, ...partial };
}

/** Count how many rooms are reachable from the entrance over the connections. */
export function reachableCount(graph: DungeonGraph): number {
  const adj = buildAdjacency(graph);
  const seen = new Set<string>([graph.entranceId]);
  const queue = [graph.entranceId];
  for (let head = 0; head < queue.length; head++) {
    for (const v of adj.get(queue[head]) ?? []) {
      if (!seen.has(v)) {
        seen.add(v);
        queue.push(v);
      }
    }
  }
  return seen.size;
}

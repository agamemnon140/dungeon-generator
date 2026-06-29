import type { DungeonInputs, Difficulty } from '../domain/inputs';
import type { Dungeon } from '../domain/dungeon';
import type { DungeonGraph } from '../domain/graph';
import { hashSeed, deriveSubSeed, mulberry32 } from '../rng';
import { MONSTERS_BY_INDEX } from '../data/srd';
import { defaultNarrativeGenerator } from '../narrative';
import { buildSkeleton } from './topology';
import { populateRooms } from './rooms';
import { buildEncounter } from './encounters';
import { assignHazards } from './hazards';

export const GENERATOR_VERSION = '0.7.0';

const DIFFICULTY_TIERS: Difficulty[] = ['easy', 'medium', 'hard', 'deadly'];

/** Combat gets slightly harder the deeper it sits in the dungeon. */
export function rampDifficulty(base: Difficulty, depth: number, maxDepth: number): Difficulty {
  let i = DIFFICULTY_TIERS.indexOf(base);
  if (maxDepth > 0 && depth / maxDepth > 0.6) i = Math.min(DIFFICULTY_TIERS.length - 1, i + 1);
  return DIFFICULTY_TIERS[i];
}

/** Stage 3 — build a balanced encounter for every combat and boss room. */
function assignEncounters(graph: DungeonGraph, inputs: DungeonInputs): void {
  const maxDepth = Math.max(...graph.rooms.map((r) => r.depth));
  for (const room of graph.rooms) {
    if (room.kind !== 'combat' && room.kind !== 'boss') continue;
    const isBoss = room.kind === 'boss';
    const difficulty = isBoss ? inputs.difficulty : rampDifficulty(inputs.difficulty, room.depth, maxDepth);
    const rng = mulberry32(deriveSubSeed(room.subSeed, 'encounter'));

    const encounter = buildEncounter({
      partyLevel: inputs.partyLevel,
      partySize: inputs.partySize,
      difficulty,
      environment: inputs.environment,
      rng,
      isBoss,
    });
    room.encounter = encounter;

    if (room.content.type === 'combat') {
      room.content.theme = encounter.monsters[0]?.name ?? '';
    }
  }
}

/**
 * The whole generator: a pure function of inputs (incl. the seed). The RNG is
 * partitioned by namespace so adding a later stage never shifts earlier draws.
 */
export function generateDungeon(inputs: DungeonInputs): Dungeon {
  const rootSeed = hashSeed(inputs.seed.trim() || 'default');

  const rngTopology = mulberry32(deriveSubSeed(rootSeed, 'topology'));
  const skeleton = buildSkeleton(inputs, rngTopology);

  const rngRooms = mulberry32(deriveSubSeed(rootSeed, 'rooms'));
  const graph = populateRooms(skeleton, inputs, rootSeed, rngRooms);

  assignEncounters(graph, inputs);
  assignHazards(graph, inputs);

  const bossIndex = graph.rooms.find((r) => r.id === graph.bossId)?.encounter?.monsters[0]?.monsterIndex;
  const bossMonster = bossIndex ? (MONSTERS_BY_INDEX.get(bossIndex) ?? null) : null;
  const rngNarrative = mulberry32(deriveSubSeed(rootSeed, 'narrative'));
  const narrative = defaultNarrativeGenerator.generate({ graph, inputs, bossMonster, rng: rngNarrative });

  return { inputs, rootSeed, graph, narrative, generatorVersion: GENERATOR_VERSION };
}

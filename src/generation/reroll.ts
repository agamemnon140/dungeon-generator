import type { Dungeon } from '../domain/dungeon';
import type { Room, RoomKind } from '../domain/graph';
import type { Environment } from '../domain/inputs';
import { ENVIRONMENTS } from '../domain/inputs';
import { deriveSubSeed, mulberry32, pickOne } from '../rng';
import { makeLabel, freshContent } from './rooms';
import { buildEncounter } from './encounters';
import { rampDifficulty } from './pipeline';
import { rollTrap } from '../data/tables/traps';
import { rollTreasure } from '../data/tables/treasure';
import { rollPuzzle } from '../data/tables/puzzles';
import { FLAVOR_BY_ENVIRONMENT } from '../data/grammars/flavor';
import { CLUE_TEMPLATES } from '../data/grammars/clues';
import { OMINOUS_ADJ } from '../data/grammars/vocab';
import { expand, type Grammar } from '../narrative/tracery';

/** Boss/entrance are tied to the story, so re-roll is offered only on these kinds. */
const REROLLABLE: ReadonlySet<RoomKind> = new Set(['combat', 'trap', 'treasure', 'puzzle', 'empty']);

export function canReroll(kind: RoomKind): boolean {
  return REROLLABLE.has(kind);
}

function placeLabel(env: Environment): string {
  return `the ${ENVIRONMENTS.find((o) => o.value === env)?.label.toLowerCase() ?? env}`;
}

/**
 * Re-roll a single room from a fresh sub-seed (derived from the room id + a new
 * reroll counter), regenerating only that room's content. Every other room stays
 * byte-identical; only this room's own narrative (a clue, if any) is updated.
 */
export function rerollRoom(dungeon: Dungeon, roomId: string): Dungeon {
  const idx = dungeon.graph.rooms.findIndex((r) => r.id === roomId);
  if (idx < 0) return dungeon;
  const old = dungeon.graph.rooms[idx];
  if (!canReroll(old.kind)) return dungeon;

  const { inputs, rootSeed } = dungeon;
  const rerollCount = old.rerollCount + 1;
  const subSeed = deriveSubSeed(rootSeed, `${roomId}#reroll${rerollCount}`);

  const room: Room = {
    id: old.id,
    kind: old.kind,
    depth: old.depth,
    subSeed,
    rerollCount,
    label: makeLabel(inputs.environment, old.kind, mulberry32(subSeed)),
    content: freshContent(old.kind),
  };

  let clueChain = dungeon.narrative.clueChain;

  switch (room.content.type) {
    case 'combat': {
      const maxDepth = Math.max(...dungeon.graph.rooms.map((r) => r.depth));
      const difficulty = rampDifficulty(inputs.difficulty, room.depth, maxDepth);
      const encounter = buildEncounter({
        partyLevel: inputs.partyLevel,
        partySize: inputs.partySize,
        difficulty,
        environment: inputs.environment,
        rng: mulberry32(deriveSubSeed(subSeed, 'encounter')),
      });
      room.encounter = encounter;
      room.content.theme = encounter.monsters[0]?.name ?? '';
      break;
    }
    case 'trap':
      room.content.trap = rollTrap(mulberry32(deriveSubSeed(subSeed, 'trap')), inputs.partyLevel);
      break;
    case 'treasure':
      room.content.loot = rollTreasure(mulberry32(deriveSubSeed(subSeed, 'treasure')), inputs.partyLevel);
      break;
    case 'puzzle':
      room.content.puzzle = rollPuzzle(mulberry32(deriveSubSeed(subSeed, 'puzzle')));
      break;
    case 'empty': {
      const rng = mulberry32(deriveSubSeed(subSeed, 'narrative'));
      const clue = dungeon.narrative.clueChain.find((c) => c.roomId === roomId);
      if (clue) {
        const grammar: Grammar = {
          boss: [dungeon.narrative.antagonist.name],
          framing: [dungeon.narrative.antagonist.framing],
          place: [placeLabel(inputs.environment)],
          adj: OMINOUS_ADJ,
        };
        const text = expand(grammar, pickOne(rng, CLUE_TEMPLATES[clue.pointsTo]), rng);
        room.narrative = { description: text, clueId: clue.id };
        room.content.flavor = text;
        clueChain = dungeon.narrative.clueChain.map((c) => (c.id === clue.id ? { ...c, text } : c));
      } else {
        const text = expand({}, pickOne(rng, FLAVOR_BY_ENVIRONMENT[inputs.environment]), rng);
        room.narrative = { description: text };
        room.content.flavor = text;
      }
      break;
    }
    default:
      break;
  }

  const rooms = dungeon.graph.rooms.slice();
  rooms[idx] = room;
  const narrative =
    clueChain === dungeon.narrative.clueChain ? dungeon.narrative : { ...dungeon.narrative, clueChain };

  return { ...dungeon, graph: { ...dungeon.graph, rooms }, narrative };
}

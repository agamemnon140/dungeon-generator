import type { Room } from '../domain/graph';
import type { Clue, NarrativeSpec } from '../domain/narrative';
import { ENVIRONMENTS } from '../domain/inputs';
import { pickOne } from '../rng';
import { OMINOUS_ADJ, NPCS, ARTIFACTS } from '../data/grammars/vocab';
import {
  HOOK_BY_OBJECTIVE,
  FRAMING_BY_TONE,
  STAKES_BY_TONE,
  RESOLUTION_BY_OBJECTIVE,
  ENTRY_FLAVOR,
} from '../data/grammars/premise';
import { CLUE_TEMPLATES } from '../data/grammars/clues';
import { FLAVOR_BY_ENVIRONMENT } from '../data/grammars/flavor';
import { expand, type Grammar } from './tracery';
import type { NarrativeContext, NarrativeGenerator } from './NarrativeGenerator';

function environmentLabel(env: string): string {
  return ENVIRONMENTS.find((o) => o.value === env)?.label.toLowerCase() ?? env;
}

/** Evenly-spaced sample of `count` rooms from an ordered list. */
function spread(rooms: Room[], count: number): Room[] {
  if (count >= rooms.length) return rooms;
  const out: Room[] = [];
  for (let k = 0; k < count; k++) {
    out.push(rooms[Math.min(rooms.length - 1, Math.floor(((k + 0.5) / count) * rooms.length))]);
  }
  return out;
}

export class TemplateNarrativeGenerator implements NarrativeGenerator {
  generate(ctx: NarrativeContext): NarrativeSpec {
    const { graph, inputs, bossMonster, rng } = ctx;
    const place = `the ${environmentLabel(inputs.environment)}`;
    const bossName = bossMonster?.name ?? 'an unnamed horror';

    // Fix the shared elements once so the hook, clues, and resolution stay coherent.
    const grammar: Record<string, readonly string[]> = {
      place: [place],
      boss: [bossName],
      adj: OMINOUS_ADJ,
      npc: [pickOne(rng, NPCS)],
      artifact: [pickOne(rng, ARTIFACTS)],
      stakes: STAKES_BY_TONE[inputs.tone],
      framing: FRAMING_BY_TONE[inputs.tone],
    };
    const g = grammar as Grammar & Record<string, string[]>;

    const framing = expand(g, '#framing#', rng);
    g.framing = [framing];
    const stakes = expand(g, '#stakes#', rng);
    g.stakes = [stakes];

    const premise = expand(g, pickOne(rng, HOOK_BY_OBJECTIVE[inputs.objective]), rng);
    const resolution = expand(g, pickOne(rng, RESOLUTION_BY_OBJECTIVE[inputs.objective]), rng);

    // Clue chain across flavor rooms, ordered by depth; the last points to the goal.
    const empties = graph.rooms
      .filter((r) => r.kind === 'empty')
      .sort((a, b) => a.depth - b.depth || (a.id < b.id ? -1 : 1));
    const clueCount = Math.min(empties.length, Math.max(2, Math.floor(graph.rooms.length / 4)));
    const clueRooms = spread(empties, clueCount);
    const clueSet = new Set(clueRooms.map((r) => r.id));

    const clueChain: Clue[] = clueRooms.map((room, i) => {
      const pointsTo: Clue['pointsTo'] =
        i === clueRooms.length - 1 ? 'objective' : i % 2 === 0 ? 'antagonist' : 'hazard';
      const text = expand(g, pickOne(rng, CLUE_TEMPLATES[pointsTo]), rng);
      room.narrative = { description: text, clueId: `clue-${i + 1}` };
      if (room.content.type === 'empty') room.content.flavor = text;
      return { id: `clue-${i + 1}`, roomId: room.id, text, pointsTo };
    });

    // Remaining flavor rooms get atmospheric description.
    for (const room of graph.rooms) {
      if (room.kind !== 'empty' || clueSet.has(room.id)) continue;
      const f = expand(g, pickOne(rng, FLAVOR_BY_ENVIRONMENT[inputs.environment]), rng);
      room.narrative = { description: f };
      if (room.content.type === 'empty') room.content.flavor = f;
    }

    const entrance = graph.rooms.find((r) => r.id === graph.entranceId);
    if (entrance && entrance.content.type === 'entrance') {
      const f = expand(g, pickOne(rng, ENTRY_FLAVOR), rng);
      entrance.content.flavor = f;
      entrance.narrative = { description: f };
    }

    const boss = graph.rooms.find((r) => r.id === graph.bossId);
    if (boss && boss.content.type === 'boss') {
      boss.content.objectivePayoff = resolution;
      boss.narrative = { description: resolution };
    }

    return {
      premise,
      antagonist: { monsterIndex: bossMonster?.index ?? '', name: bossName, framing },
      stakes,
      clueChain,
      resolution,
      tone: inputs.tone,
      objective: inputs.objective,
    };
  }
}

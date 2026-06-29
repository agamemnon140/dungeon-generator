import { describe, it, expect } from 'vitest';
import { generateDungeon } from '../generation';
import { makeInputs } from './helpers';

const NO_UNEXPANDED = /#\w+#/;

describe('narrative', () => {
  it('produces a fully-expanded premise, stakes, and resolution', () => {
    const d = generateDungeon(makeInputs({ roomCount: 16, seed: 'story-1' }));
    const n = d.narrative;
    expect(n.premise.length).toBeGreaterThan(20);
    expect(n.premise).not.toMatch(NO_UNEXPANDED);
    expect(n.stakes).not.toMatch(NO_UNEXPANDED);
    expect(n.resolution).not.toMatch(NO_UNEXPANDED);
  });

  it('uses the boss-room monster as the antagonist', () => {
    const d = generateDungeon(makeInputs({ roomCount: 16, seed: 'story-2' }));
    const bossRoom = d.graph.rooms.find((r) => r.id === d.graph.bossId)!;
    const bossMonster = bossRoom.encounter?.monsters[0];
    expect(bossMonster).toBeTruthy();
    expect(d.narrative.antagonist.name).toBe(bossMonster!.name);
    expect(d.narrative.antagonist.monsterIndex).toBe(bossMonster!.monsterIndex);
  });

  it('plants a clue chain in flavor rooms, ending at the objective', () => {
    const d = generateDungeon(makeInputs({ roomCount: 20, seed: 'story-3' }));
    const chain = d.narrative.clueChain;
    expect(chain.length).toBeGreaterThanOrEqual(2);
    expect(chain[chain.length - 1].pointsTo).toBe('objective');
    for (const clue of chain) {
      expect(clue.text).not.toMatch(NO_UNEXPANDED);
      const room = d.graph.rooms.find((r) => r.id === clue.roomId)!;
      expect(room.kind).toBe('empty');
      expect(room.narrative?.clueId).toBe(clue.id);
    }
  });

  it('is deterministic for a fixed seed', () => {
    const a = generateDungeon(makeInputs({ seed: 'story-stable', roomCount: 14 }));
    const b = generateDungeon(makeInputs({ seed: 'story-stable', roomCount: 14 }));
    expect(a.narrative).toEqual(b.narrative);
  });
});

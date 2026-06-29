import { describe, it, expect } from 'vitest';
import { generateDungeon, rerollRoom } from '../generation';
import { makeInputs } from './helpers';

function firstRoomOfKind(d: ReturnType<typeof generateDungeon>, kind: string): string | undefined {
  return d.graph.rooms.find((r) => r.kind === kind)?.id;
}

describe('single-room re-roll', () => {
  it('changes only the target room; all others stay byte-identical', () => {
    const d = generateDungeon(makeInputs({ roomCount: 20, seed: 'reroll-iso', difficulty: 'hard' }));
    const target = firstRoomOfKind(d, 'combat')!;
    const after = rerollRoom(d, target);

    for (const before of d.graph.rooms) {
      const now = after.graph.rooms.find((r) => r.id === before.id)!;
      if (before.id === target) {
        expect(now.subSeed).not.toBe(before.subSeed);
        expect(now.rerollCount).toBe(before.rerollCount + 1);
      } else {
        expect(now).toEqual(before);
      }
    }
  });

  it('leaves the top-level narrative untouched', () => {
    const d = generateDungeon(makeInputs({ roomCount: 18, seed: 'reroll-narr' }));
    const target = firstRoomOfKind(d, 'treasure') ?? firstRoomOfKind(d, 'combat')!;
    const after = rerollRoom(d, target);
    expect(after.narrative.premise).toBe(d.narrative.premise);
    expect(after.narrative.antagonist).toEqual(d.narrative.antagonist);
  });

  it('is deterministic and progresses on repeated re-rolls', () => {
    const d = generateDungeon(makeInputs({ roomCount: 16, seed: 'reroll-det' }));
    const target = firstRoomOfKind(d, 'combat')!;
    const a = rerollRoom(d, target);
    const b = rerollRoom(d, target);
    // From the same starting dungeon, re-rolling the same room is reproducible.
    expect(a.graph.rooms.find((r) => r.id === target)).toEqual(b.graph.rooms.find((r) => r.id === target));
    // Re-rolling again from the new state advances the counter and the sub-seed.
    const c = rerollRoom(a, target);
    const ra = a.graph.rooms.find((r) => r.id === target)!;
    const rc = c.graph.rooms.find((r) => r.id === target)!;
    expect(rc.rerollCount).toBe(ra.rerollCount + 1);
    expect(rc.subSeed).not.toBe(ra.subSeed);
  });

  it('does not re-roll story-critical rooms (entrance/boss)', () => {
    const d = generateDungeon(makeInputs({ roomCount: 12, seed: 'reroll-boss' }));
    const unchangedBoss = rerollRoom(d, d.graph.bossId);
    expect(unchangedBoss).toBe(d);
    const unchangedEntrance = rerollRoom(d, d.graph.entranceId);
    expect(unchangedEntrance).toBe(d);
  });
});

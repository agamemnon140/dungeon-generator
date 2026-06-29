import type { Objective, Tone } from '../../domain/inputs';

/**
 * Origin templates contain #symbols# expanded by the tracery engine against a
 * grammar the generator assembles from these tables plus runtime context
 * (#place#, #boss#, #framing#, #stakes#, #npc#, #artifact#).
 */

export const HOOK_BY_OBJECTIVE: Record<Objective, string[]> = {
  rescue: [
    'Word reaches you that #npc# was dragged into #place#. #boss#, #framing#, holds them somewhere within. If you fail, #stakes#',
    'A trembling messenger begs your aid: #npc# vanished beneath #place#, and #boss# is said to rule its depths. #stakes#',
  ],
  'retrieve-artifact': [
    'Scholars have traced #artifact# to #place#. It is guarded by #boss#, #framing#. Recover it before #stakes#',
    '#artifact# was lost in #place# generations ago. Now #boss# hoards it, #framing#, and #stakes#',
  ],
  'eliminate-threat': [
    'Something stirs in #place#: #boss#, #framing#, has begun preying on the lands above. End it, or #stakes#',
    'The raids all trace back to #place#, where #boss# gathers strength. Strike now, for #stakes#',
  ],
  explore: [
    '#place# has lain sealed for an age, until its doors cracked open on their own. Whatever waits inside answers to #boss#, #framing#. #stakes#',
    'Maps end at the threshold of #place#. You are the first to enter in living memory — but you are not alone here, for #boss# walks its halls, and #stakes#',
  ],
};

export const FRAMING_BY_TONE: Record<Tone, string[]> = {
  grim: ['an #adj# horror that has long since stopped being merciful', 'a thing of #adj# hunger wearing a crown of bone'],
  heroic: ['an #adj# tyrant whose defeat songs will remember', 'a villain grand enough to be worth the steel'],
  comic: ['an #adj# menace with a wildly inflated sense of drama', 'a self-proclaimed dark lord who monologues far too much'],
  mysterious: ['an #adj# presence no two witnesses describe the same way', 'something #adj# that may not be what it appears'],
};

export const STAKES_BY_TONE: Record<Tone, string[]> = {
  grim: ['no one else is coming, and the dark does not forgive delay.', 'every hour lost is paid for in blood that is not yours.'],
  heroic: ['the people above are counting on the few who would dare this place.', 'a darkness will spill into the world the moment you falter.'],
  comic: ['the reward is, frankly, embarrassingly good and you are not made of money.', "the alternative is explaining to everyone why you didn't."],
  mysterious: ['the truth beneath this place will not wait to be found.', 'what is uncovered here cannot be un-known.'],
};

export const RESOLUTION_BY_OBJECTIVE: Record<Objective, string[]> = {
  rescue: ['Beyond the final door, #npc# is found alive — and #boss# stands between them and freedom.', 'The captive is here, bound and watched. Cut them loose once #boss# falls.'],
  'retrieve-artifact': ['#artifact# rests upon a dais, wreathed in wards, with #boss# coiled around it.', 'Here lies #artifact# at last — but #boss# will not surrender it without a reckoning.'],
  'eliminate-threat': ['#boss# waits in its seat of power, fully roused now and ready to end the intrusion.', 'This is the heart of the threat: #boss#, and the only way out is through it.'],
  explore: ["The deepest chamber gives up the dungeon's secret — and #boss# is the keeper that secret was hiding.", 'What the maps could never show waits here, guarded to the last by #boss#.'],
};

export const ENTRY_FLAVOR = [
  'The threshold exhales cold, stale air; whatever lives here knows you have come.',
  'Old warnings are scratched beside the entrance, in more than one hand.',
  'The way in is easy. Something about that is not reassuring.',
  'Tracks in the dust lead inward — many going in, few coming back.',
];

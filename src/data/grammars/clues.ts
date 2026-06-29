import type { Clue } from '../../domain/narrative';

/** Clue templates by what they point toward. Expanded against the shared grammar. */
export const CLUE_TEMPLATES: Record<Clue['pointsTo'], string[]> = {
  antagonist: [
    'Claw-scored walls and a discarded offering hint at #boss#, #framing#.',
    'A scrawled name repeats across the stone — a warning about #boss#.',
    'The remains here were arranged deliberately, the way #boss# is said to mark its territory.',
  ],
  objective: [
    'A torn page describes the way deeper, toward what you came for.',
    'Fresh drag-marks lead inward, exactly where you need to go.',
    'A faded map fragment circles the chamber at the heart of #place#.',
  ],
  hazard: [
    'A skeleton lies mid-stride beside a sprung mechanism — the halls ahead are trapped.',
    'Scorch-marks and a dropped tool warn of a hazard further in.',
    'Someone chalked a hurried symbol here: danger, and an arrow pointing on.',
  ],
};

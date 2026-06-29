import { create } from 'zustand';
import type { DungeonInputs } from '../domain/inputs';
import type { Dungeon } from '../domain/dungeon';
import { generateDungeon, rerollRoom, GENERATOR_VERSION } from '../generation';
import { DEFAULT_RENDERER_ID } from '../render';
import { loadSaved, writeSaved, newId, type SavedGeneration } from './persistence';

export const DEFAULT_INPUTS: DungeonInputs = {
  seed: 'aboleth',
  environment: 'crypt',
  partyLevel: 3,
  partySize: 4,
  roomCount: 10,
  difficulty: 'medium',
  tone: 'grim',
  objective: 'retrieve-artifact',
  topology: 'branching',
};

const SEED_WORDS = [
  'ember', 'hollow', 'mourn', 'gloom', 'rune', 'wraith', 'tide', 'cinder',
  'umbral', 'frost', 'echo', 'silt', 'thorn', 'vault', 'gale', 'dusk',
];

/** UI-only random seed (Math.random is fine here — it never touches generation). */
export function makeSeed(): string {
  const w = SEED_WORDS[Math.floor(Math.random() * SEED_WORDS.length)];
  const n = Math.floor(Math.random() * 1000);
  return `${w}-${n}`;
}

function defaultName(inputs: DungeonInputs): string {
  return `${inputs.environment} · ${inputs.objective} (${inputs.seed})`;
}

interface StoreState {
  inputs: DungeonInputs;
  dungeon: Dungeon;
  selectedRoomId: string | null;
  rendererId: string;
  saved: SavedGeneration[];
  setInput: <K extends keyof DungeonInputs>(key: K, value: DungeonInputs[K]) => void;
  randomizeSeed: () => void;
  generate: () => void;
  selectRoom: (id: string | null) => void;
  setRenderer: (id: string) => void;
  rerollRoom: (roomId: string) => void;
  saveCurrent: () => void;
  loadGeneration: (id: string) => void;
  deleteSaved: (id: string) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  inputs: DEFAULT_INPUTS,
  dungeon: generateDungeon(DEFAULT_INPUTS),
  selectedRoomId: null,
  rendererId: DEFAULT_RENDERER_ID,
  saved: loadSaved(),

  setInput: (key, value) => set((s) => ({ inputs: { ...s.inputs, [key]: value } })),
  randomizeSeed: () => set((s) => ({ inputs: { ...s.inputs, seed: makeSeed() } })),
  generate: () => set({ dungeon: generateDungeon(get().inputs), selectedRoomId: null }),
  selectRoom: (id) => set({ selectedRoomId: id }),
  setRenderer: (id) => set({ rendererId: id }),
  rerollRoom: (roomId) => set((s) => ({ dungeon: rerollRoom(s.dungeon, roomId) })),

  saveCurrent: () => {
    const { inputs, saved } = get();
    const entry: SavedGeneration = {
      id: newId(),
      name: defaultName(inputs),
      inputs,
      savedAt: Date.now(),
      version: GENERATOR_VERSION,
    };
    const next = [entry, ...saved].slice(0, 50);
    writeSaved(next);
    set({ saved: next });
  },

  loadGeneration: (id) => {
    const entry = get().saved.find((s) => s.id === id);
    if (!entry) return;
    set({ inputs: entry.inputs, dungeon: generateDungeon(entry.inputs), selectedRoomId: null });
  },

  deleteSaved: (id) => {
    const next = get().saved.filter((s) => s.id !== id);
    writeSaved(next);
    set({ saved: next });
  },
}));

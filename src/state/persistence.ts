import type { DungeonInputs } from '../domain/inputs';

/** A saved generation stores only the inputs (+ seed) — it replays deterministically. */
export interface SavedGeneration {
  id: string;
  name: string;
  inputs: DungeonInputs;
  savedAt: number;
  version: string;
}

const KEY = 'dungeon.saved.v1';

export function loadSaved(): SavedGeneration[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedGeneration[]) : [];
  } catch {
    return [];
  }
}

export function writeSaved(list: SavedGeneration[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

import type { RoomKind } from '../domain/graph';

export interface RoomKindMeta {
  label: string;
  color: string;
  /** Short glyph shown on the map node. */
  glyph: string;
}

export const ROOM_KIND_META: Record<RoomKind, RoomKindMeta> = {
  entrance: { label: 'Entrance', color: '#5cd67e', glyph: '⇲' },
  boss: { label: 'Boss', color: '#b15cd6', glyph: '☠' },
  combat: { label: 'Combat', color: '#d65c5c', glyph: '⚔' },
  trap: { label: 'Trap', color: '#d6a15c', glyph: '⚠' },
  treasure: { label: 'Treasure', color: '#c9a14a', glyph: '◆' },
  puzzle: { label: 'Puzzle', color: '#6f8cff', glyph: '?' },
  empty: { label: 'Flavor', color: '#6b7186', glyph: '·' },
};

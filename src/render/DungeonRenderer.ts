import type { ReactElement } from 'react';
import type { DungeonGraph } from '../domain/graph';

export interface DungeonRendererProps {
  graph: DungeonGraph;
  selectedRoomId?: string | null;
  onSelectRoom?: (id: string) => void;
}

/**
 * Renders a DungeonGraph to a view. The node-link diagram implements this today;
 * a future tile/battlemap renderer implements the same interface over the same
 * model — this is the model↔renderer seam.
 */
export interface DungeonRenderer {
  id: string;
  label: string;
  render: (props: DungeonRendererProps) => ReactElement;
}

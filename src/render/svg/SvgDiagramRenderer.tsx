import { useMemo } from 'react';
import type { DungeonRendererProps } from '../DungeonRenderer';
import { roomById } from '../../domain/graph';
import { layeredLayout } from '../layout/layeredLayout';
import { EdgeLine } from './EdgeLine';
import { RoomNode } from './RoomNode';

export function SvgDiagramRenderer({ graph, selectedRoomId, onSelectRoom }: DungeonRendererProps) {
  const layout = useMemo(() => layeredLayout(graph), [graph]);

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      width="100%"
      style={{ maxHeight: '70vh', display: 'block' }}
      role="img"
      aria-label="Dungeon map diagram"
    >
      {graph.connections.map((c) => {
        const a = layout.positions[c.from];
        const b = layout.positions[c.to];
        if (!a || !b) return null;
        return <EdgeLine key={c.id} a={a} b={b} kind={c.kind} />;
      })}
      {graph.rooms.map((r) => {
        const point = layout.positions[r.id];
        if (!point) return null;
        return (
          <RoomNode
            key={r.id}
            room={roomById(graph, r.id)!}
            point={point}
            selected={selectedRoomId === r.id}
            onSelect={onSelectRoom}
          />
        );
      })}
    </svg>
  );
}

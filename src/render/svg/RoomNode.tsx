import type { Room } from '../../domain/graph';
import { ROOM_KIND_META } from '../roomStyle';
import { NODE_W, NODE_H, type Point } from '../layout/layeredLayout';

interface Props {
  room: Room;
  point: Point;
  selected: boolean;
  onSelect?: (id: string) => void;
}

export function RoomNode({ room, point, selected, onSelect }: Props) {
  const meta = ROOM_KIND_META[room.kind];
  const x = point.x - NODE_W / 2;
  const y = point.y - NODE_H / 2;
  const num = room.id.replace(/^r/, '');

  return (
    <g
      transform={`translate(${x} ${y})`}
      onClick={() => onSelect?.(room.id)}
      style={{ cursor: onSelect ? 'pointer' : 'default' }}
    >
      <title>{room.label}</title>
      <rect
        width={NODE_W}
        height={NODE_H}
        rx={10}
        fill="#1b1d27"
        stroke={selected ? '#ffffff' : meta.color}
        strokeWidth={selected ? 3 : 2}
      />
      <rect width={6} height={NODE_H} rx={3} fill={meta.color} />
      <text x={18} y={26} fontSize={18} fill="#e7e9ef" fontWeight={600}>
        <tspan fill={meta.color}>{meta.glyph}</tspan> R{num}
      </text>
      <text x={18} y={45} fontSize={12} fill="#9aa0b4">
        {meta.label}
      </text>
    </g>
  );
}

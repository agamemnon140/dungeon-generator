import { useMemo } from 'react';
import type { DungeonRendererProps } from '../DungeonRenderer';
import type { ConnectionKind } from '../../domain/graph';
import { ROOM_KIND_META } from '../roomStyle';
import { tileLayout } from './tileLayout';

const CELL = 22;
const ROOM_FLOOR = '#363c4e';
const CORRIDOR = '#2b3040';
const GRID_LINE = '#232634';

const DOOR_COLOR: Record<ConnectionKind, string> = {
  passage: '#565d76',
  door: '#c9a14a',
  secret: '#6f8cff',
  locked: '#d65c5c',
};

export function TileGridRenderer({ graph, selectedRoomId, onSelectRoom }: DungeonRendererProps) {
  const layout = useMemo(() => tileLayout(graph), [graph]);
  const width = layout.cols * CELL;
  const height = layout.rows * CELL;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxHeight: '72vh', display: 'block' }}
      role="img"
      aria-label="Dungeon battlemap"
    >
      <defs>
        <pattern id="tilegrid" width={CELL} height={CELL} patternUnits="userSpaceOnUse">
          <path d={`M ${CELL} 0 L 0 0 0 ${CELL}`} fill="none" stroke={GRID_LINE} strokeWidth={1} />
        </pattern>
      </defs>

      <rect width={width} height={height} fill="#14161f" />
      <rect width={width} height={height} fill="url(#tilegrid)" />

      {/* Corridors (drawn under rooms) */}
      {layout.corridors.map((c) => (
        <g key={c.id}>
          {c.cells.map((cell, i) => (
            <rect key={i} x={cell.x * CELL} y={cell.y * CELL} width={CELL} height={CELL} fill={CORRIDOR} />
          ))}
          {c.doors.map((d, i) => (
            <rect
              key={`d${i}`}
              x={d.x * CELL + CELL * 0.18}
              y={d.y * CELL + CELL * 0.18}
              width={CELL * 0.64}
              height={CELL * 0.64}
              rx={2}
              fill={DOOR_COLOR[c.kind]}
            />
          ))}
        </g>
      ))}

      {/* Rooms (drawn over corridors) */}
      {layout.rooms.map((r) => {
        const meta = ROOM_KIND_META[r.kind];
        const x = r.gx * CELL;
        const y = r.gy * CELL;
        const w = r.w * CELL;
        const h = r.h * CELL;
        const selected = selectedRoomId === r.id;
        const fontSize = Math.max(12, Math.min(w, h) * 0.32);
        return (
          <g
            key={r.id}
            onClick={() => onSelectRoom?.(r.id)}
            style={{ cursor: onSelectRoom ? 'pointer' : 'default' }}
          >
            <title>{r.label}</title>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill={ROOM_FLOOR}
              stroke={selected ? '#ffffff' : meta.color}
              strokeWidth={selected ? 4 : 3}
            />
            <text
              x={x + w / 2}
              y={y + h / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize}
              fill="#e7e9ef"
              fontWeight={700}
            >
              <tspan fill={meta.color}>{meta.glyph}</tspan> {r.id.replace(/^r/, 'R')}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

import type { ConnectionKind } from '../../domain/graph';
import type { Point } from '../layout/layeredLayout';

const STYLE: Record<ConnectionKind, { stroke: string; dash?: string; width: number }> = {
  passage: { stroke: '#3a3f52', width: 2 },
  door: { stroke: '#565d76', width: 3 },
  secret: { stroke: '#565d76', width: 2, dash: '4 5' },
  locked: { stroke: '#a8623a', width: 3 },
};

export function EdgeLine({ a, b, kind }: { a: Point; b: Point; kind: ConnectionKind }) {
  const s = STYLE[kind];
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={s.stroke}
      strokeWidth={s.width}
      strokeDasharray={s.dash}
      strokeLinecap="round"
    />
  );
}

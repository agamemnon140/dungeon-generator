import type { RoomContent } from '../../domain/content';

function coinLine(loot: { cp: number; sp: number; gp: number }): string {
  const parts = [
    loot.gp ? `${loot.gp} gp` : '',
    loot.sp ? `${loot.sp} sp` : '',
    loot.cp ? `${loot.cp} cp` : '',
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '—';
}

export function RoomContentView({ content }: { content: RoomContent }) {
  switch (content.type) {
    case 'trap': {
      const t = content.trap;
      return (
        <div className="content-block">
          <div className="content-title">⚠ {t.name}</div>
          <div className="content-line">{t.effect}</div>
          <div className="content-meta">
            Detect DC {t.detectDC} · Disarm DC {t.disarmDC}
            {t.damage ? ` · ${t.damage}` : ''}
          </div>
        </div>
      );
    }
    case 'treasure': {
      const l = content.loot;
      return (
        <div className="content-block">
          <div className="content-title">◆ Treasure</div>
          <div className="content-line">{coinLine(l)}</div>
          {l.items.length > 0 && <div className="content-meta">Items: {l.items.join(', ')}</div>}
        </div>
      );
    }
    case 'puzzle': {
      const p = content.puzzle;
      return (
        <div className="content-block">
          <div className="content-title">? {p.name}</div>
          <div className="content-line">{p.description}</div>
          <details className="content-solution">
            <summary>Solution</summary>
            {p.solution}
          </details>
        </div>
      );
    }
    case 'entrance':
    case 'empty':
      return content.flavor ? (
        <div className="content-block">
          <div className="content-line">{content.flavor}</div>
        </div>
      ) : null;
    case 'boss':
      return content.objectivePayoff ? (
        <div className="content-block">
          <div className="content-line">{content.objectivePayoff}</div>
        </div>
      ) : null;
    case 'combat':
      return null;
  }
}

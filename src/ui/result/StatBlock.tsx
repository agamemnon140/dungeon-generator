import { MONSTERS_BY_INDEX } from '../../data/srd';
import { formatCr, formatXp } from '../format';

export function StatBlock({ index }: { index: string }) {
  const m = MONSTERS_BY_INDEX.get(index);
  if (!m) return null;

  return (
    <div className="statblock">
      <div className="sb-head">
        <strong>{m.name}</strong>
        <span className="sb-sub">
          {m.size} {m.type}
          {m.subtype ? ` (${m.subtype})` : ''} · CR {formatCr(m.cr)} ({formatXp(m.xp)} XP)
        </span>
      </div>
      <div className="sb-line">
        AC {m.ac} · HP {m.hp}
        {m.hitDice ? ` (${m.hitDice})` : ''}
        {m.speed ? ` · Speed ${m.speed}` : ''}
      </div>
      {m.actions.length > 0 && (
        <ul className="sb-actions">
          {m.actions.map((a) => (
            <li key={a.name}>
              <strong>{a.name}.</strong> {a.desc}
            </li>
          ))}
        </ul>
      )}
      {m.source && <div className="sb-source">{m.source}</div>}
    </div>
  );
}

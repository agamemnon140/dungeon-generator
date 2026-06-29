import type { Encounter } from '../../domain/encounter';
import { StatBlock } from './StatBlock';
import { formatCr, formatXp } from '../format';

export function EncounterView({ encounter, expanded }: { encounter: Encounter; expanded: boolean }) {
  return (
    <div className="encounter">
      <div className="encounter-list">
        {encounter.monsters.map((m) => (
          <div key={m.monsterIndex} className="enc-monster">
            <span>
              {m.count > 1 ? `${m.count}× ` : ''}
              {m.name}
            </span>
            <span className="muted">
              CR {formatCr(m.cr)} · {formatXp(m.xp)} XP
            </span>
          </div>
        ))}
      </div>

      <div className="encounter-math">
        {formatXp(encounter.rawXp)} × {encounter.multiplier} ={' '}
        <strong>{formatXp(encounter.adjustedXp)} XP</strong> · budget {formatXp(encounter.budget)} ·{' '}
        <span className={`diff diff-${encounter.difficultyAchieved}`}>{encounter.difficultyAchieved}</span>
      </div>

      {encounter.note && <div className="encounter-note">⚠ {encounter.note}</div>}

      {expanded && (
        <div className="statblocks">
          {encounter.monsters.map((m) => (
            <StatBlock key={m.monsterIndex} index={m.monsterIndex} />
          ))}
        </div>
      )}
    </div>
  );
}

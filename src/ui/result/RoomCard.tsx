import type { Room } from '../../domain/graph';
import { canReroll } from '../../generation';
import { ROOM_KIND_META } from '../../render/roomStyle';
import { EncounterView } from './EncounterView';
import { RoomContentView } from './RoomContentView';

interface Props {
  room: Room;
  selected: boolean;
  onSelect: (id: string | null) => void;
  onReroll: (id: string) => void;
}

export function RoomCard({ room, selected, onSelect, onReroll }: Props) {
  const meta = ROOM_KIND_META[room.kind];
  const num = room.id.replace(/^r/, '');

  return (
    <div
      className={`room-card${selected ? ' selected' : ''}`}
      style={{ borderLeftColor: meta.color }}
      onClick={() => onSelect(selected ? null : room.id)}
    >
      <div className="room-card-head">
        <span className="room-num">R{num}</span>
        <span className="room-head-right">
          <span className="room-kind" style={{ color: meta.color }}>
            {meta.glyph} {meta.label}
          </span>
          {canReroll(room.kind) && (
            <button
              type="button"
              className="reroll-btn"
              title="Re-roll this room"
              aria-label="Re-roll this room"
              onClick={(e) => {
                e.stopPropagation();
                onReroll(room.id);
              }}
            >
              🎲
            </button>
          )}
        </span>
      </div>
      <div className="room-label">{room.label}</div>
      <div className="room-meta">depth {room.depth}</div>

      <RoomContentView content={room.content} />
      {room.encounter && <EncounterView encounter={room.encounter} expanded={selected} />}
    </div>
  );
}

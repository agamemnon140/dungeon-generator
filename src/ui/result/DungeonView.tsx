import { useStore } from '../../state/store';
import { RENDERERS, RENDERER_LIST, DEFAULT_RENDERER_ID } from '../../render';
import { ROOM_KIND_META } from '../../render/roomStyle';
import type { RoomKind } from '../../domain/graph';
import { RoomCard } from './RoomCard';
import { NarrativeView } from './NarrativeView';

function Legend({ kinds }: { kinds: RoomKind[] }) {
  return (
    <div className="legend">
      {kinds.map((k) => (
        <span key={k} className="legend-item">
          <span className="legend-dot" style={{ background: ROOM_KIND_META[k].color }} />
          {ROOM_KIND_META[k].label}
        </span>
      ))}
    </div>
  );
}

export function DungeonView() {
  const dungeon = useStore((s) => s.dungeon);
  const selectedRoomId = useStore((s) => s.selectedRoomId);
  const selectRoom = useStore((s) => s.selectRoom);
  const reroll = useStore((s) => s.rerollRoom);
  const saveCurrent = useStore((s) => s.saveCurrent);
  const rendererId = useStore((s) => s.rendererId);
  const setRenderer = useStore((s) => s.setRenderer);

  const renderer = RENDERERS[rendererId] ?? RENDERERS[DEFAULT_RENDERER_ID];
  const kindsPresent = [...new Set(dungeon.graph.rooms.map((r) => r.kind))];

  return (
    <div className="dungeon-view">
      <div className="results-toolbar">
        <button type="button" onClick={saveCurrent}>
          💾 Save
        </button>
        <button type="button" onClick={() => window.print()}>
          🖨 Print / PDF
        </button>
      </div>

      <NarrativeView narrative={dungeon.narrative} />

      <section className="map-panel">
        <div className="map-toolbar">
          <div className="map-toolbar-left">
            <h2>Map</h2>
            <div className="renderer-toggle">
              {RENDERER_LIST.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={r.id === rendererId ? 'active' : ''}
                  onClick={() => setRenderer(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <Legend kinds={kindsPresent} />
        </div>
        <div className="map-canvas">
          {renderer.render({
            graph: dungeon.graph,
            selectedRoomId,
            onSelectRoom: (id) => selectRoom(id === selectedRoomId ? null : id),
          })}
        </div>
      </section>

      <section className="rooms-panel">
        <h2>Rooms ({dungeon.graph.rooms.length})</h2>
        <div className="room-list">
          {dungeon.graph.rooms.map((r) => (
            <RoomCard
              key={r.id}
              room={r}
              selected={r.id === selectedRoomId}
              onSelect={selectRoom}
              onReroll={reroll}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

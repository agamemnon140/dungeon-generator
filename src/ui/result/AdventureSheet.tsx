import { useStore } from '../../state/store';
import { RENDERERS, DEFAULT_RENDERER_ID } from '../../render';
import { ROOM_KIND_META } from '../../render/roomStyle';
import { ENVIRONMENTS, OBJECTIVES } from '../../domain/inputs';
import { NarrativeView } from './NarrativeView';
import { RoomContentView } from './RoomContentView';
import { EncounterView } from './EncounterView';

/** Print/PDF-friendly full adventure document (shown only when printing). */
export function AdventureSheet() {
  const dungeon = useStore((s) => s.dungeon);
  const rendererId = useStore((s) => s.rendererId);
  const renderer = RENDERERS[rendererId] ?? RENDERERS[DEFAULT_RENDERER_ID];
  const { inputs, graph, narrative } = dungeon;
  const env = ENVIRONMENTS.find((o) => o.value === inputs.environment)?.label ?? inputs.environment;
  const obj = OBJECTIVES.find((o) => o.value === inputs.objective)?.label ?? inputs.objective;

  return (
    <article className="sheet">
      <header className="sheet-header">
        <h1>{env}</h1>
        <p className="sheet-sub">
          Level {inputs.partyLevel} · {inputs.partySize} PCs · {inputs.difficulty} · {graph.rooms.length} rooms ·
          seed &ldquo;{inputs.seed}&rdquo;
        </p>
        <p className="sheet-sub">Objective: {obj}</p>
      </header>

      <NarrativeView narrative={narrative} />

      <div className="sheet-map">{renderer.render({ graph })}</div>

      <section className="sheet-rooms">
        {graph.rooms.map((r) => {
          const meta = ROOM_KIND_META[r.kind];
          return (
            <div key={r.id} className="sheet-room">
              <h3>
                <span style={{ color: meta.color }}>{meta.glyph}</span> R{r.id.replace(/^r/, '')} — {r.label}{' '}
                <span className="sheet-roomkind">({meta.label})</span>
              </h3>
              <RoomContentView content={r.content} />
              {r.encounter && <EncounterView encounter={r.encounter} expanded />}
            </div>
          );
        })}
      </section>

      <footer className="sheet-footer">
        Monster data derived from the SRD 5.1 (CC-BY-4.0). Generated procedurally.
      </footer>
    </article>
  );
}

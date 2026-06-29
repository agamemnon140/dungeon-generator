import type { NarrativeSpec } from '../../domain/narrative';

export function NarrativeView({ narrative }: { narrative: NarrativeSpec }) {
  if (!narrative.premise) return null;
  return (
    <section className="narrative-panel">
      <h2>The Adventure</h2>
      <p className="premise">{narrative.premise}</p>
      <dl className="narrative-grid">
        <div>
          <dt>Antagonist</dt>
          <dd>
            {narrative.antagonist.name} — {narrative.antagonist.framing}
          </dd>
        </div>
        <div>
          <dt>Stakes</dt>
          <dd>{narrative.stakes}</dd>
        </div>
        <div>
          <dt>Resolution</dt>
          <dd>{narrative.resolution}</dd>
        </div>
      </dl>
    </section>
  );
}

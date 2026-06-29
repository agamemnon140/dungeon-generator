import { useStore } from '../../state/store';
import {
  ENVIRONMENTS,
  TOPOLOGIES,
  TONES,
  OBJECTIVES,
  DIFFICULTIES,
  ROOM_COUNT_MIN,
  ROOM_COUNT_MAX,
  PARTY_LEVEL_MIN,
  PARTY_LEVEL_MAX,
  PARTY_SIZE_MIN,
  PARTY_SIZE_MAX,
} from '../../domain/inputs';
import { SelectField, SliderField } from './controls';

export function GeneratorForm() {
  const inputs = useStore((s) => s.inputs);
  const setInput = useStore((s) => s.setInput);
  const randomizeSeed = useStore((s) => s.randomizeSeed);
  const generate = useStore((s) => s.generate);

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        generate();
      }}
    >
      <label className="field">
        <span className="field-label">Seed</span>
        <div className="seed-row">
          <input
            type="text"
            value={inputs.seed}
            onChange={(e) => setInput('seed', e.target.value)}
            placeholder="any text"
          />
          <button type="button" onClick={randomizeSeed} title="Randomize seed" aria-label="Randomize seed">
            🎲
          </button>
        </div>
      </label>

      <SelectField
        label="Environment"
        value={inputs.environment}
        options={ENVIRONMENTS}
        onChange={(v) => setInput('environment', v)}
      />

      <SliderField
        label="Party level"
        value={inputs.partyLevel}
        min={PARTY_LEVEL_MIN}
        max={PARTY_LEVEL_MAX}
        onChange={(v) => setInput('partyLevel', v)}
      />
      <SliderField
        label="Party size"
        value={inputs.partySize}
        min={PARTY_SIZE_MIN}
        max={PARTY_SIZE_MAX}
        onChange={(v) => setInput('partySize', v)}
      />
      <SliderField
        label="Rooms"
        value={inputs.roomCount}
        min={ROOM_COUNT_MIN}
        max={ROOM_COUNT_MAX}
        onChange={(v) => setInput('roomCount', v)}
      />

      <SelectField
        label="Difficulty"
        value={inputs.difficulty}
        options={DIFFICULTIES}
        onChange={(v) => setInput('difficulty', v)}
      />
      <SelectField
        label="Topology"
        value={inputs.topology}
        options={TOPOLOGIES}
        onChange={(v) => setInput('topology', v)}
      />
      <SelectField label="Tone" value={inputs.tone} options={TONES} onChange={(v) => setInput('tone', v)} />
      <SelectField
        label="Objective"
        value={inputs.objective}
        options={OBJECTIVES}
        onChange={(v) => setInput('objective', v)}
      />

      <button type="submit" className="primary generate-btn">
        Generate Dungeon
      </button>
    </form>
  );
}

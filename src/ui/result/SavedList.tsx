import { useStore } from '../../state/store';

export function SavedList() {
  const saved = useStore((s) => s.saved);
  const loadGeneration = useStore((s) => s.loadGeneration);
  const deleteSaved = useStore((s) => s.deleteSaved);

  if (saved.length === 0) {
    return <p className="saved-empty">No saved dungeons yet. Generate one and hit Save.</p>;
  }

  return (
    <ul className="saved-list">
      {saved.map((s) => (
        <li key={s.id} className="saved-item">
          <button type="button" className="saved-load" onClick={() => loadGeneration(s.id)} title="Load">
            {s.name}
          </button>
          <button
            type="button"
            className="saved-delete"
            onClick={() => deleteSaved(s.id)}
            title="Delete"
            aria-label="Delete saved dungeon"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}

import { GeneratorForm } from './ui/form/GeneratorForm';
import { DungeonView } from './ui/result/DungeonView';
import { SavedList } from './ui/result/SavedList';
import { AdventureSheet } from './ui/result/AdventureSheet';

export function App() {
  return (
    <>
      <div className="app screen-only">
        <header className="app-header">
          <h1>⛬ Dungeon Generator</h1>
          <span className="tagline">Procedural D&amp;D 5e adventures</span>
        </header>
        <div className="app-body">
          <aside className="sidebar">
            <GeneratorForm />
            <div className="sidebar-section">
              <h2 className="sidebar-title">Saved</h2>
              <SavedList />
            </div>
          </aside>
          <main className="content">
            <DungeonView />
          </main>
        </div>
        <footer className="app-footer">
          Monster data derived from the SRD 5.1 (CC-BY-4.0). See ATTRIBUTION.md.
        </footer>
      </div>

      <div className="print-only">
        <AdventureSheet />
      </div>
    </>
  );
}

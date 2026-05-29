import { useData } from '../context/DataContext';
import { DropItem } from './DropItem';

export function DropsPanel() {
  const { drops } = useData();
  const recent = drops.slice(0, 20);

  return (
    <section className="home-panel">
      <h2 className="home-panel-title">Recent Drops</h2>
      {recent.length === 0 && (
        <div className="feed-empty">No drops recorded yet.</div>
      )}
      <div className="drops-list">
        {recent.map((drop) => (
          <DropItem key={drop.key} drop={drop} />
        ))}
      </div>
    </section>
  );
}

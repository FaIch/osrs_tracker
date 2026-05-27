import { useEffect, useState } from 'react';
import { fetchDrops } from '../api/drops';
import type { Drop } from '../api/drops';
import { DropItem } from './DropItem';

export function DropsPanel() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchDrops()
      .then((data) => setDrops(data.slice(0, 20)))
      .catch(() => setError(true));
  }, []);

  return (
    <section className="home-panel">
      <h2 className="home-panel-title">Recent Drops</h2>
      {error && <div className="feed-empty">Could not load drops.</div>}
      {!error && drops.length === 0 && (
        <div className="feed-empty">No drops recorded yet.</div>
      )}
      <div className="drops-list">
        {drops.map((drop) => (
          <DropItem key={drop.key} drop={drop} />
        ))}
      </div>
    </section>
  );
}

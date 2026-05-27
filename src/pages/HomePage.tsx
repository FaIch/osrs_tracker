import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PLAYERS, PLAYER_ICON_FILTERS } from '../config';
import { useData } from '../context/DataContext';
import { lastName } from '../utils/format';
import { updatePlayer } from '../api/wom';
import { ActivityFeed } from '../components/ActivityFeed';
import { TrendingSection } from '../components/TrendingSection';
import { XpChart } from '../components/XpChart';
import { DropsPanel } from '../components/DropsPanel';

export function HomePage() {
  const { diary, loading, errors, refresh } = useData();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'success' | 'error' | null>(null);

  async function handleUpdate() {
    setUpdating(true);
    setUpdateStatus(null);
    try {
      await Promise.all(PLAYERS.map((name) => updatePlayer(name)));
      await refresh();
      setUpdateStatus('success');
    } catch {
      setUpdateStatus('error');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Group Ironman Tracker</h1>
        <div className="members-row">
          <div className="group-members">
            {PLAYERS.map((name) => (
              <span
                key={name}
                className="member-tag"
                onClick={() => navigate(`/player/${encodeURIComponent(name)}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/player/${encodeURIComponent(name)}`)}
              >
                <img src={`${import.meta.env.BASE_URL}icons/general/gim_icon.webp`} className="member-tag-icon" alt="" aria-hidden="true" style={{ filter: PLAYER_ICON_FILTERS[name] }} />
                {lastName(name)}<span className="member-tag-arrow">→</span>
              </span>
            ))}
          </div>
          <div className="header-actions">
            <button
              className="update-btn"
              onClick={handleUpdate}
              disabled={updating || loading}
            >
              {updating ? 'Updating...' : 'Update'}
            </button>
            {updateStatus === 'success' && <span className="update-status success">Updated</span>}
            {updateStatus === 'error' && <span className="update-status error">Update failed</span>}
          </div>
        </div>
      </header>

      <main className="app-main">
        {loading && (
          <div className="status-box loading">Fetching player data from Wise Old Man...</div>
        )}

        {!loading && errors.length > 0 && (
          <div className="status-box warning">
            {errors.map((e, i) => <p key={i}>⚠ {e}</p>)}
          </div>
        )}

        {!loading && (
          <>
            <XpChart diary={diary} />
            <div className="home-bottom">
              <section className="home-panel">
                <h2 className="home-panel-title">Recent Activity</h2>
                <ActivityFeed diary={diary} dayCount={3} />
              </section>
              <section className="home-panel">
                <h2 className="home-panel-title">
                  Trending <span className="home-panel-sub">last 3 days</span>
                </h2>
                <TrendingSection diary={diary} dayCount={3} />
              </section>
              <DropsPanel />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

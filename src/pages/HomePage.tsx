import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PLAYERS } from '../config';
import { useData } from '../context/DataContext';
import { lastName } from '../utils/format';
import { ActivityFeed } from '../components/ActivityFeed';
import { TrendingSection } from '../components/TrendingSection';
import { XpChart } from '../components/XpChart';

// ── Page ──────────────────────────────────────────────



export function HomePage() {
  const { diary, loading, errors } = useData();
  const navigate = useNavigate();

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Group Ironman Tracker</h1>
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
              {lastName(name)}
            </span>
          ))}
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
            </div>
          </>
        )}
      </main>
    </div>
  );
}

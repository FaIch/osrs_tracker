import { useNavigate } from 'react-router-dom';
import { PLAYERS } from '../config';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Group Ironman Diary</h1>
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
              {name}
            </span>
          ))}
        </div>
      </header>
    </div>
  );
}

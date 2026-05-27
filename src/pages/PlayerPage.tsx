import { useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { PLAYERS, PLAYER_ICON_FILTERS } from '../config';
import { useData } from '../context/DataContext';
import { lastName } from '../utils/format';
import { DiaryEntry } from '../components/DiaryEntry';
import { PlayerOverview } from '../components/PlayerOverview';
import type { DayEntry } from '../utils/diary';

export function PlayerPage() {
  const { name: rawName } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { diary, snapshots, loading, errors } = useData();

  const playerName = rawName ?? '';

  const latestSnapshot = snapshots[playerName]
    ? [...snapshots[playerName]].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0]
    : undefined;

  

  const playerDiary = useMemo((): DayEntry[] => {
    return diary
      .map((entry) => {
        const players = entry.players.filter((p) => p.name === playerName);
        if (players.length === 0) return null;
        return {
          ...entry,
          players,
          totalXpGained: players.reduce((s, p) => s + p.totalXpGained, 0),
          totalBossKills: players.reduce(
            (s, p) => s + p.bosses.reduce((bs, b) => bs + b.killsGained, 0),
            0,
          ),
          totalClues: players.reduce(
            (s, p) =>
              s +
              p.activities
                .filter((a) => a.metric.startsWith('clue_scrolls'))
                .reduce((as, a) => as + a.scoreGained, 0),
            0,
          ),
          totalLevelUps: players.reduce((s, p) => s + p.levelUps.length, 0),
        };
      })
      .filter((e): e is DayEntry => e !== null);
  }, [diary, playerName]);

  if (!loading && playerName && !PLAYERS.includes(playerName as (typeof PLAYERS)[number])) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app">
      <header className="app-header player-page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Group
        </button>
        <h1 className="app-title">
          <img src={`${import.meta.env.BASE_URL}icons/general/gim_icon.webp`} className="player-header-icon" alt="" aria-hidden="true" style={{ filter: PLAYER_ICON_FILTERS[playerName] }} />
          {lastName(playerName)}
        </h1>
      </header>

      <main className="app-main">
        {loading && (
          <div className="status-box loading">Fetching player data from Wise Old Man...</div>
        )}

        {!loading && errors.length > 0 && (
          <div className="status-box warning">
            {errors.map((e, i) => (
              <p key={i}>⚠ {e}</p>
            ))}
          </div>
        )}

        {!loading && latestSnapshot && (
          <PlayerOverview snapshot={latestSnapshot} />
        )}

        {!loading && playerDiary.length === 0 && errors.length === 0 && (
          <div className="status-box empty">
            No activity recorded yet. Data will appear after the first daily snapshot is captured.
          </div>
        )}

        {playerDiary.map((entry, i) => (
          <DiaryEntry key={entry.date} entry={entry} defaultExpanded={i === 0} />
        ))}
      </main>
    </div>
  );
}

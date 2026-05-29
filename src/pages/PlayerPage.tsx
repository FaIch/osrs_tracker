import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { PLAYERS, PLAYER_ICON_FILTERS } from '../config';
import { useData } from '../context/DataContext';
import { lastName } from '../utils/format';
import { Calendar } from '../components/Calendar';
import { DayDetail } from '../components/DayDetail';
import { PlayerOverview } from '../components/PlayerOverview';
import { fetchDrops } from '../api/drops';
import type { Drop } from '../api/drops';
import type { PlayerDayEntry } from '../utils/diary';

export function PlayerPage() {
  const { name: rawName } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { diary, snapshots, loading } = useData();

  const playerName = rawName ?? '';

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [drops, setDrops] = useState<Drop[]>([]);

  useEffect(() => {
    fetchDrops().then(setDrops).catch(() => {});
  }, []);

  const latestSnapshot = snapshots[playerName]

    ? [...snapshots[playerName]].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0]
    : undefined;

  const playerEntryByDate = useMemo((): Map<string, PlayerDayEntry> => {
    const map = new Map<string, PlayerDayEntry>();
    for (const day of diary) {
      const p = day.players.find((p) => p.name === playerName);
      if (p) map.set(day.date, p);
    }
    return map;
  }, [diary, playerName]);

  const activeDates = useMemo(() => new Set(playerEntryByDate.keys()), [playerEntryByDate]);

  useEffect(() => {
    if (selectedDate === null && playerEntryByDate.size > 0) {
      const mostRecent = [...playerEntryByDate.keys()].sort().at(-1)!;
      setSelectedDate(mostRecent);
    }
  }, [playerEntryByDate]);

  const selectedEntry = selectedDate ? (playerEntryByDate.get(selectedDate) ?? null) : null;

  const selectedDrops = useMemo(() => {
    if (!selectedDate) return [];
    return drops.filter((d) => {
      const ts = d.embeds[0]?.timestamp;
      return d.playerName === playerName && ts?.slice(0, 10) === selectedDate;
    });
  }, [drops, selectedDate, playerName]);

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
          <img
            src={`${import.meta.env.BASE_URL}icons/general/gim_icon.webp`}
            className="player-header-icon"
            alt=""
            aria-hidden="true"
            style={{ filter: PLAYER_ICON_FILTERS[playerName] }}
          />
          {lastName(playerName)}
        </h1>
      </header>

      <main className="app-main">
        {loading && (
          <div className="status-box loading">Fetching player data from Wise Old Man...</div>
        )}

        {!loading && latestSnapshot && (
          <PlayerOverview snapshot={latestSnapshot} />
        )}

        {!loading && (
          <div className="player-calendar-layout">
            <Calendar
              activeDates={activeDates}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
            />
            {selectedDate ? (
              <DayDetail
                date={selectedDate}
                entry={selectedEntry}
                drops={selectedDrops}
              />
            ) : (
              <div className="day-detail-placeholder">
                Select a highlighted day to view details.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

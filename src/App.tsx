import { useEffect, useMemo, useState } from 'react';
import { PLAYERS } from './config';
import type { PlayerName } from './config';
import { fetchPlayerSnapshots } from './api/wom';
import type { Snapshot } from './api/wom';
import { buildDiary } from './utils/diary';
import type { DayEntry } from './utils/diary';
import { DiaryEntry } from './components/DiaryEntry';
import './App.css';

export default function App() {
  const [diary, setDiary] = useState<DayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const snapshots: Record<string, Snapshot[]> = {};
      const errs: string[] = [];

      await Promise.all(
        PLAYERS.map(async (name: PlayerName) => {
          try {
            snapshots[name] = await fetchPlayerSnapshots(name);
          } catch (err) {
            errs.push(err instanceof Error ? err.message : String(err));
            snapshots[name] = [];
          }
        }),
      );

      setErrors(errs);
      setDiary(buildDiary(snapshots));
      setLoading(false);
    }

    load();
  }, []);

  const filteredDiary = useMemo((): DayEntry[] => {
    if (!selectedPlayer) return diary;

    return diary
      .map((entry) => {
        const players = entry.players.filter((p) => p.name === selectedPlayer);
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
  }, [diary, selectedPlayer]);

  function togglePlayer(name: string) {
    setSelectedPlayer((prev) => (prev === name ? null : name));
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Group Ironman Diary</h1>
        <div className="group-members">
          {PLAYERS.map((name) => (
            <span
              key={name}
              className={`member-tag${selectedPlayer === name ? ' active' : ''}`}
              onClick={() => togglePlayer(name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && togglePlayer(name)}
            >
              {name}
            </span>
          ))}
        </div>
      </header>

      <main className="app-main">
        {loading && (
          <div className="status-box loading">
            Fetching player data from Wise Old Man...
          </div>
        )}

        {!loading && errors.length > 0 && (
          <div className="status-box warning">
            {errors.map((e, i) => (
              <p key={i}>⚠ {e}</p>
            ))}
          </div>
        )}

        {!loading && filteredDiary.length === 0 && errors.length === 0 && (
          <div className="status-box empty">
            No activity recorded yet. Data will appear after the first daily snapshot is captured.
          </div>
        )}

        {filteredDiary.map((entry, i) => (
          <DiaryEntry key={entry.date} entry={entry} defaultExpanded={i < 3} />
        ))}
      </main>
    </div>
  );
}

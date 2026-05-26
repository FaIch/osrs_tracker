import { useEffect, useState } from 'react';
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

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Group Ironman Diary</h1>
        <div className="group-members">
          {PLAYERS.map((name) => (
            <span key={name} className="member-tag">
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

        {!loading && diary.length === 0 && errors.length === 0 && (
          <div className="status-box empty">
            No activity recorded yet. Data will appear after the first daily snapshot is captured.
          </div>
        )}

        {diary.map((entry, i) => (
          <DiaryEntry key={entry.date} entry={entry} defaultExpanded={i < 3} />
        ))}
      </main>
    </div>
  );
}

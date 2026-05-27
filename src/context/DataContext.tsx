import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { PLAYERS } from '../config';
import type { PlayerName } from '../config';
import { fetchPlayerSnapshots } from '../api/wom';
import type { Snapshot } from '../api/wom';
import { buildDiary } from '../utils/diary';
import type { DayEntry } from '../utils/diary';

interface DataContextValue {
  diary: DayEntry[];
  snapshots: Record<string, Snapshot[]>;
  loading: boolean;
  errors: string[];
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [diary, setDiary] = useState<DayEntry[]>([]);
  const [snapshots, setSnapshots] = useState<Record<string, Snapshot[]>>({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const snaps: Record<string, Snapshot[]> = {};
      const errs: string[] = [];

      await Promise.all(
        PLAYERS.map(async (name: PlayerName) => {
          try {
            snaps[name] = await fetchPlayerSnapshots(name);
          } catch (err) {
            errs.push(err instanceof Error ? err.message : String(err));
            snaps[name] = [];
          }
        }),
      );

      setErrors(errs);
      setSnapshots(snaps);
      setDiary(buildDiary(snaps));
      setLoading(false);
    }

    load();
  }, []);

  return (
    <DataContext.Provider value={{ diary, snapshots, loading, errors }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

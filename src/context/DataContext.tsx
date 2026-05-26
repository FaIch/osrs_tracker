import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { PLAYERS } from '../config';
import type { PlayerName } from '../config';
import { fetchPlayerSnapshots } from '../api/wom';
import type { Snapshot } from '../api/wom';
import { buildDiary } from '../utils/diary';
import type { DayEntry } from '../utils/diary';

interface DataContextValue {
  diary: DayEntry[];
  loading: boolean;
  errors: string[];
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
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
    <DataContext.Provider value={{ diary, loading, errors }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

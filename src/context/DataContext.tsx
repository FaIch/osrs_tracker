import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { PLAYERS } from '../config';
import type { PlayerName } from '../config';
import { fetchPlayerSnapshots } from '../api/wom';
import type { Snapshot } from '../api/wom';
import { fetchDrops } from '../api/drops';
import type { Drop } from '../api/drops';
import { buildDiary } from '../utils/diary';
import type { DayEntry } from '../utils/diary';

interface DataContextValue {
  diary: DayEntry[];
  snapshots: Record<string, Snapshot[]>;
  drops: Drop[];
  loading: boolean;
  errors: string[];
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [diary, setDiary] = useState<DayEntry[]>([]);
  const [snapshots, setSnapshots] = useState<Record<string, Snapshot[]>>({});
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const snaps: Record<string, Snapshot[]> = {};
    const errs: string[] = [];

    await Promise.all([
      ...PLAYERS.map(async (name: PlayerName) => {
        try {
          snaps[name] = await fetchPlayerSnapshots(name);
        } catch (err) {
          errs.push(err instanceof Error ? err.message : String(err));
          snaps[name] = [];
        }
      }),
      fetchDrops().then(setDrops).catch(() => {}),
    ]);

    setErrors(errs);
    setSnapshots(snaps);
    setDiary(buildDiary(snaps));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <DataContext.Provider value={{ diary, snapshots, drops, loading, errors, refresh: load }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

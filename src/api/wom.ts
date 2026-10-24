import { WOM_API } from '../config';

export interface SkillData {
  metric: string;
  experience: number;
  rank: number;
  level: number;
}

export interface BossData {
  metric: string;
  kills: number;
  rank: number;
}

export interface ActivityData {
  metric: string;
  score: number;
  rank: number;
}

export interface SnapshotData {
  skills: Record<string, SkillData>;
  bosses: Record<string, BossData>;
  activities: Record<string, ActivityData>;
  computed: Record<string, { metric: string; value: number; rank: number }>;
}

export interface Snapshot {
  id: number;
  playerId: number;
  createdAt: string;
  importedAt: string | null;
  data: SnapshotData;
}

export async function updatePlayer(username: string): Promise<void> {
  const res = await fetch(`${WOM_API}/players/${encodeURIComponent(username)}`, {
    method: 'POST',
  });
  if (!res.ok && res.status !== 429) {
    throw new Error(`Failed to update "${username}" (HTTP ${res.status})`);
  }
}

// WOM returns 20 snapshots by default and caps a page at 200, so page through with offset.
const SNAPSHOT_PAGE_SIZE = 200;
const MAX_SNAPSHOT_PAGES = 25;

export async function fetchPlayerSnapshots(username: string): Promise<Snapshot[]> {
  const all: Snapshot[] = [];
  for (let page = 0; page < MAX_SNAPSHOT_PAGES; page++) {
    const res = await fetch(
      `${WOM_API}/players/${encodeURIComponent(username)}/snapshots` +
        `?limit=${SNAPSHOT_PAGE_SIZE}&offset=${page * SNAPSHOT_PAGE_SIZE}`,
    );
    if (!res.ok) {
      const msg =
        res.status === 404
          ? `Player "${username}" is not tracked on Wise Old Man. Visit wiseoldman.net to add them.`
          : `Failed to fetch data for "${username}" (HTTP ${res.status})`;
      throw new Error(msg);
    }
    const batch: Snapshot[] = await res.json();
    all.push(...batch);
    if (batch.length < SNAPSHOT_PAGE_SIZE) break;
  }
  return all;
}

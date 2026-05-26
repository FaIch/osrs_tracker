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

export async function fetchPlayerSnapshots(username: string): Promise<Snapshot[]> {
  const res = await fetch(
    `${WOM_API}/players/${encodeURIComponent(username)}/snapshots`,
  );
  if (!res.ok) {
    const msg =
      res.status === 404
        ? `Player "${username}" is not tracked on Wise Old Man. Visit wiseoldman.net to add them.`
        : `Failed to fetch data for "${username}" (HTTP ${res.status})`;
    throw new Error(msg);
  }
  return res.json();
}

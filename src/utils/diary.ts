import type { Snapshot, SkillData, BossData, ActivityData } from '../api/wom';

export interface SkillGain {
  metric: string;
  xpGained: number;
  levelStart: number;
  levelEnd: number;
}

export interface BossKill {
  metric: string;
  killsGained: number;
}

export interface ActivityGain {
  metric: string;
  scoreGained: number;
}

export interface LevelUp {
  metric: string;
  from: number;
  to: number;
}

export interface PlayerDayEntry {
  name: string;
  skills: SkillGain[];
  bosses: BossKill[];
  activities: ActivityGain[];
  levelUps: LevelUp[];
  totalXpGained: number;
}

export interface DayEntry {
  date: string;
  players: PlayerDayEntry[];
  totalXpGained: number;
  totalBossKills: number;
  totalClues: number;
  totalLevelUps: number;
}

// Aggregate clue tiers into one entry; exclude noisy rank-only metrics.
const SKIP_ACTIVITIES = new Set(['clue_scrolls_all', 'lms_rank', 'league_points']);

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function skillDelta(prev: SkillData, curr: SkillData): SkillGain | null {
  if (prev.experience < 0 || curr.experience < 0) return null;
  const xpGained = curr.experience - prev.experience;
  if (xpGained <= 0 && curr.level === prev.level) return null;
  return {
    metric: curr.metric,
    xpGained: Math.max(0, xpGained),
    levelStart: prev.level,
    levelEnd: curr.level,
  };
}

function bossDelta(prev: BossData, curr: BossData): BossKill | null {
  if (prev.kills < 0 || curr.kills < 0) return null;
  const gained = curr.kills - prev.kills;
  return gained > 0 ? { metric: curr.metric, killsGained: gained } : null;
}

function activityDelta(prev: ActivityData, curr: ActivityData): ActivityGain | null {
  if (SKIP_ACTIVITIES.has(curr.metric)) return null;
  if (prev.score < 0 || curr.score < 0) return null;
  const gained = curr.score - prev.score;
  return gained > 0 ? { metric: curr.metric, scoreGained: gained } : null;
}

function processPlayer(name: string, snapshots: Snapshot[]): Map<string, PlayerDayEntry> {
  const result = new Map<string, PlayerDayEntry>();
  if (snapshots.length < 2) return result;

  // Sort ascending
  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  // Track both first and last snapshot per day
  const byDay = new Map<string, { first: Snapshot; last: Snapshot }>();
  for (const snap of sorted) {
    const key = toDateKey(snap.createdAt);
    if (!byDay.has(key)) {
      byDay.set(key, { first: snap, last: snap });
    } else {
      byDay.get(key)!.last = snap;
    }
  }

  const days = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));

  for (let i = 0; i < days.length; i++) {
    const [date, { first, last }] = days[i];

    // No previous day → compare earliest snapshot of today to latest (intra-day gains).
    // Previous day exists → compare last snapshot of that day to last of today.
    const prev = i === 0 ? first : days[i - 1][1].last;
    const curr = last;

    // Same object reference means only one snapshot exists for this period — nothing to diff.
    if (prev === curr) continue;

    const skills: SkillGain[] = [];
    const levelUps: LevelUp[] = [];

    for (const key of Object.keys(curr.data.skills)) {
      if (key === 'overall') continue;
      const prevSkill = prev.data.skills[key];
      const currSkill = curr.data.skills[key];
      if (!prevSkill || !currSkill) continue;
      const gain = skillDelta(prevSkill, currSkill);
      if (!gain) continue;
      skills.push(gain);
      if (gain.levelEnd > gain.levelStart) {
        levelUps.push({ metric: key, from: gain.levelStart, to: gain.levelEnd });
      }
    }

    const bosses: BossKill[] = [];
    for (const key of Object.keys(curr.data.bosses)) {
      const gain = bossDelta(prev.data.bosses[key], curr.data.bosses[key]);
      if (gain) bosses.push(gain);
    }

    const activities: ActivityGain[] = [];
    for (const key of Object.keys(curr.data.activities)) {
      const gain = activityDelta(prev.data.activities[key], curr.data.activities[key]);
      if (gain) activities.push(gain);
    }


    const totalXpGained = skills.reduce((s, g) => s + g.xpGained, 0);
    const hasAny = skills.length > 0 || bosses.length > 0 || activities.length > 0;

    if (hasAny) {
      result.set(date, {
        name,
        skills: skills.sort((a, b) => b.xpGained - a.xpGained),
        bosses: bosses.sort((a, b) => b.killsGained - a.killsGained),
        activities,
        levelUps,
        totalXpGained,
      });
    }
  }

  return result;
}

export function buildDiary(allSnapshots: Record<string, Snapshot[]>): DayEntry[] {
  const playerMaps = Object.entries(allSnapshots).map(([name, snaps]) => ({
    name,
    map: processPlayer(name, snaps),
  }));

  const allDates = new Set<string>();
  for (const { map } of playerMaps) {
    for (const date of map.keys()) allDates.add(date);
  }

  return [...allDates]
    .map((date) => {
      const players = playerMaps
        .map(({ map }) => map.get(date))
        .filter((p): p is PlayerDayEntry => p !== undefined);

      const totalXpGained = players.reduce((s, p) => s + p.totalXpGained, 0);
      const totalBossKills = players.reduce(
        (s, p) => s + p.bosses.reduce((bs, b) => bs + b.killsGained, 0),
        0,
      );
      const totalClues = players.reduce(
        (s, p) =>
          s +
          p.activities
            .filter((a) => a.metric.startsWith('clue_scrolls'))
            .reduce((as, a) => as + a.scoreGained, 0),
        0,
      );
      const totalLevelUps = players.reduce((s, p) => s + p.levelUps.length, 0);

      return { date, players, totalXpGained, totalBossKills, totalClues, totalLevelUps };
    })
    .filter((d) => d.players.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
}

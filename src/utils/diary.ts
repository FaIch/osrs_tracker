import type { Snapshot } from '../api/wom';
import type { PlayerDayEntry, DayEntry } from './diary.types';
import { toDateKey, skillDelta, bossDelta, activityDelta } from './diary.deltas';

export type { SkillGain, BossKill, ActivityGain, LevelUp, PlayerDayEntry, DayEntry } from './diary.types';

function processPlayer(name: string, snapshots: Snapshot[]): Map<string, PlayerDayEntry> {
  const result = new Map<string, PlayerDayEntry>();
  if (snapshots.length < 2) return result;

  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

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

    // No previous day → compare earliest to latest within today (intra-day gains).
    // Previous day exists → compare last snapshot of that day to last of today.
    const prev = i === 0 ? first : days[i - 1][1].last;
    const curr = last;

    // Same object reference means only one snapshot for this period — nothing to diff.
    if (prev === curr) continue;

    const skills = [];
    const levelUps = [];

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

    const bosses = Object.keys(curr.data.bosses)
      .map((key) => bossDelta(prev.data.bosses[key], curr.data.bosses[key]))
      .filter((g) => g !== null);

    const activities = Object.keys(curr.data.activities)
      .map((key) => activityDelta(prev.data.activities[key], curr.data.activities[key]))
      .filter((g) => g !== null);

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

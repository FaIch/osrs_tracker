import type { SkillData, BossData, ActivityData } from '../api/wom';
import type { SkillGain, BossKill, ActivityGain } from './diary.types';

// Exclude aggregate totals and rank-only metrics that add noise to the diary.
export const SKIP_ACTIVITIES = new Set(['clue_scrolls_all', 'lms_rank', 'league_points']);

export function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function skillDelta(prev: SkillData, curr: SkillData): SkillGain | null {
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

export function bossDelta(prev: BossData, curr: BossData): BossKill | null {
  if (prev.kills < 0 || curr.kills < 0) return null;
  const gained = curr.kills - prev.kills;
  return gained > 0 ? { metric: curr.metric, killsGained: gained } : null;
}

export function activityDelta(prev: ActivityData, curr: ActivityData): ActivityGain | null {
  if (SKIP_ACTIVITIES.has(curr.metric)) return null;
  if (prev.score < 0 || curr.score < 0) return null;
  const gained = curr.score - prev.score;
  return gained > 0 ? { metric: curr.metric, scoreGained: gained } : null;
}

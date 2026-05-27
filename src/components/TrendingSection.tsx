import { MetricIcon } from './MetricIcon';
import { formatXP, prettify } from '../utils/format';
import type { DayEntry } from '../utils/diary';

interface TrendingEntry { metric: string; total: number }

function computeTrending(diary: DayEntry[], dayCount: number) {
  const skillXp: Record<string, number> = {};
  const bossKills: Record<string, number> = {};

  for (const day of diary.slice(0, dayCount)) {
    for (const player of day.players) {
      for (const s of player.skills) skillXp[s.metric] = (skillXp[s.metric] ?? 0) + s.xpGained;
      for (const b of player.bosses) bossKills[b.metric] = (bossKills[b.metric] ?? 0) + b.killsGained;
    }
  }

  const sort = (rec: Record<string, number>): TrendingEntry[] =>
    Object.entries(rec)
      .map(([metric, total]) => ({ metric, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

  return { topSkills: sort(skillXp), topBosses: sort(bossKills) };
}

interface Props {
  diary: DayEntry[];
  dayCount?: number;
}

export function TrendingSection({ diary, dayCount = 3 }: Props) {
  const { topSkills, topBosses } = computeTrending(diary, dayCount);

  if (topSkills.length === 0 && topBosses.length === 0) {
    return <div className="feed-empty">Not enough data yet</div>;
  }

  return (
    <div className="trending">
      {topSkills.length > 0 && (
        <div className="trending-group">
          <div className="trending-group-label xp-value">Skills</div>
          {topSkills.map(({ metric, total }) => (
            <div key={metric} className="trending-row">
              <MetricIcon type="skills" metric={metric} className="feed-icon" />
              <span className="trending-name">{prettify(metric)}</span>
              <span className="trending-value xp-value">+{formatXP(total)}</span>
            </div>
          ))}
        </div>
      )}
      {topBosses.length > 0 && (
        <div className="trending-group">
          <div className="trending-group-label kill-value">Bosses</div>
          {topBosses.map(({ metric, total }) => (
            <a
              key={metric}
              className="trending-row trending-row-link"
              href={`https://oldschool.runescape.wiki/w/${encodeURIComponent(prettify(metric).replace(/ /g, '_'))}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MetricIcon type="bosses" metric={metric} className="feed-icon" />
              <span className="trending-name">{prettify(metric)}</span>
              <span className="trending-value kill-value">×{total}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

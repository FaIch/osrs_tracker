import type { Snapshot } from '../api/wom';
import { formatXP, prettify } from '../utils/format';
import { MetricIcon } from './MetricIcon';

function combatLevel(s: Snapshot['data']['skills']): number {
  const lvl = (k: string) => s[k]?.level ?? 1;
  const base = 0.25 * (lvl('defence') + lvl('hitpoints') + Math.floor(lvl('prayer') / 2));
  const melee = 0.325 * (lvl('attack') + lvl('strength'));
  const ranged = 0.325 * Math.floor(lvl('ranged') * 1.5);
  const magic = 0.325 * Math.floor(lvl('magic') * 1.5);
  return Math.floor(base + Math.max(melee, ranged, magic));
}

interface StatItemProps {
  label: string;
  value: string;
  icon?: { type: string; metric: string };
  valueClass?: string;
}

function StatItem({ label, value, icon, valueClass }: StatItemProps) {
  return (
    <div className="overview-stat">
      <span className="overview-stat-label">{label}</span>
      <span className={`overview-stat-value ${valueClass ?? ''}`}>
        {icon && <MetricIcon type={icon.type} metric={icon.metric} className="overview-icon" />}
        {value}
      </span>
    </div>
  );
}

interface Props {
  snapshot: Snapshot;
}

export function PlayerOverview({ snapshot }: Props) {
  const skills = snapshot.data.skills;
  const overall = skills['overall'];

  const ranked = Object.entries(skills)
    .filter(([k]) => k !== 'overall')
    .sort((a, b) => b[1].level - a[1].level);

  const highest = ranked[0];
  const lowest = ranked[ranked.length - 1];

  return (
    <div className="player-overview">
      <div className="overview-stats">
        <StatItem label="Combat" value={String(combatLevel(skills))} valueClass="overview-combat" icon={{type: 'skills', metric: 'combat'}}/>
        <StatItem label="Total Level" value={(overall?.level ?? 0).toLocaleString()} />
        <StatItem label="Total XP" value={formatXP(overall?.experience ?? 0)} valueClass="xp-value" icon={{type: 'skills', metric: 'stats'}}/>
        {highest && (
          <StatItem
            label="Highest"
            value={`${prettify(highest[0])} ${highest[1].level}`}
            icon={{ type: 'skills', metric: highest[0] }}
            valueClass="xp-value"
          />
        )}
        {lowest && (
          <StatItem
            label="Lowest"
            value={`${prettify(lowest[0])} ${lowest[1].level}`}
            icon={{ type: 'skills', metric: lowest[0] }}
            valueClass="overview-lowest"
          />
        )}
      </div>
    </div>
  );
}

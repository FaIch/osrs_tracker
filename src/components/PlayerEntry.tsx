import type { PlayerDayEntry, BossKill, ActivityGain } from '../utils/diary';
import { formatXP, prettify } from '../utils/format';
import { SkillBox, SKILLS_ORDER } from './SkillBox';

function MetricIcon({ type, metric }: { type: 'bosses' | 'activities'; metric: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}icons/${type}/${metric}.png`}
      alt=""
      aria-hidden="true"
      className="metric-icon"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
      }}
    />
  );
}

function LocalSkillIcon({ metric }: { metric: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}icons/skills/${metric}.png`}
      alt=""
      aria-hidden="true"
      className="metric-icon"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
      }}
    />
  );
}

function BossesTable({ bosses }: { bosses: BossKill[] }) {
  return (
    <div className="gains-section">
      <div className="section-label">Boss Kills</div>
      <div className="gains-grid">
        {bosses.map((b) => (
          <div key={b.metric} className="gain-row">
            <MetricIcon type="bosses" metric={b.metric} />
            <span className="metric-name">{prettify(b.metric)}</span>
            <span className="gain-value kill-value">×{b.killsGained}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivitiesTable({ activities }: { activities: ActivityGain[] }) {
  return (
    <div className="gains-section">
      <div className="section-label">Activities</div>
      <div className="gains-grid">
        {activities.map((a) => (
          <div key={a.metric} className="gain-row">
            <MetricIcon type="activities" metric={a.metric} />
            <span className="metric-name">{prettify(a.metric)}</span>
            <span className="gain-value act-value">+{a.scoreGained}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlayerEntry({ entry }: { entry: PlayerDayEntry }) {
  const skillGainMap = new Map(entry.skills.map((s) => [s.metric, s.xpGained]));

  return (
    <div className="player-entry">
      <div className="player-entry-header">
        <span className="player-name">{entry.name}</span>
        {entry.totalXpGained > 0 && (
          <span className="xp-total">+{formatXP(entry.totalXpGained)} XP</span>
        )}
      </div>

      {entry.levelUps.length > 0 && (
        <div className="level-ups">
          {entry.levelUps.map((lu) => (
            <span key={lu.metric} className="level-up-badge">
              <LocalSkillIcon metric={lu.metric} />
              {prettify(lu.metric)} {lu.from}→{lu.to}
            </span>
          ))}
        </div>
      )}

      <div className="skills-box-grid">
        {SKILLS_ORDER.map((metric) => (
          <SkillBox key={metric} metric={metric} xpGained={skillGainMap.get(metric) ?? 0} />
        ))}
      </div>

      {entry.bosses.length > 0 && <BossesTable bosses={entry.bosses} />}
      {entry.activities.length > 0 && <ActivitiesTable activities={entry.activities} />}
    </div>
  );
}

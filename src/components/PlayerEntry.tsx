import type { PlayerDayEntry, BossKill, ActivityGain, SkillGain } from '../utils/diary';
import { formatXP, prettify } from '../utils/format';

function MetricIcon({ type, metric, className = 'stat-icon' }: { type: string; metric: string; className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}icons/${type}/${metric}.png`}
      alt=""
      aria-hidden="true"
      className={className}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
    />
  );
}

function SkillsColumn({ skills, total }: { skills: SkillGain[]; total: number }) {
  return (
    <div className="stats-column">
      <div className="stats-column-header">
        <MetricIcon type="skills" metric="stats" />
        <span className="stats-column-title">Skills</span>
        <span className="stats-column-total xp-value">+{formatXP(total)} XP</span>
      </div>
      {skills.length === 0 ? (
        <span className="stats-empty">No gains</span>
      ) : (
        skills.map((s) => (
          <div key={s.metric} className="stat-item">
            <MetricIcon type="skills" metric={s.metric} />
            <span className="stat-name">{prettify(s.metric)}</span>
            <span className="stat-value xp-value">+{formatXP(s.xpGained)}</span>
          </div>
        ))
      )}
    </div>
  );
}

function BossesColumn({ bosses }: { bosses: BossKill[] }) {
  const total = bosses.reduce((s, b) => s + b.killsGained, 0);
  return (
    <div className="stats-column">
      <div className="stats-column-header">
        <span className="stats-column-title">Bosses</span>
        <span className="stats-column-total kill-value">{total} kills</span>
      </div>
      {bosses.length === 0 ? (
        <span className="stats-empty">No kills</span>
      ) : (
        bosses.map((b) => (
          <div key={b.metric} className="stat-item">
            <MetricIcon type="bosses" metric={b.metric} />
            <span className="stat-name">{prettify(b.metric)}</span>
            <span className="stat-value kill-value">×{b.killsGained}</span>
          </div>
        ))
      )}
    </div>
  );
}

function ActivitiesRow({ activities }: { activities: ActivityGain[] }) {
  if (activities.length === 0) return null;
  return (
    <div className="gains-section">
      <div className="section-label">Activities</div>
      <div className="gains-grid">
        {activities.map((a) => (
          <div key={a.metric} className="gain-row">
            <MetricIcon type="activities" metric={a.metric} className="metric-icon" />
            <span className="metric-name">{prettify(a.metric)}</span>
            <span className="gain-value act-value">+{a.scoreGained}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlayerEntry({ entry }: { entry: PlayerDayEntry }) {
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
              <MetricIcon type="skills" metric={lu.metric} />
              {prettify(lu.metric)} {lu.from}→{lu.to}
            </span>
          ))}
        </div>
      )}

      <div className="player-stats">
        <SkillsColumn skills={entry.skills} total={entry.totalXpGained} />
        <BossesColumn bosses={entry.bosses} />
      </div>

      <ActivitiesRow activities={entry.activities} />
    </div>
  );
}

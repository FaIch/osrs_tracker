import { useState } from 'react';
import type { DayEntry, PlayerDayEntry, BossKill, ActivityGain } from '../utils/diary';
import { WOM_CDN } from '../config';
import { SkillBox, SKILLS_ORDER } from './SkillBox';

function formatXP(xp: number): string {
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(2)}M`;
  if (xp >= 1_000) return `${Math.round(xp / 1_000)}K`;
  return xp.toLocaleString();
}

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function prettify(metric: string): string {
  return metric
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function WomIcon({ type, metric }: { type: 'bosses' | 'activities'; metric: string }) {
  return (
    <img
      src={`${WOM_CDN}/${type}/${metric}.png`}
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
            <WomIcon type="bosses" metric={b.metric} />
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
            <WomIcon type="activities" metric={a.metric} />
            <span className="metric-name">{prettify(a.metric)}</span>
            <span className="gain-value act-value">+{a.scoreGained}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerEntry({ entry }: { entry: PlayerDayEntry }) {
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

interface DiaryEntryProps {
  entry: DayEntry;
  defaultExpanded: boolean;
}

export function DiaryEntry({ entry, defaultExpanded }: DiaryEntryProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  function toggle() {
    setExpanded((e) => !e);
  }

  return (
    <div className="diary-entry">
      <div
        className="diary-entry-header"
        onClick={toggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && toggle()}
        aria-expanded={expanded}
      >
        <span className="diary-date">{formatDate(entry.date)}</span>

        <div className="diary-summary">
          {entry.totalXpGained > 0 && (
            <span className="summary-stat xp-stat">
              <span className="stat-label">XP</span>
              +{formatXP(entry.totalXpGained)}
            </span>
          )}
          {entry.totalBossKills > 0 && (
            <span className="summary-stat boss-stat">
              <span className="stat-label">Bosses</span>
              {entry.totalBossKills}
            </span>
          )}
          {entry.totalLevelUps > 0 && (
            <span className="summary-stat level-stat">
              <span className="stat-label">Levels</span>
              {entry.totalLevelUps}
            </span>
          )}
          {entry.totalClues > 0 && (
            <span className="summary-stat clue-stat">
              <span className="stat-label">Clues</span>
              {entry.totalClues}
            </span>
          )}
        </div>

        <span className="expand-icon" aria-hidden="true">
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {expanded && (
        <div className="diary-players">
          {entry.players.map((player) => (
            <PlayerEntry key={player.name} entry={player} />
          ))}
        </div>
      )}
    </div>
  );
}

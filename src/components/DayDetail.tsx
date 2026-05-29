import type { PlayerDayEntry } from '../utils/diary';
import type { Drop } from '../api/drops';
import { dropTotalValue, dropTopItem, itemIconUrl, itemWikiUrl } from '../api/drops';
import { MetricIcon } from './MetricIcon';
import { formatXP, formatGP, formatRarity, prettify } from '../utils/format';

interface Props {
  date: string;
  entry: PlayerDayEntry | null;
  drops: Drop[];
}

export function DayDetail({ date, entry, drops }: Props) {
  const d = new Date(`${date}T12:00:00Z`);
  const label = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="day-detail">
      <div className="day-detail-title">{label}</div>

      {!entry && drops.length === 0 && (
        <div className="day-detail-empty">No data for this day.</div>
      )}

      {drops.length > 0 && (
        <div className="day-detail-section">
          <div className="day-detail-section-label">
            <span className="day-detail-section-label-left drop-value">
              <img src={`${import.meta.env.BASE_URL}icons/general/backpack.png`} className="section-label-icon" alt="" aria-hidden="true" />
              Drops
            </span>
            <span className="xp-value">Total Value: {formatGP(drops.reduce((s, d) => s + dropTotalValue(d), 0))}</span>
          </div>
          <div className="day-detail-rows">
            {drops.map((drop) => {
              const top = dropTopItem(drop);
              const total = dropTotalValue(drop);
              return (
                <a
                  key={drop.key}
                  className="day-detail-row day-detail-row-link"
                  href={itemWikiUrl(top.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={itemIconUrl(top.id)}
                    className="stat-icon"
                    alt={top.name}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                  />
                  <span className="day-detail-name">
                    {top.quantity > 1 ? `${top.quantity}x ${top.name}` : top.name}
                    <span className="day-detail-sub"> · {drop.extra.source}</span>
                    {top.rarity != null && (
                      <span className="day-detail-sub"> · {formatRarity(top.rarity)}</span>
                    )}
                  </span>
                  <span className="day-detail-value xp-value">{formatGP(total)}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {entry && entry.bosses.length > 0 && (
        <div className="day-detail-section">
          <div className="day-detail-section-label">
            <span className="day-detail-section-label-left boss-stat">
              <MetricIcon type="skills" metric="combat" className="section-label-icon" />
              Bosses
            </span>
            <span className="boss-stat">Total Kills: {entry.bosses.reduce((s, b) => s + b.killsGained, 0)}</span>
          </div>
          <div className="day-detail-rows">
            {entry.bosses.map((boss) => (
              <a
                key={boss.metric}
                className="day-detail-row day-detail-row-link"
                href={`https://oldschool.runescape.wiki/w/${encodeURIComponent(prettify(boss.metric).replace(/ /g, '_'))}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MetricIcon type="bosses" metric={boss.metric} />
                <span className="day-detail-name">{prettify(boss.metric)}</span>
                <span className="day-detail-value">{boss.killsGained} kc</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {entry && entry.skills.length > 0 && (
        <div className="day-detail-section">
          <div className="day-detail-section-label">
            <span className="day-detail-section-label-left xp-value">
              <MetricIcon type="skills" metric="stats" className="section-label-icon" />
              Skills
            </span>
            <span className="xp-value">Total XP: +{formatXP(entry.totalXpGained)}</span>
          </div>
          <div className="day-detail-rows">
            {entry.skills.map((skill) => (
              <div key={skill.metric} className="day-detail-row">
                <MetricIcon type="skills" metric={skill.metric} />
                <span className="day-detail-name">
                  {prettify(skill.metric)}
                  {skill.levelEnd > skill.levelStart && (
                    <span className="day-detail-levelup"> {skill.levelStart} → {skill.levelEnd}</span>
                  )}
                </span>
                <span className="day-detail-value xp-value">+{formatXP(skill.xpGained)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

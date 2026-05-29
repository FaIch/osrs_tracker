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

      {entry && entry.levelUps.length > 0 && (
        <div className="day-detail-section">
          <div className="day-detail-section-label level-stat">Level Ups</div>
          <div className="level-ups">
            {entry.levelUps.map((lu) => (
              <span key={lu.metric} className="level-up-badge">
                <MetricIcon type="skills" metric={lu.metric} className="stat-icon" />
                {prettify(lu.metric)} {lu.from}→{lu.to}
              </span>
            ))}
          </div>
        </div>
      )}

      {entry && entry.skills.length > 0 && (
        <div className="day-detail-section">
          <div className="day-detail-section-label xp-value">Skills</div>
          <div className="day-detail-rows">
            {entry.skills.map((s) => (
              <div key={s.metric} className="day-detail-row">
                <MetricIcon type="skills" metric={s.metric} className="stat-icon" />
                <span className="day-detail-name">{prettify(s.metric)}</span>
                <span className="day-detail-value xp-value">+{formatXP(s.xpGained)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {entry && entry.bosses.length > 0 && (
        <div className="day-detail-section">
          <div className="day-detail-section-label boss-stat">Bosses</div>
          <div className="day-detail-rows">
            {entry.bosses.map((b) => (
              <div key={b.metric} className="day-detail-row">
                <MetricIcon type="bosses" metric={b.metric} className="stat-icon" />
                <span className="day-detail-name">{prettify(b.metric)}</span>
                <span className="day-detail-value kill-value">×{b.killsGained}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {drops.length > 0 && (
        <div className="day-detail-section">
          <div className="day-detail-section-label drop-value">Drops</div>
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
    </div>
  );
}

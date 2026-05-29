import type { Drop } from '../api/drops';
import { dropTotalValue, dropTopItem, itemIconUrl, itemWikiUrl } from '../api/drops';
import { PLAYER_COLORS } from '../config';
import { lastName, formatGP, relativeTime, formatRarity } from '../utils/format';

interface Props {
  drop: Drop;
}

export function DropItem({ drop }: Props) {
  const topItem = dropTopItem(drop);
  const total = dropTotalValue(drop);
  const timestamp = drop.embeds[0]?.timestamp;
  const color = PLAYER_COLORS[drop.playerName] ?? 'var(--text)';

  return (
    <a className="drop-row" href={itemWikiUrl(topItem.name)} target="_blank" rel="noopener noreferrer">
      <img
        src={itemIconUrl(topItem.id)}
        className="drop-item-icon"
        alt={topItem.name}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
      />
      <div className="drop-info">
        <div className="drop-info-primary">
          <span className="drop-item-name">
            {topItem.quantity > 1 ? `${topItem.quantity}x ${topItem.name}` : topItem.name}
          </span>
          <span className="drop-source"> · {drop.extra.source}</span>
        </div>
        <div className="drop-info-secondary">
          {topItem.rarity != null && (
            <span className="drop-rarity">{formatRarity(topItem.rarity)} · </span>
          )}
          <span className="drop-player" style={{ color }}>{lastName(drop.playerName)} </span>
          <span className="drop-rarity">· Kill Count: {drop.extra.killCount}</span>
        </div>
      </div>
      <div className="drop-right">
        <span className="drop-value">{formatGP(total)}</span>
        {timestamp && <span className="drop-time">{relativeTime(timestamp)}</span>}
      </div>
    </a>
  );
}

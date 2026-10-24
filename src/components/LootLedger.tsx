import { useMemo, useState } from 'react';
import type { Drop } from '../api/drops';
import type { Snapshot } from '../api/wom';
import { itemIconUrl, itemWikiUrl, sourceToBossMetric } from '../api/drops';
import { formatGP, formatRarity } from '../utils/format';
import { groupDropsBySource, rareDrops } from '../utils/loot';
import type { LuckLabel, SourceSummary } from '../utils/loot';
import { DropItem } from './DropItem';
import { MetricIcon } from './MetricIcon';

const LUCK_TEXT: Record<LuckLabel, string> = {
  'spooned': 'Spooned',
  'on-rate': 'On rate',
  'dry': 'Dry',
  'very-dry': 'Very dry',
};

function ItemIcon({ id, name }: { id: number; name: string }) {
  return (
    <img
      src={itemIconUrl(id)}
      className="drop-item-icon"
      alt={name}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
    />
  );
}

function SourceRow({ summary, snapshot }: { summary: SourceSummary; snapshot?: Snapshot }) {
  const [open, setOpen] = useState(false);
  const metric = sourceToBossMetric(summary.source);
  const kills = snapshot?.data.bosses[metric]?.kills;
  const currentKc = kills != null && kills > 0 ? kills : null;
  const sinceLast =
    currentKc != null && summary.lastKillCount != null && currentKc >= summary.lastKillCount
      ? currentKc - summary.lastKillCount
      : null;
  const count = summary.drops.length;

  return (
    <div className={`loot-source${open ? ' open' : ''}`}>
      <button
        type="button"
        className="loot-source-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <MetricIcon type="bosses" metric={metric} className="loot-source-icon" />
        <span className="loot-source-info">
          <span className="loot-source-name">{summary.source}</span>
          <span className="loot-source-sub">
            {count} notable {count === 1 ? 'drop' : 'drops'}
            {currentKc != null && <> · KC {currentKc.toLocaleString()}</>}
            {sinceLast != null && <> · {sinceLast.toLocaleString()} since last</>}
          </span>
        </span>
        <span className="loot-source-best" title={`Best: ${summary.bestItem.name}`}>
          <ItemIcon id={summary.bestItem.id} name={summary.bestItem.name} />
        </span>
        <span className="loot-source-value drop-value">{formatGP(summary.totalValue)}</span>
        <span className="loot-source-caret" aria-hidden="true">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="loot-source-drops">
          {summary.drops.map((drop) => <DropItem key={drop.key} drop={drop} />)}
        </div>
      )}
    </div>
  );
}

interface Props {
  drops: Drop[];
  snapshot?: Snapshot;
}

export function LootLedger({ drops, snapshot }: Props) {
  const sources = useMemo(() => groupDropsBySource(drops), [drops]);
  const rares = useMemo(() => rareDrops(drops), [drops]);

  return (
    <section className="loot-ledger">
      <div className="loot-ledger-header">
        <span className="loot-ledger-title">Loot</span>
        <span className="loot-ledger-sub">Notable drops reported by Dink</span>
      </div>

      {sources.length === 0 ? (
        <div className="loot-empty">No notable drops recorded yet.</div>
      ) : (
        <div className="loot-ledger-body">
          <div className="loot-column">
            <div className="loot-section-label">By source</div>
            {sources.map((s) => <SourceRow key={s.source} summary={s} snapshot={snapshot} />)}
          </div>

          <div className="loot-column">
            <div className="loot-section-label">Rare drop luck</div>
            {rares.length === 0 ? (
              <div className="loot-empty">No drops with a known drop rate yet.</div>
            ) : (
              rares.map(({ drop, item, killCount, luck }) => (
                <a
                  key={`${drop.key}-${item.id}`}
                  className="luck-row"
                  href={itemWikiUrl(item.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ItemIcon id={item.id} name={item.name} />
                  <span className="luck-info">
                    <span className="luck-item">
                      {item.name}
                      <span className="loot-source-sub"> · {drop.extra.source}</span>
                    </span>
                    <span className="loot-source-sub">
                      {formatRarity(item.rarity!)} at KC {killCount.toLocaleString()} · {luck.ratio < 0.01 ? '<0.01' : luck.ratio.toFixed(2)}× rate
                    </span>
                  </span>
                  <span
                    className={`luck-badge luck-${luck.label}`}
                    title={
                      `${(luck.chanceByNow * 100).toFixed(1)}% chance to have it by KC ${killCount.toLocaleString()}. ` +
                      'Uses the total kill count at the drop, so repeat copies look drier than they were.'
                    }
                  >
                    {LUCK_TEXT[luck.label]}
                  </span>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}

import type { Drop, DropItem } from '../api/drops';
import { dropTotalValue, dropTopItem } from '../api/drops';

export interface SourceSummary {
  source: string;
  drops: Drop[];          // newest first
  totalValue: number;
  bestItem: DropItem;
  lastKillCount: number | null;
}

function dropTime(drop: Drop): string {
  return drop.embeds[0]?.timestamp ?? '';
}

/** Groups notable drops by source, most valuable source first. */
export function groupDropsBySource(drops: Drop[]): SourceSummary[] {
  const bySource = new Map<string, Drop[]>();
  for (const drop of drops) {
    if (drop.extra.items.length === 0) continue;
    const list = bySource.get(drop.extra.source) ?? [];
    list.push(drop);
    bySource.set(drop.extra.source, list);
  }

  return [...bySource.entries()]
    .map(([source, list]) => {
      const sorted = [...list].sort((a, b) => dropTime(b).localeCompare(dropTime(a)));
      const tops = sorted.map(dropTopItem);
      const bestItem = tops.reduce((best, item) =>
        item.quantity * item.priceEach > best.quantity * best.priceEach ? item : best,
      );
      const withKc = sorted.find((d) => d.extra.killCount != null);
      return {
        source,
        drops: sorted,
        totalValue: sorted.reduce((s, d) => s + dropTotalValue(d), 0),
        bestItem,
        lastKillCount: withKc?.extra.killCount ?? null,
      };
    })
    .sort((a, b) => b.totalValue - a.totalValue);
}

export type LuckLabel = 'spooned' | 'on-rate' | 'dry' | 'very-dry';

export interface Luck {
  /** KC it took relative to the expected 1/p; below 1 is lucky. */
  ratio: number;
  /** Chance of having received it by this KC: 1 − (1 − p)^kc. */
  chanceByNow: number;
  label: LuckLabel;
}

export function luckFor(p: number, kc: number): Luck {
  const ratio = kc * p;
  const chanceByNow = 1 - (1 - p) ** kc;
  const label: LuckLabel =
    chanceByNow < 0.25 ? 'spooned'
    : chanceByNow <= 0.75 ? 'on-rate'
    : chanceByNow <= 0.95 ? 'dry'
    : 'very-dry';
  return { ratio, chanceByNow, label };
}

export interface RareDrop {
  drop: Drop;
  item: DropItem;
  killCount: number;
  luck: Luck;
}

// Commoner items are almost never the first copy at the reported KC, so their luck is meaningless.
const RARE_THRESHOLD = 1 / 100;

/** The rarest item of each drop with a known KC, if it's rare enough to rate, rarest first. */
export function rareDrops(drops: Drop[]): RareDrop[] {
  const result: RareDrop[] = [];
  for (const drop of drops) {
    const kc = drop.extra.killCount;
    if (kc == null || kc <= 0) continue;
    const rated = drop.extra.items.filter((i) => i.rarity != null && i.rarity > 0);
    if (rated.length === 0) continue;
    const item = rated.reduce((a, b) => (b.rarity! < a.rarity! ? b : a));
    if (item.rarity! > RARE_THRESHOLD) continue;
    result.push({ drop, item, killCount: kc, luck: luckFor(item.rarity!, kc) });
  }
  return result.sort((a, b) => a.item.rarity! - b.item.rarity!);
}

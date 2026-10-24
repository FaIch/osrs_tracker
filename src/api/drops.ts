export interface DropItem {
  id: number;
  quantity: number;
  priceEach: number;
  name: string;
  rarity?: number;
}

export interface Drop {
  key: string;
  type: string;
  playerName: string;
  extra: {
    items: DropItem[];
    source: string;
    category?: string;
    killCount?: number;
    rarestProbability?: number;
  };
  embeds: Array<{
    timestamp?: string;
  }>;
}

export async function fetchDrops(): Promise<Drop[]> {
  const res = await fetch('https://dink-drops.joakimfalch.workers.dev');
  if (!res.ok) throw new Error(`Drops fetch failed: ${res.status}`);
  const all: Drop[] = await res.json();
  return all.filter((d) => d.type === 'LOOT');
}

export function dropTotalValue(drop: Drop): number {
  return drop.extra.items.reduce((s, i) => s + i.quantity * i.priceEach, 0);
}

export function dropTopItem(drop: Drop): DropItem {
  return drop.extra.items.reduce((best, item) =>
    item.quantity * item.priceEach > best.quantity * best.priceEach ? item : best,
    drop.extra.items[0],
  );
}

// Dink source names that don't reduce to the WOM boss metric on their own.
const SOURCE_METRIC_OVERRIDES: Record<string, string> = {
  the_nightmare: 'nightmare',
  barrows: 'barrows_chests',
  lunar_chest: 'lunar_chests',
  hueycoatl: 'the_hueycoatl',
  corrupted_gauntlet: 'the_corrupted_gauntlet',
  gauntlet: 'the_gauntlet',
  tombs_of_amascut_expert_mode: 'tombs_of_amascut_expert',
};

/** Best-guess WOM boss metric for a Dink loot source, e.g. "Kree'arra" → "kreearra". */
export function sourceToBossMetric(source: string): string {
  const key = source
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return SOURCE_METRIC_OVERRIDES[key] ?? key;
}

export function itemIconUrl(itemId: number): string {
  return `https://static.runelite.net/cache/item/icon/${itemId}.png`;
}

export function itemWikiUrl(itemName: string): string {
  return `https://oldschool.runescape.wiki/w/${encodeURIComponent(itemName.replace(/ /g, '_'))}`;
}

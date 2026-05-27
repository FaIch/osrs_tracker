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
    killCount?: number;
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

export function itemIconUrl(itemId: number): string {
  return `https://static.runelite.net/cache/item/icon/${itemId}.png`;
}

export function itemWikiUrl(itemName: string): string {
  return `https://oldschool.runescape.wiki/w/${encodeURIComponent(itemName.replace(/ /g, '_'))}`;
}

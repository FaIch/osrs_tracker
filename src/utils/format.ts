export function lastName(name: string): string {
  return name.split(' ').at(-1) ?? name;
}

export function formatXP(xp: number): string {
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(2)}M`;
  if (xp >= 1_000) return `${Math.round(xp / 1_000)}K`;
  return xp.toLocaleString();
}

export function prettify(metric: string): string {
  return metric
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatRarity(rarity: number): string {
  const denom = Math.round(1 / rarity);
  return `1/${denom.toLocaleString()}`;
}

export function formatGP(gp: number): string {
  if (gp >= 1_000_000) return `${(gp / 1_000_000).toFixed(1)}M`;
  if (gp >= 1_000) return `${Math.floor(gp / 1_000)}k`;
  return gp.toLocaleString();
}

export function relativeTime(isoString: string): string {
  const mins = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

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

export function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

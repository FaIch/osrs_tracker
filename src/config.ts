export const PLAYERS = [
  'Flatlus Fred',
  'Gonore Geir',
  'Skabb Svein',
  'Kreft Kari',
] as const;

export type PlayerName = (typeof PLAYERS)[number];

export const WOM_API = 'https://api.wiseoldman.net/v2';
export const WOM_CDN = 'https://cdn.wiseoldman.net/images/metrics';

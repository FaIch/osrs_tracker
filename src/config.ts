export const PLAYERS = [
  'Flatlus Fred',
  'Gonore Geir',
  'Skabb Svein',
  'Kreft Kari',
] as const;

export type PlayerName = (typeof PLAYERS)[number];

export const WOM_API = 'https://api.wiseoldman.net/v2';

export const PLAYER_COLORS: Record<string, string> = {
  'Flatlus Fred': '#5b9cf0',
  'Gonore Geir':  '#a0e88a',
  'Skabb Svein':  '#e85050',
  'Kreft Kari':   '#b070e8',
};

export const PLAYER_ICON_FILTERS: Record<string, string> = {
  'Flatlus Fred': 'hue-rotate(220deg)',
  'Gonore Geir':  'hue-rotate(110deg) saturate(0.8) brightness(1.1)',
  'Skabb Svein':  'none',
  'Kreft Kari':   'hue-rotate(275deg)',
};

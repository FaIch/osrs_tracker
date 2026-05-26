// Skills in the same 3-column order as the in-game skills tab
export const SKILLS_ORDER = [
  'attack',       'hitpoints',  'mining',
  'strength',     'agility',    'smithing',
  'defence',      'herblore',   'fishing',
  'ranged',       'thieving',   'cooking',
  'prayer',       'crafting',   'firemaking',
  'magic',        'fletching',  'woodcutting',
  'runecrafting', 'slayer',     'farming',
  'construction', 'hunter',     'sailing',
] as const;

function formatXP(xp: number): string {
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(2)}M`;
  if (xp >= 1_000) return `${Math.round(xp / 1_000)}K`;
  return xp.toLocaleString();
}

function prettify(metric: string): string {
  return metric
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface SkillBoxProps {
  metric: string;
  xpGained: number;
}

export function SkillBox({ metric, xpGained }: SkillBoxProps) {
  const iconSrc = `${import.meta.env.BASE_URL}icons/skills/${metric}.png`;

  return (
    <div className={`skill-box${xpGained > 0 ? ' skill-box--active' : ''}`}>
      <img
        src={iconSrc}
        alt={prettify(metric)}
        className="skill-box-icon"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
        }}
      />
      <span className="skill-box-name">{prettify(metric)}</span>
      <span className={`skill-box-xp${xpGained > 0 ? ' skill-box-xp--active' : ''}`}>
        {xpGained > 0 ? `+${formatXP(xpGained)}` : '0'}
      </span>
    </div>
  );
}

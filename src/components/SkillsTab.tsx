import { useState } from 'react';
import type { Snapshot } from '../api/wom';
import { prettify } from '../utils/format';
import { MetricIcon } from './MetricIcon';

// Same order as the in-game skills tab, read row by row.
const SKILL_ORDER = [
  'attack', 'hitpoints', 'mining',
  'strength', 'agility', 'smithing',
  'defence', 'herblore', 'fishing',
  'ranged', 'thieving', 'cooking',
  'prayer', 'crafting', 'firemaking',
  'magic', 'fletching', 'woodcutting',
  'runecrafting', 'slayer', 'farming',
  'construction', 'hunter', 'sailing',
];

const MAX_LEVEL = 99;

// XP needed to reach each level, index = level (OSRS experience formula).
const XP_TABLE: number[] = (() => {
  const table = [0, 0];
  let points = 0;
  for (let lvl = 1; lvl < MAX_LEVEL; lvl++) {
    points += Math.floor(lvl + 300 * 2 ** (lvl / 7));
    table.push(Math.floor(points / 4));
  }
  return table;
})();

function skillDetails(metric: string, experience: number, level: number, rank: number) {
  const parts = [`${prettify(metric)} XP: ${experience.toLocaleString()}`];
  if (level < MAX_LEVEL) {
    parts.push(`Next level at: ${XP_TABLE[level + 1].toLocaleString()}`);
    parts.push(`Remaining XP: ${(XP_TABLE[level + 1] - experience).toLocaleString()}`);
  }
  parts.push(rank > 0 ? `Rank: ${rank.toLocaleString()}` : 'Unranked');
  return parts;
}

interface Props {
  snapshot: Snapshot;
}

export function SkillsTab({ snapshot }: Props) {
  const skills = snapshot.data.skills;
  const overall = skills['overall'];
  const [active, setActive] = useState<string | null>(null);

  const activeSkill = active ? skills[active] : null;
  const details = active && activeSkill
    ? skillDetails(active, activeSkill.experience, activeSkill.level, activeSkill.rank)
    : [`Total XP: ${(overall?.experience ?? 0).toLocaleString()}`];

  return (
    <div className="skills-tab" onMouseLeave={() => setActive(null)}>
      <div className="skills-grid">
        {SKILL_ORDER.map((metric) => {
          const skill = skills[metric];
          const level = skill?.level ?? 1;
          return (
            <button
              key={metric}
              type="button"
              className={`skill-cell${active === metric ? ' active' : ''}${level >= MAX_LEVEL ? ' maxed' : ''}`}
              onMouseEnter={() => setActive(metric)}
              onFocus={() => setActive(metric)}
              onClick={() => setActive(metric)}
              aria-label={`${prettify(metric)} level ${level}`}
            >
              <MetricIcon type="skills" metric={metric} className="skill-cell-icon" />
              <span className="skill-cell-level">
                <span>{level}</span>
                <span className="skill-cell-slash">/</span>
                <span>{level}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="skills-total">
        Total level: <span className="skills-total-value">{(overall?.level ?? 0).toLocaleString()}</span>
      </div>
      <div className="skills-details" aria-live="polite">
        {details.map((line) => <div key={line}>{line}</div>)}
      </div>
    </div>
  );
}

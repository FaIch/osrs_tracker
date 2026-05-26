import { useState } from 'react';
import type { DayEntry } from '../utils/diary';
import { formatXP, formatDate } from '../utils/format';
import { PlayerEntry } from './PlayerEntry';

interface DiaryEntryProps {
  entry: DayEntry;
  defaultExpanded: boolean;
}

export function DiaryEntry({ entry, defaultExpanded }: DiaryEntryProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  function toggle() {
    setExpanded((e) => !e);
  }

  return (
    <div className="diary-entry">
      <div
        className="diary-entry-header"
        onClick={toggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && toggle()}
        aria-expanded={expanded}
      >
        <span className="diary-date">{formatDate(entry.date)}</span>

        <div className="diary-summary">
          {entry.totalXpGained > 0 && (
            <span className="summary-stat xp-stat">
              <span className="stat-label">XP</span>
              +{formatXP(entry.totalXpGained)}
            </span>
          )}
          {entry.totalBossKills > 0 && (
            <span className="summary-stat boss-stat">
              <span className="stat-label">Bosses</span>
              {entry.totalBossKills}
            </span>
          )}
          {entry.totalLevelUps > 0 && (
            <span className="summary-stat level-stat">
              <span className="stat-label">Levels</span>
              {entry.totalLevelUps}
            </span>
          )}
          {entry.totalClues > 0 && (
            <span className="summary-stat clue-stat">
              <span className="stat-label">Clues</span>
              {entry.totalClues}
            </span>
          )}
        </div>

        <span className="expand-icon" aria-hidden="true">
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {expanded && (
        <div className="diary-players">
          {entry.players.map((player) => (
            <PlayerEntry key={player.name} entry={player} />
          ))}
        </div>
      )}
    </div>
  );
}

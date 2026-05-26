import { formatXP } from '../utils/format';
import type { DayEntry } from '../utils/diary';

interface PlayerStats {
  totalXp: number;
  totalKills: number;
  totalLevels: number;
  totalDays: number;
}

export function computePlayerStats(diary: DayEntry[], playerName: string): PlayerStats {
  const entries = diary.flatMap((day) => day.players.filter((p) => p.name === playerName));
  return {
    totalXp: entries.reduce((s, p) => s + p.totalXpGained, 0),
    totalKills: entries.reduce((s, p) => s + p.bosses.reduce((bs, b) => bs + b.killsGained, 0), 0),
    totalLevels: entries.reduce((s, p) => s + p.levelUps.length, 0),
    totalDays: entries.length,
  };
}

export function PlayerCard({ name, stats }: { name: string; stats: ReturnType<typeof computePlayerStats> }) {
  return (
    <div className="player-card">
      <div className="player-card-nameplate">
        <span className="player-card-name">{name}</span>
      </div>
      <div className="player-card-body">
        {stats.totalDays === 0 ? (
          <span className="card-no-activity">No activity recorded yet</span>
        ) : (
          <div className="card-stats-row">
            <span className="card-stat xp-value">+{formatXP(stats.totalXp)} XP</span>
            {stats.totalKills > 0 && <span className="card-stat kill-value">×{stats.totalKills} kills</span>}
            {stats.totalLevels > 0 && <span className="card-stat level-value">+{stats.totalLevels} levels</span>}
            <span className="card-stat-days">{stats.totalDays}d active</span>
          </div>
        )}
      </div>
    </div>
  );
}

import { PLAYER_COLORS } from '../config';
import { MetricIcon } from './MetricIcon';
import { formatDate, prettify, lastName } from '../utils/format';
import type { DayEntry } from '../utils/diary';

function playerColor(name: string) {
  return PLAYER_COLORS[name] ?? 'var(--text)';
}

interface FeedEvent {
  date: string;
  playerName: string;
  type: 'level_up' | 'boss_kill';
  metric: string;
  value: number;
  from?: number;
}

function buildEvents(diary: DayEntry[], dayCount: number): FeedEvent[] {
  const events: FeedEvent[] = [];
  for (const day of diary.slice(0, dayCount)) {
    for (const player of day.players) {
      for (const lu of player.levelUps) {
        events.push({ date: day.date, playerName: player.name, type: 'level_up', metric: lu.metric, value: lu.to, from: lu.from });
      }
      for (const boss of player.bosses) {
        events.push({ date: day.date, playerName: player.name, type: 'boss_kill', metric: boss.metric, value: boss.killsGained });
      }
    }
  }
  return events;
}

interface Props {
  diary: DayEntry[];
  dayCount?: number;
}

export function ActivityFeed({ diary, dayCount = 3 }: Props) {
  const events = buildEvents(diary, dayCount);

  const byDate = new Map<string, FeedEvent[]>();
  for (const ev of events) {
    if (!byDate.has(ev.date)) byDate.set(ev.date, []);
    byDate.get(ev.date)!.push(ev);
  }

  if (byDate.size === 0) return <div className="feed-empty">No recent activity</div>;

  return (
    <div className="activity-feed">
      {[...byDate.entries()].map(([date, dayEvents]) => (
        <div key={date} className="feed-day">
          <div className="feed-date-label">{formatDate(date)}</div>
          {dayEvents.map((ev, i) => (
            <div key={i} className="feed-event">
              <span className="feed-player-tag" style={{ color: playerColor(ev.playerName) }}>
                {lastName(ev.playerName)}
              </span>
              <MetricIcon
                type={ev.type === 'level_up' ? 'skills' : 'bosses'}
                metric={ev.metric}
                className="feed-icon"
              />
              <span className={`feed-desc ${ev.type === 'level_up' ? 'level-value' : 'kill-value'}`}>
                {ev.type === 'level_up'
                  ? `${prettify(ev.metric)} ${ev.from}→${ev.value}`
                  : `${prettify(ev.metric)} ×${ev.value}`}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

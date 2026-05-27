import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { PLAYERS, PLAYER_COLORS } from '../config';
import { formatXP, lastName } from '../utils/format';
import type { DayEntry } from '../utils/diary';

const PERIODS = [
  { label: '3d',    days: 3  },
  { label: '7d',    days: 7  },
  { label: 'Month', days: 30 },
];

function buildChartData(diary: DayEntry[], days: number) {
  // Build calendar range ending today
  const today = new Date();
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  // Map diary entries for quick lookup
  const byDate = new Map<string, Record<string, number>>();
  for (const day of diary) {
    const row: Record<string, number> = {};
    for (const p of day.players) row[p.name] = p.totalXpGained;
    byDate.set(day.date, row);
  }

  // Build daily points then accumulate so the line never drops
  const cumulative: Record<string, number> = {};
  for (const name of PLAYERS) cumulative[name] = 0;

  return dates.map((date) => {
    const row = byDate.get(date) ?? {};
    const point: Record<string, string | number> = { date };
    for (const name of PLAYERS) {
      cumulative[name] += row[name] ?? 0;
      point[name] = cumulative[name];
    }
    return point;
  });
}

function tickDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p) => p.value > 0);
  if (rows.length === 0) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-date">{label ? tickDate(label) : ''}</div>
      {rows.map((p) => (
        <div key={p.dataKey} className="chart-tooltip-row">
          <span style={{ color: p.color }}>{lastName(p.dataKey)}</span>
          <span className="chart-tooltip-value">+{formatXP(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  diary: DayEntry[];
}

export function XpChart({ diary }: Props) {
  const [period, setPeriod] = useState(3);

  const data = useMemo(() => buildChartData(diary, period), [diary, period]);
  const hasData = data.some((d) => PLAYERS.some((p) => (d[p] as number) > 0));

  return (
    <div className="xp-chart">
      <div className="xp-chart-header">
        <span className="xp-chart-title">XP Gained</span>
        <div className="xp-chart-legend">
          {PLAYERS.map((name) => (
            <span key={name} className="chart-legend-item" style={{ color: PLAYER_COLORS[name] }}>
              ● {lastName(name)}
            </span>
          ))}
        </div>
        <div className="xp-chart-periods">
          {PERIODS.map(({ label, days }) => (
            <button
              key={days}
              className={`chart-period-btn${period === days ? ' active' : ''}`}
              onClick={() => setPeriod(days)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="chart-empty">No data for this period</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={tickDate}
              tick={{ fill: '#7a7265', fontSize: 11 }}
              axisLine={{ stroke: '#5c4a30' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v) => (v > 0 ? formatXP(v) : '0')}
              tick={{ fill: '#7a7265', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={46}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.25)', strokeDasharray: '4 4' }} />
            {PLAYERS.map((name) => (
              <Line
                key={name}
                type="linear"
                dataKey={name}
                stroke={PLAYER_COLORS[name]}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2, stroke: '#fff', strokeOpacity: 1, fill: PLAYER_COLORS[name] }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', strokeOpacity: 1, fill: PLAYER_COLORS[name] }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

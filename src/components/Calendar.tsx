import { useState, useEffect } from 'react';

const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

interface Props {
  activeDates: Set<string>;
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

export function Calendar({ activeDates, selectedDate, onSelect }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  useEffect(() => {
    if (selectedDate) {
      const d = new Date(`${selectedDate}T12:00:00Z`);
      setYear(d.getFullYear());
      setMonth(d.getMonth());
    }
  }, [selectedDate]);

  const todayStr = now.toISOString().slice(0, 10);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0

  const cells: Array<string | null> = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }),
  ];

  const label = new Date(year, month, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  return (
    <div className="calendar">
      <div className="calendar-nav">
        <button className="cal-nav-btn" onClick={prev}>‹</button>
        <span className="cal-month-label">{label}</span>
        <button className="cal-nav-btn" onClick={next}>›</button>
      </div>
      <div className="calendar-grid">
        {DOW.map(d => <div key={d} className="cal-dow">{d}</div>)}
        {cells.map((dateStr, i) => {
          if (!dateStr) return <div key={i} className="cal-cell cal-empty" />;
          const day = parseInt(dateStr.slice(-2), 10);
          const active = activeDates.has(dateStr);
          const selected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          const classes = [
            'cal-cell',
            active ? 'cal-active' : 'cal-inactive',
            selected ? 'cal-selected' : '',
            isToday ? 'cal-today' : '',
          ].filter(Boolean).join(' ');
          return (
            <div
              key={dateStr}
              className={classes}
              onClick={() => active && onSelect(dateStr)}
              role={active ? 'button' : undefined}
              tabIndex={active ? 0 : undefined}
              onKeyDown={(e) => e.key === 'Enter' && active && onSelect(dateStr)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { Paper } from '@mantine/core';
import type { AppData, DayEntry } from '../lib/types';
import { currentYear, getYearMonthsClamped, MIN_DATE_KEY, todayKey, getYearProgress, getWeekNumber } from '../lib/dates';
import { yearEntries, countColors } from '../lib/stats';
import DiaryEntryModal from '../components/DiaryEntryModal';

type Props = {
  year: number;
  setYear: (y: number) => void;
  data: AppData;
  setData: (d: AppData) => void;
  minYear: number;
};

export default function DiaryView({ year, setYear, data, setData, minYear }: Props) {
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [showPastDaysModal, setShowPastDaysModal] = useState(false);
  const today = todayKey();
  const [pastDateKey, setPastDateKey] = useState<string>(today);
  const months = useMemo(() => getYearMonthsClamped(year, MIN_DATE_KEY, todayKey()), [year]);
  const stats = useMemo(() => countColors(yearEntries(data, year)), [data, year]);
  const yearProgress = useMemo(() => getYearProgress(year), [year]);

  const getDay = (date: string): DayEntry | undefined => data.days.find((d) => d.date === date);
  const upsertDay = (date: string, patch: Partial<DayEntry>) => {
    setData({
      ...data,
      days: (() => {
        const idx = data.days.findIndex((d) => d.date === date);
        if (idx === -1)
          return [
            ...data.days,
            { date, text: '', color: 'neutral', ...patch, updatedAt: new Date().toISOString() },
          ];
        const next = data.days.slice();
        next[idx] = { ...next[idx], ...patch, updatedAt: new Date().toISOString() };
        return next;
      })(),
    });
  };
  const handleEntryClick = (dateKey: string) => setSelectedEntry(dateKey);

  return (
    <div className="diary-view">
      {/* Professional toolbar with seamless integration */}
      <div className="diary-toolbar">
        <div className="toolbar-left">
          <div className="year-controls">
            <button
              className="nav-button"
              onClick={() => year > minYear && setYear(year - 1)}
              disabled={year <= minYear}
              aria-label="Previous year"
            >
              <ChevronLeftIcon />
            </button>
            <span className="current-year text-title-small text-semibold">{year}</span>
            <button
              className="nav-button"
              onClick={() => setYear(Math.min(year + 1, currentYear()))}
              disabled={year >= currentYear()}
              aria-label="Next year"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
        <div className="toolbar-center">
          {/* Year Progress Bar */}
          <div className="year-progress-container">
            <span className="year-progress-year">{year}</span>
            <div className="year-progress-bar">
              <div 
                className="year-progress-fill" 
                style={{ width: `${yearProgress}%` }}
              />
            </div>
            <span className="year-progress-text">{Math.round(yearProgress)}% done</span>
          </div>
        </div>
        <div className="toolbar-right">
          <div className="stats-overview">
            <StatDot color="green" count={stats.green} />
            <StatDot color="yellow" count={stats.yellow} />
            <StatDot color="red" count={stats.red} />
          </div>
          <button className="edit-past-button" onClick={() => { setPastDateKey(today); setShowPastDaysModal(true); }}>
            <EditIcon />
            <span>Edit Past</span>
          </button>
        </div>
      </div>

      {/* Months as columns with horizontal scroll; hide empty cards and months */}
      <div className="diary-content">
        <div className="diary-months-columns">
          {months
            .map((month) => {
              const visibleDays = month.days.filter((dateKey) => {
                const e = getDay(dateKey);
                const hasText = (e?.text ?? '').trim().length > 0;
                const isT = dateKey === today;
                const isPast = dateKey < today;
                return hasText || isT || isPast; // show today, days with text, and all past days
              });
              return { ...month, visibleDays };
            })
            .filter((m) => m.visibleDays.length > 0)
            .slice(-4)
            .map((month) => (
              <div className="month-col" key={month.month}>
                <div className="month-header">
                  <h2 className="month-title text-title-small">{month.label}</h2>
                </div>
                <div className="month-days">
                  {month.visibleDays.flatMap((dateKey, idx) => {
                    const [y, m, d] = dateKey.split('-').map((v) => parseInt(v, 10));
                    const jsDate = new Date(y, m - 1, d);
                    const isMonday = jsDate.getDay() === 1; // 1 = Monday
                    const parts: JSX.Element[] = [];

                    if (isMonday) {
                      const weekNo = getWeekNumber(jsDate);
                      parts.push(
                        <div className="week-separator" key={`${dateKey}-sep`}>
                          <div className="week-line" />
                          <div className="week-indicator">
                            <span className="week-text">W{weekNo}</span>
                          </div>
                          <div className="week-line" />
                        </div>
                      );
                    }

                    parts.push(
                      <DiaryEntryCard
                        key={dateKey}
                        dateKey={dateKey}
                        entry={getDay(dateKey)}
                        onClick={() => handleEntryClick(dateKey)}
                        isToday={dateKey === today}
                      />
                    );
                    return parts;
                  })}
                </div>
              </div>
            ))}
        </div>
      </div>

      <DiaryEntryModal
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        dateKey={selectedEntry || ''}
        entry={selectedEntry ? getDay(selectedEntry) : undefined}
        onChange={(patch) => selectedEntry && upsertDay(selectedEntry, patch)}
      />

      {showPastDaysModal && (
        <div className="modal-overlay" onClick={() => setShowPastDaysModal(false)}>
          <div className="past-days-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-title-small text-semibold" style={{ marginBottom: 8 }}>Edit Past Day</h3>
            <p className="text-body-small text-secondary" style={{ marginBottom: 12 }}>Enter a date (YYYY-MM-DD) to open that day.</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                className="field-input"
                style={{ width: 180, height: 32 }}
                type="text"
                placeholder="YYYY-MM-DD"
                value={pastDateKey}
                onChange={(e) => setPastDateKey(e.target.value)}
              />
              <button
                className="edit-past-button"
                onClick={() => {
                  // Validate format basic YYYY-MM-DD
                  const m = pastDateKey.match(/^\d{4}-\d{2}-\d{2}$/);
                  if (!m) return;
                  setSelectedEntry(pastDateKey);
                  setShowPastDaysModal(false);
                }}
              >
                Open Day
              </button>
              <button className="cancel-button" onClick={() => setShowPastDaysModal(false)}>Cancel</button>
            </div>
            <p className="text-caption text-tertiary" style={{ marginTop: 8 }}>Range: from {MIN_DATE_KEY} to {today}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function DiaryEntryCard({ 
  dateKey, 
  entry, 
  onClick,
  isToday
}: { 
  dateKey: string; 
  entry?: DayEntry; 
  onClick: () => void;
  isToday: boolean;
}) {
  const dayNum = parseInt(dateKey.split('-')[2], 10);
  const color = entry?.color ?? (isToday ? 'neutral' : 'red');
  const text = entry?.text ?? '';

  // Parse date for better formatting
  const [year, month, day] = dateKey.split('-');
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const weekdayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()];

  return (
    <Paper
      withBorder
      shadow="xs"
      radius="xs"
      className={`diary-card c-${color} ${isToday ? 'is-today' : ''} interactive`}
      onClick={onClick}
    >
      <div className="card-header micro">
        <div className="date-section compact">
          <div className="day-badge tiny">{dayNum}</div>
          {isToday && <span className="today-label text-caption">Today</span>}
        </div>
        <div className="card-header-right">
          <h3 className="day-name small text-semibold">{weekdayShort}</h3>
          <div className="mood-indicator micro">
            <div className={`mood-dot ${color}`} />
          </div>
        </div>
      </div>

      {text && (
        <div className="entry-preview full">
          <p className="preview-text untruncate text-body-small">{text}</p>
        </div>
      )}

      {isToday && !text && (
        <div className="entry-prompt">
          <p className="prompt-text text-body-small text-tertiary">Click to write today's entry</p>
        </div>
      )}
    </Paper>
  );
}

function StatDot({ color, count }: { color: 'red' | 'yellow' | 'green'; count: number }) {
  return (
    <div className="stat-dot">
      <div className={`dot ${color}`} />
      <span className="count text-body-small text-medium">{count}</span>
    </div>
  );
}

// Icons
function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18L9 12L15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18L15 12L9 6" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

import React, { useMemo, useState } from 'react';
import { Paper } from '@mantine/core';
import type { AppData, DayEntry } from '../lib/types';
import { currentYear, getYearMonthsClamped, MIN_DATE_KEY, todayKey } from '../lib/dates';
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
  const months = useMemo(() => getYearMonthsClamped(year, MIN_DATE_KEY, todayKey()), [year]);
  const stats = useMemo(() => countColors(yearEntries(data, year)), [data, year]);
  const today = todayKey();

  const getDay = (date: string): DayEntry | undefined => data.days.find((d) => d.date === date);
  const upsertDay = (date: string, patch: Partial<DayEntry>) => {
    setData({
      ...data,
      days: (() => {
        const idx = data.days.findIndex((d) => d.date === date);
        if (idx === -1)
          return [
            ...data.days,
            { date, text: '', color: 'yellow', ...patch, updatedAt: new Date().toISOString() },
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
      <div className="diary-nav">
        <div className="nav-section">
          <h1 className="diary-title text-title-large">Diary</h1>
          <div className="year-controls">
            <button
              className="nav-button"
              onClick={() => year > minYear && setYear(year - 1)}
              disabled={year <= minYear}
              aria-label="Previous year"
            >
              <ChevronLeftIcon />
            </button>
            <span className="current-year text-body-large text-semibold">{year}</span>
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
        <div className="nav-actions">
          <div className="stats-overview">
            <StatDot color="green" count={stats.green} />
            <StatDot color="yellow" count={stats.yellow} />
            <StatDot color="red" count={stats.red} />
          </div>
          <button className="edit-past-button" onClick={() => setShowPastDaysModal(true)}>
            <EditIcon />
            <span className="text-body-small">Edit Past</span>
          </button>
        </div>
      </div>

      <div className="diary-content-full">
        <div className="diary-months-full">
          {months.map((month) => (
            <MonthSection
              key={month.month}
              month={month}
              getDay={getDay}
              onEntryClick={handleEntryClick}
              today={today}
            />
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
            <h3>Edit Past Days - Coming Soon</h3>
            <p>This feature will allow you to edit any past day</p>
            <button onClick={() => setShowPastDaysModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MonthSection({ 
  month, 
  getDay, 
  onEntryClick,
  today
}: { 
  month: { month: number; label: string; days: string[] }; 
  getDay: (date: string) => DayEntry | undefined;
  onEntryClick: (dateKey: string) => void;
  today: string;
}) {
  return (
    <div className="month-section">
      <div className="month-header">
        <h2 className="month-title text-title">{month.label}</h2>
      </div>
      
      <div className="month-entries">
        {month.days.map((dateKey) => (
          <DiaryEntryCard
            key={dateKey}
            dateKey={dateKey}
            entry={getDay(dateKey)}
            onClick={() => onEntryClick(dateKey)}
            isToday={dateKey === today}
          />
        ))}
      </div>
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
  const color = entry?.color ?? 'yellow';
  const text = entry?.text ?? '';
  const hasContent = !!entry && (entry.text?.trim() || entry.diaryEntry?.trim());

  // Parse date for better formatting
  const [year, month, day] = dateKey.split('-');
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <Paper
      withBorder
      shadow="xs"
      radius="xs"
      className={`diary-card c-${color} ${isToday ? 'is-today' : ''} interactive`}
      onClick={onClick}
    >
      <div className="card-header">
        <div className="date-section">
          <div className="day-badge">{dayNum}</div>
          <div className="day-info">
            <h3 className="day-name text-body-large text-semibold">{weekday}</h3>
            {isToday && <span className="today-label text-caption">Today</span>}
          </div>
        </div>
        
        <div className="mood-indicator">
          <div className={`mood-dot ${color}`} />
        </div>
      </div>

      {text && (
        <div className="entry-preview">
          <p className="preview-text text-body-small">{text}</p>
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

function CalendarIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)' }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// Removed legacy inline DayEntry/ColorPicker row layout in favor of card/modal flow.
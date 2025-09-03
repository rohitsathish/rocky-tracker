import React, { useMemo, useState } from 'react';
import { Paper } from '@mantine/core';
import { AppData, Habit } from '../lib/types';
import { currentYear, getYearMonthsClamped, MIN_DATE_KEY, todayKey } from '../lib/dates';

type Props = {
  year: number;
  setYear: (y: number) => void;
  data: AppData;
  setData: (d: AppData) => void;
  minYear: number;
};

export default function HabitView({ year, setYear, data, setData, minYear }: Props) {
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showHabitsManager, setShowHabitsManager] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showArchivedHabits, setShowArchivedHabits] = useState(false);

  const months = useMemo(() => getYearMonthsClamped(year, MIN_DATE_KEY, todayKey()), [year]);
  const today = todayKey();
  
  const currentHabits = useMemo(() => 
    data.habits.filter(habit => !habit.completedAt || habit.completedAt >= today), 
    [data.habits, today]
  );
  
  const archivedHabits = useMemo(() => 
    data.habits.filter(habit => habit.completedAt && habit.completedAt < today), 
    [data.habits, today]
  );

  const createHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `h_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setData({
      ...data,
      habits: [...data.habits, newHabit]
    });
  };

  const updateHabit = (habitId: string, updates: Partial<Habit>) => {
    setData({
      ...data,
      habits: data.habits.map(habit => 
        habit.id === habitId 
          ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
          : habit
      )
    });
  };

  const deleteHabit = (habitId: string) => {
    setData({
      ...data,
      habits: data.habits.filter(habit => habit.id !== habitId),
      days: data.days.map(day => ({
        ...day,
        completedHabits: day.completedHabits?.filter(id => id !== habitId)
      }))
    });
  };

  const toggleHabitCompletion = (dateKey: string, habitId: string) => {
    const dayEntry = data.days.find(d => d.date === dateKey);
    
    if (dayEntry) {
      const completedHabits = dayEntry.completedHabits || [];
      const isCompleted = completedHabits.includes(habitId);
      
      const updatedCompletedHabits = isCompleted 
        ? completedHabits.filter(id => id !== habitId)
        : [...completedHabits, habitId];
      
      setData({
        ...data,
        days: data.days.map(d => 
          d.date === dateKey 
            ? { ...d, completedHabits: updatedCompletedHabits, updatedAt: new Date().toISOString() }
            : d
        )
      });
    } else {
      // Create new day entry
      const newDay = {
        date: dateKey,
        text: '',
        color: 'green' as const,
        completedHabits: [habitId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setData({
        ...data,
        days: [...data.days, newDay]
      });
    }
  };
  
  const openDayModal = (dateKey: string) => {
    setSelectedDay(dateKey);
    setShowDayModal(true);
  };

  return (
    <div className="habit-view">
      {/* Professional toolbar following diary pattern */}
      <div className="habit-toolbar">
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
          {/* Empty center section for grid layout consistency */}
        </div>
        
        <div className="toolbar-right">
          <button 
            className="edit-habits-button"
            onClick={() => setShowHabitsManager(true)}
          >
            <EditIcon /> <span>Edit Habits</span>
          </button>
        </div>
      </div>

      {/* Content area with proper scrolling */}
      <div className="habit-content">
        <div className="habit-scroll-container">
          <div className="habit-calendar">
            {months.map(month => (
              <MonthCalendar
                key={month.month}
                month={month}
                habits={currentHabits}
                data={data}
                today={today}
                onToggleHabit={toggleHabitCompletion}
                onDayClick={openDayModal}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Habits Management Modal */}
      {showHabitsManager && (
        <HabitsManagerModal 
          currentHabits={currentHabits}
          archivedHabits={archivedHabits}
          showArchivedHabits={showArchivedHabits}
          setShowArchivedHabits={setShowArchivedHabits}
          onEditHabit={(habit: Habit) => {
            setEditingHabit(habit);
            setShowHabitModal(true);
            setShowHabitsManager(false);
          }}
          onNewHabit={() => {
            setEditingHabit(null);
            setShowHabitModal(true);
            setShowHabitsManager(false);
          }}
          onClose={() => setShowHabitsManager(false)}
        />
      )}

      {/* Individual Habit Modal */}
      {showHabitModal && (
        <HabitModal
          habit={editingHabit}
          onSave={(habitData) => {
            if (editingHabit) {
              updateHabit(editingHabit.id, habitData);
            } else {
              createHabit(habitData);
            }
            setShowHabitModal(false);
            setEditingHabit(null);
          }}
          onCancel={() => {
            setShowHabitModal(false);
            setEditingHabit(null);
          }}
        />
      )}

      {/* Day Habits Modal */}
      {showDayModal && selectedDay && (
        <DayHabitsModal 
          dateKey={selectedDay}
          currentHabits={currentHabits}
          data={data}
          onToggleHabit={toggleHabitCompletion}
          onClose={() => {
            setShowDayModal(false);
            setSelectedDay(null);
          }}
        />
      )}
    </div>
  );
}

function MonthCalendar({ 
  month, 
  habits, 
  data, 
  today,
  onToggleHabit,
  onDayClick
}: { 
  month: { month: number; label: string; days: string[] };
  habits: Habit[];
  data: AppData;
  today: string;
  onToggleHabit: (dateKey: string, habitId: string) => void;
  onDayClick?: (dateKey: string) => void;
}) {
  const weekHeaders = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'];
  
  // Calculate max habits per week for uniform row height
  const getActiveHabitsForDay = (dateKey: string) => {
    return habits.filter(habit => {
      return dateKey >= habit.startDate && (!habit.completedAt || dateKey <= habit.completedAt);
    });
  };

  const calculateMaxHabitsInWeeks = () => {
    const weeks: string[][] = [];
    let currentWeek: string[] = [];
    
    // Group days into weeks
    const firstDay = month.days[0];
    if (firstDay) {
      const firstDate = new Date(firstDay);
      let dayOfWeek = firstDate.getDay();
      dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday-first
      
      // Add empty slots for days before the first day
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push('');
      }
    }
    
    month.days.forEach((dateKey, index) => {
      currentWeek.push(dateKey);
      if (currentWeek.length === 7 || index === month.days.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    // Calculate max habits per week
    return weeks.map(week => {
      return Math.max(
        ...week.map(dateKey => 
          dateKey ? getActiveHabitsForDay(dateKey).length : 0
        )
      );
    });
  };

  const maxHabitsPerWeek = calculateMaxHabitsInWeeks();
  
  // Create calendar grid with proper day alignment and week tracking
  const createCalendarGrid = (): JSX.Element[] => {
    const grid: JSX.Element[] = [];
    
    // Add week headers
    weekHeaders.forEach(day => {
      grid.push(
        <div key={day} className="week-header">
          {day}
        </div>
      );
    });
    
    if (month.days.length === 0) return grid;
    
    // Get the first day of the month and determine its weekday
    const firstDay = month.days[0];
    const firstDate = new Date(firstDay);
    let dayOfWeek = firstDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Convert to Monday-first (0 = Monday, 6 = Sunday)
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    let currentWeekIndex = 0;
    let dayInWeek = dayOfWeek;
    
    // Add empty cells before the first day
    for (let i = 0; i < dayOfWeek; i++) {
      grid.push(
        <div key={`empty-${i}`} className="day-cell empty">
        </div>
      );
    }
    
    // Add the actual days with week information
    month.days.forEach((dateKey, dayIndex) => {
      const weekIndex = Math.floor((dayOfWeek + dayIndex) / 7);
      grid.push(
        <DayCell
          key={dateKey}
          dateKey={dateKey}
          habits={habits}
          data={data}
          today={today}
          onToggleHabit={onToggleHabit}
          onDayClick={onDayClick}
          maxHabitsInWeek={maxHabitsPerWeek[weekIndex] || 0}
        />
      );
      
      dayInWeek++;
      if (dayInWeek === 7) {
        currentWeekIndex++;
        dayInWeek = 0;
      }
    });
    
    return grid;
  };
  
  return (
    <div className="calendar-month">
      <div className="month-header">
        <h2 className="month-title text-title-small">{month.label}</h2>
      </div>
      
      <div className="calendar-grid">
        {createCalendarGrid()}
      </div>
    </div>
  );
}

function DayCell({ 
  dateKey, 
  habits, 
  data, 
  today,
  onToggleHabit,
  onDayClick,
  maxHabitsInWeek
}: { 
  dateKey: string;
  habits: Habit[];
  data: AppData;
  today: string;
  onToggleHabit: (dateKey: string, habitId: string) => void;
  onDayClick?: (dateKey: string) => void;
  maxHabitsInWeek: number;
}) {
  const dayNum = parseInt(dateKey.split('-')[2], 10);
  const dayEntry = data.days.find(d => d.date === dateKey);
  const completedHabits = dayEntry?.completedHabits || [];
  const isToday = dateKey === today;
  const isPast = dateKey < today;
  const isFuture = dateKey > today;

  // Filter habits that are active on this date
  const activeHabitsForDay = habits.filter(habit => {
    return dateKey >= habit.startDate && (!habit.completedAt || dateKey <= habit.completedAt);
  });

  const completedCount = activeHabitsForDay.filter(habit => 
    completedHabits.includes(habit.id)
  ).length;

  const allCompleted = activeHabitsForDay.length > 0 && completedCount === activeHabitsForDay.length;
  const partialCompletion = activeHabitsForDay.length > 0 && completedCount > 0 && completedCount < activeHabitsForDay.length;
  const noneCompleted = activeHabitsForDay.length > 0 && completedCount === 0;
  const todayInitial = isToday && completedCount === 0; // show purple, hide dots
  const completionPct = activeHabitsForDay.length > 0 ? Math.round((completedCount / activeHabitsForDay.length) * 100) : 0;

  if (isFuture && activeHabitsForDay.length === 0) {
    return (
      <div className="day-cell future empty">
        <div 
          className="day-cell-inner future empty"
          style={{ 
            '--dot-rows': 0
          } as React.CSSProperties}
        >
          <div className="day-badge-container future empty">
            <div className="day-number">{dayNum}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`day-cell ${todayInitial ? 'today' : ''} ${allCompleted ? 'all-done' : ''} ${partialCompletion ? 'partial-completion' : ''} ${noneCompleted ? 'none-completed' : ''} ${isFuture ? 'future' : ''}`}
      onClick={() => onDayClick && activeHabitsForDay.length > 0 && onDayClick(dateKey)}
      style={{ cursor: activeHabitsForDay.length > 0 ? 'pointer' : 'default' }}
    >
      <div 
        className={`day-cell-inner ${todayInitial ? 'today' : ''} ${allCompleted ? 'all-done' : ''} ${partialCompletion ? 'partial-completion' : ''} ${noneCompleted ? 'none-completed' : ''} ${isFuture ? 'future' : ''}`}
        style={{ 
          '--dot-rows': todayInitial ? 0 : Math.ceil(activeHabitsForDay.length / 3)
        } as React.CSSProperties}
      >
        {/* Single container with grey background that holds both day number and dots */}
        <div className={`day-badge-container ${todayInitial ? 'today' : ''} ${allCompleted ? 'all-done' : ''} ${partialCompletion ? 'partial-completion' : ''} ${noneCompleted ? 'none-completed' : ''}`}>
          <div className="day-number">{dayNum}</div>
          
          {activeHabitsForDay.length > 0 && !todayInitial && (
            <div className="habit-dots-container">
              {Array.from({ length: Math.ceil(maxHabitsInWeek / 3) }, (_, rowIndex) => (
                <div key={rowIndex} className="habit-dots-row">
                  {activeHabitsForDay
                    .slice(rowIndex * 3, (rowIndex + 1) * 3)
                    .map(habit => (
                      <div
                        key={habit.id}
                        className={`habit-dot ${completedHabits.includes(habit.id) ? 'completed' : 'missed'}`}
                        title={`${habit.title}: ${completedHabits.includes(habit.id) ? 'Completed' : 'Not completed'}`}
                      />
                    ))}
                  {/* Fill empty slots in this row to maintain alignment */}
                  {Array.from({ 
                    length: 3 - activeHabitsForDay.slice(rowIndex * 3, (rowIndex + 1) * 3).length 
                  }, (_, emptyIndex) => (
                    <div key={`empty-${emptyIndex}`} style={{ width: '7px', height: '7px' }} />
                  ))}
                </div>
              ))}
              {/* Fill empty rows to maintain uniform height across the week */}
              {Array.from({ 
                length: Math.max(0, Math.ceil(maxHabitsInWeek / 3) - Math.ceil(activeHabitsForDay.length / 3))
              }, (_, emptyRowIndex) => (
                <div key={`empty-row-${emptyRowIndex}`} className="habit-dots-row">
                  {Array.from({ length: 3 }, (_, emptyDotIndex) => (
                    <div key={`empty-dot-${emptyDotIndex}`} style={{ width: '7px', height: '7px' }} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HabitModal({ 
  habit, 
  onSave, 
  onCancel 
}: { 
  habit: Habit | null;
  onSave: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(habit?.title || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [startDate, setStartDate] = useState(habit?.startDate || todayKey());

  const handleSave = () => {
    if (!title.trim()) return;
    
    onSave({
      title: title.trim(),
      description: description.trim(),
      startDate
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="habit-modal-redesign" onClick={(e) => e.stopPropagation()}>
        {/* Date-style Preview */}
        <div className="date-preview-section">
          <div className="date-circle-large">
            <HabitIcon />
          </div>
          <div className="date-details">
            <h3 className="weekday-large">{habit ? 'Edit Habit' : 'New Habit'}</h3>
            <p className="full-date-large">Set up your daily routine</p>
          </div>
        </div>
        
        {/* Form Content Section */}
        <div className="diary-content-section">
          <div className="input-group">
            <label className="input-label">Habit Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter habit name..."
              className="habit-input"
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="habit-textarea"
              rows={3}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="habit-input"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer-clean">
          <button onClick={onCancel} className="cancel-button-clean">
            Cancel
          </button>
          <button onClick={handleSave} className="save-button-clean" disabled={!title.trim()}>
            {habit ? 'Update Habit' : 'Create Habit'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Icons
function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18L9 12L15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18L15 12L9 6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14m-7-7h14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  );
}

function HabitIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M9 11l3 3L22 4" />
    </svg>
  );
}

// Habits Manager Modal
function HabitsManagerModal({
  currentHabits,
  archivedHabits,
  showArchivedHabits,
  setShowArchivedHabits,
  onEditHabit,
  onNewHabit,
  onClose
}: {
  currentHabits: Habit[];
  archivedHabits: Habit[];
  showArchivedHabits: boolean;
  setShowArchivedHabits: (show: boolean) => void;
  onEditHabit: (habit: Habit) => void;
  onNewHabit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="habits-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="date-preview-section">
          <div className="date-circle-large">
            <HabitIcon />
          </div>
          <div className="date-details">
            <h3 className="weekday-large">Manage Habits</h3>
            <p className="full-date-large">Create, edit, and organize your habits</p>
          </div>
        </div>

        <div className="diary-content-section">
          {/* New Habit Button */}
          <div className="new-habit-section">
            <button className="new-habit-button" onClick={onNewHabit}>
              <PlusIcon /> New Habit
            </button>
          </div>

          {/* Current Habits */}
          <div className="habits-section">
            <h3 className="section-title">Current Habits ({currentHabits.length})</h3>
            {currentHabits.length === 0 ? (
              <div className="empty-habits">
                <p>No current habits. Create your first habit to get started!</p>
              </div>
            ) : (
              <div className="habits-list">
                {currentHabits.map(habit => (
                  <div key={habit.id} className="habit-item" onClick={() => onEditHabit(habit)}>
                    <div className="habit-info">
                      <div className="habit-name">{habit.title}</div>
                      <div className="habit-details">
                        Started: {new Date(habit.startDate).toLocaleDateString()}
                        {habit.description && <span> • {habit.description}</span>}
                      </div>
                    </div>
                    <EditIcon />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Archived Habits */}
          <div className="habits-section">
            <button 
              className="section-toggle"
              onClick={() => setShowArchivedHabits(!showArchivedHabits)}
            >
              <span>Archived Habits ({archivedHabits.length})</span>
              {showArchivedHabits ? '▼' : '▶'}
            </button>
            
            {showArchivedHabits && (
              <div className="habits-list archived">
                {archivedHabits.length === 0 ? (
                  <div className="empty-habits">
                    <p>No archived habits yet.</p>
                  </div>
                ) : (
                  archivedHabits.map(habit => (
                    <div key={habit.id} className="habit-item archived" onClick={() => onEditHabit(habit)}>
                      <div className="habit-info">
                        <div className="habit-name">{habit.title}</div>
                        <div className="habit-details">
                          {habit.startDate} - {habit.completedAt}
                          {habit.description && <span> • {habit.description}</span>}
                        </div>
                      </div>
                      <EditIcon />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Day Habits Modal
function DayHabitsModal({
  dateKey,
  currentHabits,
  data,
  onToggleHabit,
  onClose
}: {
  dateKey: string;
  currentHabits: Habit[];
  data: AppData;
  onToggleHabit: (dateKey: string, habitId: string) => void;
  onClose: () => void;
}) {
  const date = new Date(dateKey);
  const dayEntry = data.days.find(d => d.date === dateKey);
  const completedHabits = dayEntry?.completedHabits || [];

  // Filter habits that are active on this date
  const activeHabitsForDay = currentHabits.filter(habit => {
    return dateKey >= habit.startDate && (!habit.completedAt || dateKey <= habit.completedAt);
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="day-habits-modal" onClick={(e) => e.stopPropagation()}>
        <div className="date-preview-section">
          <div className="date-circle-large">
            <span className="day-number-large">{date.getDate()}</span>
          </div>
          <div className="date-details">
            <h3 className="weekday-large">{date.toLocaleDateString('en-US', { weekday: 'long' })}</h3>
            <p className="full-date-large">{date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="diary-content-section">
          <div className="input-group">
            <label className="input-label">Daily Habits</label>
            <p className="input-hint">Mark your habits as complete or incomplete</p>
          </div>
          {activeHabitsForDay.length === 0 ? (
            <div className="empty-habits">
              <p>No habits are active for this day.</p>
            </div>
          ) : (
            <div className="habits-checklist">
              {activeHabitsForDay.map(habit => {
                const isCompleted = completedHabits.includes(habit.id);
                return (
                  <div key={habit.id} className={`habit-checkbox-item ${isCompleted ? 'completed' : ''}`}>
                    <label>
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => onToggleHabit(dateKey, habit.id)}
                      />
                      <span className="checkmark"></span>
                      <div className="habit-label">
                        <div className="habit-name">{habit.title}</div>
                        {habit.description && <div className="habit-description">{habit.description}</div>}
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

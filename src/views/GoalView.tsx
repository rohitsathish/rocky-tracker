import React, { useMemo, useState } from 'react';
import { Paper } from '@mantine/core';
import { AppData, Goal } from '../lib/types';
import { currentYear, getYearMonthsClamped, MIN_DATE_KEY, todayKey } from '../lib/dates';

type Props = {
  year: number;
  setYear: (y: number) => void;
  data: AppData;
  setData: (d: AppData) => void;
  minYear: number;
};

export default function GoalView({ year, setYear, data, setData, minYear }: Props) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const months = useMemo(() => getYearMonthsClamped(year, MIN_DATE_KEY, todayKey()), [year]);
  const activeGoals = useMemo(() => data.goals.filter(goal => !goal.completedAt), [data.goals]);
  const today = todayKey();

  const createGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `g_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setData({
      ...data,
      goals: [...data.goals, newGoal]
    });
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setData({
      ...data,
      goals: data.goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
          : goal
      )
    });
  };

  const deleteGoal = (goalId: string) => {
    setData({
      ...data,
      goals: data.goals.filter(goal => goal.id !== goalId),
      days: data.days.map(day => ({
        ...day,
        completedGoals: day.completedGoals?.filter(id => id !== goalId)
      }))
    });
  };

  const toggleGoalCompletion = (dateKey: string, goalId: string) => {
    const dayIndex = data.days.findIndex(d => d.date === dateKey);
    let updatedDays;

    if (dayIndex === -1) {
      // Create new day entry
      updatedDays = [...data.days, {
        date: dateKey,
        text: '',
        color: 'yellow' as const,
        completedGoals: [goalId],
        updatedAt: new Date().toISOString()
      }];
    } else {
      // Update existing day entry
      const day = data.days[dayIndex];
      const currentGoals = day.completedGoals || [];
      const isCompleted = currentGoals.includes(goalId);
      
      updatedDays = data.days.map(d => 
        d.date === dateKey 
          ? {
              ...d,
              completedGoals: isCompleted 
                ? currentGoals.filter(id => id !== goalId)
                : [...currentGoals, goalId],
              updatedAt: new Date().toISOString()
            }
          : d
      );
    }

    setData({ ...data, days: updatedDays });
  };

  return (
    <div className="goal-view">
      {/* Header */}
      <div className="goal-nav">
        <div className="nav-section">
          <h1 className="goal-title text-title-large">Goals</h1>
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

        <div className="goal-actions">
          <button 
            className="add-goal-button"
            onClick={() => setShowGoalModal(true)}
          >
            <PlusIcon />
            <span className="text-body-small">New Goal</span>
          </button>
        </div>
      </div>

      {/* Year view calendar grid - one year per page */}
      <div className="goal-calendar">
        {months.map(month => (
          <MonthCalendar
            key={month.month}
            month={month}
            goals={activeGoals}
            data={data}
            today={today}
            onToggleGoal={toggleGoalCompletion}
          />
        ))}
      </div>

      {/* Goal Modal */}
      {showGoalModal && (
        <GoalModal
          goal={editingGoal}
          onSave={(goalData) => {
            if (editingGoal) {
              updateGoal(editingGoal.id, goalData);
            } else {
              createGoal(goalData);
            }
            setShowGoalModal(false);
            setEditingGoal(null);
          }}
          onCancel={() => {
            setShowGoalModal(false);
            setEditingGoal(null);
          }}
        />
      )}
    </div>
  );
}

function MonthCalendar({ 
  month, 
  goals, 
  data, 
  today,
  onToggleGoal 
}: { 
  month: { month: number; label: string; days: string[] };
  goals: Goal[];
  data: AppData;
  today: string;
  onToggleGoal: (dateKey: string, goalId: string) => void;
}) {
  return (
    <div className="calendar-month">
      <div className="calendar-header">
        <h3 className="calendar-title text-title-small">{month.label}</h3>
      </div>
      
      <div className="calendar-grid">
        {month.days.map(dateKey => (
          <DayCell
            key={dateKey}
            dateKey={dateKey}
            goals={goals}
            data={data}
            today={today}
            onToggleGoal={onToggleGoal}
          />
        ))}
      </div>
    </div>
  );
}

function DayCell({ 
  dateKey, 
  goals, 
  data, 
  today,
  onToggleGoal 
}: { 
  dateKey: string;
  goals: Goal[];
  data: AppData;
  today: string;
  onToggleGoal: (dateKey: string, goalId: string) => void;
}) {
  const dayNum = parseInt(dateKey.split('-')[2], 10);
  const dayEntry = data.days.find(d => d.date === dateKey);
  const completedGoals = dayEntry?.completedGoals || [];
  const isToday = dateKey === today;
  const isPast = dateKey < today;
  const isFuture = dateKey > today;

  // Filter goals that are active on this date
  const activeGoalsForDay = goals.filter(goal => {
    return dateKey >= goal.startDate && (!goal.completedAt || dateKey <= goal.completedAt);
  });

  const completedCount = activeGoalsForDay.filter(goal => 
    completedGoals.includes(goal.id)
  ).length;

  const allCompleted = activeGoalsForDay.length > 0 && completedCount === activeGoalsForDay.length;
  const completionPct = activeGoalsForDay.length > 0 ? Math.round((completedCount / activeGoalsForDay.length) * 100) : 0;

  if (isFuture && activeGoalsForDay.length === 0) {
    return (
      <div className="day-cell future empty">
        <div className="day-number">{dayNum}</div>
      </div>
    );
  }

  return (
    <div className={`day-cell ${isToday ? 'today' : ''} ${allCompleted ? 'all-done' : ''} ${isFuture ? 'future' : ''}`}>
      <div className="day-number">{dayNum}</div>
      
      {activeGoalsForDay.length > 0 && (
        <div className="goal-dots" aria-label={`Goals: ${completedCount}/${activeGoalsForDay.length}`}>
          {activeGoalsForDay.map(goal => (
            <button
              key={goal.id}
              className={`goal-dot ${completedGoals.includes(goal.id) ? 'completed' : 'missed'}`}
              onClick={() => !isFuture && onToggleGoal(dateKey, goal.id)}
              title={`${goal.title}: ${completedGoals.includes(goal.id) ? 'Completed' : 'Not completed'}`}
              disabled={isFuture}
            />
          ))}
        </div>
      )}

      {activeGoalsForDay.length > 0 && (
        <div className="completion-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completionPct}>
          <div className="completion-fill" style={{ width: `${completionPct}%` }} />
        </div>
      )}

      {allCompleted && (
        <div className="completion-effect">✨</div>
      )}
    </div>
  );
}

function GoalModal({ 
  goal, 
  onSave, 
  onCancel 
}: { 
  goal: Goal | null;
  onSave: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [startDate, setStartDate] = useState(goal?.startDate || todayKey());

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
      <div className="goal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-title">{goal ? 'Edit Goal' : 'New Goal'}</h2>
        </div>
        
        <div className="modal-content">
          <div className="form-field">
            <label className="field-label text-body-small text-medium">Goal Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter goal title..."
              className="field-input"
              autoFocus
            />
          </div>

          <div className="form-field">
            <label className="field-label text-body-small text-medium">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="field-textarea"
              rows={3}
            />
          </div>

          <div className="form-field">
            <label className="field-label text-body-small text-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="field-input"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onCancel} className="cancel-button">
            Cancel
          </button>
          <button onClick={handleSave} className="save-button" disabled={!title.trim()}>
            {goal ? 'Update Goal' : 'Create Goal'}
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
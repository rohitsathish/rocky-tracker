import React, { useState, useEffect } from 'react';
import { Modal, Text, Textarea, Button, Group, Badge } from '@mantine/core';
import { DayEntry } from '../lib/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  dateKey: string;
  entry?: DayEntry;
  onChange: (patch: Partial<DayEntry>) => void;
};

export default function DiaryEntryModal({ isOpen, onClose, dateKey, entry, onChange }: Props) {
  const [summary, setSummary] = useState(entry?.text ?? '');
  const [diaryEntry, setDiaryEntry] = useState(entry?.diaryEntry ?? '');
  const [color, setColor] = useState<'red' | 'yellow' | 'green' | 'neutral'>(entry?.color ?? 'neutral');

  // Parse date for display
  const [year, month, day] = dateKey.split('-');
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
  const dayNum = parseInt(day);

  useEffect(() => {
    if (isOpen) {
      setSummary(entry?.text ?? '');
      setDiaryEntry(entry?.diaryEntry ?? '');
      setColor(entry?.color ?? 'neutral');
    }
  }, [isOpen, entry]);

  const handleSave = () => {
    onChange({
      text: summary,
      diaryEntry: diaryEntry,
      color: color
    });
    onClose();
  };

  const handleClose = () => {
    // Save on close
    if (summary.trim() || diaryEntry.trim() || (entry && entry.text) || (entry && entry.diaryEntry)) {
      handleSave();
    }
    onClose();
  };

  const moodOptions = [
    { value: 'red', label: 'Challenging', color: 'red' },
    { value: 'yellow', label: 'Okay', color: 'yellow' },
    { value: 'green', label: 'Great', color: 'green' }
  ] as const;

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      size="md"
      title={null}
      padding={0}
      radius={12}
      centered
      withCloseButton={false}
      overlayProps={{
        backgroundOpacity: 0.5,
        blur: 12
      }}
      transitionProps={{
        transition: 'pop',
        duration: 200,
        timingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
      styles={{
        content: {
          background: 'var(--bg-canvas)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }
      }}
    >
      <div className="diary-entry-modal-redesign">
        {/* Date Preview */}
        <div className="date-preview-section">
          <div className="date-circle-large">
            <span className="day-number-large">{dayNum}</span>
          </div>
          <div className="date-details">
            <h3 className="weekday-large">{weekday}</h3>
            <p className="full-date-large">{monthName} {dayNum}, {year}</p>
          </div>
        </div>

        {/* Mood Selector Section */}
        <div className="mood-selector-section">
          <div className="selector-group">
            <label className="selector-label">Day Mood</label>
            <Group gap={8}>
              {moodOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={color === option.value ? 'filled' : 'subtle'}
                  color={option.color}
                  onClick={() => {
                    setColor(option.value);
                    // Auto-save color change
                    onChange({
                      text: summary,
                      diaryEntry: diaryEntry,
                      color: option.value
                    });
                  }}
                  aria-label={`Mark as ${option.label} day`}
                  size="sm"
                  radius={8}
                  styles={{
                    root: {
                      transition: 'all 140ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                      fontWeight: color === option.value ? 600 : 500,
                      fontSize: '13px',
                      height: '36px',
                      padding: '0 12px'
                    }
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </Group>
          </div>
        </div>

        {/* Content */}
        <div className="diary-content-section">
          {/* Day Summary */}
          <div className="input-group">
            <label className="input-label">Day Summary</label>
            <Textarea
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                // Auto-save on change
                onChange({
                  text: e.target.value,
                  diaryEntry: diaryEntry,
                  color: color
                });
              }}
              placeholder="How was your day in a few words..."
              rows={3}
              autosize
              minRows={3}
              maxRows={5}
              styles={{
                input: {
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '14px',
                  fontWeight: 400,
                  borderRadius: '8px'
                }
              }}
            />
          </div>

          {/* Diary Entry */}
          <div className="input-group">
            <label className="input-label">Diary Entry</label>
            <Textarea
              value={diaryEntry}
              onChange={(e) => {
                setDiaryEntry(e.target.value);
                // Auto-save on change
                onChange({
                  text: summary,
                  diaryEntry: e.target.value,
                  color: color
                });
              }}
              placeholder="Write your full diary entry here... You can use **markdown** for formatting."
              rows={10}
              autosize
              minRows={10}
              maxRows={25}
              autoFocus
              styles={{
                input: {
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '14px',
                  fontWeight: 400,
                  borderRadius: '8px',
                  fontFamily: 'var(--font-mono)'
                }
              }}
            />
          </div>
        </div>

      </div>
    </Modal>
  );
}

function PenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
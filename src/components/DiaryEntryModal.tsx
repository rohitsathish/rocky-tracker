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
  const [color, setColor] = useState<'red' | 'yellow' | 'green'>(entry?.color ?? 'yellow');

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
      setColor(entry?.color ?? 'yellow');
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
      onClose={handleClose}
      size="lg"
      title={null}
      padding={0}
      radius={6}
      centered
      overlayProps={{
        backgroundOpacity: 0.4,
        blur: 8
      }}
      transitionProps={{
        transition: 'pop',
        duration: 160,
        timingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
      styles={{
        content: {
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-2xl)'
        }
      }}
    >
      <div className="diary-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="date-display">
            <div className="date-badge text-title-small">{dayNum}</div>
            <div className="date-info">
              <h2 className="modal-title text-title">{weekday}</h2>
              <p className="modal-subtitle text-body-small text-secondary">{monthName} {dayNum}, {year}</p>
            </div>
          </div>
          
          {/* Color Picker */}
          <div className="mood-selector">
            <Text size="xs" c="dimmed" mb={4} fw={500}>Day Mood</Text>
            <Group gap={4}>
              {moodOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={color === option.value ? 'filled' : 'subtle'}
                  color={option.color}
                  onClick={() => setColor(option.value)}
                  aria-label={`Mark as ${option.label} day`}
                  size="compact-xs"
                  radius={4}
                  styles={{
                    root: {
                      transition: 'all 140ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                      fontWeight: color === option.value ? 600 : 500,
                      fontSize: '11px',
                      height: '24px',
                      padding: '0 8px'
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
        <div className="modal-content">
          {/* Day Summary */}
          <div className="section">
            <label className="section-label text-body-small text-medium">Day Summary</label>
            <p className="section-hint text-caption text-tertiary">Brief overview shown in diary view</p>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="How was your day in a few words..."
              className="summary-input text-body"
              rows={2}
              autosize
              minRows={2}
              maxRows={4}
            />
          </div>

          {/* Diary Entry */}
          <div className="section">
            <label className="section-label text-body-small text-medium">Diary Entry</label>
            <p className="section-hint text-caption text-tertiary">Full diary entry with markdown support</p>
            <Textarea
              value={diaryEntry}
              onChange={(e) => setDiaryEntry(e.target.value)}
              placeholder="Write your full diary entry here... You can use **markdown** for formatting."
              className="diary-input text-body"
              rows={8}
              autosize
              minRows={8}
              maxRows={20}
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <Button 
            onClick={handleClose} 
            variant="filled" 
            color="blue"
            size="sm"
            radius={4}
            styles={{
              root: {
                transition: 'all 140ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                fontWeight: 500
              }
            }}
          >
            Save Entry
          </Button>
        </div>
      </div>
    </Modal>
  );
}
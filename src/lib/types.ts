// Rocky Tracker — Core Data Types (Schema v1)
// Keep minimal and stable; runtime validation lives in validate.ts

export type DayColor = 'red' | 'yellow' | 'green' | 'neutral';

// ISO date string in YYYY-MM-DD (local calendar day)
export type DateKey = string;

export interface DayEntry {
  // Calendar day key (YYYY-MM-DD)
  date: DateKey;
  // Brief summary shown in diary view
  text: string;
  // Full markdown diary entry
  diaryEntry?: string;
  // Mood/summary color for the day
  color: DayColor;
  // IDs of habits completed on this day (habits not listed are considered missed if active)
  completedHabits?: string[];
  // Optional timestamps for future auditing
  createdAt?: string; // ISO datetime
  updatedAt?: string; // ISO datetime
}

export interface Habit {
  id: string; // stable id (e.g., 'h_xxx')
  title: string;
  // Appears on or after this local date
  startDate: DateKey;
  // When set, habit stops appearing after this date and is considered archived
  completedAt?: DateKey;
  // Optional description/notes
  description?: string;
  // Optional timestamps
  createdAt?: string; // ISO datetime
  updatedAt?: string; // ISO datetime
}

export interface AppDataV1 {
  version: 1;
  days: DayEntry[];
  habits: Habit[];
}

export type AppData = AppDataV1;

export function createEmptyAppData(): AppData {
  return { version: 1, days: [], habits: [] };
}


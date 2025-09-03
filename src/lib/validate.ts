// Runtime validation and normalization for AppData (Schema v1)
// No external deps; keep fast and small.

import { AppData, AppDataV1, DayColor, DayEntry, Habit } from './types';

export type ValidationResult<T> = { ok: true; data: T; warnings: string[] } | { ok: false; errors: string[] };

const COLOR_SET: Record<string, true> = { red: true, yellow: true, green: true, neutral: true };

export function isDayColor(x: unknown): x is DayColor {
  return typeof x === 'string' && !!COLOR_SET[x];
}

export function isDateKey(s: unknown): s is string {
  if (typeof s !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00');
  // Basic validity check (handles 2025-02-30, etc.)
  return !Number.isNaN(d.getTime()) && s === toDateKey(d);
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function uniqueStrings(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of arr) {
    if (typeof v !== 'string') continue;
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

export function validateHabit(raw: unknown): ValidationResult<Habit> {
  const errors: string[] = [];
  const obj = (raw ?? {}) as Record<string, unknown>;

  const id = typeof obj.id === 'string' && obj.id.trim() ? obj.id.trim() : '';
  if (!id) errors.push('habit.id missing');

  const title = typeof obj.title === 'string' && obj.title.trim() ? obj.title.trim() : '';
  if (!title) errors.push('habit.title missing');

  const startDate = obj.startDate;
  if (!isDateKey(startDate)) errors.push('habit.startDate invalid');

  let completedAt: string | undefined;
  if (obj.completedAt != null) {
    if (isDateKey(obj.completedAt)) completedAt = obj.completedAt;
    else errors.push('habit.completedAt invalid');
  }

  const description = typeof obj.description === 'string' ? obj.description : undefined;
  const createdAt = typeof obj.createdAt === 'string' ? obj.createdAt : undefined;
  const updatedAt = typeof obj.updatedAt === 'string' ? obj.updatedAt : undefined;

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    data: { id, title, startDate: startDate as string, completedAt, description, createdAt, updatedAt },
    warnings: [],
  };
}

export function validateDay(raw: unknown, knownHabitIds?: Set<string>): ValidationResult<DayEntry> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const obj = (raw ?? {}) as Record<string, unknown>;

  const date = obj.date;
  if (!isDateKey(date)) errors.push('day.date invalid');

  const text = typeof obj.text === 'string' ? obj.text : '';
  const diaryEntry = typeof (obj as any).diaryEntry === 'string' ? (obj as any).diaryEntry : undefined;
  const color = isDayColor(obj.color) ? (obj.color as DayColor) : 'yellow';
  if (!isDayColor(obj.color)) warnings.push('day.color normalized to yellow');

  let completedHabits = uniqueStrings(obj.completedHabits);
  if (knownHabitIds) {
    const filtered = completedHabits.filter((h) => knownHabitIds.has(h));
    if (filtered.length !== completedHabits.length) warnings.push('day.completedHabits contained unknown habit ids');
    completedHabits = filtered;
  }

  const createdAt = typeof obj.createdAt === 'string' ? obj.createdAt : undefined;
  const updatedAt = typeof obj.updatedAt === 'string' ? obj.updatedAt : undefined;

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      date: date as string,
      text,
      diaryEntry,
      color,
      completedHabits: completedHabits.length ? completedHabits : undefined,
      createdAt,
      updatedAt,
    },
    warnings,
  };
}

export function validateAppData(raw: unknown): ValidationResult<AppData> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const obj = (raw ?? {}) as Record<string, unknown>;

  const version = (obj.version as number) ?? 1;
  if (version !== 1) warnings.push(`unexpected version ${String(version)}; parsed as v1`);

  const rawHabits = Array.isArray(obj.habits) ? obj.habits : [];
  const habits: Habit[] = [];
  const habitErrors: string[] = [];
  for (let i = 0; i < rawHabits.length; i++) {
    const res = validateHabit(rawHabits[i]);
    if (res.ok) habits.push(res.data);
    else habitErrors.push(...res.errors.map((e) => `habits[${i}]: ${e}`));
  }
  if (habitErrors.length) errors.push(...habitErrors);

  const idSet = new Set<string>();
  for (const h of habits) {
    if (idSet.has(h.id)) warnings.push(`duplicate habit.id ${h.id}; keeping first`);
    idSet.add(h.id);
  }
  const knownHabitIds = new Set(idSet);

  const rawDays = Array.isArray(obj.days) ? obj.days : [];
  const days: DayEntry[] = [];
  const dayErrors: string[] = [];
  const byDate = new Map<string, DayEntry>();
  for (let i = 0; i < rawDays.length; i++) {
    const res = validateDay(rawDays[i], knownHabitIds);
    if (!res.ok) {
      dayErrors.push(...res.errors.map((e) => `days[${i}]: ${e}`));
      continue;
    }
    const d = res.data;
    if (byDate.has(d.date)) {
      warnings.push(`duplicate day ${d.date}; keeping last occurrence`);
    }
    byDate.set(d.date, d);
  }
  if (dayErrors.length) errors.push(...dayErrors);

  // Keep days sorted ascending
  for (const d of Array.from(byDate.values()).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))) {
    days.push(d);
  }

  if (errors.length) return { ok: false, errors };
  const data: AppDataV1 = { version: 1, days, habits };
  return { ok: true, data, warnings };
}

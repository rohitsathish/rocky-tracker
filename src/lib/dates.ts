import { DateKey } from './types';
import { toDateKey } from './validate';

export const MIN_YEAR = 2025;
export const MIN_DATE_KEY: DateKey = '2025-01-01';

export function currentYear(): number {
  return new Date().getFullYear();
}

export function todayKey(): DateKey {
  return toDateKey(new Date());
}

export function clampToMinYear(year: number): number {
  return year < MIN_YEAR ? MIN_YEAR : year;
}

export function clampYear(year: number): number {
  const min = MIN_YEAR;
  const max = currentYear();
  return Math.min(Math.max(year, min), max);
}

export function fromDateKey(key: DateKey): Date {
  // Treat as local date
  const [y, m, d] = key.split('-').map((n) => parseInt(n, 10));
  return new Date(y, m - 1, d);
}

export function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleString(undefined, {
    month: 'short',
    year: 'numeric',
  });
}

export function getMonthLength(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getMonthDays(year: number, month: number): DateKey[] {
  const len = getMonthLength(year, month);
  const arr: DateKey[] = [];
  for (let d = 1; d <= len; d++) {
    arr.push(toDateKey(new Date(year, month - 1, d)));
  }
  return arr;
}

export function getYearMonths(year: number): { month: number; label: string; days: DateKey[] }[] {
  const out: { month: number; label: string; days: DateKey[] }[] = [];
  for (let m = 1; m <= 12; m++) {
    out.push({ month: m, label: monthLabel(year, m), days: getMonthDays(year, m) });
  }
  return out;
}

export function getYearMonthsClamped(
  year: number,
  minKey: DateKey,
  maxKey: DateKey
): { month: number; label: string; days: DateKey[] }[] {
  const months = getYearMonths(year);
  const filtered = months
    .map((m) => ({ ...m, days: m.days.filter((d) => d >= minKey && d <= maxKey) }))
    .filter((m) => m.days.length > 0);
  return filtered;
}

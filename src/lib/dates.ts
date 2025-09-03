import { DateKey } from './types';
import { toDateKey } from './validate';

export const MIN_YEAR = 2025;
export const MIN_DATE_KEY: DateKey = '2025-08-01';

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
    month: 'long',
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

export function getYearProgress(year: number): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // If it's not the current year, return 100% or 0%
  if (year < currentYear) return 100;
  if (year > currentYear) return 0;
  
  // Calculate progress for current year
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);
  const totalYearMs = endOfYear.getTime() - startOfYear.getTime();
  const elapsedMs = now.getTime() - startOfYear.getTime();
  
  return Math.min(100, Math.max(0, (elapsedMs / totalYearMs) * 100));
}

export function getWeekNumber(date: Date): number {
  // ISO week date calculation
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  const startDay = startOfYear.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Adjust for ISO week (Monday start)
  const adjustedDayOfYear = dayOfYear + (startDay === 0 ? 6 : startDay - 1);
  return Math.ceil(adjustedDayOfYear / 7);
}

export function getTotalWeeksInYear(year: number): number {
  // Check if last day of year is in week 53
  const lastDay = new Date(year, 11, 31);
  const weekNum = getWeekNumber(lastDay);
  return weekNum === 1 ? 52 : weekNum; // If week 1 of next year, then 52 weeks
}

export function isDateMissingEntry(dateKey: DateKey, data: any): boolean {
  const today = todayKey();
  const targetDate = fromDateKey(dateKey);
  const minDate = fromDateKey(MIN_DATE_KEY); // Aug 1, 2025
  
  // Only check dates from MIN_DATE_KEY to yesterday (not including today)
  if (targetDate < minDate || dateKey >= today) {
    return false;
  }
  
  // Check if entry exists and has text
  const entry = data.days?.find((d: any) => d.date === dateKey);
  return !entry || !entry.text || entry.text.trim().length === 0;
}

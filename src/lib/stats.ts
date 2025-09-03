import { AppData, DayEntry } from './types';
import { fromDateKey, MIN_DATE_KEY, todayKey, getYearMonthsClamped, isDateMissingEntry } from './dates';

export type ColorCounts = { red: number; yellow: number; green: number };

export function countColors(days: DayEntry[]): ColorCounts {
  const out: ColorCounts = { red: 0, yellow: 0, green: 0 };
  for (const d of days) {
    if (d.color === 'red') out.red++;
    else if (d.color === 'yellow') out.yellow++;
    else if (d.color === 'green') out.green++;
  }
  return out;
}

export function countColorsWithMissing(data: AppData, year: number): ColorCounts {
  const out: ColorCounts = { red: 0, yellow: 0, green: 0 };
  
  // Get all days in the year within our date range
  const months = getYearMonthsClamped(year, MIN_DATE_KEY, todayKey());
  const allDays = months.flatMap(m => m.days);
  
  for (const dateKey of allDays) {
    const entry = data.days.find(d => d.date === dateKey);
    
    if (isDateMissingEntry(dateKey, data)) {
      out.red++;
    } else if (entry) {
      if (entry.color === 'red') out.red++;
      else if (entry.color === 'yellow') out.yellow++;
      else if (entry.color === 'green') out.green++;
      // Neutral days are not counted in the mood statistics
    }
    // If entry exists but is today or future, don't count it
  }
  
  return out;
}

export function yearEntries(data: AppData, year: number): DayEntry[] {
  return data.days.filter((d) => fromDateKey(d.date).getFullYear() === year);
}


import { AppData, DayEntry } from './types';
import { fromDateKey } from './dates';

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

export function yearEntries(data: AppData, year: number): DayEntry[] {
  return data.days.filter((d) => fromDateKey(d.date).getFullYear() === year);
}


// Sample data for development and quick manual testing.
// Not intended to be persisted as real user data.

import { AppData, DayEntry, Goal } from './types';
import { toDateKey } from './validate';

export function makeSampleAppData(now = new Date()): AppData {
  const today = new Date(now);
  const dayN = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return toDateKey(d);
  };

  const goals: Goal[] = [
    {
      id: 'g_hydrate',
      title: 'Hydrate (8 cups)',
      startDate: dayN(14),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'g_code',
      title: 'Code 30 minutes',
      startDate: dayN(6),
      createdAt: new Date().toISOString(),
    },
  ];

  const days: DayEntry[] = [
    { date: dayN(6), text: 'Started tracking. Felt good.', color: 'green', completedGoals: ['g_hydrate'] },
    { date: dayN(5), text: 'Long day, low energy.', color: 'yellow', completedGoals: ['g_hydrate'] },
    { date: dayN(4), text: 'Great focus, shipped a feature!', color: 'green', completedGoals: ['g_hydrate', 'g_code'] },
    { date: dayN(3), text: 'Stalled a bit; need rest.', color: 'yellow', completedGoals: [] },
    { date: dayN(2), text: 'Tough day.', color: 'red', completedGoals: ['g_hydrate'] },
    { date: dayN(1), text: 'Solid progress on goals.', color: 'green', completedGoals: ['g_hydrate', 'g_code'] },
    { date: dayN(0), text: 'Steady and calm.', color: 'green', completedGoals: ['g_hydrate'] },
  ];

  return { version: 1, days, goals };
}

export const SAMPLE_APP_DATA: AppData = makeSampleAppData();


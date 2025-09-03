import React, { useEffect, useRef, useState } from 'react';
import { Container, Text } from '@mantine/core';
import AppHeader from './components/AppHeader';
import SaveIndicator from './components/SaveIndicator';
import { notifications } from '@mantine/notifications';
import { loadData, saveData, hasFileHandle } from './lib/storage';
import DiaryView from './views/DiaryView';
import HabitView from './views/HabitView';
import { AppData, DayEntry, createEmptyAppData } from './lib/types';
import { validateAppData } from './lib/validate';
import { currentYear, clampToMinYear, MIN_YEAR } from './lib/dates';

type DemoData = { version: number; message: string; updatedAt: string };

const useDebounced = <T,>(value: T, delay = 500) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

export default function App() {
  const [status, setStatus] = useState<string>('Ready');
  const [tab, setTab] = useState<'diary' | 'habits'>('diary');
  const [data, setData] = useState<AppData>(() => createEmptyAppData());
  const [year, setYear] = useState<number>(() => clampToMinYear(currentYear()));
  const debouncedData = useDebounced(data, 500);
  const saving = useRef(false);

  // Debug helper
  const log = (...a: unknown[]) => console.debug('[app]', ...a);

  // Reflect immediate intent to save when data changes
  useEffect(() => {
    if (!saving.current) {
      setStatus('Saving…');
      log('data changed → Saving…', { days: data.days.length, habits: data.habits.length });
    }
  }, [data]);

  // Data persistence handled by Tauri (or localStorage fallback).

  useEffect(() => {
    // Try to load existing data from storage.
    (async () => {
      if (await hasFileHandle()) {
        log('loading data…');
        const raw = await loadData<unknown>();
        const validated = raw ? validateAppData(raw) : undefined;
        if (validated?.ok) { 
          setData(validated.data); 
          const meta = { days: validated.data.days.length, habits: validated.data.habits.length };
          log('data loaded', meta);
        }
        else {
          // Backward-compat: support old demo shape with a message only, otherwise init empty
          const demo = raw as DemoData | undefined;
          setData(createEmptyAppData());
          if (demo?.message) {
            notifications.show({
              title: 'Migrated to new format',
              message: 'Existing demo note kept only in memory this session',
              color: 'blue',
              autoClose: 2500,
            });
          }
        }
      }
    })();
  }, []);

  useEffect(() => {
    // Autosave when content changes (debounced payload).
    // Skip autosave for initial empty data or if we're currently loading/saving
    (async () => {
      if (saving.current) return;
      
      // Don't save empty initial state
      if (debouncedData.days.length === 0 && debouncedData.habits.length === 0) {
        log('autosave skipped: empty data');
        return;
      }
      
      saving.current = true;
      try {
        log('autosave start', { bytes: JSON.stringify(debouncedData).length });
        await saveData(debouncedData);
        setStatus('Saved');
        log('autosave success');
      } catch (e) {
        setStatus('Error saving');
        console.error('[app] autosave failed', e);
        notifications.show({
          title: 'Save failed ❌',
          message: 'Could not save your changes',
          color: 'red',
          autoClose: 4000,
        });
      } finally {
        saving.current = false;
      }
    })();
  }, [debouncedData]);

  useEffect(() => {
    const onBeforeUnload = (_e: BeforeUnloadEvent) => {
      // Best-effort final save via local API.
      log('beforeunload: attempting final save');
      if (!saving.current) {
        saveData(data)
          .then(() => log('final save: ok'))
          .catch((e) => { console.error('[app] final save failed', e); });
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [data]);

  return (
    <Container fluid p={0} h="100vh" style={{ display: 'flex', flexDirection: 'column' }}>
      <AppHeader
        tab={tab}
        setTab={(t) => setTab(t)}
        right={<SaveIndicator status={status} />}
      />
      <Container
        fluid
        p={0}
        style={{
          flex: 1,
          minHeight: 0,
          backgroundColor: 'var(--bg-canvas)',
          color: 'var(--text-primary)',
          overflow: 'hidden' // Prevent this container from creating scrollbars
        }}
      >
        {tab === 'diary' ? (
          <DiaryView
            year={year}
            setYear={setYear}
            data={data}
            setData={setData}
            minYear={MIN_YEAR}
          />
        ) : (
          <HabitView
            year={year}
            setYear={setYear}
            data={data}
            setData={setData}
            minYear={MIN_YEAR}
          />
        )}
        {tab !== 'diary' && (
          <Text size="xs" c="dimmed" lh={1.5} mt="md" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
            Your diary entries are automatically saved to your device and stay private.
          </Text>
        )}
      </Container>
    </Container>
  );
}

/* legacy: StatusChip kept for reference, replaced by SaveIndicator */
function StatusChip({ status }: { status: string }) {
  const color = status === 'Saved' ? '#30D158' : status === 'Error saving' ? '#FF453A' : '#0A84FF';
  const label = status.toUpperCase();
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '4px 10px',
      borderRadius: 999,
      border: '1px solid var(--border-primary)',
      background: 'transparent',
    }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} />
      <Text size="xs" c="dimmed">{label}</Text>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { Container, Title, Text } from '@mantine/core';
import AppHeader from './components/AppHeader';
import SaveIndicator from './components/SaveIndicator';
import { notifications } from '@mantine/notifications';
import { loadData, saveData, hasFileHandle } from './lib/storage';
import DiaryView from './views/DiaryView';
import GoalView from './views/GoalView';
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

type Props = {
  colorScheme: 'light' | 'dark';
  onToggleColorScheme: () => void;
};

export default function App({ colorScheme, onToggleColorScheme }: Props) {
  const [status, setStatus] = useState<string>('Ready');
  const [tab, setTab] = useState<'diary' | 'goals'>('diary');
  const [data, setData] = useState<AppData>(() => createEmptyAppData());
  const [year, setYear] = useState<number>(() => clampToMinYear(currentYear()));
  const debouncedData = useDebounced(data, 500);
  const saving = useRef(false);

  // Data persistence handled by Tauri (or localStorage fallback).

  useEffect(() => {
    // Try to load existing data from storage.
    (async () => {
      if (await hasFileHandle()) {
        const raw = await loadData<unknown>();
        const validated = raw ? validateAppData(raw) : undefined;
        if (validated?.ok) setData(validated.data);
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
    // Autosave when content changes.
    (async () => {
      if (saving.current) return;
      saving.current = true;
      try {
        await saveData(debouncedData);
        setStatus('Saved');
        
        // Show success notification (only occasionally to avoid spam)
        if (Math.random() < 0.1) { // 10% chance to show notification
          notifications.show({
            title: 'Auto-saved ✅',
            message: 'Your changes have been saved',
            color: 'green',
            autoClose: 2000,
          });
        }
      } catch (e) {
        setStatus('Error saving');
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
      if (!saving.current) {
        saveData(data).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [data]);

  // no-op

  return (
    <Container fluid p={0} h="100vh" style={{ display: 'flex', flexDirection: 'column' }}>
      <AppHeader
        tab={tab}
        setTab={(t) => setTab(t)}
        colorScheme={colorScheme}
        onToggleColorScheme={onToggleColorScheme}
        right={<SaveIndicator status={status} />}
      />
      <Container
        fluid
        p={0}
        style={{
          flex: 1,
          minHeight: 0,
          backgroundColor: 'var(--bg-canvas)',
          color: 'var(--text-primary)'
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
          <GoalView
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

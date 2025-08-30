import React from 'react';
import { SegmentedControl, ActionIcon, Tooltip } from '@mantine/core';

export type TabKey = 'diary' | 'goals';

type Props = {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  colorScheme: 'light' | 'dark';
  onToggleColorScheme: () => void;
  right?: React.ReactNode;
};

export default function AppHeader({ tab, setTab, colorScheme, onToggleColorScheme, right }: Props) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand">
          <div className="brand-dot" />
          <h3 className="brand-title">Rocky Tracker</h3>
        </div>
      </div>
      <div className="header-center">
        <SegmentedControl
          value={tab}
          onChange={(v) => setTab(v === 'diary' ? 'diary' : 'goals')}
          size="xs"
          radius="md"
          data={[
            { label: 'Diary', value: 'diary' },
            { label: 'Goals', value: 'goals' },
          ]}
          transitionTimingFunction="cubic-bezier(0.34, 1.56, 0.64, 1)"
          transitionDuration={140}
          styles={{
            root: {
              backgroundColor: 'var(--bg-elevated)',
              padding: '2px',
              border: '1px solid var(--border-subtle)'
            },
            control: {
              border: 'none',
              fontWeight: '500'
            },
            indicator: {
              boxShadow: 'var(--shadow-xs)',
              border: '1px solid var(--border-default)'
            }
          }}
        />
      </div>
      <div className="header-right">
        <Tooltip label={`Theme: ${colorScheme}`}>
          <ActionIcon 
            variant="subtle" 
            radius="xl" 
            aria-label="Toggle theme" 
            onClick={onToggleColorScheme}
            size="lg"
          >
            {colorScheme === 'dark' ? (
              <MoonIcon />
            ) : (
              <SunIcon />
            )}
          </ActionIcon>
        </Tooltip>
        {right}
      </div>
    </header>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
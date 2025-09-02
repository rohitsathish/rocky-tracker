import React from 'react';

export type TabKey = 'diary' | 'goals';

type Props = {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  right?: React.ReactNode;
};

export default function AppHeader({ tab, setTab, right }: Props) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand">
          <div className="brand-dot" />
          <h3 className="brand-title">Rocky Tracker</h3>
        </div>
      </div>
      <div className="header-center">
        <div className="tab-switch" role="tablist" aria-label="Primary tabs">
          <button
            role="tab"
            aria-selected={tab === 'diary'}
            className={`tab-btn ${tab === 'diary' ? 'active' : ''}`}
            onClick={() => setTab('diary')}
          >
            Diary
          </button>
          <button
            role="tab"
            aria-selected={tab === 'goals'}
            className={`tab-btn ${tab === 'goals' ? 'active' : ''}`}
            onClick={() => setTab('goals')}
          >
            Goals
          </button>
        </div>
      </div>
      <div className="header-right">
        {right}
      </div>
    </header>
  );
}

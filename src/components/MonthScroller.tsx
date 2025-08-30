import React from 'react';

export default function MonthScroller({ children }: { children: React.ReactNode }) {
  return (
    <div className="month-scroller">
      {children}
      <style>{`
        .month-scroller { overflow-x: auto; padding-bottom: 8px; }
        .month-scroller > .month { position: relative; min-width: 280px; max-width: 360px; }
        .month-header { position: sticky; top: 0; z-index: 2; padding: 6px 4px; backdrop-filter: saturate(180%) blur(8px); background: color-mix(in oklab, var(--surface) 80%, transparent); border-bottom: 1px solid var(--hairline); }
        .month-grid { display: flex; flex-direction: column; }
        .months { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(280px, 360px); gap: 16px; align-items: start; }
      `}</style>
    </div>
  );
}

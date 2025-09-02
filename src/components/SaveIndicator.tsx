import React from 'react';

type Props = { status: string };

export default function SaveIndicator({ status }: Props) {
  const kind = status === 'Saved' ? 'ok' : status === 'Error saving' ? 'error' : 'saving';
  return (
    <div className={`save-indicator ${kind}`} aria-live="polite" title={status}>
      <span className="dot" />
      <span className="label">{status}</span>
    </div>
  );
}

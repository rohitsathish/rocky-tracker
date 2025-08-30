# Rocky Tracker — Project Structure

This file maps the current project layout and the major planned modules, with concise descriptions to help you find code quickly.

## Current Layout

Root
- `AGENTS.md`: Orchestration guide for how to work on the project.
- `LLM/INSTRUCTIONS.md`: High‑level goals and open questions.
- `LLM/TRACKER.md`: Execution plan and progress tracker.
- `LLM/STRUCTURE.md`: This structure map.
- `server.js`: (Optional) local API used earlier for dev; Tauri handles file IO now.
- `data/rocky.json`: Legacy local dev data (git‑ignored). Tauri desktop stores in app‑data instead.
- `index.html`: Vite HTML entry.
- `vite.config.ts`: Vite + Tauri dev configuration.
- `tsconfig.json`: TypeScript config.
- `package.json`: Scripts and dependencies (React, Mantine, Tauri CLI).
- `scripts/`: Helper scripts.
- `public/`: Static assets (favicon, manifest, service worker).

`src-tauri/`
- Tauri v2 app (config + Rust commands `load_data`, `save_data`).
- Persists `rocky.json` under the OS app‑data directory.
- Automated backups under `backups/` (rotating; keep last 7).

`src/`
- `main.tsx`: App bootstrap and React root mount.
- `App.tsx`: App shell (tabs + theme toggle) and autosave demo wiring.
- `index.css`: Global styles.
  - Defines Apple‑inspired light/dark CSS variables used for surfaces, text, and borders.

`src/lib/`
- `storage.ts`: Environment‑aware persistence (Tauri invoke or `localStorage`).
- `idb.ts`: IndexedDB helper (present; not yet wired for core flows).
- `tauri.ts`: Minimal helpers to detect/invoke Tauri without extra deps.
- `types.ts`: Core data types (Schema v1: `DayEntry`, `Goal`, `AppData`).
- `validate.ts`: Runtime validation/normalization for `AppData` (no deps).
- `sampleData.ts`: Small dev dataset (`makeSampleAppData`, `SAMPLE_APP_DATA`).

## Planned Modules

`src/views/`
- `DiaryView.tsx`: Diary view (renamed from DayView) with horizontal months in columns.
- `GoalView.tsx`: Compact calendar-style months + goal UI.

`src/components/`
- Reusable UI: day cards, month scrollers, counters, dialogs, goal checklist, stats tiles.

`src/lib/`
- `types.ts`: App data types (Day, Goal, AppData).
- `dates.ts`: Date utilities (month/year calculations, ranges).
- `stats.ts`: Aggregations (color counts, streaks, goal points).
- `migrate.ts`: Optional data migrations/versioning.

## Notes
- Current target is Tauri desktop only. Store data in the OS user data directory via Tauri APIs (e.g., `%APPDATA%/Rocky Tracker/rocky.json` on Windows).
- Do not commit real data files. Import/export is out of scope for now.

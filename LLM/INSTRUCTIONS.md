# Rocky Tracker — High‑Level Goals & Aims

This app is a small Windows desktop (Tauri) React application that helps track personal goals and habits. The app must be self‑contained and persist data to a file so it is accessible later (JSON preferred). The two primary views are Day View and Goal View.

## Vision & Scope
- Simple, fast personal tracker focused on daily journaling and goal completion.
- Desktop (Tauri) only for now (no web/PWA target in scope).
- Fully offline capable; autosave on every change or before exit.

## Day View
- Free‑form text summary per day, plus a color tag: red (bad), yellow (okay), green (great).
- Maximize visible days via a horizontal months layout; use as much screen real estate as possible.
- Always show the complete text for each day (no truncation), with adaptive card height.
- Show yearly counts of red/yellow/green days in a compact tracker section.

## Goal View
- Calendar‑like month rows; each cell represents a day.
- Each day shows dots for per‑goal completion (green=done, red=missed), flexible to the number of goals.
- “All‑done” subtle dopamine effect when all tasks for a day are complete.
- Goals can be added/edited/deleted. A goal with `startDate` appears on all days starting that date; once `completedAt` is set, it stops appearing and moves to archive after the completion date.
- Show useful stats: streaks, per‑day “goal points” (1 point per active goal completed per day), and related summaries.

## Layout & UX Notes
- Horizontal Months approach in both views.
- Intelligent sizing: keep months as narrow as possible without overflow; expand only when needed.
- Keep it simple: no keyboard shortcuts; provide light/dark theming; autosave on change (or before unload if simpler).

### Dev Runtime (2025‑08‑30)
- Assume a dev instance is running with hot module reloading (HMR).
- Validate changes live; do not run production builds during sessions (`npm run build`).
- Service Worker: Disabled in dev to avoid HMR caching issues. In production only, `/sw.js` is registered. If you previously ran with a SW in dev, do a hard reload after this change.

### Design Philosophy (2025‑08‑29)
- Apple‑inspired: sleek, modern, calm; minimal chrome, hairline separators, gentle radii; translucent header.
- Typography: Inter (primary) with IBM Plex Sans as alternate; headings tighter leading, body 1.45 line‑height; inputs use Inter.
- Colors: Neutral light background (`#F2F2F7`) and dark (`#1C1C1E`) with soft surfaces; blue accent near `#0A84FF`.
- Background: No brown tones; neutral system grays only; remove legacy dark brown.
- Start Date: Universal minimum of 2025‑01‑01; navigation cannot go earlier.
- End Date: Do not show beyond today's date. Months and days are clamped so future months and future days are hidden.
- Day View: Show full note text per day (no truncation). Color control is in‑note and appears on hover/focus (not always visible). Months flex to accommodate varying note sizes.
  - Layout: Journal‑style rows (not boxed cards), sticky month headers, hairline row separators, in‑note color toolbar on hover/focus; accent strip shows only when content exists.

### Design Updates (2025‑08‑30)
- Dense‑soft UI system applied across app: 2px radii, 4px spacing grid, micro‑interactions ≤ 200ms, pastel tints.
- Diary View uses a full‑screen layout; months render as columns with configurable max width (`--month-max-width`).
- Diary days are tinted by their assigned color (soft backgrounds that preserve readability).
- Goal View shows one calendar year per page with month sections and goal dots per day; an “all done” effect appears when all active goals are completed for a day.

## Data & Persistence
- Prefer JSON for storage. On desktop, write to the OS user data directory (via Tauri). Suggested path on Windows: `%APPDATA%/Rocky Tracker/rocky.json` using Tauri’s app data dir API.
- Autosave on every change. Consider periodic snapshots for safety.
- Do not commit real data to the repo; export/backup features are out of scope for now.

### Backup Strategy (MVP)
- Automated backups: At most one backup per ~24 hours (mtime-based), stored under `backups/` in the app‑data directory. Keep the last 7 backups; delete older ones.
- Atomic-ish writes: Save via temp file then rename to reduce corruption risk.
- Load fallback: If `rocky.json` is unreadable/invalid, load the most recent backup; otherwise initialize empty data.

### Schema v1 (2025‑08‑29)
Top-level structure:

```
{
  "version": 1,
  "days": [DayEntry],
  "goals": [Goal]
}
```

DayEntry:

```
{
  "date": "YYYY-MM-DD",        // calendar day (local)
  "text": "free-form notes",    // full untruncated text
  "color": "red|yellow|green",  // day mood/summary
  "completedGoals": ["goalId"],  // optional; done goals on that day
  "createdAt": "ISO datetime?",
  "updatedAt": "ISO datetime?"
}
```

Goal:

```
{
  "id": "g_xxx",               // stable id
  "title": "Readable name",
  "startDate": "YYYY-MM-DD",    // active on/after this date
  "completedAt": "YYYY-MM-DD?",  // optional; archived after this date
  "description": "...",
  "createdAt": "ISO datetime?",
  "updatedAt": "ISO datetime?"
}
```

Notes:
- Missed goals per day are inferred: if a goal is active that day and not in `completedGoals`, it’s a miss.
- Arrays are preferred for storage simplicity; de-duplication and normalization are handled in runtime validation.

---

## Decisions (2025‑08‑29)
- Platform: Tauri desktop only for now; no web/PWA.
- Data path: Store JSON in the OS app‑data dir (Windows suggestion: `%APPDATA%/Rocky Tracker/rocky.json`). No encryption/password.
- Goals model: Binary per day (done/missed).
- Visual style: Fixed red/yellow/green day colors; only dark/light theming; typography similar to Inter or IBM Plex Sans.
- Import/Export: Not required right now; out of scope.

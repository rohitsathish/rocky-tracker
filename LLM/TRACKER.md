# Rocky Tracker - Implementation Steps

## Phase 0: Coordination Docs (Completed 2025-08-29)
- [x] Create/Update `LLM/INSTRUCTIONS.md` (goals + open questions)
- [x] Create `LLM/STRUCTURE.md` (current/planned file map)
- [x] Update `LLM/TRACKER.md` (plan + phase 0 log)
- [x] Rewrite root `AGENTS.md` (orchestration guide)

Notes: Initial repo scan completed; docs scaffolded to guide subsequent phases. Runtime assumption: a dev server is running with hot reloading; do not run production builds (npm run build) during sessions.

## Phase 1: Data Foundation & Core Setup
**Goal:** Establish data structure, file storage, and basic app shell

### Step 1.1: Data Schema Design
- [x] Create TypeScript interfaces for Day, Goal, AppData
- [x] Design JSON structure for file storage
- [x] Implement data validation utilities
- [x] Create sample data for testing

**Deliverable:** Data types and sample JSON structure  
**User Test:** Review data schema, confirm it matches requirements

Notes (2025-08-29):
- Added `src/lib/types.ts` with `DayEntry`, `Goal`, and `AppData` (Schema v1) and helper `createEmptyAppData()`.
- Added `src/lib/validate.ts` with `validateAppData`, `validateDay`, `validateGoal`, and helpers (`isDateKey`, `isDayColor`, `toDateKey`).
- Added `src/lib/sampleData.ts` with `makeSampleAppData()` and `SAMPLE_APP_DATA` (7 days, 2 goals) for dev usage.
- JSON structure: `{ version: 1, days: DayEntry[], goals: Goal[] }`. `DayEntry.completedGoals` holds goal IDs completed on that day; missed can be inferred from active goals not listed.
- No runtime wiring changes yet; Tauri defaults remain `{version:1,days:[],goals:[]}` which conforms to v1.

### Step 1.2: File Storage System  
- [x] JSON read/write via Tauri to app‑data (`rocky.json`)
- [x] Automated backups: at most once per ~24h; keep last 7; rotate
- [x] Write safety: temp file then rename (atomic‑ish)
- [x] Load fallback to latest backup if main is invalid
- [ ] Add migration/versioning scaffolding (future-proof hook)

**Deliverable:** Working file persistence system  
**User Test:** Data saves automatically, persists between app restarts

### Step 1.3: Basic App Shell
Plan (detailed):
- [x] Create header tabs (Day / Goals)
- [x] Theme toggle (light/dark) persisted
- [x] Route or state switcher between views
- [x] Responsive container with horizontal months scaffold

**Deliverable:** App shell with navigation and theming  
**User Test:** Can switch between views, toggle theme, responsive design works

Notes (2025-08-29):
- Added `src/views/DayView.tsx` and `src/views/GoalView.tsx` as scaffolds.
- Updated `src/main.tsx` to persist and control Mantine color scheme.
- Updated `src/App.tsx` to include header, tabs, and theme toggle.
- Kept demo autosave text area under Day tab for now; copy updated to reflect app‑data/localStorage.

---

Phase 1 — Execution Plan & Sanity Checks (2025‑08‑29)
- 1.2.a Implement periodic backup + rotation (keep 7)
- 1.2.b Implement temp+rename write
- 1.2.c Implement load fallback to latest backup
- 1.2.d Frontend uses existing debounce autosave (no change)
- 1.2.e Add migration hook (stub)
- 1.3 App shell scaffolding (tabs, theme toggle, basic layout)

Sanity checks per step:
- Validate visually in the running dev app (HMR refreshes UI on save)
- Fix TypeScript overlay warnings/errors until clear
- Manual: Save several times; verify only one backup per day; check rotation beyond 7

## Phase 2: Day View Implementation
**Goal:** Complete Diary View (formerly Day View) with horizontal months, day cards, and stats

### Step 2.1: Month Layout & Navigation
- [x] Create horizontal months layout with uniform width
- [x] Implement date utilities (month/year calculations)
- [x] Add year selector (prev/next controls)
- [x] Handle month overflow with horizontal scrolling

**Deliverable:** Month grid layout with navigation  
**User Test:** Can view 6+ months, scroll horizontally, jump to specific years

### Step 2.2: Day Cards Implementation
- [ ] Create day cards with variable height based on text length
- [ ] Add text input with auto-resize
- [ ] Implement color selection (red/yellow/green)
- [ ] Add day numbering and basic formatting

**Deliverable:** Interactive day cards  
**User Test:** Can write text, select colors, cards resize appropriately

Notes (2025-08-29):
- Added `src/lib/dates.ts` and `src/lib/stats.ts`.
- Updated `src/App.tsx` to load/validate `AppData` and persist on change (debounced).
- Redesigned Day View from first principles: journal rows (no heavy cards), sticky month headers, in-note color controls on hover/focus, hairline separators, wider columns.
- Applied design refresh (Apple-inspired): updated theme, typography, neutral backgrounds, and border variables. Minimum date set to 2025-01-01; year navigation disabled before 2025.
- Clamped UI to not show beyond today's date (months/days filtered); next-year navigation disabled when at current year.

### Step 2.3: Dense‑Soft UI + Diary Columns (Completed 2025-08-29)
- [x] Adopt dense-soft minimalism: 2px corners, 4px grid, <200ms motion
- [x] Tighten header and control spacing (~40%)
- [x] Add compat CSS tokens (`--hairline`, `--surface`, etc.)
- [x] Diary: Full-screen view; months in columns with `--month-max-width`
- [x] Diary: Color each day’s card with assigned color (pastel tints)

Notes (2025-08-29):
- Updated `src/index.css` with compact spacing, smaller radii, and columnar months styles (`.diary-months`).
- Fixed variable mismatches in `SaveIndicator` and mapped alias tokens for older components.
- `src/views/DiaryView.tsx`: switched to column layout, added color tint classes on cards, kept micro-interactions under 180ms.

Update (2025-08-30):
- Unified Mantine theme for Dense‑soft (3px corners, IBM Plex Sans typography).
- Implemented IBM Plex Sans with robust Google Fonts loading strategy for Tauri desktop compatibility.
- Enhanced Dense-Soft Design System: Apple-level refinement with tighter spacing grid, micro-interactions <200ms, pastel colours, high information density without cognitive load.
- Full-screen diary view with enhanced layout: columns with 320px minimum width, better spacing, backdrop-filtered navigation.
- Refined color system: softer pastels, micro-shadows, gradient accents on day cards.
- Enhanced Mantine component integration: custom styles for SegmentedControl, ActionIcon, Modal with dense-soft philosophy.
- Day cards with left-border color indicators, subtle gradients, and enhanced hover micro-interactions.
- Modal improvements: enhanced blur effects, smooth transitions with custom cubic-bezier timing.
- Typography system updated to IBM Plex Sans throughout with proper fallbacks.
- Professional micro-animations with gentle spring physics and reduced motion.

### Step 2.3: Stats Tracking
- [ ] Calculate red/yellow/green day counts for current year
- [ ] Display stats in prominent section
- [ ] Add visual indicators (progress bars/charts)
- [ ] Update stats in real-time as days are modified

**Deliverable:** Stats tracker with live updates  
**User Test:** Stats accurately reflect day colors, update immediately

## Phase 3: Goal Management System
**Goal:** Basic goal CRUD operations and data persistence

### Step 3.1: Goal Creation & Management
- [ ] Create goal creation form (name, start date, optional end date)
- [ ] Implement goal list view with active/archived states
- [ ] Add goal deletion functionality
- [ ] Handle goal date validation and conflicts

**Deliverable:** Goal management interface  
**User Test:** Can create, view, and delete goals with proper date handling

### Step 3.2: Daily Goal Assignment
- [ ] Auto-assign active goals to each day based on date ranges
- [ ] Create goal completion data structure per day
- [ ] Implement goal archiving when end date is reached
- [ ] Handle goal status calculations

**Deliverable:** Goals appear on appropriate days  
**User Test:** Goals show up on correct days, archive properly when ended

## Phase 4: Goal View Implementation  
**Goal:** Calendar view with goal completion tracking

### Step 4.1: Calendar Grid Layout
- [x] Create horizontal months layout (similar to Day View but compact)
- [x] Implement day cells with goal completion dots
- [x] Add visual completion percentage per day (cell styling)
- [x] Create "all goals completed" visual effect

**Deliverable:** Goal calendar grid with visual feedback  
**User Test:** Can see goals as dots, completion percentage is clear

### Step 4.2: Goal Interaction & Details
- [ ] Implement day cell click → goal detail popup
- [ ] Show goal checklist with completion status
- [ ] Add goal streak calculations
- [ ] Display individual goal statistics in popup

**Deliverable:** Interactive goal completion system  
**User Test:** Can click days, see goal details, check off goals

### Step 4.3: Goal Stats & Tracking
- [ ] Calculate goal points (1 point per goal per day completed)
- [ ] Implement streak tracking per goal
- [ ] Create goal statistics dashboard
- [ ] Add visual progress indicators

**Deliverable:** Comprehensive goal statistics  
**User Test:** Points and streaks calculate correctly, stats are meaningful

## Phase 5: Archive & Polish
**Goal:** Archive system and final refinements

### Step 5.1: Archive System
- [ ] Create archive view for completed goals
- [ ] Show archived goal statistics and historical data
- [ ] Implement archive filtering and search
- [ ] Add archive data export capabilities

**Deliverable:** Working archive system  
**User Test:** Can view archived goals and their historical performance

### Step 5.2: Performance & Polish
- [ ] Optimize rendering for large datasets (12+ months)
- [ ] Add loading states and smooth transitions
- [ ] Fine-tune responsive design for different screen sizes

**Deliverable:** Polished, performant app  
**User Test:** App handles large amounts of data smoothly

### Step 5.3: Final Integration & Testing
- [ ] End-to-end testing of all features
- [ ] Data integrity validation
- [ ] Error handling and edge cases
- [ ] Final UI/UX refinements

**Deliverable:** Production-ready app  
**User Test:** Complete workflow testing, data reliability verification

---

## Success Criteria
- ✅ Day View shows 6+ months with scrollable timeline
- ✅ Day cards have variable height, color coding, and text input
- ✅ Goal View shows completion dots and percentages
- ✅ Goals auto-assign to days based on date ranges
- ✅ Stats track day colors, goal points, and streaks
- ✅ All data persists automatically to JSON files under the OS app‑data directory (Tauri)
- ✅ Archive system for completed goals
- ✅ Theme switching and responsive design

**Estimated Timeline:** 6-8 development sessions (1-2 hours each)

Out of scope (current): Web/PWA build and import/export UI.
- Removed legacy `DayView.tsx`; `DiaryView.tsx` supersedes it.

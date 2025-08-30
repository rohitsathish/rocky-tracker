# AGENTS — Project Orchestration Guide

This document coordinates how to work on Rocky Tracker. It consolidates goals from `LLM/INSTRUCTIONS.md`, the execution plan from `LLM/TRACKER.md`, and the project map in `LLM/STRUCTURE.md`.

## Sources of Truth
- `LLM/INSTRUCTIONS.md`: High‑level goals, scope, and open questions. Always read first.
- `LLM/TRACKER.md`: Step‑by‑step plan and status. Update after each completed step/phase.
- `LLM/STRUCTURE.md`: Project layout (current + planned). Keep in sync when files move or are added.

## Session Workflow
1) Review objectives
   - Read `LLM/INSTRUCTIONS.md`. If open questions exist, confirm assumptions or request answers.
   - Skim `LLM/TRACKER.md` to identify the next planned step.
2) Sync structure
   - If adding/renaming significant files, update `LLM/STRUCTURE.md` accordingly.
3) Implement the targeted step
   - Make focused, minimal changes aligned with the plan and coding style.
   - Prefer functional React + hooks; TypeScript; 2‑space indent; semicolons; single quotes.
4) Validate
   - Verify changes live in the already running dev app (HMR). Do not run production builds during sessions. Add/adjust tests if applicable (Vitest + RTL when introduced).
5) Document progress
   - Mark the step as completed in `LLM/TRACKER.md`. Note any follow‑ups or decisions.
   - If new modules were added, update `LLM/STRUCTURE.md`.
6) Commit
   - Use Conventional Commits (e.g., `feat(day): horizontal months`, `fix(storage): autosave race`).

## Update Rules (Every Run)
- Always: Update `LLM/TRACKER.md` when a step or phase completes.
- When structure changes: Update `LLM/STRUCTURE.md` with new/renamed files and brief descriptions.
- When scope clarifies: Append answers to open questions in `LLM/INSTRUCTIONS.md` (with date), and remove resolved items.

## Project Constraints & Practices
- Platform: Tauri desktop only for now (no web/PWA scope).
- Data: Store JSON in the OS app‑data dir via Tauri. Never commit real data in repo.
- Views: Day View maximizes visible days and shows full text; Goal View shows goal dots, streaks, and an all‑done effect.
- Autosave: On every change (or before unload if simpler). Consider periodic snapshots.
- Style: Functional components only; TypeScript strict; clean, warning‑free code. Fixed red/yellow/green day colors; dark/light theming; typography akin to Inter or IBM Plex Sans.

## Build & Dev Commands
- `npm i`: Install deps
- `npm run dev`: Vite dev server (HMR). Assumption: a dev instance is already running; rely on hot reload for validation.
- `npm run build`: Production build (not used during sessions; avoid running).
- `npm run preview`: Serve production build (not used during sessions).
- `npm test`: Vitest + RTL (to be added)
- `npm run lint` / `npm run format`: ESLint/Prettier (to be wired)

## Quick Checklist (Per Task)
- Confirm requirement in `LLM/INSTRUCTIONS.md`.
- Locate target files in `LLM/STRUCTURE.md`.
- Implement minimal, focused changes.
- Validate locally; add tests if relevant.
- Update `LLM/TRACKER.md` and `LLM/STRUCTURE.md`.
- Commit with Conventional Commit message.

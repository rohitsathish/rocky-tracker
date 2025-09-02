# AGENTS — Project Orchestration Guide

## Project Constraints & Practices
- Platform: Tauri desktop only for now (no web/PWA scope).
- Data: Store JSON in the OS app‑data dir via Tauri. Never commit real data in repo.
- Views: Day View maximizes visible days and shows full text; Goal View shows goal dots, streaks, and an all‑done effect.
- Autosave: On every change (or before unload if simpler). Consider periodic snapshots.
- Style: Functional components only; TypeScript strict; clean, warning‑free code. Fixed red/yellow/green day colors; dark/light theming; typography akin to Inter or IBM Plex Sans.
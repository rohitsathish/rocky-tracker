@echo off
cd /d "%~dp0"
echo Starting Rocky Tracker in development mode...
echo.
echo Hot reload is enabled:
echo - React/TypeScript changes will reload automatically
echo - Rust changes will trigger rebuilds
echo.
echo To stop the app, close the window or press Ctrl+C here
echo.
npm run dev:app
pause
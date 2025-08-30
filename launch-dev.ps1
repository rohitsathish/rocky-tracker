# Rocky Tracker - One-Click Development Launch
# This script starts the Tauri development server with hot reload

Write-Host "🚀 Starting Rocky Tracker in development mode..." -ForegroundColor Green
Write-Host ""
Write-Host "📝 Hot reload is enabled:" -ForegroundColor Yellow
Write-Host "   • React/TypeScript changes will reload automatically"
Write-Host "   • Rust changes will trigger rebuilds"
Write-Host ""
Write-Host "⏹️  To stop: Close the app window or press Ctrl+C here" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location -Path $PSScriptRoot

try {
    # Start the development server
    npm run dev:app
}
catch {
    Write-Host "❌ Error starting development server:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure you have:" -ForegroundColor Yellow
    Write-Host "   • Node.js installed"
    Write-Host "   • Rust installed"
    Write-Host "   • Dependencies installed (npm install)"
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
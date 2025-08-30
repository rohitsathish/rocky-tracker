# Rocky Tracker - Build and Run Production Version
# This script builds the app and runs the production executable

Write-Host "🏗️  Building Rocky Tracker production version..." -ForegroundColor Green
Write-Host ""

# Change to script directory
Set-Location -Path $PSScriptRoot

try {
    # Build the production app
    Write-Host "📦 Building application..." -ForegroundColor Yellow
    npm run build:app

    Write-Host ""
    Write-Host "✅ Build completed! Looking for executable..." -ForegroundColor Green
    
    # Find and run the built executable
    $exePath = Get-ChildItem -Path "src-tauri/target/release" -Name "*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if ($exePath) {
        $fullPath = Join-Path -Path "src-tauri/target/release" -ChildPath $exePath
        Write-Host "🚀 Starting: $fullPath" -ForegroundColor Green
        Start-Process -FilePath $fullPath
    } else {
        Write-Host "❌ Could not find built executable in src-tauri/target/release/" -ForegroundColor Red
        Write-Host "Build may have failed. Check the output above for errors." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Error during build:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
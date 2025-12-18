@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1
title 👻 AntiGravity Ghost Agent - Master Control

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║      👻 ANTIGRAVITY GHOST AGENT - MASTER CONTROL v2.0            ║
echo ║═══════════════════════════════════════════════════════════════════║
echo ║                                                                   ║
echo ║  This starts the complete real-time system:                       ║
echo ║                                                                   ║
echo ║    1. Dashboard Server (port 9999)                               ║
echo ║    2. Python API (port 5000)                                      ║
echo ║    3. IDE Bridge (real-time sync)                                 ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

set "BASE_DIR=%~dp0"
cd /d "%BASE_DIR%"

:: Clean up existing processes
echo [Step 1/4] Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":9999" ^| findstr "LISTENING" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo   ✓ Ports cleared

:: Start Dashboard Server
echo.
echo [Step 2/4] Starting Dashboard Server...
start "Dashboard Server" /min cmd /c "cd /d "%BASE_DIR%" && node tools\dashboard_server.js"
timeout /t 3 /nobreak >nul
echo   ✓ Dashboard Server started on port 9999

:: Start Python API
echo.
echo [Step 3/4] Starting Python API...
where python >nul 2>&1
if %errorlevel% equ 0 (
    if exist "%BASE_DIR%core\ghost_api.py" (
        start "Ghost API" /min cmd /c "cd /d "%BASE_DIR%" && python core\ghost_api.py --port 5000"
        timeout /t 2 /nobreak >nul
        echo   ✓ Python API started on port 5000
    ) else (
        echo   ⚠ Python API skipped (ghost_api.py not found)
    )
) else (
    echo   ⚠ Python not installed, skipping API
)

:: Start IDE Bridge
echo.
echo [Step 4/4] Starting IDE Bridge (real-time sync)...
start "IDE Bridge" cmd /c "cd /d "%BASE_DIR%" && node tools\ide_bridge.js"
timeout /t 2 /nobreak >nul
echo   ✓ IDE Bridge started (syncing every 10 seconds)

:: Complete
echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                    ✅ SYSTEM ONLINE!                              ║
echo ╠═══════════════════════════════════════════════════════════════════╣
echo ║                                                                   ║
echo ║  🌐 Dashboard:     http://localhost:9999                          ║
echo ║  🎨 Genesis:       http://localhost:9999/genesis                  ║
echo ║  🐍 Python API:    http://localhost:5000/status                   ║
echo ║                                                                   ║
echo ║  ⚡ Real-Time Sync: ACTIVE                                        ║
echo ║     - Extensions update every 10 seconds                          ║
echo ║     - Stats sync automatically                                    ║
echo ║                                                                   ║
echo ║  Windows running in background:                                   ║
echo ║     - Dashboard Server                                            ║
echo ║     - Ghost API                                                   ║
echo ║     - IDE Bridge (shows live sync logs)                           ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

:: Open dashboard
echo Opening dashboard in browser...
timeout /t 1 /nobreak >nul
start "" "http://localhost:9999"

echo.
echo This window can be closed. Services run in background windows.
echo To stop: Close the "IDE Bridge", "Dashboard Server", and "Ghost API" windows.
echo.
pause

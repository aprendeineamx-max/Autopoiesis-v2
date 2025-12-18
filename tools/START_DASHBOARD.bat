@echo off
title Ghost Agent Dashboard Server
color 0A

echo.
echo  ╔═══════════════════════════════════════════════════════════════════╗
echo  ║           GHOST AGENT DASHBOARD - STARTUP SCRIPT                  ║
echo  ╚═══════════════════════════════════════════════════════════════════╝
echo.

:: Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js not found in PATH
    pause
    exit /b 1
)

cd /d "%~dp0"

echo [1/3] Killing any existing servers on port 9999 and 8888...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":9999"') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8888"') do taskkill /F /PID %%a >nul 2>nul

echo [2/3] Starting Dashboard Server on port 9999...
start "Ghost Dashboard Server" /MIN cmd /c "node dashboard_server.js"

timeout /t 2 /nobreak >nul

echo [3/3] Opening Dashboard in browser...
start http://localhost:9999/

echo.
echo  ══════════════════════════════════════════════════════════════════
echo  DASHBOARD SERVER IS RUNNING!
echo.
echo  Dashboard:  http://localhost:9999/
echo  Genesis:    http://localhost:9999/genesis
echo.
echo  API Endpoints:
echo    GET  /api/stats      - Get current stats
echo    GET  /api/heartbeat  - Get extension status
echo    GET  /api/allowlist  - Get allowlist count
echo.
echo  Press any key to stop the server...
echo  ══════════════════════════════════════════════════════════════════
echo.

pause >nul

echo Stopping servers...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":9999"') do taskkill /F /PID %%a >nul 2>nul

echo Done!

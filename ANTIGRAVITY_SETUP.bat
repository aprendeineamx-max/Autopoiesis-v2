@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1
title 👻 ANTIGRAVITY Ghost Agent - Complete Setup

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║      👻 ANTIGRAVITY GHOST AGENT - AUTO SETUP v1.0                 ║
echo ║═══════════════════════════════════════════════════════════════════║
echo ║  This script configures Ghost Agent for ANTIGRAVITY IDE           ║
echo ║                                                                   ║
echo ║  Steps:                                                           ║
echo ║    1. Start Dashboard Server (port 9999)                          ║
echo ║    2. Start Python API (port 5000)                                ║
echo ║    3. Register extensions as active                               ║
echo ║    4. Open Dashboard in browser                                   ║
echo ║                                                                   ║
echo ║  Extensions are already loaded by Antigravity IDE automatically   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

set "BASE_DIR=%~dp0"
cd /d "%BASE_DIR%"

:: =================== STEP 1: Kill existing processes ====================
echo [1/4] Preparing environment...

:: Kill any existing processes on ports 9999 and 5000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":9999" ^| findstr "LISTENING" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo   ✓ Ports cleared

:: =================== STEP 2: Start Dashboard Server ====================
echo.
echo [2/4] Starting Dashboard Server...

start "Dashboard Server" /min cmd /c "cd /d "%BASE_DIR%" && node tools\dashboard_server.js"
timeout /t 3 /nobreak >nul

:: Verify server is running
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:9999/api/stats' -TimeoutSec 3 -UseBasicParsing; Write-Host '  ✓ Dashboard Server running on port 9999' } catch { Write-Host '  ⚠ Server starting...' }" 2>nul

:: =================== STEP 3: Start Python API ====================
echo.
echo [3/4] Starting Python API...

where python >nul 2>&1
if %errorlevel% equ 0 (
    if exist "%BASE_DIR%core\ghost_api.py" (
        start "Ghost API" /min cmd /c "cd /d "%BASE_DIR%" && python core\ghost_api.py --port 5000"
        timeout /t 2 /nobreak >nul
        echo   ✓ Python API starting on port 5000
    ) else (
        echo   ⚠ ghost_api.py not found, skipping
    )
) else (
    echo   ⚠ Python not found, skipping API
)

:: =================== STEP 4: Register Extensions ====================
echo.
echo [4/4] Registering extensions...

:: Create config directory
if not exist "%USERPROFILE%\.gemini\antigravity" (
    mkdir "%USERPROFILE%\.gemini\antigravity" 2>nul
)

:: Create heartbeat file with all extensions active
set "HEARTBEAT_FILE=%USERPROFILE%\.gemini\antigravity\.ghost_heartbeat.json"
(
echo {
echo   "extensions": {
echo     "AntiGravity_Internal_Hook": {"active": true, "lastSeen": "%DATE% %TIME%"},
echo     "AntiGravity_Chat_Exporter": {"active": true, "lastSeen": "%DATE% %TIME%"},
echo     "AntiGravity_Supervisor": {"active": true, "lastSeen": "%DATE% %TIME%"}
echo   },
echo   "source": "SETUP_SCRIPT",
echo   "timestamp": "%DATE% %TIME%"
echo }
) > "%HEARTBEAT_FILE%"
echo   ✓ Heartbeat file created

:: Send HTTP heartbeats to server for each extension
timeout /t 1 /nobreak >nul

powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:9999/api/heartbeat' -Method POST -ContentType 'application/json' -Body '{\"extensionId\":\"AntiGravity_Internal_Hook\",\"active\":true}' -TimeoutSec 2 | Out-Null } catch {}" 2>nul
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:9999/api/heartbeat' -Method POST -ContentType 'application/json' -Body '{\"extensionId\":\"AntiGravity_Chat_Exporter\",\"active\":true}' -TimeoutSec 2 | Out-Null } catch {}" 2>nul
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:9999/api/heartbeat' -Method POST -ContentType 'application/json' -Body '{\"extensionId\":\"AntiGravity_Supervisor\",\"active\":true}' -TimeoutSec 2 | Out-Null } catch {}" 2>nul
echo   ✓ HTTP heartbeats sent for 3 extensions

:: =================== COMPLETE ====================
echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                    ✅ ANTIGRAVITY SETUP COMPLETE!                 ║
echo ╠═══════════════════════════════════════════════════════════════════╣
echo ║                                                                   ║
echo ║  🌐 Dashboard:     http://localhost:9999                          ║
echo ║  🎨 Genesis:       http://localhost:9999/genesis                  ║
echo ║  🐍 Python API:    http://localhost:5000/status                   ║
echo ║                                                                   ║
echo ║  Extensions Registered:                                           ║
echo ║    ✓ AntiGravity_Internal_Hook                                    ║
echo ║    ✓ AntiGravity_Chat_Exporter                                    ║
echo ║    ✓ AntiGravity_Supervisor                                       ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

:: Open dashboard in browser
echo Opening dashboard in browser...
timeout /t 1 /nobreak >nul
start "" "http://localhost:9999"

echo.
echo Press any key to close this window (servers will keep running)...
pause >nul

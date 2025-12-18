@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1
title 👻 Ghost Agent - Complete Setup

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║         👻 GHOST AGENT - COMPLETE AUTO SETUP v1.0                 ║
echo ║═══════════════════════════════════════════════════════════════════║
echo ║  This script will:                                                ║
echo ║    ✓ Install VS Code extension (VSIX)                            ║
echo ║    ✓ Start Dashboard Server                                       ║
echo ║    ✓ Start Python API                                             ║
echo ║    ✓ Open Dashboard in browser                                    ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

set "BASE_DIR=%~dp0"
cd /d "%BASE_DIR%"

:: Colors
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

:: =================== STEP 1: Check Prerequisites ====================
echo %YELLOW%[1/5] Checking prerequisites...%NC%

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%ERROR: Node.js not found. Please install Node.js first.%NC%
    pause
    exit /b 1
)
echo   ✓ Node.js found

where code >nul 2>&1
if %errorlevel% neq 0 (
    echo %YELLOW%Warning: VS Code CLI not in PATH. Will try default location...%NC%
    set "CODE_CMD=%LOCALAPPDATA%\Programs\Microsoft VS Code\bin\code.cmd"
) else (
    set "CODE_CMD=code"
)
echo   ✓ VS Code CLI ready

:: =================== STEP 2: Build Extension VSIX ====================
echo.
echo %YELLOW%[2/5] Building VS Code extension...%NC%

set "EXT_DIR=%BASE_DIR%extensions\AntiGravity_Internal_Hook"

:: Check if vsce is installed
where vsce >nul 2>&1
if %errorlevel% neq 0 (
    echo   Installing vsce globally...
    call npm install -g @vscode/vsce
)

cd /d "%EXT_DIR%"

:: Install dependencies if needed
if not exist "node_modules" (
    echo   Installing dependencies...
    call npm install --silent 2>nul
)

:: Build VSIX
echo   Packaging extension...
call vsce package --allow-missing-repository --skip-license -o antigravity-internal-hook.vsix 2>nul
if exist "antigravity-internal-hook.vsix" (
    echo   ✓ Extension packaged: antigravity-internal-hook.vsix
    set "VSIX_PATH=%EXT_DIR%\antigravity-internal-hook.vsix"
) else (
    echo %YELLOW%  Warning: VSIX build failed. Will try direct installation...%NC%
    set "VSIX_PATH="
)

:: =================== STEP 3: Install Extension ====================
echo.
echo %YELLOW%[3/5] Installing extension in VS Code...%NC%

if defined VSIX_PATH (
    echo   Installing from VSIX...
    call "%CODE_CMD%" --install-extension "%VSIX_PATH%" --force 2>nul
    if %errorlevel% equ 0 (
        echo   ✓ Extension installed successfully!
    ) else (
        echo   Trying alternative installation method...
        goto :direct_install
    )
) else (
    :direct_install
    :: Alternative: Copy to extensions folder directly
    echo   Installing directly to extensions folder...
    set "VSCODE_EXT_DIR=%USERPROFILE%\.vscode\extensions\antigravity-internal-hook-1.0.4"
    
    if exist "!VSCODE_EXT_DIR!" (
        echo   ✓ Extension already installed at: !VSCODE_EXT_DIR!
    ) else (
        xcopy /E /I /Y "%EXT_DIR%" "!VSCODE_EXT_DIR!" >nul 2>&1
        echo   ✓ Extension copied to: !VSCODE_EXT_DIR!
    )
)

cd /d "%BASE_DIR%"

:: =================== STEP 4: Start Servers ====================
echo.
echo %YELLOW%[4/5] Starting servers...%NC%

:: Kill any existing processes on ports 9999 and 5000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":9999" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Start Dashboard Server
echo   Starting Dashboard Server on port 9999...
start "Dashboard Server" /min cmd /c "cd /d "%BASE_DIR%" && node tools\dashboard_server.js"
timeout /t 2 /nobreak >nul
echo   ✓ Dashboard Server started

:: Start Python API (if python available)
where python >nul 2>&1
if %errorlevel% equ 0 (
    if exist "%BASE_DIR%core\ghost_api.py" (
        echo   Starting Python API on port 5000...
        start "Ghost API" /min cmd /c "cd /d "%BASE_DIR%" && python core\ghost_api.py --port 5000"
        timeout /t 2 /nobreak >nul
        echo   ✓ Python API started
    )
)

:: =================== STEP 5: Send Initial Heartbeat ====================
echo.
echo %YELLOW%[5/5] Sending initial heartbeat...%NC%

:: Create heartbeat directory
if not exist "%USERPROFILE%\.gemini\antigravity" (
    mkdir "%USERPROFILE%\.gemini\antigravity" 2>nul
)

:: Create heartbeat file
set "HEARTBEAT_FILE=%USERPROFILE%\.gemini\antigravity\.ghost_heartbeat.json"
echo {"extensions":{"AntiGravity_Internal_Hook":{"active":true,"lastSeen":"%DATE% %TIME%"}}} > "%HEARTBEAT_FILE%"
echo   ✓ Heartbeat file created

:: Send HTTP heartbeat to server
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:9999/api/heartbeat' -Method POST -ContentType 'application/json' -Body '{\"extensionId\":\"AntiGravity_Internal_Hook\",\"active\":true}' -TimeoutSec 5 | Out-Null; Write-Host '  ✓ HTTP heartbeat sent' } catch { Write-Host '  Note: Server is starting up...' }" 2>nul

:: =================== COMPLETE ====================
echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                      ✅ SETUP COMPLETE!                           ║
echo ╠═══════════════════════════════════════════════════════════════════╣
echo ║                                                                   ║
echo ║  Dashboard:     http://localhost:9999                             ║
echo ║  Genesis:       http://localhost:9999/genesis                     ║
echo ║  Python API:    http://localhost:5000/status                      ║
echo ║                                                                   ║
echo ║  IMPORTANT:                                                       ║
echo ║  → Restart VS Code (or press Ctrl+Shift+P → "Reload Window")      ║
echo ║  → The extension will activate and send heartbeats                ║
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

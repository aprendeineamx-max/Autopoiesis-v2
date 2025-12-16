@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: AntiGravity Supervisor - Portable Installer
:: Installs the Supervisor extension to AntiGravity IDE
:: ============================================================================

title AntiGravity Supervisor - Portable Installer
color 0B

echo.
echo ============================================================================
echo     ANTIGRAVITY SUPERVISOR - PORTABLE INSTALLER
echo ============================================================================
echo.
echo  This will install the Autonomous Supervisor Extension to AntiGravity IDE
echo.
echo ============================================================================
echo.

:: Detect AntiGravity installation
set "ANTIGRAVITY_PATH="

:: Check common locations
if exist "%LOCALAPPDATA%\Programs\AntiGravity\resources\app\extensions" (
    set "ANTIGRAVITY_PATH=%LOCALAPPDATA%\Programs\AntiGravity\resources\app\extensions"
)

if exist "C:\Program Files\AntiGravity\resources\app\extensions" (
    set "ANTIGRAVITY_PATH=C:\Program Files\AntiGravity\resources\app\extensions"
)

if exist "C:\Program Files (x86)\AntiGravity\resources\app\extensions" (
    set "ANTIGRAVITY_PATH=C:\Program Files (x86)\AntiGravity\resources\app\extensions"
)

if not defined ANTIGRAVITY_PATH (
    echo [ERROR] AntiGravity installation not found!
    echo.
    echo Please install AntiGravity IDE first, or specify the path manually.
    echo.
    pause
    exit /b 1
)

echo [OK] Found AntiGravity at: %ANTIGRAVITY_PATH%
echo.

:: Set source and destination
set "SOURCE_DIR=%~dp0.."
set "DEST_DIR=%ANTIGRAVITY_PATH%\antigravity-supervisor"

echo Source: %SOURCE_DIR%
echo Destination: %DEST_DIR%
echo.

:: Check if already installed
if exist "%DEST_DIR%" (
    echo [WARN] Extension already installed. Removing old version...
    rmdir /s /q "%DEST_DIR%" 2>nul
    timeout /t 1 /nobreak >nul
)

:: Copy extension
echo [INSTALL] Copying extension files...
xcopy "%SOURCE_DIR%" "%DEST_DIR%\" /E /I /Y /Q

if errorlevel 1 (
    echo [ERROR] Failed to copy files!
    pause
    exit /b 1
)

echo [OK] Extension files copied successfully
echo.

:: Install npm dependencies
echo [NPM] Installing dependencies...
cd /d "%DEST_DIR%"

if not exist "package.json" (
    echo [ERROR] package.json not found in destination!
    pause
    exit /b 1
)

call npm install --silent 2>nul

if errorlevel 1 (
    echo [WARN] npm install had issues, but may still work
) else (
    echo [OK] Dependencies installed successfully
)

echo.
echo ============================================================================
echo     INSTALLATION COMPLETE!
echo ============================================================================
echo.
echo  Extension installed to:
echo  %DEST_DIR%
echo.
echo  NEXT STEPS:
echo  1. CLOSE AntiGravity IDE completely (Alt+F4)
echo  2. REOPEN AntiGravity IDE
echo  3. Look for: '🤖 SUPERVISOR AI: AUTONOMOUS MODE READY'
echo  4. Press Ctrl+Shift+P and type 'supervisor' to see commands
echo  5. Run 'Start Autonomous Supervisor' to begin!
echo.
echo  AVAILABLE COMMANDS:
echo  - Start Autonomous Supervisor
echo  - Stop Autonomous Supervisor
echo  - Supervisor Status
echo  - Emergency Stop
echo  - Run Single Cycle (Test)
echo.
echo ============================================================================
echo.

pause

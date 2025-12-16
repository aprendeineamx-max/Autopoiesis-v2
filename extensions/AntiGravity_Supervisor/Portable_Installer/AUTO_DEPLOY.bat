@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: AUTO-DEPLOY SUPERVISOR - Complete Autonomous Installation
:: Closes IDE → Installs → Reopens IDE → Validates
:: ============================================================================

title AUTO-DEPLOY SUPERVISOR
color 0E

echo.
echo ============================================================================
echo     AUTO-DEPLOY SUPERVISOR - AUTONOMOUS INSTALLATION
echo ============================================================================
echo.
echo  This script will:
echo   1. Close AntiGravity IDE gracefully
echo   2. Install Supervisor Extension
echo   3. Reopen AntiGravity IDE
echo   4. Validate installation
echo.
echo ============================================================================
echo.

pause

:: ============================================================================
:: PHASE 1: CLOSE ANTIGRAVITY IDE
:: ============================================================================

echo [1/4] Closing AntiGravity IDE...
echo.

:: Check if running
tasklist /FI "IMAGENAME eq Antigravity.exe" 2>NUL | find /I /N "Antigravity.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo    AntiGravity is running. Closing gracefully...
    
    :: Try graceful close first (send close message)
    taskkill /IM "Antigravity.exe" /T >NUL 2>&1
    
    :: Wait for closure
    timeout /t 3 /nobreak >nul
    
    :: Force close if still running
    tasklist /FI "IMAGENAME eq Antigravity.exe" 2>NUL | find /I /N "Antigravity.exe">NUL
    if "%ERRORLEVEL%"=="0" (
        echo    Force closing...
        taskkill /F /IM "Antigravity.exe" /T >NUL 2>&1
        timeout /t 2 /nobreak >nul
    )
    
    echo    [OK] AntiGravity closed
) else (
    echo    [OK] AntiGravity not running
)

echo.

:: ============================================================================
:: PHASE 2: RUN INSTALLER
:: ============================================================================

echo [2/4] Installing Supervisor Extension...
echo.

set "INSTALLER_PATH=%~dp0INSTALL.bat"

if not exist "%INSTALLER_PATH%" (
    echo    [ERROR] INSTALL.bat not found!
    echo    Expected: %INSTALLER_PATH%
    pause
    exit /b 1
)

:: Run installer (should be in same directory)
call "%INSTALLER_PATH%"

if errorlevel 1 (
    echo.
    echo    [ERROR] Installation failed!
    echo.
    pause
    exit /b 1
)

echo.
echo    [OK] Installation complete
echo.

:: ============================================================================
:: PHASE 3: DETECT ANTIGRAVITY LOCATION
:: ============================================================================

echo [3/4] Detecting AntiGravity IDE...
echo.

set "ANTIGRAVITY_EXE="

:: Check standard locations
if exist "%LOCALAPPDATA%\Programs\Antigravity\Antigravity.exe" (
    set "ANTIGRAVITY_EXE=%LOCALAPPDATA%\Programs\Antigravity\Antigravity.exe"
    echo    [OK] Found: %LOCALAPPDATA%\Programs\Antigravity\
    goto :found_exe
)

if exist "C:\Program Files\Antigravity\Antigravity.exe" (
    set "ANTIGRAVITY_EXE=C:\Program Files\Antigravity\Antigravity.exe"
    echo    [OK] Found: C:\Program Files\Antigravity\
    goto :found_exe
)

if exist "C:\Program Files (x86)\Antigravity\Antigravity.exe" (
    set "ANTIGRAVITY_EXE=C:\Program Files (x86)\Antigravity\Antigravity.exe"
    echo    [OK] Found: C:\Program Files (x86)\Antigravity\
    goto :found_exe
)

echo    [ERROR] AntiGravity.exe not found!
echo.
pause
exit /b 1

:found_exe
echo.

:: ============================================================================
:: PHASE 4: REOPEN ANTIGRAVITY IDE
:: ============================================================================

echo [4/4] Reopening AntiGravity IDE...
echo.

:: Wait a moment
timeout /t 2 /nobreak >nul

:: Launch AntiGravity
start "" "%ANTIGRAVITY_EXE%"

if errorlevel 1 (
    echo    [ERROR] Failed to launch AntiGravity!
    pause
    exit /b 1
)

echo    [OK] AntiGravity IDE launched
echo.

:: Wait for IDE to start
echo    Waiting for IDE to initialize (10 seconds)...
timeout /t 10 /nobreak >nul

:: ============================================================================
:: VALIDATION
:: ============================================================================

echo.
echo ============================================================================
echo     VALIDATION
echo ============================================================================
echo.

:: Check if proof file was created
if exist "C:\AntiGravityExt\SUPERVISOR_ALIVE.txt" (
    echo [OK] SUPERVISOR_ALIVE.txt created
    type "C:\AntiGravityExt\SUPERVISOR_ALIVE.txt"
    echo.
) else (
    echo [WARN] SUPERVISOR_ALIVE.txt not found (extension may not have activated yet)
)

echo.
echo ============================================================================
echo     AUTO-DEPLOY COMPLETE!
echo ============================================================================
echo.
echo  NEXT STEPS:
echo   1. Check for popup: '🤖 SUPERVISOR AI: AUTONOMOUS MODE READY'
echo   2. Status bar should be GREEN
echo   3. Press F12 to see console activation message
echo   4. Press Ctrl+Shift+P and type 'supervisor'
echo   5. Run 'Start Autonomous Supervisor' to begin!
echo.
echo  VALIDATION:
echo   - Check: C:\AntiGravityExt\SUPERVISOR_ALIVE.txt (should exist)
echo   - Console (F12): Should show activation message
echo   - Commands: 5 supervisor commands available
echo.
echo ============================================================================
echo.

pause

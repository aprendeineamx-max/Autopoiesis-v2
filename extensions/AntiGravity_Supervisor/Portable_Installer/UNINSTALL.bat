@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: AntiGravity Supervisor - Portable Uninstaller
:: Removes the Supervisor extension from AntiGravity IDE
:: ============================================================================

title AntiGravity Supervisor - Uninstaller
color 0C

echo.
echo ============================================================================
echo     ANTIGRAVITY SUPERVISOR - UNINSTALLER
echo ============================================================================
echo.

:: Detect AntiGravity installation
set "ANTIGRAVITY_PATH="

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
    pause
    exit /b 1
)

set "DEST_DIR=%ANTIGRAVITY_PATH%\antigravity-supervisor"

if not exist "%DEST_DIR%" (
    echo [INFO] Extension not installed, nothing to remove.
    pause
    exit /b 0
)

echo  Extension location: %DEST_DIR%
echo.
echo  This will REMOVE the Supervisor extension.
echo.
set /p "CONFIRM=Are you sure? (Y/N): "

if /i not "%CONFIRM%"=="Y" (
    echo [CANCELLED] Uninstall cancelled.
    pause
    exit /b 0
)

echo.
echo [UNINSTALL] Removing extension...
rmdir /s /q "%DEST_DIR%"

if errorlevel 1 (
    echo [ERROR] Failed to remove extension!
    pause
    exit /b 1
)

echo [OK] Extension removed successfully
echo.
echo  You may need to reload AntiGravity IDE to complete removal.
echo.

pause

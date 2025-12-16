@echo off
setlocal enabledelayedexpansion
title AntiGravity Chat Exporter - Portable Installer
color 0B

:: ============================================
:: ANTIGRAVITY CHAT EXPORTER - PORTABLE INSTALLER
:: ============================================

cls
echo.
echo ========================================
echo  ANTIGRAVITY CHAT EXPORTER
echo  Portable Installer v1.0
echo ========================================
echo.

:: ============================================
:: PHASE 1: DETECT ANTIGRAVITY INSTALLATION
:: ============================================

echo [1/6] Detecting AntiGravity installation...
echo.

set "ANTIGRAVITY_PATH="
set "ANTIGRAVITY_EXE="

:: Method 1: Check standard installation path
if exist "%LOCALAPPDATA%\Programs\Antigravity\Antigravity.exe" (
    set "ANTIGRAVITY_PATH=%LOCALAPPDATA%\Programs\Antigravity"
    set "ANTIGRAVITY_EXE=%LOCALAPPDATA%\Programs\Antigravity\Antigravity.exe"
    echo    Found: %LOCALAPPDATA%\Programs\Antigravity\
    goto :detected
)

:: Method 2: Check Program Files
if exist "C:\Program Files\Antigravity\Antigravity.exe" (
    set "ANTIGRAVITY_PATH=C:\Program Files\Antigravity"
    set "ANTIGRAVITY_EXE=C:\Program Files\Antigravity\Antigravity.exe"
    echo    Found: C:\Program Files\Antigravity\
    goto :detected
)

:: Method 3: Ask user
echo    ERROR: AntiGravity not found in standard locations
echo.
echo    Please enter the path to your AntiGravity installation:
echo    (Example: C:\Program Files\Antigravity)
echo.
set /p "ANTIGRAVITY_PATH=    Path: "

if not exist "%ANTIGRAVITY_PATH%\Antigravity.exe" (
    echo.
    echo    ERROR: Antigravity.exe not found in specified path!
    echo    Installation cannot continue.
    echo.
    pause
    exit /b 1
)

set "ANTIGRAVITY_EXE=%ANTIGRAVITY_PATH%\Antigravity.exe"

:detected
echo    SUCCESS: AntiGravity found
echo.

:: ============================================
:: PHASE 2: PRE-INSTALLATION CHECKS
:: ============================================

echo [2/6] Pre-installation checks...
echo.

:: Check if AntiGravity is running
tasklist /FI "IMAGENAME eq Antigravity.exe" 2>NUL | find /I /N "Antigravity.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo    WARNING: AntiGravity is currently running
    echo    Please close AntiGravity before continuing.
    echo.
    set /p "CONTINUE=    Close and press ENTER to continue (or Ctrl+C to cancel): "
    
    :: Try to close gracefully
    taskkill /IM "Antigravity.exe" /F >NUL 2>&1
    timeout /t 2 >NUL
)

echo    AntiGravity is closed
echo.

:: Define paths
set "BUILTIN_EXT_PATH=%ANTIGRAVITY_PATH%\resources\app\extensions\antigravity-chat-exporter"
set "USER_EXT_PATH=%USERPROFILE%\.antigravity\extensions\antigravity-chat-exporter"
set "EXPORT_DIR=%USERPROFILE%\Documents\AntiGravity_Chat_Exports"
set "SCRIPTS_DIR=%EXPORT_DIR%\Scripts"

:: ============================================
:: PHASE 3: BACKUP EXISTING INSTALLATION
:: ============================================

echo [3/6] Backup existing installation...
echo.

set "BACKUP_CREATED=0"

if exist "%BUILTIN_EXT_PATH%" (
    set "BACKUP_DIR=%ANTIGRAVITY_PATH%\resources\app\extensions\.backup\antigravity-chat-exporter_%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
    set "BACKUP_DIR=!BACKUP_DIR: =0!"
    
    echo    Backing up existing extension...
    xcopy "%BUILTIN_EXT_PATH%" "!BACKUP_DIR!\" /E /I /Q /Y >NUL 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo    Backup created: !BACKUP_DIR!
        set "BACKUP_CREATED=1"
    )
)

if %BACKUP_CREATED%==0 (
    echo    No existing installation found (fresh install)
)

echo.

:: ============================================
:: PHASE 4: INSTALL EXTENSION FILES
:: ============================================

echo [4/6] Installing extension...
echo.

:: Get current directory (where installer is)
set "INSTALLER_DIR=%~dp0"

:: Verify source files exist
if not exist "%INSTALLER_DIR%extension\extension.js" (
    echo    ERROR: extension.js not found in installer package!
    echo    Expected: %INSTALLER_DIR%extension\extension.js
    echo.
    pause
    exit /b 1
)

if not exist "%INSTALLER_DIR%extension\package.json" (
    echo    ERROR: package.json not found in installer package!
    echo    Expected: %INSTALLER_DIR%extension\package.json
    echo.
    pause
    exit /b 1
)

:: Install to built-in extensions (primary)
echo    Installing to built-in extensions...
if not exist "%BUILTIN_EXT_PATH%" mkdir "%BUILTIN_EXT_PATH%"

copy /Y "%INSTALLER_DIR%extension\extension.js" "%BUILTIN_EXT_PATH%\extension.js" >NUL 2>&1
copy /Y "%INSTALLER_DIR%extension\package.json" "%BUILTIN_EXT_PATH%\package.json" >NUL 2>&1

if exist "%BUILTIN_EXT_PATH%\extension.js" (
    echo    SUCCESS: Built-in installation complete
) else (
    echo    WARNING: Built-in installation failed (may need admin rights)
)

echo.
echo    Installing to user extensions...
if not exist "%USER_EXT_PATH%" mkdir "%USER_EXT_PATH%"

copy /Y "%INSTALLER_DIR%extension\extension.js" "%USER_EXT_PATH%\extension.js" >NUL 2>&1
copy /Y "%INSTALLER_DIR%extension\package.json" "%USER_EXT_PATH%\package.json" >NUL 2>&1

if exist "%USER_EXT_PATH%\extension.js" (
    echo    SUCCESS: User installation complete
) else (
    echo    ERROR: User installation failed!
)

echo.

:: ============================================
:: PHASE 5: CREATE EXPORT DIRECTORIES & SCRIPTS
:: ============================================

echo [5/6] Setting up export directory...
echo.

if not exist "%EXPORT_DIR%" (
    mkdir "%EXPORT_DIR%"
    echo    Created: %EXPORT_DIR%
)

if not exist "%SCRIPTS_DIR%" (
    mkdir "%SCRIPTS_DIR%"
    echo    Created: %SCRIPTS_DIR%
)

:: Copy export scripts if available
if exist "%INSTALLER_DIR%scripts\" (
    echo.
    echo    Installing export scripts...
    xcopy "%INSTALLER_DIR%scripts\*.*" "%SCRIPTS_DIR%\" /Y /Q >NUL 2>&1
    echo    Scripts installed to: %SCRIPTS_DIR%
)

echo.

:: ============================================
:: PHASE 6: VERIFICATION & SUCCESS
:: ============================================

echo [6/6] Verifying installation...
echo.

set "INSTALL_OK=0"

if exist "%BUILTIN_EXT_PATH%\extension.js" (
    set /a INSTALL_OK+=1
    echo    [OK] Built-in: %BUILTIN_EXT_PATH%
)

if exist "%USER_EXT_PATH%\extension.js" (
    set /a INSTALL_OK+=1
    echo    [OK] User: %USER_EXT_PATH%
)

if %INSTALL_OK% GTR 0 (
    echo.
    echo ========================================
    echo  INSTALLATION SUCCESSFUL!
    echo ========================================
    echo.
    echo Extension installed to %INSTALL_OK% location(s)
    echo Export directory: %EXPORT_DIR%
    echo.
    echo NEXT STEPS:
    echo  1. Restart AntiGravity
    echo  2. Open Command Palette (Ctrl+Shift+P)
    echo  3. Type: "Configure Chat Exporter"
    echo.
    echo DEFAULT SETTINGS:
    echo  - Export directory: %EXPORT_DIR%
    echo  - Auto-export mode: Clipboard Monitor
    echo  - Monitor interval: 10 seconds
    echo.
    
    if exist "%SCRIPTS_DIR%\export_v3.ps1" (
        echo EXPORT SCRIPTS AVAILABLE:
        echo  - %SCRIPTS_DIR%\export_v3.ps1
        echo  - %SCRIPTS_DIR%\export_now.ps1
        echo.
    )
    
    if %BACKUP_CREATED%==1 (
        echo BACKUP: Previous version backed up
        echo.
    )
    
    echo Press any key to exit...
    pause >nul
    exit /b 0
) else (
    echo.
    echo ========================================
    echo  INSTALLATION FAILED!
    echo ========================================
    echo.
    echo No files were copied successfully.
    echo Possible causes:
    echo  - Insufficient permissions
    echo  - AntiGravity still running
    echo  - Disk full
    echo.
    echo TRY THIS:
    echo  1. Run as Administrator
    echo  2. Ensure AntiGravity is closed
    echo  3. Check disk space
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

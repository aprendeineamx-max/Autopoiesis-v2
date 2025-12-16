@echo off
title AntiGravity Hook Diagnostics
color 0E

echo.
echo ========================================
echo  ANTIGRAVITY HOOK - DIAGNOSTICS
echo ========================================
echo.
echo This script will verify if Internal Hook
echo is working correctly on this machine.
echo.
pause

cls
echo.
echo ========================================
echo  DIAGNOSTIC REPORT
echo ========================================
echo.

:: Test 1: Extension Activation
echo [TEST 1] Checking if extension activated...
if exist "C:\AntiGravityExt\HOOK_ALIVE.txt" (
    echo    [OK] Extension is active
    echo    Last activation: 
    type "C:\AntiGravityExt\HOOK_ALIVE.txt"
    echo.
) else (
    echo    [FAIL] Extension NOT activated
    echo    File not found: C:\AntiGravityExt\HOOK_ALIVE.txt
    echo.
    echo    SOLUTION: Extension didn't load. Check:
    echo      1. AntiGravity Developer Tools (Help ^> Toggle Developer Tools)
    echo      2. Console tab for errors
    echo      3. Extension is in correct folder
    echo.
)

:: Test 2: Command Discovery
echo [TEST 2] Checking available commands...
if exist "C:\AntiGravityExt\AntiGravity_Hook_Discovery.log" (
    echo    [OK] Command list exists
    findstr /C:"acceptAgentStep" "C:\AntiGravityExt\AntiGravity_Hook_Discovery.log" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo    [OK] acceptAgentStep command FOUND
        echo.
        echo    This means auto-click SHOULD work!
    ) else (
        echo    [FAIL] acceptAgentStep command NOT FOUND
        echo.
        echo    PROBLEM: Your AntiGravity version doesn't have this command
        echo    SOLUTION: Update AntiGravity or use different command
        echo.
        echo    Available agent commands:
        findstr /C:"agent" "C:\AntiGravityExt\AntiGravity_Hook_Discovery.log" | findstr /C:"accept"
    )
    echo.
) else (
    echo    [WAIT] Command discovery not run yet
    echo    Extension creates this file 5 seconds after activation
    echo    Wait a bit and restart AntiGravity
    echo.
)

:: Test 3: Status Files
echo [TEST 3] Checking status files...
if exist "C:\AntiGravityExt\GHOST_STATUS.txt" (
    echo    [OK] Status file exists
    echo    Current status: 
    type "C:\AntiGravityExt\GHOST_STATUS.txt"
    echo.
) else (
    echo    [INFO] Status file not created yet
    echo.
)

if exist "C:\AntiGravityExt\GHOST_CMD.txt" (
    echo    [OK] Command file exists
    echo    Current command: 
    type "C:\AntiGravityExt\GHOST_CMD.txt"
    echo.
) else (
    echo    [INFO] Command file not created yet
    echo.
)

:: Test 4: AntiGravity Process
echo [TEST 4] Checking AntiGravity process...
tasklist /FI "IMAGENAME eq Antigravity.exe" 2>NUL | find /I /N "Antigravity.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo    [OK] AntiGravity is running
    echo.
) else (
    echo    [FAIL] AntiGravity is NOT running
    echo    Extension only works when AntiGravity is running!
    echo.
)

:: Test 5: Extension Folder
echo [TEST 5] Checking extension installation...
set "FOUND=0"

if exist "%LOCALAPPDATA%\Programs\Antigravity\resources\app\extensions\antigravity-internal-hook\extension.js" (
    echo    [OK] Built-in location: FOUND
    set "FOUND=1"
)

if exist "%USERPROFILE%\.antigravity\extensions\antigravity-internal-hook\extension.js" (
    echo    [OK] User location: FOUND
    set "FOUND=1"
)

if "%FOUND%"=="0" (
    echo    [FAIL] Extension files NOT FOUND
    echo    Re-run INSTALL.bat!
    echo.
)

echo.
echo ========================================
echo  DIAGNOSTIC COMPLETE
echo ========================================
echo.
echo Next Steps:
echo  1. If all tests OK but clicks don't work:
echo     - Check AntiGravity version compatibility
echo     - Look for errors in Developer Tools Console
echo.
echo  2. If extension not activated:
echo     - Restart AntiGravity
echo     - Check extension folder permissions
echo.
echo  3. If acceptAgentStep not found:
echo     - Your AntiGravity version may be different
echo     - Check available commands in Discovery.log
echo.
pause

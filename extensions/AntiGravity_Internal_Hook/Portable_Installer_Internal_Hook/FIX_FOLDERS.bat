@echo off
title Fix AntiGravity Hook - Create Folders
color 0A

echo.
echo ========================================
echo  CREATING REQUIRED FOLDERS
echo ========================================
echo.

:: Create main folder
if not exist "C:\AntiGravityExt" (
    echo Creating C:\AntiGravityExt\...
    mkdir "C:\AntiGravityExt"
    echo [OK] Folder created
) else (
    echo [OK] C:\AntiGravityExt already exists
)

:: Test write permissions
echo.
echo Testing write permissions...
echo test > "C:\AntiGravityExt\test_write.txt" 2>NUL
if exist "C:\AntiGravityExt\test_write.txt" (
    echo [OK] Write permissions OK
    del "C:\AntiGravityExt\test_write.txt"
) else (
    echo [FAIL] Cannot write to C:\AntiGravityExt\
    echo.
    echo SOLUTION: Run this script as Administrator
    echo Right-click ^> Run as Administrator
    pause
    exit /b 1
)

echo.
echo ========================================
echo  SUCCESS!
echo ========================================
echo.
echo Folders created and writable.
echo.
echo NEXT STEP:
echo  1. Restart AntiGravity
echo  2. Wait 10 seconds
echo  3. Run DIAGNOSTICS.bat again
echo.
pause

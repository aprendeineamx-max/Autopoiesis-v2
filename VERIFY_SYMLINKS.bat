@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1
title ✅ Verification Report

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║              ✅ SYMLINK VERIFICATION REPORT                       ║
echo ╠═══════════════════════════════════════════════════════════════════╣
echo ║  Checking that everything is configured correctly...             ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

echo [Check 1] Symlinks Created
echo ==========================================
dir "%USERPROFILE%\.antigravity\extensions" | findstr /C:"SYMLINK"
if %errorLevel% equ 0 (
    echo   ✓ Symlinks detected
) else (
    echo   ✗ No symlinks found
)

echo.
echo [Check 2] Repository Source Files
echo ==========================================
set "REPO_TRACKER=C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions\AntiGravity_Internal_Hook\src\stats_tracker.js"
if exist "%REPO_TRACKER%" (
    echo   ✓ Repository stats_tracker.js exists
    findstr /C:"CHANGED" /C:"Send to dashboard IMMEDIATELY" "%REPO_TRACKER%" >nul
    if !errorLevel! equ 0 (
        echo   ✓ Repository has tracking fix
    ) else (
        echo   ✗ Repository missing tracking fix
    )
) else (
    echo   ✗ Repository file not found
)

echo.
echo [Check 3] Symlinked Files (What Antigravity Loads)
echo ==========================================
set "AG_TRACKER=%USERPROFILE%\.antigravity\extensions\antigravity-internal-hook-1.0.4\src\stats_tracker.js"
if exist "%AG_TRACKER%" (
    echo   ✓ Antigravity stats_tracker.js accessible
    findstr /C:"CHANGED" /C:"Send to dashboard IMMEDIATELY" "%AG_TRACKER%" >nul
    if !errorLevel! equ 0 (
        echo   ✓ Antigravity extension has tracking fix
    ) else (
        echo   ✗ Antigravity extension missing tracking fix
    )
) else (
    echo   ✗ Antigravity file not accessible
)

echo.
echo [Check 4] File Comparison
echo ==========================================
powershell -Command "if ((Get-FileHash 'C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions\AntiGravity_Internal_Hook\src\stats_tracker.js').Hash -eq (Get-FileHash '%USERPROFILE%\.antigravity\extensions\antigravity-internal-hook-1.0.4\src\stats_tracker.js').Hash) { Write-Host '  ✓ Files are IDENTICAL (symlink works)' } else { Write-Host '  ✗ Files are DIFFERENT (symlink broken)' }"

echo.
echo [Check 5] Extension Status
echo ==========================================
if exist "C:\AntiGravityExt\HOOK_ALIVE.txt" (
    echo   Extension status:
    type "C:\AntiGravityExt\HOOK_ALIVE.txt"
) else (
    echo   ⚠ HOOK_ALIVE.txt not found
)

echo.
echo [Check 6] Stats File
echo ==========================================
if exist "%USERPROFILE%\.gemini\antigravity\.ghost_stats.json" (
    echo   Stats file:
    type "%USERPROFILE%\.gemini\antigravity\.ghost_stats.json"
) else (
    echo   ⚠ Stats file not found
)

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                      VERIFICATION COMPLETE                        ║
echo ╠═══════════════════════════════════════════════════════════════════╣
echo ║                                                                   ║
echo ║  If all checks passed:                                            ║
echo ║  ✓ Symlinks are working                                           ║
echo ║  ✓ Antigravity loads from repository                              ║
echo ║  ✓ Tracking fix is active                                         ║
echo ║                                                                   ║
echo ║  Next: Reload Antigravity to ensure extensions reload with        ║
echo ║  the symlinked code: Ctrl+Shift+P → Reload Window                 ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

pause

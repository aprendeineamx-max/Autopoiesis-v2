@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1
title 🧪 Testing Real IDE Tracking

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║          🧪 TEST: Real IDE Tracking Verification                  ║
echo ╠═══════════════════════════════════════════════════════════════════╣
echo ║                                                                   ║
echo ║  This script verifies that Antigravity extensions are            ║
echo ║  sending stats to the dashboard when processing commands.        ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

set "STATS_FILE=%USERPROFILE%\.gemini\antigravity\.ghost_stats.json"
set "HOOK_FILE=C:\AntiGravityExt\HOOK_ALIVE.txt"

echo [Test 1] Checking if extension is active...
if exist "%HOOK_FILE%" (
    type "%HOOK_FILE%"
    echo   ✓ Extension is ACTIVE
) else (
    echo   ✗ Extension NOT active - HOOK_ALIVE.txt not found
    goto :end
)

echo.
echo [Test 2] Current stats from file...
if exist "%STATS_FILE%" (
    type "%STATS_FILE%"
) else (
    echo   ⚠ Stats file not found yet
)

echo.
echo [Test 3] Checking API endpoint...
powershell -Command "$r = Invoke-RestMethod -Uri 'http://localhost:9999/api/stats' -ErrorAction SilentlyContinue; if ($r) { Write-Host '  ✓ API responding'; $r | ConvertTo-Json } else { Write-Host '  ✗ API not responding' }"

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                     INSTRUCTIONS                                  ║
echo ╠═══════════════════════════════════════════════════════════════════╣
echo ║                                                                   ║
echo ║  1. Open Antigravity IDE                                          ║
echo ║  2. Use AI features (create file, edit code, etc)                ║
echo ║  3. Click "Accept" or "Allow" when prompted                       ║
echo ║  4. Run this script again to see if numbers increased            ║
echo ║                                                                   ║
echo ║  Expected: "executed" should increment after using IDE            ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

:end
pause

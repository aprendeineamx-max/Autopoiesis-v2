@echo off
:: ---------------------------------------------------------
:: ANTI-GRAVITY GHOST AGENT :: GLOBAL LAUNCHER
:: ---------------------------------------------------------
:: This script initializes the OmniControl Overwatch HUD
:: in a detached process (No visible console window).

cd /d "%~dp0"

echo.
echo   [ GHOST AGENT ]
echo   Starting OmniControl Overwatch System...
echo.

:: Launch PowerShell script with Hidden WindowStyle (The WPF GUI will still appear)
start "" powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "OmniControl_HUD.ps1"

echo   [ OK ] System injected.
timeout /t 2 >nul
exit

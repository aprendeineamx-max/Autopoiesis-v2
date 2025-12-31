@echo off
echo DIAGNOSTICO DE GHOST AGENT v7.0
echo.
if exist "extension\extension.js" ( echo [OK] extension local ) else ( echo [X] extension local missing )
if exist "%USERPROFILE%\.gemini\antigravity\browserAllowlist.txt" ( echo [OK] Allowlist Global ) else ( echo [X] Allowlist missing )
echo.
pause

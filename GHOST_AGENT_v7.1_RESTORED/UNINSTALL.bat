@echo off
title Ghost Agent - Desinstalacion Completa
color 0C

echo.
echo ========================================
echo   GHOST AGENT - DESINSTALACION COMPLETA
echo ========================================

echo.
echo ADVERTENCIA: Esta accion eliminara:
echo   - Extension de Antigravity
echo   - Carpeta C:\AntiGravityExt\
echo   - BrowserAllowlist
echo   - Configuracion de color de barra
echo.
set /p "CONFIRM=¿Estas SEGURO? (escribe SI para confirmar): "

if /I not "%CONFIRM%"=="SI" (
    echo.
    echo [i] Desinstalacion cancelada por el usuario
    pause
    exit /b 0
)

echo.
echo ========================================
echo  INICIANDO DESINSTALACION
echo ========================================

:: Cerrar Antigravity
taskkill /IM "Antigravity.exe" /F >NUL 2>&1

:: Eliminar carpetas
rd /s /q "C:\AntiGravityExt" 2>NUL
rd /s /q "%USERPROFILE%\AppData\Local\Programs\AntiGravity\resources\app\extensions\antigravity-internal-hook" 2>NUL
rd /s /q "%USERPROFILE%\.antigravity\extensions\antigravity-internal-hook" 2>NUL

:: Eliminar Allowlist
del /f /q "%USERPROFILE%\.gemini\antigravity\browserAllowlist.txt" 2>NUL

echo.
echo ========================================
echo   DESINSTALACION COMPLETADA
echo ========================================
pause

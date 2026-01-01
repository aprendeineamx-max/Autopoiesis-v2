@echo off
title GHOST AGENT - KILL SWITCH
color 0C

echo.
echo ============================================
echo   GHOST AGENT - PARADA DE EMERGENCIA
echo ============================================
echo.
echo [!] DETENIENDO AGENTE EN TIEMPO REAL...

:: 1. Enviar Señal de PAUSE (Soft Kill)
echo PAUSE > "C:\AntiGravityExt\GHOST_CMD.txt"
echo [OK] Senal de pausa enviada.

:: 2. Matar Extension (Hard Kill)
set "EXT_DIR=%USERPROFILE%\AppData\Local\Programs\AntiGravity\resources\app\extensions\antigravity-internal-hook"

if exist "%EXT_DIR%\extension.js" (
    move /Y "%EXT_DIR%\extension.js" "%EXT_DIR%\extension.js.KILLED" >NUL
    echo [OK] Extension desactivada fisicamente. (Renombrada a .KILLED)
) else (
    echo [i] La extension no esta activa o ya fue detenida.
)

echo.
echo ============================================
echo   AGENTE NEUTRALIZADO
echo ============================================
echo.
echo [!] REINICIA ANTIGRAVITY AHORA.
echo     El agente NO cargara mas.
echo.
pause

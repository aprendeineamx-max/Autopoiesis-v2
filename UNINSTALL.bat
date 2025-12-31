@echo off
title GHOST AGENT - SAFE UNINSTALLER
color 0E

echo.
echo =======================================================
echo   GHOST AGENT - DESINSTALACION SEGURA
echo =======================================================
echo.
echo [i] ESTE SCRIPT NO ELIMINA ARCHIVOS PERMANENTEMENTE.
echo [i] SOLO DESACTIVA LA EXTENSION DEL IDE.
echo.

set "EXT_DIR=%USERPROFILE%\AppData\Local\Programs\AntiGravity\resources\app\extensions\antigravity-internal-hook"
set "BACKUP_ROOT=C:\AntiGravityExt\_DISABLED_EXTENSIONS"

:: Obtener fecha y hora para carpeta unica (Formato seguro para carpetas)
set "TIMESTAMP=%DATE:~-4%-%DATE:~3,2%-%DATE:~0,2%_%TIME:~0,2%h%TIME:~3,2%m%TIME:~6,2%s"
set "TIMESTAMP=%TIMESTAMP: =0%"
set "BACKUP_PATH=%BACKUP_ROOT%\Deactivated_%TIMESTAMP%"

if not exist "%EXT_DIR%\extension.js" (
    echo [!] No se encontro la extension activa en el IDE.
    echo [!] Nada que desinstalar.
    goto :FINISH
)

echo [1/2] Creando carpeta de respaldo seguro...
mkdir "%BACKUP_PATH%" 2>NUL
echo     Destino: %BACKUP_PATH%

echo.
echo [2/2] Moviendo extension (Desactivando)...
move /Y "%EXT_DIR%\*" "%BACKUP_PATH%\" >NUL
rd /q "%EXT_DIR%" 2>NUL

if not exist "%EXT_DIR%\extension.js" (
    echo.
    echo [OK] EXITO: Extension desactivada correctamente.
    echo      Tus archivos estan seguros en:
    echo      %BACKUP_PATH%
) else (
    echo.
    echo [X] ERROR: No se pudo mover la extension.
    echo     Cierra el IDE y vuelve a intentar.
)

:FINISH
echo.
echo =======================================================
echo   PROCESO TERMINADO
echo =======================================================
echo.
echo [!] Para reactivar, usa INSTALL.bat o el Panel de Control.
echo.
pause

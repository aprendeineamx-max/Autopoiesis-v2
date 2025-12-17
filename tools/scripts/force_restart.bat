@echo off
echo [ANTIGRAVITY] INICIANDO PROTOCOLO "FENIX" (REINICIO TOTAL)...
echo [ANTIGRAVITY] Terminando procesos hostiles...

:: 1. MATAR TODO (Shotgun Approach)
:: Code.exe (Standard)
taskkill /IM Code.exe /F 2>NUL
:: Antigravity.exe (Fork Name)
taskkill /IM Antigravity.exe /F 2>NUL
:: electron.exe (Dev/Debug)
taskkill /IM electron.exe /F 2>NUL

echo [ANTIGRAVITY] Esperando disipacion de memoria...
TIMEOUT /T 3 /NOBREAK >NUL

echo [ANTIGRAVITY] RELANZANDO ENTORNO (RUTA ABSOLUTA)...

:: INTENTO DEFINITIVO: Ejecutable Directo
start "" "C:\Users\Administrator\AppData\Local\Programs\AntiGravity\Antigravity.exe" "C:\AntiGravityExt\AntiGravity_Ghost_Agent"

:: Fallback si falla (poco probable)
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fallo ejecucion primaria. Intentando 'code'...
    start "" code "C:\AntiGravityExt\AntiGravity_Ghost_Agent"
)

:success
echo [ANTIGRAVITY] Inyeccion completa. El sistema deberia volver en 5 segundos.
echo [ANTIGRAVITY] Cerrando inyector.
exit

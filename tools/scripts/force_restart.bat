@echo off
echo [ANTIGRAVITY] INICIANDO PROTOCOLO "FENIX" (REINICIO TOTAL)...
echo [ANTIGRAVITY] Terminando procesos hostiles...

:: 1. MATAR SOLO ANTIGRAVITY (Strict)
taskkill /IM Antigravity.exe /F 2>NUL
taskkill /IM electron.exe /F 2>NUL
:: Intencionalmente NO matamos Code.exe para no afectar otras instalaciones

echo [ANTIGRAVITY] Esperando limpieza (3s)...
TIMEOUT /T 3 /NOBREAK >NUL

:: 2. DEFINIR RUTAS (Busqueda Profunda)
set "PATH_1=C:\Users\Administrator\AppData\Local\Programs\AntiGravity\Antigravity.exe"
set "PATH_2=C:\Program Files\AntiGravity\Antigravity.exe"
set "WS_PATH=C:\AntiGravityExt\AntiGravity_Ghost_Agent"

:: 3. VERIFICAR Y LANZAR
set "EXT_DEV_PATH=C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions\AntiGravity_Internal_Hook"

if exist "%PATH_1%" (
    echo [LAUNCH] Detectado en AppData. Inyectando Extension...
    start "" "%PATH_1%" --extensionDevelopmentPath="%EXT_DEV_PATH%" "%WS_PATH%"
    goto :success
)

if exist "%PATH_2%" (
    echo [LAUNCH] Detectado en Program Files. Inyectando Extension...
    start "" "%PATH_2%" --extensionDevelopmentPath="%EXT_DEV_PATH%" "%WS_PATH%"
    goto :success
)

:: FAIL STATE
echo [CRITICAL ERROR] No se encuentra Antigravity.exe en ninguna ruta conocida.
echo [STRICT MODE] No se usara 'code' como fallback por orden del usuario.
echo Por favor verifica tu instalacion.
pause
exit /b 1

:success
echo [SUCCESS] Inyeccion enviada. 
exit

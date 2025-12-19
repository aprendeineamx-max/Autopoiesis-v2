@echo off
echo ================================================
echo   Iniciando Antigravity con Proxy Configurado
echo ================================================
echo.

REM Configurar variables de entorno para SSL
set NODE_TLS_REJECT_UNAUTHORIZED=0
set HTTPS_PROXY=http://127.0.0.1:8080
set HTTP_PROXY=http://127.0.0.1:8080

echo Variables configuradas:
echo   NODE_TLS_REJECT_UNAUTHORIZED=0
echo   HTTP_PROXY=http://127.0.0.1:8080
echo   HTTPS_PROXY=http://127.0.0.1:8080
echo.

echo Iniciando Antigravity...
echo.

REM Buscar ejecutable de Antigravity
if exist "C:\Users\%USERNAME%\AppData\Local\Programs\Antigravity\Antigravity.exe" (
    start "" "C:\Users\%USERNAME%\AppData\Local\Programs\Antigravity\Antigravity.exe"
    echo Antigravity iniciado
) else if exist "C:\Program Files\Antigravity\Antigravity.exe" (
    start "" "C:\Program Files\Antigravity\Antigravity.exe"
    echo Antigravity iniciado
) else (
    echo ERROR: No se encontro Antigravity.exe
    echo Por favor inicia Antigravity manualmente desde esta ventana
    echo.
    cmd /k
)

pause

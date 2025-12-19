@echo off
echo ================================================
echo   CDP WebSocket Capture - AUTO SETUP
echo ================================================
echo.

REM Verificar si websocket-client está instalado
python -c "import websocket" 2>nul
if %errorlevel% == 0 (
    echo [OK] websocket-client ya instalado
    goto :run_capture
)

echo [!] websocket-client no encontrado
echo.
echo Intentando instalar...
echo.

REM Intentar pip
python -m pip install websocket-client >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Instalado via pip
    goto :run_capture
)

REM Intentar pip --user
python -m pip install --user websocket-client >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Instalado via pip --user
    goto :run_capture
)

echo [X] No se pudo instalar automáticamente
echo.
echo ================================================
echo   INSTALACION MANUAL REQUERIDA
echo ================================================
echo.
echo Opcion 1 - Descargar manualmente:
echo   1. Visita: https://pypi.org/project/websocket-client/
echo   2. Descarga el archivo .whl o .tar.gz
echo   3. Extrae a: %CD%
echo.
echo Opcion 2 - Usar monitor simple (sin websocket):
echo   python cdp_monitor_simple.py
echo.
pause
exit /b 1

:run_capture
echo.
echo ================================================
echo   Iniciando Captura WebSocket
echo ================================================
echo.

python cdp_websocket_capture.py

pause

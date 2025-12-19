@echo off
echo ================================================
echo   Antigravity CDP Capture - Launcher
echo ================================================
echo.

echo [1/3] Cerrando Antigravity...
taskkill /F /IM Antigravity.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Iniciando Antigravity con remote debugging...

REM Buscar executable de Antigravity
set "AG_PATH=C:\Users\%USERNAME%\AppData\Local\Programs\Antigravity\Antigravity.exe"

if exist "%AG_PATH%" (
    echo Ejecutable encontrado: %AG_PATH%
    echo.
    echo Iniciando con --remote-debugging-port=9222...
    start "" "%AG_PATH%" --remote-debugging-port=9222
    echo.
    echo ✅ Antigravity iniciado
) else (
    echo ❌ ERROR: No se encontró Antigravity.exe
    echo Por favor verifica la ruta
    pause
    exit /b 1
)

echo.
echo [3/3] Esperando a que Antigravity inicie...
timeout /t 5 /nobreak >nul

echo.
echo ================================================
echo   Iniciando captura CDP
echo ================================================
echo.

cd /d "%~dp0"
python cdp_capture.py

pause

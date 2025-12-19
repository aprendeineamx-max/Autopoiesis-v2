@echo off
echo ================================================
echo   WebSocket Sniffer - Inicio Automatico
echo ================================================
echo.
echo Este script captura AUTOMATICAMENTE el trafico
echo WebSocket de Antigravity sin configuracion manual
echo.
echo Presiona Ctrl+C para detener
echo.
echo ================================================
echo.

cd /d "C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools"

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no esta instalado
    echo Instala Python desde: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Instalar psutil si es necesario
echo Verificando dependencias...
python -c "import psutil" >nul 2>&1
if errorlevel 1 (
    echo Instalando psutil...
    pip install psutil
)

echo.
echo ================================================
echo   INICIANDO CAPTURA AUTOMATICA
echo ================================================
echo.
echo Los datos se guardaran en: C:\websocket_captures\
echo.
echo IMPORTANTE: Deja este script corriendo mientras usas Antigravity
echo.

REM Ejecutar sniffer
python websocket_sniffer.py

pause

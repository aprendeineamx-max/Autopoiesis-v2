@echo off
echo ================================================
echo   Live Chat Viewer - Ver mensajes en tiempo real
echo ================================================
echo.

cd /d "C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools"

echo Iniciando visualizador de mensajes...
echo.
echo Este visualizador muestra los ultimos 5 mensajes capturados
echo y se actualiza automaticamente cada 2 segundos.
echo.
echo Presiona Ctrl+C para salir
echo.
timeout /t 3 >nul

python live_viewer.py

pause

@echo off
echo ================================================
echo   mitmproxy Web UI - Vista Grafica
echo ================================================
echo.

cd /d "C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools"

echo Iniciando mitmproxy con interfaz web...
echo.
echo Web UI estara disponible en:
echo   http://localhost:8081
echo.
echo Proxy escuchando en:
echo   127.0.0.1:8080
echo.

REM Iniciar mitmweb (versión con UI)
mitmweb --listen-port 8080 --web-port 8081 -s mitm_chat_capture.py

pause

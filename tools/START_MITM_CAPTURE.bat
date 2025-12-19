@echo off
echo ================================================
echo   mitmproxy - Chat Capture System
echo   Captura automatica de mensajes de Antigravity
echo ================================================
echo.

cd /d "C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools"

echo [1/3] Verificando mitmproxy...
python -c "import mitmproxy" >nul 2>&1
if errorlevel 1 (
    echo ERROR: mitmproxy no esta instalado
    echo Instalando ahora...
    pip install mitmproxy
    if errorlevel 1 (
        echo ERROR: Fallo la instalacion
        pause
        exit /b 1
    )
)
echo OK - mitmproxy instalado

echo.
echo [2/3] Configuracion:
echo   Proxy: 127.0.0.1:8080
echo   Web UI: http://localhost:8081
echo   Captura: C:\chat_captures\chat_messages_live.txt
echo.

echo [3/3] Iniciando captura...
echo.
echo ================================================
echo   INSTRUCCIONES:
echo ================================================
echo.
echo 1. Configura Antigravity para usar proxy:
echo    Settings -^> Proxy -^> HTTP/HTTPS: 127.0.0.1:8080
echo.
echo 2. Instala certificado SSL:
echo    Abre: http://mitm.it
echo    Descarga certificado para Windows
echo    Instala en "Trusted Root Certification Authorities"
echo.
echo 3. Usa Antigravity chat normalmente
echo.
echo 4. Los mensajes se guardaran en:
echo    C:\chat_captures\chat_messages_live.txt
echo.
echo 5. Ver captura en tiempo real:
echo    Abre: http://localhost:8081
echo.
echo ================================================
echo   INICIANDO MITMPROXY
echo ================================================
echo.
echo Presiona Ctrl+C para detener
echo.

REM Iniciar mitmproxy con nuestro addon
REM Nota: En mitmproxy 12.x, usa mitmweb para UI web o mitmdump para captura
mitmdump --listen-port 8080 -s mitm_chat_capture.py --set console_eventlog_verbosity=info

pause

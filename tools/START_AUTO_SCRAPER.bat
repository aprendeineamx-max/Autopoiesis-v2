@echo off
echo ================================================
echo   Auto Chat Scraper - 100%% AUTOMATICO
echo   NO requiere reload ni Ctrl+A/C
echo ================================================
echo.

echo [1/2] Instalando dependencias...
pip install pyautogui pywin32 pillow --quiet
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudieron instalar dependencias
    pause
    exit /b 1
)
echo OK - Dependencias instaladas
echo.

echo [2/2] Iniciando captura automatica...
echo.
echo ================================================
echo   INSTRUCCIONES:
echo ================================================
echo.
echo 1. Deja esta ventana abierta
echo 2. Usa Antigravity normalmente
echo 3. El script capturara automaticamente cada 15s
echo 4. Mensajes se guardan en:
echo    C:\chat_captures\auto_scraped_messages.json
echo.
echo Presiona Ctrl+C para detener
echo.
echo ================================================
echo   CAPTURA EN PROGRESO
echo ================================================
echo.

python auto_chat_scraper.py

pause

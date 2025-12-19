@echo off
echo ================================================
echo   WebSocket Monitor - Instalacion CORRECTA
echo   (En carpeta de Antigravity, no VS Code)
echo ================================================
echo.

set "SOURCE=C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions\WebSocket_Monitor"
set "TARGET=C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions"

echo [1/2] Verificando archivos fuente...
if not exist "%SOURCE%\package.json" (
    echo ERROR: No se encontro package.json
    pause
    exit /b 1
)
echo OK - Archivos encontrados
echo.

echo [2/2] La extension ya esta en la ubicacion correcta:
echo %TARGET%\WebSocket_Monitor\
echo.
echo No es necesario copiar nada.
echo.
echo ================================================
echo   EXTENSION YA ESTA INSTALADA
echo ================================================
echo.
echo La extension WebSocket_Monitor ya esta en:
echo   C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions\WebSocket_Monitor\
echo.
echo PARA ACTIVARLA:
echo   Opcion 1 - Modo F5 (Desarrollo):
echo     1. File -^> Open Folder -^> Selecciona WebSocket_Monitor
echo     2. Presiona F5
echo     3. En Extension Development Host, usa el chat
echo     4. Ve logs en Debug Console (ventana original)
echo.
echo   Opcion 2 - Carga automatica:
echo     La extension se cargara automaticamente si esta
echo     en la carpeta extensions/ y reinicias Antigravity
echo.
pause

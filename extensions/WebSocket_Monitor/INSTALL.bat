@echo off
echo ================================================
echo   WebSocket Monitor - Instalador Automatico
echo ================================================
echo.

REM Verificar que la carpeta de origen existe
if not exist "C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions\WebSocket_Monitor" (
    echo ERROR: No se encontro la carpeta WebSocket_Monitor
    pause
    exit /b 1
)

echo [1/4] Verificando archivos...
if not exist "C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions\WebSocket_Monitor\package.json" (
    echo ERROR: package.json no encontrado
    pause
    exit /b 1
)
if not exist "C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions\WebSocket_Monitor\extension.js" (
    echo ERROR: extension.js no encontrado
    pause
    exit /b 1
)
echo OK - Archivos encontrados
echo.

echo [2/4] Buscando carpeta de extensiones de Antigravity...
set "EXTENSIONS_DIR=%USERPROFILE%\.vscode\extensions"
if not exist "%EXTENSIONS_DIR%" (
    set "EXTENSIONS_DIR=%APPDATA%\Code\User\extensions"
)
if not exist "%EXTENSIONS_DIR%" (
    echo ERROR: No se encontro la carpeta de extensiones
    echo Intentando crear en: %USERPROFILE%\.antigravity\extensions
    set "EXTENSIONS_DIR=%USERPROFILE%\.antigravity\extensions"
    mkdir "%EXTENSIONS_DIR%" 2>nul
)
echo Carpeta de extensiones: %EXTENSIONS_DIR%
echo.

echo [3/4] Copiando extension...
set "TARGET_DIR=%EXTENSIONS_DIR%\antigravity-research.websocket-monitor-1.0.0"
if exist "%TARGET_DIR%" (
    echo Eliminando version anterior...
    rmdir /s /q "%TARGET_DIR%"
)

xcopy "C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions\WebSocket_Monitor\*.*" "%TARGET_DIR%\" /E /I /Y
if errorlevel 1 (
    echo ERROR: Fallo al copiar archivos
    pause
    exit /b 1
)
echo OK - Extension copiada
echo.

echo [4/4] Extension instalada en:
echo %TARGET_DIR%
echo.
echo ================================================
echo   INSTALACION COMPLETADA
echo ================================================
echo.
echo SIGUIENTE PASO:
echo   1. Cierra Antigravity COMPLETAMENTE
echo   2. Abre Antigravity de nuevo
echo   3. Ctrl+Shift+P -^> "Output: Show Output Channels"
echo   4. Deberas ver "WebSocket Monitor" en la lista
echo.
pause

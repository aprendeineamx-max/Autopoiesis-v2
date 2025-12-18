@echo off
chcp 65001 >nul
cls
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║       ANTIGRAVITY GHOST AGENT v2.0 - PORTABLE INSTALLER           ║
echo ║                                                                   ║
echo ║   Auto-Accepts: Allow, Accept, Accept All, Blue Buttons          ║
echo ║   Includes: browserAllowlist.txt for localhost auto-allow        ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

:: Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Se recomienda ejecutar como Administrador para acceso completo.
    echo.
)

:: Set paths
set "DEST_EXT=%USERPROFILE%\AppData\Local\Programs\AntiGravity\resources\app\extensions\antigravity-internal-hook"
set "DEST_GEMINI=%USERPROFILE%\.gemini\antigravity"
set "SOURCE_EXT=%~dp0extension"

echo [1/5] Detectando rutas...
echo       Destino Extension: %DEST_EXT%
echo       Destino Gemini:    %DEST_GEMINI%
echo       Fuente:            %SOURCE_EXT%
echo.

:: Create directories
echo [2/5] Creando directorios...
if not exist "%DEST_EXT%" mkdir "%DEST_EXT%"
if not exist "%DEST_EXT%\src" mkdir "%DEST_EXT%\src"
if not exist "%DEST_GEMINI%" mkdir "%DEST_GEMINI%"
if not exist "C:\AntiGravityExt\AntiGravity_Ghost_Agent" mkdir "C:\AntiGravityExt\AntiGravity_Ghost_Agent"
echo       ✓ Directorios creados
echo.

:: Copy extension files
echo [3/5] Copiando archivos de extension...
copy /Y "%SOURCE_EXT%\extension.js" "%DEST_EXT%\extension.js" >nul
copy /Y "%SOURCE_EXT%\package.json" "%DEST_EXT%\package.json" >nul
copy /Y "%SOURCE_EXT%\src\ghost_core.js" "%DEST_EXT%\src\ghost_core.js" >nul
copy /Y "%SOURCE_EXT%\src\browser_bridge.js" "%DEST_EXT%\src\browser_bridge.js" >nul
copy /Y "%SOURCE_EXT%\src\session_manager.js" "%DEST_EXT%\src\session_manager.js" >nul
echo       ✓ Archivos de extension copiados
echo.

:: Create browserAllowlist.txt (THE KEY FILE!)
echo [4/5] Creando browserAllowlist.txt (UNIVERSAL - Autoriza TODOS los sitios)...
(
echo *
echo *.*
echo http://*
echo https://*
echo localhost
echo localhost:*
echo 127.0.0.1
echo 127.0.0.1:*
echo 0.0.0.0
echo 0.0.0.0:*
echo *.com
echo *.net
echo *.org
echo *.io
echo *.dev
echo *.app
echo *.co
echo *.me
echo *.ai
echo *.edu
echo *.gov
echo *.mx
echo *.es
echo *.uk
echo *.de
echo *.fr
echo *.it
echo *.jp
echo *.cn
echo *.br
echo *.ar
echo *.cl
echo file://*
echo vscode-webview://*
echo vscode-file://*
) > "%DEST_GEMINI%\browserAllowlist.txt"
echo       ✓ browserAllowlist.txt UNIVERSAL creado en %DEST_GEMINI%
echo.

:: Create trigger file
echo [5/5] Creando archivos de control...
echo IDLE > "C:\AntiGravityExt\AntiGravity_Ghost_Agent\TRIGGER.txt"
echo Ghost Agent v2.0 Installed at %date% %time% > "C:\AntiGravityExt\GHOST_AGENT_INSTALLED.txt"
echo       ✓ Archivos de control creados
echo.

echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                    INSTALACION COMPLETADA                         ║
echo ╠═══════════════════════════════════════════════════════════════════╣
echo ║                                                                   ║
echo ║  ✓ Extension instalada en:                                       ║
echo ║    %DEST_EXT%                                                     ║
echo ║                                                                   ║
echo ║  ✓ browserAllowlist.txt creado (Auto-autoriza localhost)         ║
echo ║                                                                   ║
echo ║  SIGUIENTE PASO:                                                  ║
echo ║  → Reinicia Antigravity IDE para activar la extension            ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.
pause

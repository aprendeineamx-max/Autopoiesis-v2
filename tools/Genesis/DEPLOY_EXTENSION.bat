@echo off
set "SOURCE=%~1"
set "TARGET=C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions\AntiGravity_Internal_Hook\extension.js"
set "BACKUP=C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions\AntiGravity_Internal_Hook\extension.js.bak"

if "%SOURCE%"=="" (
    echo [ERROR] Por favor arrastra un archivo JS sobre este script.
    echo Uso: DEPLOY_EXTENSION.bat [ruta_archivo_genesis.js]
    pause
    exit /b
)

echo [GENESIS] Iniciando Despliegue de Extension...
echo [GENESIS] Fuente: %SOURCE%

if exist "%TARGET%" (
    echo [BACKUP] Guardando extension actual...
    copy /Y "%TARGET%" "%BACKUP%" >NUL
    echo [BACKUP] Guardado en extension.js.bak
)

echo [INSTALL] Inyectando codigo Genesis...
copy /Y "%SOURCE%" "%TARGET%" >NUL

echo.
echo [EXITO] Extension instalada.
echo [ACCION] Ejecuta "force_restart.bat" para activar.
echo.
pause

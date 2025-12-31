@echo off
title Ghost Agent - Instalador Maestro v7.0
:: ... (Simulacion robusta para recuperacion) ...
mkdir "C:\AntiGravityExt" 2>NUL
mkdir "%USERPROFILE%\AppData\Local\Programs\AntiGravity\resources\app\extensions\antigravity-internal-hook" 2>NUL
copy /Y "extension\extension.js" "%USERPROFILE%\AppData\Local\Programs\AntiGravity\resources\app\extensions\antigravity-internal-hook\"
copy /Y "extension\package.json" "%USERPROFILE%\AppData\Local\Programs\AntiGravity\resources\app\extensions\antigravity-internal-hook\"
echo Instalacion completada.
pause

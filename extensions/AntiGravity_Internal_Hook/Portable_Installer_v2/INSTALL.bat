@echo off
chcp 65001 >nul
cls
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║       ANTIGRAVITY GHOST AGENT v2.0 - PORTABLE INSTALLER           ║
echo ║                                                                   ║
echo ║   Auto-Accepts: Allow, Accept, Accept All, Blue Buttons          ║
echo ║   Includes: MEGA browserAllowlist.txt (200+ entries)             ║
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

:: Create MEGA browserAllowlist.txt
echo [4/5] Creando MEGA browserAllowlist.txt (200+ entradas - TODOS los sitios)...
(
echo # ANTIGRAVITY BROWSER ALLOWLIST - MEGA UNIVERSAL
echo # Autoriza TODOS los sitios del mundo
echo.
echo # === WILDCARDS MAESTROS ===
echo *
echo *.*
echo **.**
echo *://*
echo *://*.*
echo.
echo # === PROTOCOLOS ===
echo http://*
echo https://*
echo file://*
echo ftp://*
echo ws://*
echo wss://*
echo data:*
echo blob:*
echo javascript:*
echo about:*
echo chrome://*
echo chrome-extension://*
echo vscode://*
echo vscode-webview://*
echo vscode-file://*
echo vscode-resource://*
echo.
echo # === LOCALHOST Y REDES LOCALES ===
echo localhost
echo localhost:*
echo *.localhost
echo *.localhost:*
echo 127.0.0.1
echo 127.0.0.1:*
echo 127.*.*.*
echo 0.0.0.0
echo 0.0.0.0:*
echo 192.168.*.*
echo 192.168.*.*:*
echo 10.*.*.*
echo 10.*.*.*:*
echo 172.16.*.*
echo 172.16.*.*:*
echo ::1
echo [::1]
echo [::1]:*
echo.
echo # === TLDs GENERICOS ===
echo *.com
echo *.net
echo *.org
echo *.edu
echo *.gov
echo *.mil
echo *.int
echo *.info
echo *.biz
echo *.name
echo *.pro
echo *.mobi
echo *.tel
echo *.asia
echo *.cat
echo *.coop
echo *.jobs
echo *.museum
echo *.travel
echo *.aero
echo.
echo # === TLDs NUEVOS POPULARES ===
echo *.io
echo *.dev
echo *.app
echo *.ai
echo *.co
echo *.me
echo *.tv
echo *.cc
echo *.ws
echo *.fm
echo *.am
echo *.ly
echo *.to
echo *.gg
echo *.xyz
echo *.online
echo *.site
echo *.website
echo *.space
echo *.tech
echo *.store
echo *.shop
echo *.blog
echo *.cloud
echo *.digital
echo *.live
echo *.network
echo *.world
echo *.zone
echo *.link
echo *.click
echo *.hosting
echo *.software
echo *.solutions
echo *.design
echo *.studio
echo *.agency
echo *.company
echo *.business
echo *.center
echo *.systems
echo *.services
echo *.global
echo *.team
echo *.tools
echo *.works
echo *.media
echo *.social
echo *.news
echo *.wiki
echo *.community
echo *.foundation
echo *.academy
echo *.university
echo *.school
echo *.training
echo *.education
echo *.institute
echo.
echo # === TLDs PAISES AMERICAS ===
echo *.mx
echo *.us
echo *.ca
echo *.br
echo *.ar
echo *.cl
echo *.pe
echo *.ve
echo *.ec
echo *.bo
echo *.py
echo *.uy
echo *.cr
echo *.pa
echo *.gt
echo *.hn
echo *.sv
echo *.ni
echo *.cu
echo *.do
echo *.pr
echo *.jm
echo *.tt
echo *.ht
echo.
echo # === TLDs PAISES EUROPA ===
echo *.uk
echo *.de
echo *.fr
echo *.es
echo *.it
echo *.pt
echo *.nl
echo *.be
echo *.ch
echo *.at
echo *.pl
echo *.cz
echo *.sk
echo *.hu
echo *.ro
echo *.bg
echo *.hr
echo *.si
echo *.rs
echo *.ua
echo *.ru
echo *.by
echo *.lt
echo *.lv
echo *.ee
echo *.fi
echo *.se
echo *.no
echo *.dk
echo *.is
echo *.ie
echo *.lu
echo *.mc
echo *.li
echo *.ad
echo *.sm
echo *.va
echo *.mt
echo *.cy
echo *.gr
echo *.al
echo *.mk
echo *.ba
echo *.md
echo.
echo # === TLDs PAISES ASIA ===
echo *.cn
echo *.jp
echo *.kr
echo *.in
echo *.pk
echo *.bd
echo *.lk
echo *.np
echo *.bt
echo *.mm
echo *.th
echo *.vn
echo *.kh
echo *.la
echo *.my
echo *.sg
echo *.id
echo *.ph
echo *.tw
echo *.hk
echo *.mo
echo *.mn
echo *.kz
echo *.uz
echo *.tm
echo *.kg
echo *.tj
echo *.af
echo *.ir
echo *.iq
echo *.sy
echo *.lb
echo *.jo
echo *.il
echo *.ps
echo *.sa
echo *.ae
echo *.qa
echo *.kw
echo *.bh
echo *.om
echo *.ye
echo.
echo # === TLDs PAISES AFRICA ===
echo *.za
echo *.eg
echo *.ng
echo *.ke
echo *.tz
echo *.ug
echo *.rw
echo *.et
echo *.gh
echo *.ci
echo *.sn
echo *.cm
echo *.cd
echo *.ao
echo *.mz
echo *.zw
echo *.bw
echo *.na
echo *.zm
echo *.mw
echo *.mg
echo *.mu
echo *.sc
echo *.tn
echo *.ma
echo *.dz
echo.
echo # === TLDs PAISES OCEANIA ===
echo *.au
echo *.nz
echo *.fj
echo *.pg
echo *.sb
echo *.vu
echo *.nc
echo *.pf
echo *.mh
echo *.pw
echo *.ki
echo *.nr
echo *.ck
echo *.nu
echo *.tk
echo.
echo # === PUERTOS COMUNES ===
echo *:80
echo *:443
echo *:8080
echo *:8443
echo *:3000
echo *:3001
echo *:4000
echo *:5000
echo *:5173
echo *:5174
echo *:8000
echo *:8888
echo *:9000
echo *:9999
echo *:1337
echo *:4200
echo *:4173
echo *:3030
echo *:6006
echo.
echo # === SERVICIOS CONOCIDOS ===
echo *.github.com
echo *.github.io
echo *.githubusercontent.com
echo *.gitlab.com
echo *.gitlab.io
echo *.bitbucket.org
echo *.npmjs.com
echo *.unpkg.com
echo *.jsdelivr.net
echo *.cdnjs.cloudflare.com
echo *.cloudflare.com
echo *.cloudfront.net
echo *.amazonaws.com
echo *.s3.amazonaws.com
echo *.azure.com
echo *.azurewebsites.net
echo *.blob.core.windows.net
echo *.googleusercontent.com
echo *.googleapis.com
echo *.gstatic.com
echo *.google.com
echo *.youtube.com
echo *.ytimg.com
echo *.firebase.com
echo *.firebaseio.com
echo *.firebaseapp.com
echo *.vercel.app
echo *.vercel.com
echo *.netlify.app
echo *.netlify.com
echo *.heroku.com
echo *.herokuapp.com
echo *.railway.app
echo *.render.com
echo *.onrender.com
echo *.fly.io
echo *.fly.dev
echo *.deno.dev
echo *.deno.land
echo *.replit.com
echo *.repl.co
echo *.codesandbox.io
echo *.stackblitz.com
echo *.codepen.io
echo *.jsfiddle.net
echo *.glitch.com
echo *.glitch.me
echo.
echo # === WILDCARD FINAL ABSOLUTO ===
echo *
) > "%DEST_GEMINI%\browserAllowlist.txt"
echo       ✓ MEGA browserAllowlist.txt creado (200+ entradas)
echo.

:: Create trigger file
echo [5/5] Creando archivos de control...
echo IDLE > "C:\AntiGravityExt\AntiGravity_Ghost_Agent\TRIGGER.txt"
echo Ghost Agent v2.0 MEGA Installed at %date% %time% > "C:\AntiGravityExt\GHOST_AGENT_INSTALLED.txt"
echo       ✓ Archivos de control creados
echo.

echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                    INSTALACION COMPLETADA                         ║
echo ╠═══════════════════════════════════════════════════════════════════╣
echo ║                                                                   ║
echo ║  ✓ Extension instalada                                           ║
echo ║  ✓ MEGA browserAllowlist.txt creado (200+ entradas)             ║
echo ║                                                                   ║
echo ║  SIGUIENTE PASO:                                                  ║
echo ║  → Reinicia Antigravity IDE para activar la extension            ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.
pause

╔═══════════════════════════════════════════════════════════════════════════╗
║          ANTIGRAVITY GHOST AGENT v2.0 - INSTALADOR PORTABLE               ║
╚═══════════════════════════════════════════════════════════════════════════╝

DESCRIPCIÓN:
============
Este paquete instala el Ghost Agent para Antigravity IDE.
Auto-acepta TODOS los prompts sin intervención humana:

  ✓ "Allow Once" (localhost browsing)
  ✓ "Accept" / "Accept All" (code changes)
  ✓ Blue buttons (chat editing)
  ✓ Trust domain prompts
  ✓ Terminal run confirmations


CONTENIDO DEL PAQUETE:
======================
📁 Portable_Installer_v2/
├── INSTALL.bat          ← Ejecutar para instalar
├── README.txt           ← Este archivo
└── extension/           ← Archivos de la extension
    ├── extension.js     ← Punto de entrada
    ├── package.json     ← Manifiesto
    └── src/
        ├── ghost_core.js      ← Motor de auto-aceptación
        ├── browser_bridge.js  ← Manejo de URLs
        └── session_manager.js ← Rutinas de inicio


INSTRUCCIONES:
==============
1. Copiar toda la carpeta "Portable_Installer_v2" a la PC destino
2. Ejecutar "INSTALL.bat" como Administrador
3. Reiniciar Antigravity IDE
4. ¡Listo! El Ghost Agent estará activo


¿QUÉ HACE INSTALL.bat?
======================
1. Copia la extensión a:
   %USERPROFILE%\AppData\Local\Programs\AntiGravity\resources\app\extensions\

2. Crea el archivo mágico "browserAllowlist.txt" en:
   %USERPROFILE%\.gemini\antigravity\browserAllowlist.txt
   
   Este archivo es la CLAVE para que localhost se auto-autorice.


VERIFICACIÓN:
=============
Después de reiniciar el IDE, deberías ver:
- Barra de estado color MORADO
- Mensaje: "👻 Ghost Agent v2.0: AUTO-ACCEPT MODE ACTIVE"
- Archivo: C:\AntiGravityExt\GHOST_AGENT_ACTIVE.txt


SOLUCIÓN DE PROBLEMAS:
======================
Si "Allow Once" sigue apareciendo:
1. Verificar que browserAllowlist.txt existe en:
   %USERPROFILE%\.gemini\antigravity\browserAllowlist.txt

2. Verificar contenido del archivo (debe incluir "localhost" y "*")

3. Reiniciar el IDE completamente


VERSIÓN: 2.0.0
FECHA: Diciembre 2024

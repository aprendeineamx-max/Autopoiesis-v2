# 🛠️ Análisis de Sistema y Plan de Mantenimiento (Ghost Agent System)

## 📊 Estado Actual del Sistema

El sistema recuperado en `C:\AntiGravityExt` consta de dos componentes principales que actualmente funcionan de manera independiente pero complementaria:

1.  **Ghost Agent v7.0 ("El Núcleo")**:
    *   **Rol**: Automatización activa (clics, permisos, interacción con IDE).
    *   **Estado**: Producción (Stable, Safe Uninstall).
    *   **Arquitectura**: Monolítica. Scripts batch independientes y una extensión JS unificada.
    *   **Archivos Clave**: `extension.js`, `GHOST_CONTROL_PANEL.ps1`, `INSTALL.bat`.

2.  **AntiGravity Tools ("El Arsenal")** (Carpeta `tools/`):
    *   **Rol**: Inteligencia, Captura y Forense.
    *   **Estado**: Desordenado pero funcional. Gran colección de scripts Python/JS recuperados.
    *   **Archivos Clave**: `dashboard_server.js`, `cdp_capture.py`, `mitm_chat_capture.py`.

## 🔍 Diagnóstico Técnico

### ✅ Lo que funciona bien (Fortalezas)
-   **Instalación/Desinstalación**: El nuevo flujo seguro (`INSTALL.bat` / `SAFE UNINSTALL`) es robusto y a prueba de fallos.
-   **Portabilidad**: El sistema base funciona casi sin dependencias externas (solo requiere el IDE).
-   **Interfaz**: El Panel de Control en PowerShell es ligero y efectivo.

### ⚠️ Áreas de Mejora (Deuda Técnica)
1.  **Código "Espagueti" en Extensión**: `extension.js` hace todo (UI, lógica, archivos). Es difícil de mantener.
2.  **Rutas Estáticas**: La extensión asume `C:\AntiGravityExt` en su código. Si mueves la carpeta, la extensión instalada en `%APPDATA%` se romperá.
3.  **Configuración Dispersa**: Los timeouts, colores y rutas están "quemados" en el código. Deberían estar en un `config.json`.
4.  **Desconexión con Tools**: El Panel de Control no sabe que existen las herramientas de `tools/`. Sería ideal lanzarlas desde ahí.

---

## 🚀 Plan de Mantenimiento y Refactorización

Propongo una estrategia en 3 Fases para modernizar el sistema sin romper la estabilidad actual.

### FASE 1: Modularización y Configuración (Prioridad Alta)
*Objetivo: Hacer el sistema configurable y fácil de editar.*

1.  **Centralizar Configuración**:
    -   Crear `ghost_config.json` en la raíz.
    -   Definir: Rutas, Colores de Status Bar, Timeouts de Auto-Accept.
2.  **Refactorizar Extensión**:
    -   Dividir `extension.js` en módulos:
        -   `src/configManager.js` (Lee el JSON).
        -   `src/ui.js` (Maneja la Status Bar).
        -   `src/worker.js` (Lógica de clics).
    -   *Beneficio*: Podrás cambiar el comportamiento editando el JSON sin tocar código JS.

### FASE 2: Integración de Herramientas (Prioridad Media)
*Objetivo: Unificar el Panel de Control con el Arsenal de Tools.*

1.  **Pestaña "Tools" en GUI**:
    -   Actualizar `GHOST_CONTROL_PANEL.ps1` para incluir una segunda pestaña.
    -   Listar scripts detectados en `tools/` (ej. Dashboards, Scrapers).
    -   Botones de "Lanzar" para scripts comunes (`START_DASHBOARD.bat`).

### FASE 3: Sistema de Logs y Telemetría Local (Prioridad Baja)
*Objetivo: Saber qué está haciendo el agente.*

1.  **Sistema de Logs Unificado**:
    -   Que la extensión y las tools escriban en `logs/activity.log`.
    -   Visualizador de logs en el Panel de Control.

---

## 🏁 Recomendación Inmediata

Proceder con la **FASE 1**.
Separar la configuración del código es vital para evitar errores futuros y facilitar ajustes rápidos.

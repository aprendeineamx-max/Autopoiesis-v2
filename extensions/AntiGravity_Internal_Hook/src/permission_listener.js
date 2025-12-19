/**
 * PERMISSION LISTENER - Intercepta prompts de autorización
 * 
 * Este módulo detecta cuando el usuario da click en "Allow/Accept"
 * en prompts de Antigravity y registra estos eventos en el tracking.
 * 
 * Estrategia: Como no sabemos exactamente qué API usa Antigravity
 * para los prompts, implementamos múltiples métodos de detección.
 */

const vscode = require('vscode');
const statsTracker = require('./stats_tracker');
const fs = require('fs');
const path = require('path');

// Flag file para detectar cuando se concede permiso
const PERMISSION_FLAG = path.join(process.env.USERPROFILE || process.env.HOME, '.gemini', 'antigravity', '.last_permission.txt');

let permissionCount = 0;
let lastPermissionTime = 0;

/**
 * Activar listener de permisos
 */
function activate(context) {
    console.log('[PermissionListener] Activating...');

    // MÉTODO 1: Monitorear workspace trust (VS Code API estándar)
    if (vscode.workspace && vscode.workspace.onDidGrantWorkspaceTrust) {
        try {
            const trustDisposable = vscode.workspace.onDidGrantWorkspaceTrust(() => {
                console.log('[PermissionListener] Workspace trust granted');
                trackPermission('workspace_trust');
            });
            context.subscriptions.push(trustDisposable);
        } catch (e) {
            console.log('[PermissionListener] Workspace trust API not available');
        }
    }

    // MÉTODO 2: Escuchar comandos relacionados con permisos
    const permissionCommands = [
        'workbench.action.acceptWorkspace',
        'workbench.action.trustWorkspace',
        'security.grantPermission'
    ];

    permissionCommands.forEach(cmdName => {
        try {
            const disposable = vscode.commands.registerCommand(`antigravity.${cmdName}`, () => {
                console.log(`[PermissionListener] Command executed: ${cmdName}`);
                trackPermission(cmdName);
            });
            context.subscriptions.push(disposable);
        } catch (e) {
            // Comando puede no existir, continuar
        }
    });

    // MÉTODO 3: Monitorear archivo flag
    // Cuando extensiones/sistema escriben en este archivo, indica permiso concedido
    watchPermissionFile(context);

    // MÉTODO 4: Interceptor de mensajes de información
    // Algunos sistemas muestran "Permission granted" como notificación
    interceptInformationMessages(context);

    console.log('[PermissionListener] Active - monitoring 4 detection methods');
}

/**
 * Registrar permiso concedido
 */
function trackPermission(source) {
    const now = Date.now();

    // Evitar duplicados (si múltiples métodos detectan el mismo evento)
    if (now - lastPermissionTime < 1000) {
        console.log('[PermissionListener] Duplicate detection, skipping');
        return;
    }

    lastPermissionTime = now;
    permissionCount++;

    console.log(`[PermissionListener] ✓ Permission granted (source: ${source}, count: ${permissionCount})`);

    // Registrar en stats tracker
    if (statsTracker && statsTracker.trackPermissionGrant) {
        statsTracker.trackPermissionGrant({
            source: source,
            timestamp: new Date().toISOString(),
            count: permissionCount
        });
    } else {
        console.log('[PermissionListener] WARNING: statsTracker.trackPermissionGrant not available');
    }
}

/**
 * Monitorear archivo flag de permisos
 */
function watchPermissionFile(context) {
    try {
        // Crear directorio si no existe
        const dir = path.dirname(PERMISSION_FLAG);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Crear archivo inicial
        if (!fs.existsSync(PERMISSION_FLAG)) {
            fs.writeFileSync(PERMISSION_FLAG, '0');
        }

        // Monitorear cambios
        const watcher = fs.watch(PERMISSION_FLAG, (eventType) => {
            if (eventType === 'change') {
                console.log('[PermissionListener] Permission flag file changed');
                trackPermission('permission_file');
            }
        });

        context.subscriptions.push({
            dispose: () => watcher.close()
        });

        console.log('[PermissionListener] File watcher active:', PERMISSION_FLAG);
    } catch (e) {
        console.log('[PermissionListener] File watcher failed:', e.message);
    }
}

/**
 * Interceptar mensajes de información
 */
function interceptInformationMessages(context) {
    // Este método es experimental - intenta capturar notificaciones
    // que contengan palabras clave relacionadas con permisos

    const keywords = ['allow', 'accept', 'grant', 'permit', 'authorized'];

    // Sobrescribir vscode.window.showInformationMessage
    const originalShowInfo = vscode.window.showInformationMessage;

    vscode.window.showInformationMessage = function (...args) {
        const message = args[0] ? args[0].toString().toLowerCase() : '';

        // Detectar si mensaje contiene palabras clave
        if (keywords.some(keyword => message.includes(keyword))) {
            console.log('[PermissionListener] Information message detected:', message.substring(0, 50));
            // No trackear aquí para evitar falsos positivos
            // Solo logear para debugging
        }

        return originalShowInfo.apply(this, args);
    };
}

/**
 * Función helper para que external code pueda notificar permisos manualmente
 */
function notifyPermissionGranted(context) {
    trackPermission('manual_notification');
}

module.exports = {
    activate,
    notifyPermissionGranted,
    trackPermission
};

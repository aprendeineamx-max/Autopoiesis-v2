const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let autoExportEnabled = true;
let debounceTimer = null;
let outputChannel = null;

/**
 * Command ID correcto para export (confirmado via grep search)
 * Fuente: ANTIGRAVITY_COMMANDS.txt, Deep_API_Tester
 */
const EXPORT_COMMAND_ID = 'antigravity.exportChatNow';

/**
 * Fallbacks si el principal falla
 */
const FALLBACK_COMMANDS = [
    'antigravity.ghostAgent.exportChat',  // De AntiGravity_Internal_Hook
    'workbench.action.exportConversation',
    'antigravity.exportConversation'
];

let pollingInterval = null;
let lastExportTime = 0;
const POLLING_INTERVAL_MS = 10000; // 10 segundos
const DEBOUNCE_TIME_MS = 3000; // 3 segundos después del último cambio

function activate(context) {
    outputChannel = vscode.window.createOutputChannel('Auto Exporter');
    outputChannel.appendLine('✅ Auto Exporter Extension Activated');
    outputChannel.appendLine('🤖 Modo AUTOMÁTICO: Export se dispara cada 10s si hay actividad');

    // Comando manual para trigger export
    const triggerCommand = vscode.commands.registerCommand(
        'antigravity-auto-exporter.triggerExport',
        triggerExport
    );

    // Comando para toggle auto-export
    const toggleCommand = vscode.commands.registerCommand(
        'antigravity-auto-exporter.toggleAutoExport',
        toggleAutoExport
    );

    context.subscriptions.push(triggerCommand, toggleCommand);

    // Iniciar polling automático
    if (autoExportEnabled) {
        startAutomaticPolling();
        outputChannel.appendLine('✅ Polling automático iniciado (cada 10s)');
    }

    // Intentar encontrar el command ID correcto
    findCorrectExportCommand();

    outputChannel.appendLine('🎯 Sistema listo: Exports automáticos SIN intervención manual');
}

/**
 * Inicia el polling automático para detectar actividad de chat
 */
function startAutomaticPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }

    pollingInterval = setInterval(() => {
        if (!autoExportEnabled) {
            return;
        }

        // Verificar si ha pasado suficiente tiempo desde el último export
        const now = Date.now();
        if (now - lastExportTime < DEBOUNCE_TIME_MS) {
            return; // Muy pronto desde el último export
        }

        // Verificar si la ventana está activa (hay actividad)
        if (vscode.window.state.focused) {
            outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] 🔄 Polling: Ventana activa, triggerando export...`);
            triggerExport(); // Assuming triggerExportAutomatic should call the existing triggerExport
        }
    }, POLLING_INTERVAL_MS);
}

/**
 * Detener polling automático
 */
function stopAutomaticPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        outputChannel.appendLine('⏸️ Polling automático detenido');
    }
}

/**
 * Intenta encontrar el command ID correcto para export
 */
async function findCorrectExportCommand() {
    outputChannel.appendLine('🔎 Buscando command ID correcto para export...');

    // Obtener TODOS los comandos disponibles
    const allCommands = await vscode.commands.getCommands();

    // Filtrar comandos que contengan "export" y "chat" o "conversation"
    const exportCommands = allCommands.filter(cmd =>
    (cmd.toLowerCase().includes('export') &&
        (cmd.toLowerCase().includes('chat') || cmd.toLowerCase().includes('conversation')))
    );

    outputChannel.appendLine(`\n📋 Comandos de export encontrados (${exportCommands.length}):`);
    exportCommands.forEach(cmd => {
        outputChannel.appendLine(`   - ${cmd}`);
    });

    if (exportCommands.length > 0) {
        outputChannel.appendLine(`\n✅ Usando: ${exportCommands[0]}`);
        return exportCommands[0];
    }

    outputChannel.appendLine('\n⚠️ No se encontró command específico, probando lista predefinida...');
    return null;
}

/**
 * Trigger export automático (llamado por polling)
 */
async function triggerExportAutomatic() {
    lastExportTime = Date.now();

    try {
        outputChannel.appendLine(`   📤 Ejecutando: ${EXPORT_COMMAND_ID}`);
        await vscode.commands.executeCommand(EXPORT_COMMAND_ID);
        outputChannel.appendLine(`   ✅ Export exitoso (automático)`);

        // No mostrar notification para exports automáticos (sería molesto)
        // vscode.window.showInformationMessage('✅ Chat exportado automáticamente');
    } catch (error) {
        outputChannel.appendLine(`   ⚠️ Export automático falló: ${error.message}`);
        // Intentar con fallbacks solo si el principal falla
        await tryFallbackCommands();
    }
}

/**
 * Intentar comandos fallback
 */
async function tryFallbackCommands() {
    for (const fallback of FALLBACK_COMMANDS) {
        try {
            outputChannel.appendLine(`   📤 Probando fallback: ${fallback}`);
            await vscode.commands.executeCommand(fallback);
            outputChannel.appendLine(`   ✅ Éxito con fallback: ${fallback}`);
            return;
        } catch (error) {
            // Continue to next fallback
        }
    }

    outputChannel.appendLine(`   ❌ Todos los comandos fallaron`);
}

/**
 * Detecta activity de chat y programa export
 */
function onChatActivity() {
    if (!autoExportEnabled) {
        return;
    }

    // Clear timer anterior
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    // Configurar nuevo timer
    const debounceTime = vscode.workspace.getConfiguration('autoExporter').get('debounceTime', 2000);

    debounceTimer = setTimeout(() => {
        outputChannel.appendLine('⏰ Debounce time reached, triggering export...');
        triggerExport();
    }, debounceTime);
}

/**
 * Triggerea el export automáticamente
 */
async function triggerExport() {
    outputChannel.appendLine('\n🚀 Triggering export...');

    // Método 1: Intentar comandos conocidos
    for (const commandId of POSSIBLE_EXPORT_COMMANDS) {
        try {
            outputChannel.appendLine(`   Probando: ${commandId}`);
            await vscode.commands.executeCommand(commandId);
            outputChannel.appendLine(`   ✅ Éxito con: ${commandId}`);

            vscode.window.showInformationMessage(`Export triggered: ${commandId}`);
            return;
        } catch (error) {
            // Silently continue to next command
        }
    }

    // Método 2: Buscar dinámicamente
    const correctCommand = await findCorrectExportCommand();
    if (correctCommand) {
        try {
            await vscode.commands.executeCommand(correctCommand);
            outputChannel.appendLine(`   ✅ Éxito con comando encontrado: ${correctCommand}`);
            vscode.window.showInformationMessage(`Export triggered: ${correct Command}`);
            return;
        } catch (error) {
            outputChannel.appendLine(`   ❌ Error: ${ error.message } `);
        }
    }
    
    // Método 3: Simular keybindings (fallback)
    outputChannel.appendLine('⚠️ No se pudo ejecutar comando, intentando keybinding...');
    
    // Si no funciona, mostrar instrucciones al usuario
    const result = await vscode.window.showWarningMessage(
        'No se pudo triggear export automáticamente. ¿Qué prefieres?',
        'Abrir Menu',
        'Ver Command ID',
        'Cancelar'
    );
    
    if (result === 'Abrir Menu') {
        outputChannel.appendLine('📋 Usuario abrirá menu manualmente');
        vscode.window.showInformationMessage(
            'Por favor abre: Menu → Customizations → Export\nEl monitor guardará el backup automáticamente.'
        );
    } else if (result === 'Ver Command ID') {
        // Abrir Command Palette con filtro "export"
        await vscode.commands.executeCommand('workbench.action.showCommands');
        outputChannel.appendLine('📋 Command Palette abierto para búsqueda manual');
    }
}

/**
 * Toggle auto-export on/off
 */
function toggleAutoExport() {
    autoExportEnabled = !autoExportEnabled;
    
    if (autoExportEnabled) {
        startAutomaticPolling();
        outputChannel.appendLine(`\n✅ Auto Export ENABLED - Polling iniciado`);
        vscode.window.showInformationMessage('✅ Auto Export ACTIVADO - Exports cada 10s');
    } else {
        stopAutomaticPolling();
        outputChannel.appendLine(`\n⏸️ Auto Export DISABLED - Polling detenido`);
        vscode.window.showInformationMessage('⏸️ Auto Export DESACTIVADO');
    }
}

function deactivate() {
    stopAutomaticPolling();
    
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    
    if (outputChannel) {
        outputChannel.appendLine('🛑 Auto Exporter Extension Deactivated');
        outputChannel.dispose();
    }
}

module.exports = {
    activate,
    deactivate
};

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

function activate(context) {
    outputChannel = vscode.window.createOutputChannel('Auto Exporter');
    outputChannel.appendLine('✅ Auto Exporter Extension Activated');

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

    // Detectar cambios en archivos (como proxy para mensajes)
    const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');

    fileWatcher.onDidChange((uri) => {
        // Si es un archivo de Antigravity que indica actividad de chat
        if (uri.path.includes('chat') || uri.path.includes('conversation')) {
            onChatActivity();
        }
    });

    context.subscriptions.push(fileWatcher);

    // Intentar encontrar el command ID correcto
    findCorrectExportCommand();

    outputChannel.appendLine('🔍 Monitoring chat activity...');
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
    
    deb​ounceTimer = setTimeout(() => {
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
    
    const status = autoExportEnabled ? 'ENABLED' : 'DISABLED';
    outputChannel.appendLine(`\n🔄 Auto Export ${ status } `);
    
    vscode.window.showInformationMessage(`Auto Export ${ status } `);
}

function deactivate() {
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

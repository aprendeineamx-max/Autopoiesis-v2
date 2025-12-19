/**
 * ANTIGRAVITY API EXPLORER
 * 
 * Extensión para descubrir y documentar todas las APIs disponibles en Antigravity IDE.
 * Investiga APIs estándar de VS Code y APIs propietarias de Antigravity.
 */

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let outputChannel = null;
const discoveries = {
    vscodeAPIs: {},
    customAPIs: {},
    chatAPIs: {},
    globalObjects: [],
    networkCalls: []
};

function activate(context) {
    console.log('[API Explorer] Activating...');

    outputChannel = vscode.window.createOutputChannel('API Explorer');
    outputChannel.show();

    log('API Explorer activated');
    log('Starting automatic API discovery...');

    // Comando principal
    const exploreCmd = vscode.commands.registerCommand('apiExplorer.exploreAPIs', async () => {
        await exploreAllAPIs();
    });

    // Comando para test de chat
    const testChatCmd = vscode.commands.registerCommand('apiExplorer.testChatAPI', async () => {
        await testChatAPIs();
    });

    // Comando para exportar reporte
    const exportCmd = vscode.commands.registerCommand('apiExplorer.exportReport', async () => {
        await exportReport();
    });

    context.subscriptions.push(exploreCmd, testChatCmd, exportCmd);

    // Auto-exploración al activar
    setTimeout(() => exploreAllAPIs(), 2000);
}

async function exploreAllAPIs() {
    log('\n========================================');
    log('STARTING API EXPLORATION');
    log('========================================\n');

    // 1. Explorar namespace vscode
    exploreVSCodeNamespace();

    // 2. Buscar APIs custom de Antigravity
    exploreCustomAPIs();

    // 3. Explorar objetos globales (del window/global)
    exploreGlobalObjects();

    // 4. Test específicos de Chat
    await testChatAPIs();

    // 5. Mostrar resumen
    showSummary();

    vscode.window.showInformationMessage('API exploration complete! Check output channel.');
}

function exploreVSCodeNamespace() {
    log('--- VS Code Namespace ---');

    const namespaces = [
        'commands', 'window', 'workspace', 'extensions',
        'languages', 'debug', 'tasks', 'env', 'authentication',
        'chat', 'lm', 'ai' // Posibles APIs de AI/Chat
    ];

    namespaces.forEach(ns => {
        try {
            const api = vscode[ns];
            if (api) {
                log(`✓ vscode.${ns} - AVAILABLE`);
                discoveries.vscodeAPIs[ns] = {
                    available: true,
                    methods: Object.keys(api).filter(k => typeof api[k] === 'function'),
                    properties: Object.keys(api).filter(k => typeof api[k] !== 'function')
                };

                // Detalles de métodos
                log(`  Methods: ${discoveries.vscodeAPIs[ns].methods.join(', ')}`);
                log(`  Properties: ${discoveries.vscodeAPIs[ns].properties.join(', ')}`);
            } else {
                log(`✗ vscode.${ns} - NOT AVAILABLE`);
                discoveries.vscodeAPIs[ns] = { available: false };
            }
        } catch (e) {
            log(`✗ vscode.${ns} - ERROR: ${e.message}`);
            discoveries.vscodeAPIs[ns] = { available: false, error: e.message };
        }
    });

    log('');
}

function exploreCustomAPIs() {
    log('--- Custom Antigravity APIs ---');

    // Buscar propiedades custom en vscode
    const customProps = Object.keys(vscode).filter(key => {
        return !['commands', 'window', 'workspace', 'extensions', 'languages',
            'debug', 'tasks', 'env', 'authentication', 'Uri', 'Range',
            'Position', 'Selection', 'TextEdit', 'WorkspaceEdit',
            'SnippetString', 'CompletionItem', 'CodeLens', 'Diagnostic',
            'Location', 'Hover', 'DocumentHighlight', 'SymbolInformation',
            'CodeAction', 'CodeActionKind', 'Comment', 'CommentThread',
            'FileSystemError', 'FoldingRange', 'CancellationTokenSource',
            'Progress', 'EventEmitter', 'Disposable', 'ThemeIcon',
            'TreeItem', 'TreeItemCollapsibleState', 'QuickInputButtons',
            'ProgressLocation', 'StatusBarAlignment', 'TextEditorRevealType',
            'OverviewRulerLane', 'DecorationRangeBehavior', 'EndOfLine',
            'FileType', 'FilePermission', 'ConfigurationTarget'].includes(key);
    });

    if (customProps.length > 0) {
        log('Custom properties found:');
        customProps.forEach(prop => {
            log(`  ⚡ vscode.${prop} - ${typeof vscode[prop]}`);
            discoveries.customAPIs[prop] = {
                type: typeof vscode[prop],
                keys: typeof vscode[prop] === 'object' ? Object.keys(vscode[prop]) : null
            };

            if (typeof vscode[prop] === 'object') {
                log(`     Keys: ${Object.keys(vscode[prop]).join(', ')}`);
            }
        });
    } else {
        log('No custom properties detected');
    }

    log('');
}

function exploreGlobalObjects() {
    log('--- Global Objects (via globalThis) ---');

    // Solo en contexto de extension host, no tenemos acceso a window del webview
    // Pero podemos explorar el contexto global de Node.js

    const globalKeys = Object.keys(globalThis).filter(key => {
        return key.toLowerCase().includes('antigravity') ||
            key.toLowerCase().includes('chat') ||
            key.toLowerCase().includes('ai') ||
            key.toLowerCase().includes('assistant');
    });

    if (globalKeys.length > 0) {
        log('Relevant global objects found:');
        globalKeys.forEach(key => {
            log(`  🌐 ${key} - ${typeof globalThis[key]}`);
            discoveries.globalObjects.push({
                name: key,
                type: typeof globalThis[key]
            });
        });
    } else {
        log('No relevant global objects found');
    }

    log('');
}

async function testChatAPIs() {
    log('--- Testing Chat APIs ---');

    // Test 1: vscode.chat
    if (vscode.chat) {
        log('✓ vscode.chat exists');
        log(`  Type: ${typeof vscode.chat}`);
        log(`  Keys: ${Object.keys(vscode.chat).join(', ')}`);

        discoveries.chatAPIs.vscodeChat = {
            available: true,
            keys: Object.keys(vscode.chat)
        };

        // Intentar usar API
        try {
            if (vscode.chat.sendMessage) {
                log('  ⚡ vscode.chat.sendMessage exists - attempting call...');
                // No llamar realmente para no enviar mensaje
                discoveries.chatAPIs.sendMessageAvailable = true;
            }

            if (vscode.chat.onDidReceiveMessage) {
                log('  ⚡ vscode.chat.onDidReceiveMessage exists - can listen to messages');
                discoveries.chatAPIs.receiveMessageAvailable = true;
            }
        } catch (e) {
            log(`  Error testing chat methods: ${e.message}`);
        }
    } else {
        log('✗ vscode.chat does not exist');
        discoveries.chatAPIs.vscodeChat = { available: false };
    }

    // Test 2: vscode.lm (Language Model API - nueva en VS Code)
    if (vscode.lm) {
        log('✓ vscode.lm exists (Language Model API)');
        log(`  Keys: ${Object.keys(vscode.lm).join(', ')}`);

        discoveries.chatAPIs.vscodeLM = {
            available: true,
            keys: Object.keys(vscode.lm)
        };
    } else {
        log('✗ vscode.lm does not exist');
    }

    // Test 3: vscode.ai (si existe)
    if (vscode.ai) {
        log('✓ vscode.ai exists');
        log(`  Keys: ${Object.keys(vscode.ai).join(', ')}`);

        discoveries.chatAPIs.vscodeAI = {
            available: true,
            keys: Object.keys(vscode.ai)
        };
    } else {
        log('✗ vscode.ai does not exist');
    }

    // Test 4: Buscar en window (si estuviéramos en webview context)
    log('\nNote: Cannot access window.chat from extension context');
    log('Need to inject script into webview to explore window.chat');

    log('');
}

function showSummary() {
    log('\n========================================');
    log('SUMMARY');
    log('========================================\n');

    const vscodeCount = Object.keys(discoveries.vscodeAPIs).filter(
        k => discoveries.vscodeAPIs[k].available
    ).length;

    log(`VS Code APIs found: ${vscodeCount}`);
    log(`Custom APIs found: ${Object.keys(discoveries.customAPIs).length}`);
    log(`Global objects found: ${discoveries.globalObjects.length}`);
    log(`Chat APIs available: ${Object.keys(discoveries.chatAPIs).length}`);

    log('\n--- Chat API Status ---');
    if (discoveries.chatAPIs.vscodeChat?.available) {
        log('✓ vscode.chat is AVAILABLE');
    } else {
        log('✗ vscode.chat is NOT available');
    }

    if (discoveries.chatAPIs.vscodeLM?.available) {
        log('✓ vscode.lm (Language Model) is AVAILABLE');
    } else {
        log('✗ vscode.lm is NOT available');
    }

    log('\n');
}

async function exportReport() {
    const reportContent = generateMarkdownReport();

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }

    const reportPath = path.join(workspaceFolder.uri.fsPath, 'ANTIGRAVITY_API_REPORT.md');

    try {
        fs.writeFileSync(reportPath, reportContent);
        log(`Report exported to: ${reportPath}`);
        vscode.window.showInformationMessage(`API Report exported to workspace root`);

        // Abrir el archivo
        const doc = await vscode.workspace.openTextDocument(reportPath);
        await vscode.window.showTextDocument(doc);
    } catch (e) {
        log(`Error exporting report: ${e.message}`);
        vscode.window.showErrorMessage(`Failed to export report: ${e.message}`);
    }
}

function generateMarkdownReport() {
    let md = '# Antigravity API Exploration Report\n\n';
    md += `**Generated:** ${new Date().toISOString()}\n\n`;
    md += '---\n\n';

    // VS Code APIs
    md += '## VS Code Standard APIs\n\n';
    for (const [ns, data] of Object.entries(discoveries.vscodeAPIs)) {
        if (data.available) {
            md += `### vscode.${ns}\n\n`;
            md += `**Status:** ✅ Available\n\n`;
            if (data.methods?.length > 0) {
                md += `**Methods:** ${data.methods.join(', ')}\n\n`;
            }
            if (data.properties?.length > 0) {
                md += `**Properties:** ${data.properties.join(', ')}\n\n`;
            }
        } else {
            md += `### vscode.${ns}\n**Status:** ❌ Not Available\n\n`;
        }
    }

    // Custom APIs
    md += '## Custom Antigravity APIs\n\n';
    if (Object.keys(discoveries.customAPIs).length > 0) {
        for (const [name, data] of Object.entries(discoveries.customAPIs)) {
            md += `### ${name}\n`;
            md += `**Type:** ${data.type}\n`;
            if (data.keys) {
                md += `**Keys:** ${data.keys.join(', ')}\n`;
            }
            md += '\n';
        }
    } else {
        md += 'No custom APIs detected.\n\n';
    }

    // Chat APIs
    md += '## Chat & AI APIs\n\n';
    if (discoveries.chatAPIs.vscodeChat?.available) {
        md += '### vscode.chat\n**Status:** ✅ Available\n';
        md += `**Methods:** ${discoveries.chatAPIs.vscodeChat.keys.join(', ')}\n\n`;
    } else {
        md += '### vscode.chat\n**Status:** ❌ Not Available\n\n';
    }

    if (discoveries.chatAPIs.vscodeLM?.available) {
        md += '### vscode.lm (Language Model)\n**Status:** ✅ Available\n';
        md += `**Methods:** ${discoveries.chatAPIs.vscodeLM.keys.join(', ')}\n\n`;
    }

    // Global Objects
    md += '## Global Objects\n\n';
    if (discoveries.globalObjects.length > 0) {
        for (const obj of discoveries.globalObjects) {
            md += `- **${obj.name}** (${obj.type})\n`;
        }
    } else {
        md += 'No relevant global objects found.\n';
    }

    md += '\n---\n\n';
    md += '## Next Steps\n\n';
    md += '1. Test each Chat API method\n';
    md += '2. Explore network traffic for API calls\n';
    md += '3. Inspect Antigravity source code (if available)\n';
    md += '4. Document use cases for each API\n';

    return md;
}

function log(message) {
    outputChannel.appendLine(message);
    console.log(`[API Explorer] ${message}`);
}

function deactivate() {
    log('API Explorer deactivated');
}

module.exports = {
    activate,
    deactivate
};

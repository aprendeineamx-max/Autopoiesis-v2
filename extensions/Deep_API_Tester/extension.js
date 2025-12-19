/**
 * DEEP API TESTER
 * 
 * Investigación profunda de APIs custom de Antigravity
 * Focus: Cascade, UnifiedStateSync, Chat access
 */

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let outputChannel = null;
const findings = {
    cascade: {},
    stateSync: {},
    chatAccess: {},
    events: []
};

function activate(context) {
    console.log('[Deep Tester] Activating...');

    outputChannel = vscode.window.createOutputChannel('Deep API Tester');
    outputChannel.show();

    log('Deep API Tester activated');
    log('Target APIs: Cascade, UnifiedStateSync, Chat\n');

    // Comandos
    context.subscriptions.push(
        vscode.commands.registerCommand('deepTester.testCascade', () => testCascadeAPIs()),
        vscode.commands.registerCommand('deepTester.testStateSync', () => testStateSyncAPIs()),
        vscode.commands.registerCommand('deepTester.testChatAccess', () => testChatAccessAPIs()),
        vscode.commands.registerCommand('deepTester.exportFindings', () => exportFindings())
    );

    // Auto-start comprehensive test
    setTimeout(() => runComprehensiveTests(), 2000);
}

async function runComprehensiveTests() {
    log('========================================');
    log('STARTING COMPREHENSIVE API TESTS');
    log('========================================\n');

    await testCascadeAPIs();
    await testStateSyncAPIs();
    await testChatAccessAPIs();

    showSummary();
}

// ============================================
// TESTE TESTE TESTE
// ============================================

async function testCascadeAPIs() {
    log('\n--- Testing vscode.Cascade ---');

    if (!vscode.Cascade) {
        log('✗ vscode.Cascade NOT AVAILABLE');
        findings.cascade.available = false;
        return;
    }

    log('✓ vscode.Cascade AVAILABLE');
    findings.cascade.available = true;
    findings.cascade.methods = Object.keys(vscode.Cascade).filter(k => typeof vscode.Cascade[k] === 'function');
    findings.cascade.properties = Object.keys(vscode.Cascade).filter(k => typeof vscode.Cascade[k] !== 'function');

    log(`  Methods: ${findings.cascade.methods.join(', ')}`);
    log(`  Properties: ${findings.cascade.properties.join(', ')}`);

    // Test getFocusState
    try {
        const focusState = await vscode.Cascade.getFocusState();
        log(`  getFocusState() returned: ${JSON.stringify(focusState)}`);
        findings.cascade.focusState = focusState;
    } catch (e) {
        log(`  getFocusState() error: ${e.message}`);
    }

    // Test getCascadeStarterPrompts
    try {
        const prompts = await vscode.Cascade.getCascadeStarterPrompts();
        log(`  getCascadeStarterPrompts() returned: ${JSON.stringify(prompts)}`);
        findings.cascade.starterPrompts = prompts;
    } catch (e) {
        log(`  getCascadeStarterPrompts() error: ${e.message}`);
    }

    // Registrar event listeners
    try {
        if (vscode.Cascade.onDidRequestNextHunk) {
            vscode.Cascade.onDidRequestNextHunk((data) => {
                log(`  [EVENT] onDidRequestNextHunk: ${JSON.stringify(data)}`);
                findings.events.push({ event: 'onDidRequestNextHunk', data: data, timestamp: new Date() });
            });
            log('  ✓ Listener registered: onDidRequestNextHunk');
        }

        if (vscode.Cascade.onDidRequestAcceptAllInFile) {
            vscode.Cascade.onDidRequestAcceptAllInFile((data) => {
                log(`  [EVENT] onDidRequestAcceptAllInFile: ${JSON.stringify(data)}`);
                findings.events.push({ event: 'onDidRequestAcceptAllInFile', data: data, timestamp: new Date() });
            });
            log('  ✓ Listener registered: onDidRequestAcceptAllInFile');
        }
    } catch (e) {
        log(`  Error registering listeners: ${e.message}`);
    }

    log('');
}

async function testStateSyncAPIs() {
    log('\n--- Testing vscode.antigravityUnifiedStateSync ---');

    if (!vscode.antigravityUnifiedStateSync) {
        log('✗ vscode.antigravityUnifiedStateSync NOT AVAILABLE');
        findings.stateSync.available = false;
        return;
    }

    log('✓ vscode.antigravityUnifiedStateSync AVAILABLE');
    findings.stateSync.available = true;
    findings.stateSync.methods = Object.keys(vscode.antigravityUnifiedStateSync).filter(
        k => typeof vscode.antigravityUnifiedStateSync[k] === 'function'
    );

    log(`  Methods: ${findings.stateSync.methods.join(', ')}`);

    // Test subscribe
    try {
        // Intentar suscribirse a topic de test
        const testTopic = 'deep_api_test';

        vscode.antigravityUnifiedStateSync.subscribe(testTopic, (update) => {
            log(`  [STATE SYNC] Update received on '${testTopic}': ${JSON.stringify(update)}`);
            findings.stateSync.receivedUpdates = findings.stateSync.receivedUpdates || [];
            findings.stateSync.receivedUpdates.push({ topic: testTopic, update: update, timestamp: new Date() });
        });

        log(`  ✓ Subscribed to topic: '${testTopic}'`);

        // Intentar push update
        setTimeout(async () => {
            try {
                await vscode.antigravityUnifiedStateSync.pushUpdate({
                    topic: testTopic,
                    payload: {
                        test: true,
                        message: 'Deep API Tester - Estado de prueba',
                        timestamp: new Date().toISOString()
                    }
                });
                log(`  ✓ Pushed update to '${testTopic}'`);
            } catch (e) {
                log(`  ✗ Error pushing update: ${e.message}`);
            }
        }, 1000);

        // Intentar suscribirse a topics comunes
        const commonTopics = ['chat', 'cascade', 'messages', 'agent', 'settings', 'ui'];

        commonTopics.forEach(topic => {
            try {
                vscode.antigravityUnifiedStateSync.subscribe(topic, (update) => {
                    log(`  [STATE SYNC] Update on '${topic}': ${JSON.stringify(update).substring(0, 200)}...`);
                    findings.stateSync.topicUpdates = findings.stateSync.topicUpdates || {};
                    findings.stateSync.topicUpdates[topic] = findings.stateSync.topicUpdates[topic] || [];
                    findings.stateSync.topicUpdates[topic].push({ update: update, timestamp: new Date() });
                });
                log(`  ✓ Listening to topic: '${topic}'`);
            } catch (e) {
                log(`  ✗ Failed to subscribe to '${topic}': ${e.message}`);
            }
        });

    } catch (e) {
        log(`  Error testing subscribe: ${e.message}`);
    }

    // Test initIPCSubscription
    try {
        if (vscode.antigravityUnifiedStateSync.initIPCSubscription) {
            await vscode.antigravityUnifiedStateSync.initIPCSubscription();
            log('  ✓ IPC Subscription initialized');
        }
    } catch (e) {
        log(`  initIPCSubscription error: ${e.message}`);
    }

    log('');
}

async function testChatAccessAPIs() {
    log('\n--- Testing Chat Message Access ---');

    // Test 1: vscode.chat APIs
    if (vscode.chat) {
        log('Testing vscode.chat providers...');

        // Intentar registrar session content provider
        try {
            const provider = {
                provideChatSessionContent(session) {
                    log(`  [CHAT PROVIDER] Session: ${JSON.stringify(session)}`);
                    findings.chatAccess.sessionData = session;
                    return null;
                }
            };

            vscode.chat.registerChatSessionContentProvider(provider);
            log('  ✓ ChatSessionContentProvider registered');
        } catch (e) {
            log(`  ChatSessionContentProvider error: ${e.message}`);
        }

        // Test onDidDisposeChatSession
        try {
            vscode.chat.onDidDisposeChatSession((session) => {
                log(`  [CHAT] Session disposed: ${JSON.stringify(session)}`);
                findings.chatAccess.disposedSessions = findings.chatAccess.disposedSessions || [];
                findings.chatAccess.disposedSessions.push(session);
            });
            log('  ✓ Listening to onDidDisposeChatSession');
        } catch (e) {
            log(`  onDidDisposeChatSession error: ${e.message}`);
        }
    }

    // Test 2: vscode.interactive
    if (vscode.interactive) {
        log('\nTesting vscode.interactive...');
        findings.chatAccess.interactive = {
            available: true,
            methods: Object.keys(vscode.interactive)
        };
        log(`  Methods: ${findings.chatAccess.interactive.methods.join(', ')}`);

        // Investigar transferActiveChat
        if (vscode.interactive.transferActiveChat) {
            log('  transferActiveChat exists - signature investigation needed');
            log(`  Type: ${typeof vscode.interactive.transferActiveChat}`);
        }
    }

    // Test 3: Buscar en workspace para tab de chat
    try {
        const tabs = vscode.window.tabGroups.all.flatMap(group => group.tabs);
        const chatTabs = tabs.filter(tab => {
            const input = tab.input;
            return input && (
                input.constructor.name.includes('Chat') ||
                (input.uri && input.uri.scheme === 'chat')
            );
        });

        if (chatTabs.length > 0) {
            log(`\n  Found ${chatTabs.length} chat tab(s):`);
            chatTabs.forEach((tab, i) => {
                log(`    Tab ${i + 1}: ${tab.label}, Input type: ${tab.input?.constructor.name}`);
                findings.chatAccess.chatTabs = findings.chatAccess.chatTabs || [];
                findings.chatAccess.chatTabs.push({
                    label: tab.label,
                    inputType: tab.input?.constructor.name
                });
            });
        } else {
            log('\n  No chat tabs currently open');
        }
    } catch (e) {
        log(`  Error searching tabs: ${e.message}`);
    }

    // Test 4: Buscar en AntigravityFiles
    if (vscode.AntigravityFiles) {
        log('\nTesting vscode.AntigravityFiles...');

        try {
            vscode.AntigravityFiles.onDidDragToCascade((data) => {
                log(`  [FILES] Drag to Cascade: ${JSON.stringify(data)}`);
                findings.chatAccess.dragEvents = findings.chatAccess.dragEvents || [];
                findings.chatAccess.dragEvents.push(data);
            });
            log('  ✓ Listening to onDidDragToCascade');
        } catch (e) {
            log(`  onDidDragToCascade error: ${e.message}`);
        }
    }

    log('');
}

function showSummary() {
    log('\n========================================');
    log('SUMMARY OF FINDINGS');
    log('========================================\n');

    log('Cascade API:');
    log(`  Available: ${findings.cascade.available ? 'YES' : 'NO'}`);
    if (findings.cascade.available) {
        log(`  Methods tested: ${findings.cascade.methods?.length || 0}`);
        log(`  Focus state: ${findings.cascade.focusState ? 'Retrieved' : 'Not available'}`);
    }

    log('\nUnifiedStateSync API:');
    log(`  Available: ${findings.stateSync.available ? 'YES' : 'NO'}`);
    if (findings.stateSync.available) {
        log(`  Subscriptions active: ${Object.keys(findings.stateSync.topicUpdates || {}).length}`);
    }

    log('\nChat Access:');
    log(`  Interactive API: ${findings.chatAccess.interactive?.available ? 'YES' : 'NO'}`);
    log(`  Chat tabs found: ${findings.chatAccess.chatTabs?.length || 0}`);

    log('\nEvents captured: ' + findings.events.length);

    log('\n========================================');
    log('Keep extension running to capture events');
    log('Use chat normally and watch for updates');
    log('========================================\n');
}

async function exportFindings() {
    const report = generateDetailedReport();

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }

    const reportPath = path.join(workspaceFolder.uri.fsPath, 'DEEP_API_FINDINGS.md');

    try {
        fs.writeFileSync(reportPath, report);
        log(`Detailed findings exported to: ${reportPath}`);
        vscode.window.showInformationMessage('Deep API findings exported!');

        const doc = await vscode.workspace.openTextDocument(reportPath);
        await vscode.window.showTextDocument(doc);
    } catch (e) {
        log(`Error exporting: ${e.message}`);
    }
}

function generateDetailedReport() {
    let md = '# Deep API Investigation - Detailed Findings\n\n';
    md += `**Generated:** ${new Date().toISOString()}\n\n`;
    md += '---\n\n';

    // Cascade
    md += '## vscode.Cascade\n\n';
    if (findings.cascade.available) {
        md += '**Status:** ✅ Available\n\n';
        md += `**Methods:**\n${findings.cascade.methods?.map(m => `- ${m}`).join('\n')}\n\n`;
        if (findings.cascade.focusState) {
            md += `**Focus State:**\n\`\`\`json\n${JSON.stringify(findings.cascade.focusState, null, 2)}\n\`\`\`\n\n`;
        }
        if (findings.cascade.starterPrompts) {
            md += `**Starter Prompts:**\n\`\`\`json\n${JSON.stringify(findings.cascade.starterPrompts, null, 2)}\n\`\`\`\n\n`;
        }
    } else {
        md += '**Status:** ❌ Not Available\n\n';
    }

    // State Sync
    md += '## vscode.antigravityUnifiedStateSync\n\n';
    if (findings.stateSync.available) {
        md += '**Status:** ✅ Available\n\n';
        md += `**Methods:**\n${findings.stateSync.methods?.map(m => `- ${m}`).join('\n')}\n\n`;

        if (findings.stateSync.topicUpdates) {
            md += '**Topic Updates Captured:**\n';
            Object.entries(findings.stateSync.topicUpdates).forEach(([topic, updates]) => {
                md += `\n### Topic: \`${topic}\`\n`;
                md += `Updates captured: ${updates.length}\n\n`;
                if (updates.length > 0) {
                    md += '**Sample:**\n```json\n' + JSON.stringify(updates[0].update, null, 2) + '\n```\n\n';
                }
            });
        }
    }

    // Chat Access
    md += '## Chat Message Access\n\n';
    md += `**Interactive API:** ${findings.chatAccess.interactive?.available ? '✅ Available' : '❌ Not Available'}\n`;
    if (findings.chatAccess.chatTabs) {
        md += `**Chat tabs found:** ${findings.chatAccess.chatTabs.length}\n\n`;
        findings.chatAccess.chatTabs.forEach((tab, i) => {
            md += `${i + 1}. ${tab.label} (${tab.inputType})\n`;
        });
    }

    // Events
    md += '\n## Events Captured\n\n';
    md += `Total events: ${findings.events.length}\n\n`;
    if (findings.events.length > 0) {
        md += '**Event Log:**\n';
        findings.events.forEach(evt => {
            md += `- **${evt.event}** at ${evt.timestamp.toISOString()}\n`;
            md += `  \`\`\`json\n  ${JSON.stringify(evt.data, null, 2)}\n  \`\`\`\n\n`;
        });
    }

    return md;
}

function log(message) {
    outputChannel.appendLine(message);
    console.log(`[Deep Tester] ${message}`);
}

function deactivate() {
    log('Deep API Tester deactivated');
}

module.exports = {
    activate,
    deactivate
};

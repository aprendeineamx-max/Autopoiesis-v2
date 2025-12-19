const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let outputChannel;
let eventListeners = [];
let isMonitoring = false;
let eventLog = [];

function activate(context) {
    outputChannel = vscode.window.createOutputChannel('Deep API Tester - Simple');
    outputChannel.show();
    log('✅ Deep API Tester ACTIVATED SUCCESSFULLY\n');

    // Command 1: Run all basic tests
    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.runAllDeepTests', async () => {
            await runBasicTests();
        })
    );

    // Command 2: Start event monitoring
    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.startMonitoring', async () => {
            await startEventMonitoring();
        })
    );

    // Command 3: Stop event monitoring
    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.stopMonitoring', () => {
            stopEventMonitoring();
        })
    );

    // Command 4: Show event log
    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.showEventLog', () => {
            showEventLog();
        })
    );

    // Command 5: Export findings
    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.exportFindings', () => {
            exportFindings();
        })
    );

    log('Commands registered:');
    log('  • Tester: Run ALL Deep Tests');
    log('  • Tester: Start Event Monitoring');
    log('  • Tester: Stop Event Monitoring');
    log('  • Tester: Show Event Log');
    log('  • Tester: Export Findings\n');
}

async function runBasicTests() {
    log('\n================================================');
    log('   RUNNING BASIC TESTS');
    log('================================================\n');

    // Test 1: Cascade
    if (vscode.Cascade) {
        log('=== Cascade API Test ===');
        try {
            const state = await vscode.Cascade.getFocusState();
            log(`✅ Panel visible: ${state.isVisible}`);
            log(`✅ Panel focused: ${state.isFocused}`);
            log('');
        } catch (e) {
            log(`❌ Error: ${e.message}\n`);
        }
    } else {
        log('❌ Cascade API not available\n');
    }

    // Test 2: transferActiveChat
    if (vscode.interactive?.transferActiveChat) {
        log('=== transferActiveChat Test ===');
        const fn = vscode.interactive.transferActiveChat;
        log(`✅ Function found`);
        log(`   Name: ${fn.name}`);
        log(`   Params: ${fn.length}`);
        log(`   Type: ${fn.constructor.name}`);
        log('');
    } else {
        log('❌ transferActiveChat not available\n');
    }

    log('✅ BASIC TESTS COMPLETE\n');
}

async function startEventMonitoring() {
    if (isMonitoring) {
        log('⚠️  Monitoring already active\n');
        return;
    }

    log('\n================================================');
    log('   STARTING EVENT MONITORING');
    log('================================================\n');

    if (!vscode.Cascade) {
        log('❌ Cascade API not available\n');
        return;
    }

    isMonitoring = true;
    eventLog = [];

    log('🎯 Registering event listeners...\n');

    // Listener 1: onDidRequestAcceptAllInFile
    if (vscode.Cascade.onDidRequestAcceptAllInFile) {
        const listener1 = vscode.Cascade.onDidRequestAcceptAllInFile((data) => {
            logEvent('onDidRequestAcceptAllInFile', data);
        });
        eventListeners.push(listener1);
        log('✅ Listener: onDidRequestAcceptAllInFile');
    }

    // Listener 2: onDidExpandSuggestionPanel
    if (vscode.Cascade.onDidExpandSuggestionPanel) {
        const listener2 = vscode.Cascade.onDidExpandSuggestionPanel((data) => {
            logEvent('onDidExpandSuggestionPanel', data);
        });
        eventListeners.push(listener2);
        log('✅ Listener: onDidExpandSuggestionPanel');
    }

    // Listener 3: onDidStopStreaming
    if (vscode.Cascade.onDidStopStreaming) {
        const listener3 = vscode.Cascade.onDidStopStreaming((data) => {
            logEvent('onDidStopStreaming', data);
        });
        eventListeners.push(listener3);
        log('✅ Listener: onDidStopStreaming');
    }

    // Listener 4: State change polling
    const statePoller = setInterval(async () => {
        if (!isMonitoring) {
            clearInterval(statePoller);
            return;
        }

        try {
            const state = await vscode.Cascade.getFocusState();
            const timestamp = new Date().toISOString();

            // Only log if state changed
            const lastState = eventLog.length > 0 ? eventLog[eventLog.length - 1].data : null;
            if (!lastState ||
                lastState.isVisible !== state.isVisible ||
                lastState.isFocused !== state.isFocused) {

                eventLog.push({
                    timestamp,
                    event: 'STATE_CHANGE',
                    data: state
                });

                log(`[${timestamp}] STATE_CHANGE:`);
                log(`  visible: ${state.isVisible}, focused: ${state.isFocused}`);
            }
        } catch (e) {
            log(`❌ State polling error: ${e.message}`);
        }
    }, 1000);

    log(`\n🎧 MONITORING ACTIVE`);
    log(`📊 Events captured: ${eventLog.length}`);
    log(`\n⚡ Now use the chat and watch for events!\n`);
}

function stopEventMonitoring() {
    if (!isMonitoring) {
        log('⚠️  Monitoring not active\n');
        return;
    }

    log('\n================================================');
    log('   STOPPING EVENT MONITORING');
    log('================================================\n');

    // Dispose all listeners
    eventListeners.forEach(listener => listener.dispose());
    eventListeners = [];
    isMonitoring = false;

    log(`✅ Monitoring stopped`);
    log(`📊 Total events captured: ${eventLog.length}\n`);
}

function showEventLog() {
    log('\n================================================');
    log('   EVENT LOG');
    log('================================================\n');

    if (eventLog.length === 0) {
        log('No events captured yet.\n');
        log('Start monitoring first with: "Tester: Start Event Monitoring"\n');
        return;
    }

    log(`Total events: ${eventLog.length}\n`);

    eventLog.forEach((entry, index) => {
        log(`--- Event ${index + 1} ---`);
        log(`Time: ${entry.timestamp}`);
        log(`Type: ${entry.event}`);
        log(`Data: ${JSON.stringify(entry.data, null, 2)}`);
        log('');
    });
}

function exportFindings() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) {
        log('❌ No workspace folder found\n');
        return;
    }

    const exportPath = path.join(workspaceFolder, 'CASCADE_EVENT_LOG.json');

    const exportData = {
        timestamp: new Date().toISOString(),
        totalEvents: eventLog.length,
        events: eventLog,
        summary: {
            monitoring: isMonitoring,
            listenersActive: eventListeners.length
        }
    };

    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

    log('\n✅ Findings exported to:');
    log(`   ${exportPath}\n`);
}

function logEvent(eventName, data) {
    const timestamp = new Date().toISOString();

    eventLog.push({
        timestamp,
        event: eventName,
        data: data
    });

    log(`\n🔔 [${timestamp}] ${eventName}`);
    log(`Data: ${JSON.stringify(data, null, 2)}\n`);
}

function log(message) {
    outputChannel.appendLine(message);
    console.log(`[Deep Tester] ${message}`);
}

function deactivate() {
    stopEventMonitoring();
    log('Deep API Tester deactivated');
}

module.exports = { activate, deactivate };

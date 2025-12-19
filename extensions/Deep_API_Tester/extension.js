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

    // Command 6: Introspect Cascade
    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.introspectCascade', () => {
            introspectCascade();
        })
    );

    // Command 7: Test getCascadeStarterPrompts
    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.testStarterPrompts', async () => {
            await testStarterPrompts();
        })
    );

    // Command 8: Test transferActiveChat deep
    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.testTransferChat', async () => {
            await testTransferActiveChat();
        })
    );

    // Command 9: Introspect vscode.interactive namespace
    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.introspectInteractive', () => {
            introspectInteractiveNamespace();
        })
    );

    log('Commands registered:');
    log('  • Tester: Run ALL Deep Tests');
    log('  • Tester: Start Event Monitoring');
    log('  • Tester: Stop Event Monitoring');
    log('  • Tester: Show Event Log');
    log('  • Tester: Export Findings');
    log('  • Tester: Introspect Cascade');
    log('  • Tester: Test Starter Prompts ⭐');
    log('  • Tester: Test Transfer Chat ⭐');
    log('  • Tester: Introspect Interactive Namespace ⭐⭐\n');
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

async function testStarterPrompts() {
    log('\n================================================');
    log('   TESTING getCascadeStarterPrompts()');
    log('================================================\n');

    if (!vscode.Cascade?.getCascadeStarterPrompts) {
        log('❌ getCascadeStarterPrompts not available\n');
        return;
    }

    try {
        log('🔍 Calling getCascadeStarterPrompts()...\n');
        const prompts = await vscode.Cascade.getCascadeStarterPrompts();

        log(`✅ Result type: ${typeof prompts}`);
        log(`✅ Is array: ${Array.isArray(prompts)}`);

        if (prompts) {
            log(`✅ Length: ${prompts.length || 'N/A'}`);
            log(`\nFull result:\n${JSON.stringify(prompts, null, 2)}\n`);
        } else {
            log('⚠️  Returned null/undefined\n');
        }

    } catch (e) {
        log(`❌ Error: ${e.message}`);
        log(`Stack: ${e.stack}\n`);
    }
}

async function testTransferActiveChat() {
    log('\n================================================');
    log('   DEEP TEST: transferActiveChat()');
    log('================================================\n');

    if (!vscode.interactive?.transferActiveChat) {
        log('❌ transferActiveChat not available\n');
        return;
    }

    const fn = vscode.interactive.transferActiveChat;

    log('📋 Function Analysis:');
    log(`   Name: ${fn.name}`);
    log(`   Params: ${fn.length}`);
    log(`   Constructor: ${fn.constructor.name}`);
    log(`   String: ${fn.toString().substring(0, 200)}...\n`);

    // Test cases
    const testCases = [
        { name: 'null', value: null },
        { name: 'undefined', value: undefined },
        { name: 'empty object', value: {} },
        { name: 'panel object', value: { panel: 'cascade' } },
        { name: 'uri object', value: { uri: vscode.window.activeTextEditor?.document.uri } },
    ];

    log('🧪 Running parameter tests...\n');

    for (const test of testCases) {
        log(`--- Test: ${test.name} ---`);
        try {
            const result = await fn(test.value);
            log(`✅ Success! Result type: ${typeof result}`);
            if (result) {
                log(`Result: ${JSON.stringify(result, null, 2)}`);
            }
        } catch (e) {
            log(`❌ Error: ${e.message}`);
        }
        log('');
    }

    log('✅ TRANSFER CHAT TESTS COMPLETE\n');
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

    log('🎯 Registering ALL event listeners...\n');

    // Register ALL discovered events
    const events = [
        'onDidRequestNextHunk',
        'onDidRequestPreviousHunk',
        'onDidRequestAcceptAllInFile',
        'onDidRequestRejectAllInFile'
    ];

    events.forEach(eventName => {
        if (vscode.Cascade[eventName]) {
            const listener = vscode.Cascade[eventName]((data) => {
                logEvent(eventName, data);
            });
            eventListeners.push(listener);
            log(`✅ Listener: ${eventName}`);
        }
    });

    // State change polling
    const statePoller = setInterval(async () => {
        if (!isMonitoring) {
            clearInterval(statePoller);
            return;
        }

        try {
            const state = await vscode.Cascade.getFocusState();
            const timestamp = new Date().toISOString();

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
    log(`\n⚡ Now use the chat and accept code suggestions!\n`);
}

function stopEventMonitoring() {
    if (!isMonitoring) {
        log('⚠️  Monitoring not active\n');
        return;
    }

    log('\n================================================');
    log('   STOPPING EVENT MONITORING');
    log('================================================\n');

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

function introspectCascade() {
    log('\n================================================');
    log('   CASCADE API INTROSPECTION');
    log('================================================\n');

    if (!vscode.Cascade) {
        log('❌ Cascade API not available\n');
        return;
    }

    log('🔍 Discovering all properties and methods...\n');

    const ownProps = Object.getOwnPropertyNames(vscode.Cascade);
    log(`=== Own Properties (${ownProps.length}) ===`);
    ownProps.forEach(prop => {
        const value = vscode.Cascade[prop];
        const type = typeof value;
        log(`  • ${prop}: ${type}`);
    });
    log('');

    const proto = Object.getPrototypeOf(vscode.Cascade);
    if (proto) {
        const protoProps = Object.getOwnPropertyNames(proto);
        log(`=== Prototype Properties (${protoProps.length}) ===`);
        protoProps.forEach(prop => {
            try {
                const value = proto[prop];
                const type = typeof value;
                log(`  • ${prop}: ${type}`);
            } catch (e) {
                log(`  • ${prop}: [error accessing]`);
            }
        });
        log('');
    }

    const allKeys = Object.keys(vscode.Cascade);
    log(`=== Enumerable Keys (${allKeys.length}) ===`);
    allKeys.forEach(key => {
        const value = vscode.Cascade[key];
        const type = typeof value;
        log(`  • ${key}: ${type}`);
    });
    log('');

    log('=== Event Listeners (onDid*) ===');
    const allProps = [...new Set([...ownProps, ...Object.keys(vscode.Cascade)])];
    const eventProps = allProps.filter(prop => prop.startsWith('onDid'));

    if (eventProps.length === 0) {
        log('  ❌ No onDid* event properties found');
    } else {
        eventProps.forEach(prop => {
            const exists = typeof vscode.Cascade[prop] === 'function';
            log(`  ${exists ? '✅' : '❌'} ${prop}`);
        });
    }
    log('');

    log('=== Methods ===');
    const methods = allProps.filter(prop => typeof vscode.Cascade[prop] === 'function');
    methods.forEach(method => {
        log(`  ✅ ${method}()`);
    });
    log('');

    log('✅ INTROSPECTION COMPLETE\n');
}

function introspectInteractiveNamespace() {
    log('\n================================================');
    log('   VSCODE.INTERACTIVE INTROSPECTION');
    log('================================================\n');

    if (!vscode.interactive) {
        log('❌ vscode.interactive not available\n');
        return;
    }

    log('🔍 Discovering ALL properties and methods...\n');

    // Get all own properties
    const ownProps = Object.getOwnPropertyNames(vscode.interactive);
    log(`=== Own Properties (${ownProps.length}) ===`);
    ownProps.forEach(prop => {
        try {
            const value = vscode.interactive[prop];
            const type = typeof value;
            log(`  • ${prop}: ${type}`);
        } catch (e) {
            log(`  • ${prop}: [error: ${e.message}]`);
        }
    });
    log('');

    // Get prototype properties
    const proto = Object.getPrototypeOf(vscode.interactive);
    if (proto) {
        const protoProps = Object.getOwnPropertyNames(proto);
        log(`=== Prototype Properties (${protoProps.length}) ===`);
        protoProps.forEach(prop => {
            try {
                const value = proto[prop];
                const type = typeof value;
                log(`  • ${prop}: ${type}`);
            } catch (e) {
                log(`  • ${prop}: [error accessing]`);
            }
        });
        log('');
    }

    // Get enumerable keys
    const allKeys = Object.keys(vscode.interactive);
    log(`=== Enumerable Keys (${allKeys.length}) ===`);
    allKeys.forEach(key => {
        try {
            const value = vscode.interactive[key];
            const type = typeof value;
            log(`  • ${key}: ${type}`);
        } catch (e) {
            log(`  • ${key}: [error: ${e.message}]`);
        }
    });
    log('');

    // Try to call each function with minimal params
    log('=== Function Call Tests ===');
    const allProps = [...new Set([...ownProps, ...allKeys])];
    const functions = allProps.filter(prop => {
        try {
            return typeof vscode.interactive[prop] === 'function';
        } catch {
            return false;
        }
    });

    functions.forEach(fnName => {
        log(`\n--- Testing: ${fnName}() ---`);

        if (fnName === 'transferActiveChat') {
            log('⚠️  Skipping (requires API proposal)');
            return;
        }

        try {
            const fn = vscode.interactive[fnName];
            log(`Params: ${fn.length}`);

            // Only test if no params required
            if (fn.length === 0) {
                const result = fn();
                log(`✅ Called successfully`);
                log(`Result type: ${typeof result}`);

                if (result && typeof result.then === 'function') {
                    log('⏳ Returns Promise...');
                    result.then(r => {
                        log(`Promise resolved: ${JSON.stringify(r)}`);
                    }).catch(e => {
                        log(`Promise rejected: ${e.message}`);
                    });
                } else if (result) {
                    log(`Result: ${JSON.stringify(result, null, 2)}`);
                }
            } else {
                log('⚠️  Requires parameters, skipping call');
            }
        } catch (e) {
            log(`❌ Error: ${e.message}`);
        }
    });

    log('\n✅ INTERACTIVE INTROSPECTION COMPLETE\n');
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

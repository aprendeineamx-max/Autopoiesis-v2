/**
 * DEEP API TESTER - PHASE 1B/1C FUNCTIONS
 * 
 * Tests profundos de:
 * - Cascade panel control
 * - transferActiveChat investigation  
 * - WebView access attempts
 */

// Context will be injected from main extension
let vscode, log, findings, writeDiscoveriesToFile;

function setContext(context) {
    vscode = context.vscode;
    log = context.log;
    findings = context.findings;
    writeDiscoveriesToFile = context.writeDiscoveriesToFile;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// FASE 1B: DEEP CASCADE TESTING
// ============================================

async function deepCascadeTesting() {
    log('\n========================================');
    log('FASE 1B: DEEP CASCADE TESTING');
    log('========================================\n');

    if (!vscode.Cascade) {
        log('❌ CASCADE NOT AVAILABLE');
        return;
    }

    const deepFindings = {
        panelControl: {},
        hiddenProperties: {},
        eventData: {},
        setCascadeBarState: {}
    };

    // TEST 1: Panel Control
    log('--- Test 1: Panel Control ---');
    try {
        log('Initial state...');
        const initialState = await vscode.Cascade.getFocusState();
        log(`  ${JSON.stringify(initialState)}`);

        // Close panel
        log('\nClosing panel...');
        await vscode.Cascade.closePanel();
        await sleep(500);
        const closedState = await vscode.Cascade.getFocusState();
        log(`  ${JSON.stringify(closedState)}`);
        deepFindings.panelControl.canClose = closedState.isVisible === false;

        // Open panel
        log('\nOpening panel...');
        await vscode.Cascade.openPanel();
        await sleep(500);
        const openedState = await vscode.Cascade.getFocusState();
        log(`  ${JSON.stringify(openedState)}`);
        deepFindings.panelControl.canOpen = openedState.isVisible === true;

        // Toggle panel  
        log('\nToggling panel...');
        await vscode.Cascade.togglePanel();
        await sleep(500);
        const toggledState = await vscode.Cascade.getFocusState();
        log(`  ${JSON.stringify(toggledState)}`);
        deepFindings.panelControl.canToggle = true;

        // Restore original state
        if (initialState.isVisible) {
            await vscode.Cascade.openPanel();
        }

        log('\n✅ Panel Control: WORKING');
        log(`  Can open: ${deepFindings.panelControl.canOpen}`);
        log(`  Can close: ${deepFindings.panelControl.canClose}`);
        log(`  Can toggle: ${deepFindings.panelControl.canToggle}`);

    } catch (e) {
        log(`❌ Panel Control Error: ${e.message}`);
        deepFindings.panelControl.error = e.message;
    }

    // TEST 2: Explore ALL properties (including hidden)
    log('\n--- Test 2: Hidden Properties Exploration ---');
    try {
        const allKeys = Object.getOwnPropertyNames(vscode.Cascade);
        const prototypeKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(vscode.Cascade) || {});
        const symbolKeys = Object.getOwnPropertySymbols(vscode.Cascade);

        log(`  Total properties: ${allKeys.length}`);
        log(`  Prototype properties: ${prototypeKeys.length}`);
        log(`  Symbol properties: ${symbolKeys.length}`);

        // Check for undocumented properties
        const documented = ['setCascadeBarState', 'onDidRequestNextHunk', 'onDidRequestPreviousHunk',
            'onDidRequestAcceptAllInFile', 'onDidRequestRejectAllInFile',
            'openPanel', 'closePanel', 'togglePanel', 'getFocusState',
            'getCascadeStarterPrompts'];

        const undocumented = allKeys.filter(k => !documented.includes(k));

        if (undocumented.length > 0) {
            log(`\n  🔍 UNDOCUMENTED properties found: ${undocumented.length}`);
            undocumented.forEach(prop => {
                const type = typeof vscode.Cascade[prop];
                log(`    - ${prop} (${type})`);
                deepFindings.hiddenProperties[prop] = { type };
            });
        } else {
            log('  No undocumented properties found');
        }

    } catch (e) {
        log(`  Error exploring properties: ${e.message}`);
    }

    // TEST 3: setCascadeBarState experimentation
    log('\n--- Test 3: setCascadeBarState Parameters ---');
    try {
        // Try different parameter combinations
        const testCases = [
            { visible: true },
            { visible: false },
            { focused: true },
            { visible: true, focused: true },
            { state: 'open' },
            { state: 'closed' },
            {}
        ];

        let workingParams = [];

        for (const params of testCases) {
            try {
                await vscode.Cascade.setCascadeBarState(params);
                log(`  ✓ Params accepted: ${JSON.stringify(params)}`);
                workingParams.push(params);
                await sleep(200);
            } catch (e) {
                log(`  ✗ Params rejected: ${JSON.stringify(params)} - ${e.message}`);
            }
        }

        deepFindings.setCascadeBarState.workingParams = workingParams;

    } catch (e) {
        log(`  Error testing setCascadeBarState: ${e.message}`);
    }

    // TEST 4: Event data deep inspection
    log('\n--- Test 4: Event Data Deep Inspection ---');
    log('  Registering enhanced event listeners...');

    if (vscode.Cascade.onDidRequestAcceptAllInFile) {
        vscode.Cascade.onDidRequestAcceptAllInFile((data) => {
            // Log ALL properties of the event data
            log('\n  [DEEP EVENT] onDidRequestAcceptAllInFile triggered');
            log(`    Raw data type: ${typeof data}`);
            log(`    Constructor: ${data?.constructor?.name}`);

            if (data) {
                const allProps = Object.getOwnPropertyNames(data);
                log(`    Properties count: ${allProps.length}`);

                allProps.forEach(prop => {
                    const value = data[prop];
                    const type = typeof value;
                    log(`      - ${prop}: ${type} = ${JSON.stringify(value).substring(0, 100)}`);
                });

                // Check for nested objects
                if (data.uri) {
                    log(`    URI object properties:`);
                    Object.keys(data.uri).forEach(key => {
                        log(`      - uri.${key}: ${JSON.stringify(data.uri[key])}`);
                    });
                }
            }

            deepFindings.eventData.acceptAllInFile = deepFindings.eventData.acceptAllInFile || [];
            deepFindings.eventData.acceptAllInFile.push({
                data,
                timestamp: new Date(),
                allProperties: data ? Object.getOwnPropertyNames(data) : []
            });
        });

        log('  ✓ Enhanced listener registered');
        log('  Trigger some AI suggestions to see deep event data...');
    }

    // Save findings
    findings.deepCascade = deepFindings;
    writeDiscoveriesToFile();

    log('\n========================================');
    log('DEEP CASCADE TESTING COMPLETE');
    log('Generate AI suggestions to capture event data');
    log('========================================\n');
}

// ============================================
// FASE 1C: TRANSFER ACTIVE CHAT INVESTIGATION
// ============================================

async function testTransferActiveChat() {
    log('\n========================================');
    log('FASE 1C: TRANSFERACTIVECHAT INVESTIGATION');
    log('========================================\n');

    if (!vscode.interactive || !vscode.interactive.transferActiveChat) {
        log('❌ transferActiveChat NOT AVAILABLE');
        return;
    }

    const transferFindings = {
        functionInfo: {},
        testResults: []
    };

    // TEST 1: Function Inspection
    log('--- Test 1: Function Signature Inspection ---');
    try {
        const fn = vscode.interactive.transferActiveChat;

        transferFindings.functionInfo.type = typeof fn;
        transferFindings.functionInfo.name = fn.name;
        transferFindings.functionInfo.length = fn.length; // Number of params
        transferFindings.functionInfo.isAsync = fn.constructor.name === 'AsyncFunction';

        log(`  Function name: ${fn.name}`);
        log(`  Parameter count: ${fn.length}`);
        log(`  Is async: ${transferFindings.functionInfo.isAsync}`);

        // Try to get function source (may be native)
        try {
            const fnString = fn.toString();
            if (!fnString.includes('[native code]')) {
                log(`  Function source (first 200 chars):`);
                log(`    ${fnString.substring(0, 200)}...`);
                transferFindings.functionInfo.source = fnString;
            } else {
                log(`  Function is NATIVE CODE`);
                transferFindings.functionInfo.isNative = true;
            }
        } catch (e) {
            log(`  Could not get function source`);
        }

    } catch (e) {
        log(`  Error inspecting function: ${e.message}`);
    }

    // TEST 2: Call with different parameters
    log('\n--- Test 2: Parameter Testing ---');

    const testCases = [
        { name: 'No params', params: [] },
        { name: 'Null', params: [null] },
        { name: 'Undefined', params: [undefined] },
        { name: 'Empty object', params: [{}] },
        { name: 'Empty string', params: [''] },
        { name: 'Target object with sessionId', params: [{ sessionId: 'test' }] },
        { name: 'Target object with uri', params: [{ uri: vscode.Uri.parse('untitled:test') }] },
        { name: 'Target object with panel', params: [{ panel: 'test' }] },
    ];

    for (const testCase of testCases) {
        try {
            log(`\n  Testing: ${testCase.name}`);
            log(`    Params: ${JSON.stringify(testCase.params)}`);

            const result = await vscode.interactive.transferActiveChat(...testCase.params);

            log(`    ✓ Success!`);
            log(`    Result type: ${typeof result}`);
            log(`    Result: ${JSON.stringify(result, null, 2)}`);

            transferFindings.testResults.push({
                testCase: testCase.name,
                params: testCase.params,
                success: true,
                result
            });

        } catch (e) {
            log(`    ✗ Error: ${e.message}`);

            // Extract useful info from error
            const errorInfo = {
                message: e.message,
                stack: e.stack?.split('\n')[0]
            };

            // Look for hints in error message
            if (e.message.includes('Expected')) {
                log(`    🔍 Error hints at expected parameter type`);
            }
            if (e.message.includes('argument')) {
                log(`    🔍 Error mentions arguments`);
            }

            transferFindings.testResults.push({
                testCase: testCase.name,
                params: testCase.params,
                success: false,
                error: errorInfo
            });
        }

        await sleep(200);
    }

    // Save findings
    findings.transferActiveChat = transferFindings;
    writeDiscoveriesToFile();

    log('\n========================================');
    log('TRANSFERACTIVECHAT INVESTIGATION COMPLETE');
    log('========================================\n');
}

// ============================================
// FASE 1C (alt): WEBVIEW ACCESS TESTING
// ============================================

async function testWebViewAccess() {
    log('\n========================================');
    log('WEBVIEW/DOM ACCESS INVESTIGATION');
    log('========================================\n');

    const webviewFindings = {
        panels: [],
        webviews: [],
        chatPanelFound: false
    };

    // TEST 1: Search for chat webview panels
    log('--- Test 1: Searching for Chat WebView ---');

    try {
        // Check if we can access extension context webview panels
        // (This usually requires the panel to be created by our extension)

        // Try to find Cascade/Chat panel via VS Code APIs
        const windows = vscode.window.state;
        log(`  Window state available: ${!!windows}`);

        // Check for any accessible webviews
        // Note: We typically can't access webviews created by other extensions
        log('  Attempting to enumerate accessible panels...');

        // This is a limitation test - we likely won't find the chat panel
        log('  ⚠️  LIMITATION: Extensions typically cannot access');
        log('     webviews created by other extensions or core VS Code');

        webviewFindings.limitation = 'Cannot access webviews from core VS Code or other extensions';

    } catch (e) {
        log(`  Error: ${e.message}`);
    }

    // TEST 2: Check for alternative DOM access methods
    log('\n--- Test 2: Alternative Access Methods ---');

    try {
        // Check if we can inject scripts via extension-specific APIs
        log('  Checking Antigravity-specific APIs for webview access...');

        // Look for any Antigravity APIs that might give us access
        const antigravityAPIs = Object.keys(vscode).filter(k =>
            k.toLowerCase().includes('antigravity') ||
            k.toLowerCase().includes('cascade')
        );

        log(`  Found ${antigravityAPIs.length} Antigravity-related APIs:`);
        antigravityAPIs.forEach(api => {
            log(`    - vscode.${api}`);

            // Check if any have webview-related methods
            const obj = vscode[api];
            if (obj && typeof obj === 'object') {
                const methods = Object.keys(obj).filter(k =>
                    k.toLowerCase().includes('webview') ||
                    k.toLowerCase().includes('panel') ||
                    k.toLowerCase().includes('view')
                );

                if (methods.length > 0) {
                    log(`      WebView-related methods: ${methods.join(', ')}`);
                    webviewFindings.potentialAccessPoints = webviewFindings.potentialAccessPoints || [];
                    webviewFindings.potentialAccessPoints.push({
                        api,
                        methods
                    });
                }
            }
        });

    } catch (e) {
        log(`  Error: ${e.message}`);
    }

    // TEST 3: Fallback strategy documentation
    log('\n--- Test 3: Fallback Strategies ---');
    log('  If direct webview access impossible, alternatives:');
    log('    1. File system monitoring (if chat saves to disk)');
    log('    2. Process monitoring (if chat uses external process)');
    log('    3. User-mediated: Dashboard displays message for user to copy');
    log('    4. VSCode Commands: Use executeCommand to control chat');

    // Save findings
    findings.webviewAccess = webviewFindings;
    writeDiscoveriesToFile();

    log('\n========================================');
    log('WEBVIEW ACCESS INVESTIGATION COMPLETE');
    log('========================================\n');
}

// ============================================
// RUN ALL DEEP TESTS
// ============================================

async function runAllDeepTests() {
    log('\n\n');
    log('================================================');
    log('   RUNNING ALL DEEP TESTS (PHASE 1B + 1C)');
    log('================================================\n');

    await deepCascadeTesting();
    await testTransferActiveChat();
    await testWebViewAccess();

    log('\n\n================================================');
    log('   ALL DEEP TESTS COMPLETE');
    log('================================================');
    log('\nCheck API_DISCOVERIES.json for full findings\n');
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Export functions
module.exports = {
    setContext,
    deepCascadeTesting,
    testTransferActiveChat,
    testWebViewAccess,
    runAllDeepTests,
    sleep
};

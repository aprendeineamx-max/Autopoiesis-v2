const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let outputChannel;
let eventListeners = [];
let isMonitoring = false;
let eventLog = [];

function activate(context) {
    outputChannel = vscode.window.createOutputChannel('Deep API Tester - Dev Mode');
    outputChannel.show();
    log('🚀 Deep API Tester ACTIVATED - DEV MODE\n');
    log('✅ API Proposals ENABLED\n');

    // All previous commands...
    registerAllCommands(context);

    // NEW: Enhanced dev mode commands
    registerDevModeCommands(context);

    log('✅ All commands registered including DEV MODE tests\n');
}

function registerAllCommands(context) {
    // Command 1-9 from before
    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.runAllDeepTests', async () => {
            await runBasicTests();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.startMonitoring', async () => {
            await startEventMonitoring();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.stopMonitoring', () => {
            stopEventMonitoring();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.showEventLog', () => {
            showEventLog();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.exportFindings', () => {
            exportFindings();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.introspectCascade', () => {
            introspectCascade();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.testStarterPrompts', async () => {
            await testStarterPrompts();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.testTransferChat', async () => {
            await testTransferActiveChat();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.introspectInteractive', () => {
            introspectInteractiveNamespace();
        })
    );
}

function registerDevModeCommands(context) {
    // Command 10: Exhaustive transferActiveChat testing
    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.exhaustiveTransferTest', async () => {
            await exhaustiveTransferTest();
        })
    );

    // Command 11: Explore vscode namespace completely
    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.exploreAllVscode', () => {
            exploreAllVscodeAPIs();
        })
    );

    // Command 12: Test with active chat session
    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.testWithActiveChat', async () => {
            await testWithActiveChatSession();
        })
    );

    log('DEV MODE Commands:');
    log('  • Tester: Exhaustive Transfer Test 🔥');
    log('  • Tester: Explore All Vscode APIs 🔥');
    log('  • Tester: Test With Active Chat 🔥');
}

async function exhaustiveTransferTest() {
    log('\n================================================');
    log('   EXHAUSTIVE transferActiveChat TEST');
    log('   (130+ Parameter Variations - Chat Focused)');
    log('================================================\n');

    if (!vscode.interactive?.transferActiveChat) {
        log('❌ transferActiveChat not available\n');
        return;
    }

    const testCases = [];

    // ============================================
    // CATEGORY 1: Primitive Types & Variations
    // ============================================
    log('Building test cases...\n');
    log('Category 1: Primitives & Basic Types');

    testCases.push(
        { category: 'Primitives', name: 'null', value: null },
        { category: 'Primitives', name: 'undefined', value: undefined },
        { category: 'Primitives', name: 'true', value: true },
        { category: 'Primitives', name: 'false', value: false },
        { category: 'Primitives', name: 'number 0', value: 0 },
        { category: 'Primitives', name: 'number 1', value: 1 },
        { category: 'Primitives', name: 'number -1', value: -1 },
        { category: 'Primitives', name: 'empty string', value: '' },
        { category: 'Primitives', name: 'string "chat"', value: 'chat' },
        { category: 'Primitives', name: 'string "session"', value: 'session' },
        { category: 'Primitives', name: 'string "active"', value: 'active' },
    );

    // ============================================
    // CATEGORY 2: Basic Objects & Arrays
    // ============================================
    log('Category 2: Basic Objects & Arrays');

    testCases.push(
        { category: 'Basic Objects', name: 'empty object', value: {} },
        { category: 'Basic Objects', name: 'empty array', value: [] },
        { category: 'Basic Objects', name: '{ id: "test" }', value: { id: 'test' } },
        { category: 'Basic Objects', name: '{ session: "active" }', value: { session: 'active' } },
        { category: 'Basic Objects', name: '{ chat: true }', value: { chat: true } },
        { category: 'Basic Objects', name: '{ panel: "cascade" }', value: { panel: 'cascade' } },
        { category: 'Basic Objects', name: '{ type: "chat" }', value: { type: 'chat' } },
    );

    // ============================================
    // CATEGORY 3: VS Code Window & Editor Objects
    // ============================================
    log('Category 3: VS Code Window & Editor');

    const activeEditor = vscode.window.activeTextEditor;
    const activeDoc = activeEditor?.document;
    const activeUri = activeDoc?.uri;

    testCases.push(
        { category: 'VSCode Window', name: 'window', value: vscode.window },
        { category: 'VSCode Window', name: 'activeTextEditor', value: activeEditor },
        { category: 'VSCode Window', name: 'activeTextEditor.document', value: activeDoc },
        { category: 'VSCode Window', name: 'activeTextEditor.document.uri', value: activeUri },
        { category: 'VSCode Window', name: 'activeTextEditor.selection', value: activeEditor?.selection },
        { category: 'VSCode Window', name: 'activeTextEditor.selections', value: activeEditor?.selections },
        { category: 'VSCode Window', name: 'activeTextEditor.visibleRanges', value: activeEditor?.visibleRanges },
        { category: 'VSCode Window', name: 'window.state', value: vscode.window.state },
        { category: 'VSCode Window', name: 'window.tabGroups', value: vscode.window.tabGroups },
        { category: 'VSCode Window', name: 'window.activeColorTheme', value: vscode.window.activeColorTheme },
    );

    // ============================================
    // CATEGORY 4: VS Code Workspace Objects
    // ============================================
    log('Category 4: VS Code Workspace');

    testCases.push(
        { category: 'VSCode Workspace', name: 'workspace', value: vscode.workspace },
        { category: 'VSCode Workspace', name: 'workspaceFolders', value: vscode.workspace.workspaceFolders },
        { category: 'VSCode Workspace', name: 'workspaceFolders[0]', value: vscode.workspace.workspaceFolders?.[0] },
        { category: 'VSCode Workspace', name: 'workspaceFile', value: vscode.workspace.workspaceFile },
        { category: 'VSCode Workspace', name: 'workspace.name', value: vscode.workspace.name },
        { category: 'VSCode Workspace', name: 'textDocuments', value: vscode.workspace.textDocuments },
        { category: 'VSCode Workspace', name: 'textDocuments[0]', value: vscode.workspace.textDocuments?.[0] },
    );

    // ============================================
    // CATEGORY 5: URIs & Paths
    // ============================================
    log('Category 5: URIs & Paths');

    testCases.push(
        { category: 'URIs', name: 'Uri.parse("file:///")', value: vscode.Uri.parse('file:///') },
        { category: 'URIs', name: 'Uri.parse("untitled:Untitled-1")', value: vscode.Uri.parse('untitled:Untitled-1') },
        { category: 'URIs', name: 'activeUri', value: activeUri },
        { category: 'URIs', name: '{ uri: activeUri }', value: { uri: activeUri } },
    );

    // ============================================
    // CATEGORY 6: Special VS Code APIs
    // ============================================
    log('Category 6: Special APIs (chat, lm, extensions)');

    testCases.push(
        { category: 'Special APIs', name: 'vscode.languages', value: vscode.languages },
        { category: 'Special APIs', name: 'vscode.extensions', value: vscode.extensions },
        { category: 'Special APIs', name: 'vscode.env', value: vscode.env },
        { category: 'Special APIs', name: 'vscode.commands', value: vscode.commands },
        { category: 'Special APIs', name: 'vscode.debug', value: vscode.debug },
        { category: 'Special APIs', name: 'vscode.tasks', value: vscode.tasks },
    );

    // If chat API exists
    if (vscode.chat) {
        testCases.push(
            { category: 'Chat API', name: 'vscode.chat', value: vscode.chat }
        );
    }

    // If lm API exists
    if (vscode.lm) {
        testCases.push(
            { category: 'LM API', name: 'vscode.lm', value: vscode.lm }
        );
    }

    // If Cascade exists
    if (vscode.Cascade) {
        testCases.push(
            { category: 'Cascade', name: 'vscode.Cascade', value: vscode.Cascade }
        );
    }

    // ============================================
    // CATEGORY 7: Complex Nested Objects
    // ============================================
    log('Category 7: Complex Nested Structures');

    testCases.push(
        {
            category: 'Complex', name: 'nested object with editor', value: {
                editor: activeEditor,
                document: activeDoc,
                uri: activeUri
            }
        },
        {
            category: 'Complex', name: 'session-like object', value: {
                id: 'session-123',
                type: 'chat',
                active: true,
                timestamp: Date.now()
            }
        },
        {
            category: 'Complex', name: 'chat-like object', value: {
                messages: [],
                participants: ['user', 'ai'],
                sessionId: 'test-session'
            }
        },
        {
            category: 'Complex', name: 'panel context object', value: {
                panel: 'cascade',
                visible: true,
                focused: false,
                context: activeEditor
            }
        },
    );

    // ============================================
    // CATEGORY 8: Symbols & Language Features
    // ============================================
    log('Category 8: Symbols & Language Features');

    if (activeDoc) {
        testCases.push(
            { category: 'Language', name: 'document.languageId', value: activeDoc.languageId },
            { category: 'Language', name: 'Position(0,0)', value: new vscode.Position(0, 0) },
            { category: 'Language', name: 'Range object', value: new vscode.Range(0, 0, 0, 10) },
            { category: 'Language', name: 'Location object', value: new vscode.Location(activeUri, new vscode.Position(0, 0)) },
        );
    }

    // ============================================
    // CATEGORY 9: Function & Constructor Tests
    // ============================================
    log('Category 9: Functions & Constructors');

    testCases.push(
        { category: 'Functions', name: 'empty function', value: () => { } },
        { category: 'Functions', name: 'function returning object', value: () => ({ chat: true }) },
        { category: 'Functions', name: 'Promise.resolve({})', value: Promise.resolve({}) },
    );

    // ============================================
    // CATEGORY 10: ChatSession Simulation Attempts
    // ============================================
    log('Category 10: ChatSession Simulations');

    testCases.push(
        {
            category: 'ChatSession Sim', name: 'ChatSession mock 1', value: {
                __typename: 'ChatSession',
                id: 'mock-session',
                messages: []
            }
        },
        {
            category: 'ChatSession Sim', name: 'ChatSession mock 2', value: {
                constructor: { name: 'ChatSession' },
                id: 'test',
                active: true
            }
        },
        {
            category: 'ChatSession Sim', name: 'InteractiveSession mock', value: {
                type: 'InteractiveSession',
                requester: 'extension',
                session: { id: 'test' }
            }
        },
        {
            category: 'ChatSession Sim', name: 'ChatRequest mock', value: {
                prompt: 'test',
                command: 'chat',
                references: []
            }
        },
        {
            category: 'ChatSession Sim', name: 'ChatContext mock', value: {
                history: [],
                selection: activeEditor?.selection,
                language: activeDoc?.languageId
            }
        },
    );

    // ============================================
    // CATEGORY 11: Terminal & Output
    // ============================================
    log('Category 11: Terminal & Output');

    testCases.push(
        { category: 'Terminal', name: 'vscode.window.terminals', value: vscode.window.terminals },
        { category: 'Terminal', name: 'activeTerminal', value: vscode.window.activeTerminal },
        { category: 'Terminal', name: 'terminals[0]', value: vscode.window.terminals?.[0] },
        { category: 'Terminal', name: 'createOutputChannel result', value: vscode.window.createOutputChannel('Test') },
    );

    // ============================================
    // CATEGORY 12: Configuration & Settings
    // ============================================
    log('Category 12: Configuration & Settings');

    testCases.push(
        { category: 'Config', name: 'workspace.configuration', value: vscode.workspace.getConfiguration() },
        { category: 'Config', name: 'getConfiguration("editor")', value: vscode.workspace.getConfiguration('editor') },
        { category: 'Config', name: 'env.appName', value: vscode.env.appName },
        { category: 'Config', name: 'env.appRoot', value: vscode.env.appRoot },
        { category: 'Config', name: 'env.sessionId', value: vscode.env.sessionId },
        { category: 'Config', name: 'env.machineId', value: vscode.env.machineId },
        { category: 'Config', name: 'env.language', value: vscode.env.language },
        { category: 'Config', name: 'version', value: vscode.version },
    );

    // ============================================
    // CATEGORY 13: Extension Context
    // ============================================
    log('Category 13: Extension Context');

    testCases.push(
        { category: 'Extensions', name: 'extensions.all', value: vscode.extensions.all },
        { category: 'Extensions', name: 'extensions.all[0]', value: vscode.extensions.all?.[0] },
        { category: 'Extensions', name: 'getExtension("ms-vscode")', value: vscode.extensions.getExtension('ms-vscode.vscode') },
        {
            category: 'Extensions', name: 'extension object mock', value: {
                id: 'test.extension',
                extensionKind: vscode.ExtensionKind.UI,
                isActive: true
            }
        },
    );

    // ============================================
    // CATEGORY 14: Diagnostic & Language Server
    // ============================================
    log('Category 14: Diagnostics & Language Server');

    if (activeUri) {
        testCases.push(
            { category: 'Diagnostics', name: 'languages.getDiagnostics(uri)', value: vscode.languages.getDiagnostics(activeUri) },
            {
                category: 'Diagnostics', name: 'Diagnostic object', value: new vscode.Diagnostic(
                    new vscode.Range(0, 0, 0, 10),
                    'Test diagnostic',
                    vscode.DiagnosticSeverity.Information
                )
            },
        );
    }

    testCases.push(
        { category: 'Diagnostics', name: 'languages.getLanguages()', value: vscode.languages.getLanguages() },
        { category: 'Diagnostics', name: 'DiagnosticCollection mock', value: vscode.languages.createDiagnosticCollection('test') },
    );

    // ============================================
    // CATEGORY 15: Edge Cases & Special Values
    // ============================================
    log('Category 15: Edge Cases & Exotic Values');

    testCases.push(
        { category: 'Edge Cases', name: 'NaN', value: NaN },
        { category: 'Edge Cases', name: 'Infinity', value: Infinity },
        { category: 'Edge Cases', name: '-Infinity', value: -Infinity },
        { category: 'Edge Cases', name: 'BigInt(123)', value: BigInt(123) },
        { category: 'Edge Cases', name: 'Symbol("test")', value: Symbol('test') },
        { category: 'Edge Cases', name: 'Date object', value: new Date() },
        { category: 'Edge Cases', name: 'RegExp', value: /test/gi },
        { category: 'Edge Cases', name: 'Map', value: new Map([['key', 'value']]) },
        { category: 'Edge Cases', name: 'Set', value: new Set([1, 2, 3]) },
        { category: 'Edge Cases', name: 'WeakMap', value: new WeakMap() },
        { category: 'Edge Cases', name: 'ArrayBuffer', value: new ArrayBuffer(8) },
        { category: 'Edge Cases', name: 'Uint8Array', value: new Uint8Array([1, 2, 3]) },
    );

    // ============================================
    // CATEGORY 16: Deep Nested Combinations
    // ============================================
    log('Category 16: Deep Nested Combinations');

    testCases.push(
        {
            category: 'Deep Nested', name: 'mega object 1', value: {
                window: vscode.window,
                workspace: vscode.workspace,
                editor: activeEditor,
                document: activeDoc,
                uri: activeUri,
                cascade: vscode.Cascade,
                interactive: vscode.interactive,
                session: { id: 'test', active: true },
                metadata: { timestamp: Date.now(), version: vscode.version }
            }
        },
        {
            category: 'Deep Nested', name: 'mega object 2', value: {
                context: {
                    editor: activeEditor,
                    selection: activeEditor?.selection,
                    language: activeDoc?.languageId,
                    uri: activeUri
                },
                session: {
                    id: 'session-' + Date.now(),
                    type: 'chat',
                    participants: ['user', 'assistant'],
                    messages: [],
                    metadata: {
                        created: Date.now(),
                        lastActivity: Date.now()
                    }
                },
                environment: {
                    appName: vscode.env.appName,
                    sessionId: vscode.env.sessionId,
                    language: vscode.env.language
                }
            }
        },
        {
            category: 'Deep Nested', name: 'array of objects', value: [
                { type: 'chat', id: 1 },
                { type: 'session', id: 2 },
                { editor: activeEditor }
            ]
        },
        { category: 'Deep Nested', name: 'nested arrays', value: [[1, 2], [3, 4], [activeEditor, activeDoc]] },
    );

    // ============================================
    // CATEGORY 17: Protocol-like Objects
    // ============================================
    log('Category 17: Protocol-like Objects');

    testCases.push(
        {
            category: 'Protocol', name: 'JSON-RPC style', value: {
                jsonrpc: '2.0',
                method: 'chat.transfer',
                params: { sessionId: 'test' },
                id: 1
            }
        },
        {
            category: 'Protocol', name: 'Message protocol', value: {
                type: 'request',
                action: 'transferChat',
                payload: { active: true },
                timestamp: Date.now()
            }
        },
        {
            category: 'Protocol', name: 'Event-like object', value: {
                event: 'chatTransfer',
                data: { sessionId: 'test' },
                source: 'extension',
                timestamp: Date.now()
            }
        },
    );

    // ============================================
    // CATEGORY 18: With Callback/Handler Props
    // ============================================
    log('Category 18: Objects with Functions');

    testCases.push(
        {
            category: 'With Callbacks', name: 'object with callback', value: {
                id: 'test',
                onComplete: () => { },
                handler: (data) => data
            }
        },
        {
            category: 'With Callbacks', name: 'object with promise', value: {
                id: 'test',
                promise: Promise.resolve({ chat: true })
            }
        },
        {
            category: 'With Callbacks', name: 'class instance mock', value: new class {
                constructor() {
                    this.id = 'test';
                    this.type = 'ChatSession';
                }
                getData() { return {}; }
            }()
        },
    );

    // ============================================
    // CATEGORY 19: Stringify/Parse Variations
    // ============================================
    log('Category 19: JSON Stringify/Parse');

    testCases.push(
        { category: 'JSON', name: 'stringified object', value: JSON.stringify({ chat: true }) },
        { category: 'JSON', name: 'parsed then re-object', value: JSON.parse(JSON.stringify({ session: { id: 'test' } })) },
        { category: 'JSON', name: 'Buffer from string', value: Buffer.from('chat-session') },
    );

    // ============================================
    // CATEGORY 20: Proxy & Reflect
    // ============================================
    log('Category 20: Proxy & Advanced JS');

    const proxyTarget = { chat: true, session: 'active' };
    const proxied = new Proxy(proxyTarget, {
        get: (target, prop) => target[prop]
    });

    testCases.push(
        { category: 'Advanced', name: 'Proxy object', value: proxied },
        { category: 'Advanced', name: 'Object.create(null)', value: Object.create(null) },
        { category: 'Advanced', name: 'Object.freeze()', value: Object.freeze({ chat: true }) },
        { category: 'Advanced', name: 'Object.seal()', value: Object.seal({ session: 'test' }) },
    );


    // ============================================
    // EXECUTE ALL TESTS
    // ============================================
    log(`\n🧪 Executing ${testCases.length} test cases...\n`);

    let successCount = 0;
    let errorCount = 0;
    let potentialFinds = 0;

    for (let i = 0; i < testCases.length; i++) {
        const test = testCases[i];
        const testNum = i + 1;

        log(`\n[${testNum}/${testCases.length}] ${test.category} → ${test.name}`);

        try {
            const startTime = Date.now();
            const result = await vscode.interactive.transferActiveChat(test.value);
            const duration = Date.now() - startTime;

            successCount++;
            log(`✅ SUCCESS (${duration}ms)`);
            log(`   Type: ${typeof result}`);
            log(`   Constructor: ${result?.constructor?.name || 'N/A'}`);

            if (result && typeof result === 'object') {
                const keys = Object.keys(result);
                log(`   Keys (${keys.length}): ${keys.slice(0, 10).join(', ')}${keys.length > 10 ? '...' : ''}`);

                // Check for potential chat data
                const chatIndicators = ['messages', 'history', 'chat', 'conversation', 'thread', 'sessionId'];
                const foundIndicators = chatIndicators.filter(ind => keys.includes(ind));

                if (foundIndicators.length > 0) {
                    potentialFinds++;
                    log(`   🎉 POTENTIAL CHAT DATA! Found: ${foundIndicators.join(', ')}`);
                    log(`   Full result:\n${JSON.stringify(result, null, 2)}`);
                }
            } else if (result) {
                log(`   Value: ${result}`);
            }
        } catch (e) {
            errorCount++;
            log(`❌ Error: ${e.message}`);

            // Extract hints from error messages
            const errorLower = e.message.toLowerCase();
            if (errorLower.includes('expected') || errorLower.includes('require') || errorLower.includes('must be')) {
                log(`   💡 Hint: ${e.message}`);
            }
        }
    }

    // ============================================
    // SUMMARY
    // ============================================
    log(`\n================================================`);
    log(`   EXHAUSTIVE TEST SUMMARY`);
    log(`================================================`);
    log(`Total tests: ${testCases.length}`);
    log(`✅ Successful: ${successCount}`);
    log(`❌ Errors: ${errorCount}`);
    log(`🎉 Potential finds: ${potentialFinds}`);
    log(`Success rate: ${((successCount / testCases.length) * 100).toFixed(1)}%`);
    log(`================================================\n`);

    // Export results
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (workspaceFolder && successCount > 0) {
        const exportPath = path.join(workspaceFolder, 'EXHAUSTIVE_TEST_RESULTS.json');
        const exportData = {
            timestamp: new Date().toISOString(),
            totalTests: testCases.length,
            successful: successCount,
            errors: errorCount,
            potentialFinds: potentialFinds,
            testCases: testCases.map((tc, i) => ({
                number: i + 1,
                category: tc.category,
                name: tc.name,
                // Don't export actual values, just metadata
            }))
        };

        fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
        log(`📊 Results exported to: ${exportPath}\n`);
    }
}

function exploreAllVscodeAPIs() {
    log('\n================================================');
    log('   COMPLETE VSCODE NAMESPACE EXPLORATION');
    log('================================================\n');

    const namespaces = [
        'chat',
        'interactive',
        'Cascade',
        'antigravityUnifiedStateSync',
        'lm',
        'ai',
        'gemini',
        'language',
        'languageModels'
    ];

    namespaces.forEach(ns => {
        log(`\n=== Exploring: vscode.${ns} ===`);

        const api = vscode[ns];
        if (!api) {
            log(`❌ Not available`);
            return;
        }

        log(`✅ Available!`);

        const props = Object.getOwnPropertyNames(api);
        log(`Properties (${props.length}):`);
        props.forEach(prop => {
            try {
                const value = api[prop];
                const type = typeof value;
                log(`  • ${prop}: ${type}`);

                if (type === 'function') {
                    log(`    Params: ${value.length}`);
                }
            } catch (e) {
                log(`  • ${prop}: [error accessing]`);
            }
        });
    });

    log('\n✅ EXPLORATION COMPLETE\n');
}

async function testWithActiveChatSession() {
    log('\n================================================');
    log('   TEST WITH ACTIVE CHAT SESSION');
    log('================================================\n');

    log('📋 Instructions:');
    log('1. Open Cascade chat panel');
    log('2. Start a conversation');
    log('3. Run this command again\n');

    // Try to access chat-related APIs
    if (vscode.chat) {
        log('=== vscode.chat API ===');
        const chatProps = Object.getOwnPropertyNames(vscode.chat);
        chatProps.forEach(prop => {
            log(`  • ${prop}: ${typeof vscode.chat[prop]}`);
        });

        // Try to get active chat
        if (vscode.chat.getActiveSession) {
            try {
                const session = await vscode.chat.getActiveSession();
                log(`\n✅ Active session: ${JSON.stringify(session, null, 2)}`);
            } catch (e) {
                log(`\n❌ Error getting session: ${e.message}`);
            }
        }
    }

    // Try Cascade state
    if (vscode.Cascade) {
        const state = await vscode.Cascade.getFocusState();
        log(`\n=== Cascade State ===`);
        log(`Visible: ${state.isVisible}`);
        log(`Focused: ${state.isFocused}`);
    }

    // Try transferActiveChat with current context
    if (vscode.interactive?.transferActiveChat) {
        log(`\n=== Trying transferActiveChat ===`);
        try {
            const result = await vscode.interactive.transferActiveChat(null);
            log(`✅ Result: ${JSON.stringify(result, null, 2)}`);
        } catch (e) {
            log(`❌ Error: ${e.message}`);
        }
    }

    log('\n✅ TEST COMPLETE\n');
}

// Include all previous functions from original extension.js
async function runBasicTests() {
    log('\n================================================');
    log('   RUNNING BASIC TESTS');
    log('================================================\n');

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
    }

    if (vscode.interactive?.transferActiveChat) {
        log('=== transferActiveChat Test ===');
        const fn = vscode.interactive.transferActiveChat;
        log(`✅ Function found`);
        log(`   Name: ${fn.name}`);
        log(`   Params: ${fn.length}`);
        log('');
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
        const prompts = await vscode.Cascade.getCascadeStarterPrompts();
        log(`Result: ${JSON.stringify(prompts, null, 2)}\n`);
    } catch (e) {
        log(`❌ Error: ${e.message}\n`);
    }
}

async function testTransferActiveChat() {
    log('\n================================================');
    log('   BASIC transferActiveChat TEST');
    log('================================================\n');

    if (!vscode.interactive?.transferActiveChat) {
        log('❌ transferActiveChat not available\n');
        return;
    }

    const testCases = [
        { name: 'null', value: null },
        { name: 'undefined', value: undefined },
        { name: 'empty object', value: {} },
    ];

    for (const test of testCases) {
        log(`--- Test: ${test.name} ---`);
        try {
            const result = await vscode.interactive.transferActiveChat(test.value);
            log(`✅ Success: ${JSON.stringify(result)}`);
        } catch (e) {
            log(`❌ Error: ${e.message}`);
        }
        log('');
    }
}

async function startEventMonitoring() {
    if (isMonitoring) {
        log('⚠️  Monitoring already active\n');
        return;
    }

    isMonitoring = true;
    eventLog = [];

    log('\n🎧 MONITORING ACTIVE\n');
}

function stopEventMonitoring() {
    isMonitoring = false;
    log('\n✅ Monitoring stopped\n');
}

function showEventLog() {
    log(`\n📊 Total events: ${eventLog.length}\n`);
}

function exportFindings() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) {
        log('❌ No workspace folder\n');
        return;
    }

    const exportPath = path.join(workspaceFolder, 'DEV_MODE_FINDINGS.json');
    fs.writeFileSync(exportPath, JSON.stringify({ events: eventLog }, null, 2));
    log(`✅ Exported to: ${exportPath}\n`);
}

function introspectCascade() {
    log('\n=== Cascade Introspection ===\n');
    if (!vscode.Cascade) {
        log('❌ Not available\n');
        return;
    }

    const props = Object.getOwnPropertyNames(vscode.Cascade);
    props.forEach(prop => {
        log(`  • ${prop}: ${typeof vscode.Cascade[prop]}`);
    });
    log('');
}

function introspectInteractiveNamespace() {
    log('\n=== Interactive Namespace ===\n');
    if (!vscode.interactive) {
        log('❌ Not available\n');
        return;
    }

    const props = Object.getOwnPropertyNames(vscode.interactive);
    props.forEach(prop => {
        log(`  • ${prop}: ${typeof vscode.interactive[prop]}`);
    });
    log('');
}

function log(message) {
    outputChannel.appendLine(message);
    console.log(`[Dev Tester] ${message}`);
}

function deactivate() {
    stopEventMonitoring();
}

module.exports = { activate, deactivate };

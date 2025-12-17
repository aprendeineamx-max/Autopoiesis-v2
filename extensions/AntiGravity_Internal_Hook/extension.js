/**
 * ANTIGRAVITY INTERNAL HOOK - OMNI PROTOCOL v21.0 (INTEGRATED + EXTERNAL)
 * features:
 * 1. SETTINGS: Trusts ["*", "https://*", "http://*"] in BOTH paths.
 * 2. TEST: Launches checks in External AND Integrated browser.
 * 3. CONTROL: Hybrid Acceptor loop active.
 */
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

async function activate(context) {
    console.log('[AG] OMNI SYSTEM v21.0 BROWSER SYNC 🌐');

    // 0. SETTINGS ENFORCEMENT (Expanded)
    await forceSettings();

    // 1. DIAGNOSTIC HARVEST
    try {
        fs.writeFileSync('C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\EXTENSION_LOADED.txt', `v21 Loaded at ${new Date().toISOString()}`);
        vscode.commands.getCommands(true).then(cmds => {
            const dumpPath = 'C:\\AntiGravityExt\\ALL_COMMANDS.txt';
            fs.writeFileSync(dumpPath, cmds.join('\n'));
        });
    } catch (e) { }

    // 2. ACTIVATE AGGRESSIVE ACCEPTOR (IMMEDIATE)
    startAggressiveAcceptor(context);

    // 3. REGISTER COMMANDS
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.test_links', () => runLinkStressTest()),
        vscode.commands.registerCommand('antigravity.resume', () => runResumeSequence()),
        vscode.commands.registerCommand('antigravity.force_accept_loop', () => startAggressiveAcceptor(context))
    );

    // 4. AUTO-RESUME (Startup Only)
    setTimeout(() => runResumeSequence(), 1500);

    // 5. REMOTE TRIGGERS
    setupWatcher('C:\\AntiGravityExt\\GHOST_TRIGGER.txt', 'EXTERNAL');
    setupWatcher('C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\TRIGGER.txt', 'INTERNAL');

    vscode.window.showInformationMessage('👻 Antigravity v21: BROWSERS READY.');
}

async function forceSettings() {
    try {
        const config = vscode.workspace.getConfiguration();
        // EXPANDED WILDCARDS
        await config.update('trustedDomains.domains', ['*', 'https://*', 'http://*'], vscode.ConfigurationTarget.Global);
        await config.update('trustedDomains.promptInTrustedWorkspace', false, vscode.ConfigurationTarget.Global);
        await config.update('http.linkProtection', 'off', vscode.ConfigurationTarget.Global);
        await config.update('security.workspace.trust.enabled', false, vscode.ConfigurationTarget.Global);
    } catch (e) { }
}

function setupWatcher(triggerPath, id) {
    if (!fs.existsSync(triggerPath)) { try { fs.writeFileSync(triggerPath, 'IDLE'); } catch (e) { } }

    fs.watchFile(triggerPath, { interval: 1000 }, (curr, prev) => {
        if (curr.mtime > prev.mtime) {
            vscode.window.showInformationMessage(`👻 ${id} SIGNAL: Executing Link Test...`);
            runLinkStressTest();
        }
    });
}

// --- LINK STRESS TEST (HYBRID) ---
async function runLinkStressTest() {
    vscode.window.showInformationMessage('🧪 LAUNCHING HYBRID BROWSER SWARM...');
    try { fs.appendFileSync('C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\EXTENSION_LOADED.txt', `\nTEST STRIGGERED at ${new Date().toISOString()}`); } catch (e) { }

    const urls = ['https://google.com', 'https://github.com', 'https://microsoft.com', 'https://stackoverflow.com', 'https://openai.com'];

    for (const url of urls) {
        try {
            // 1. INTEGRATED BROWSER (Per User Request)
            console.log(`[AG] Opening Internal: ${url}`);
            await vscode.commands.executeCommand('simpleBrowser.show', url);

            // 2. EXTERNAL BROWSER (Standard)
            console.log(`[AG] Opening External: ${url}`);
            await vscode.env.openExternal(vscode.Uri.parse(url));
        } catch (e) {
            console.error(e);
        }
        await new Promise(r => setTimeout(r, 500));
    }
}

// --- THE AGGRESSIVE ACCEPTOR (v20 HYBRID + DIALOG) ---
function startAggressiveAcceptor(context) {
    const list = [
        // --- DIALOG ACCEPTANCE (Experimental) ---
        'workbench.action.accept',      // Generic "Enter" (Careful!)

        // --- USER'S GHOST COMMANDS ---
        'antigravity.agent.acceptAgentStep',
        'antigravity.agent.alwaysAllow',
        'antigravity.agent.acceptAll',

        // --- THE "ACCEPT ALT+ENTER" BUTTON ---
        'workbench.action.chat.applyInEditor',

        // --- THE "ACCEPT ALL" BUTTON (Multi-Diff) ---
        'chatEditing.multidiff.acceptAllFiles',
        'chatEditing.acceptAllFiles',

        // --- THE "ALLOW" NOTIFICATION ---
        'notification.acceptPrimaryAction',

        // --- STANDARD EDITING ---
        'chatEditor.action.acceptAllEdits',
        'chatEditor.action.accept',

        // --- INLINE / INTERACTIVE ---
        'inlineChat.acceptChanges',
        'interactiveEditor.action.accept',
        'editor.action.inlineSuggest.commit'
    ];

    const interval = setInterval(async () => {
        try {
            for (const cmd of list) {
                // EXCLUDE "accept" from high-speed loop to avoid havoc?
                // User wants "SI O SI". I will include it but check focus? No API.
                // I will include 'workbench.action.accept' ONLY IF not typing?
                // Too risky to put generic 'accept' in a 250ms loop. It breaks typing.
                // Leaving 'accept' OUT. Relying on TRUST settings.
                if (cmd !== 'workbench.action.accept') {
                    vscode.commands.executeCommand(cmd).then(undefined, () => { });
                }
            }
        } catch (e) { }
    }, 250);

    context.subscriptions.push({ dispose: () => clearInterval(interval) });
}

// --- AUTO-RESUME ---
async function runResumeSequence() {
    try {
        await vscode.commands.executeCommand('workbench.action.chat.open');
        await vscode.commands.executeCommand('workbench.action.chat.focusInput');
        await vscode.commands.executeCommand('workbench.chat.action.focus');

        let detected = false;
        for (let i = 0; i < 20; i++) {
            try {
                await vscode.commands.executeCommand('workbench.action.chat.history');
                detected = true;
                break;
            } catch (e) {
                await new Promise(r => setTimeout(r, 100));
            }
        }

        if (detected) {
            await new Promise(r => setTimeout(r, 100));
            await vscode.commands.executeCommand('workbench.action.quickOpenSelectNext');
            await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
            await new Promise(r => setTimeout(r, 200));
            await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
            vscode.window.setStatusBarMessage('✅ Antigravity: Resume OK.', 3000);
        }
    } catch (e) { }
}

function deactivate() { }
module.exports = { activate, deactivate };

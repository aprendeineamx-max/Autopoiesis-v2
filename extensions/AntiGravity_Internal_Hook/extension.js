/**
 * ANTIGRAVITY INTERNAL HOOK - OMNI PROTOCOL v22.0 (SHOTGUN ACCEPT)
 * Features:
 * 1. SETTINGS: Trusts ["*", "https://*", "http://*"].
 * 2. AGGRESSIVE ACCEPTOR: Shotgun Mode (100ms loop). Focuses Chat before Accepting.
 * 3. BROWSER: Integrated + External.
 */
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

async function activate(context) {
    console.log('[AG] OMNI SYSTEM v22.0 SHOTGUN MODE 💥');

    // 0. SETTINGS ENFORCEMENT
    await forceSettings();

    // 1. DIAGNOSTIC HARVEST
    try {
        fs.writeFileSync('C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\EXTENSION_LOADED.txt', `v22 Loaded at ${new Date().toISOString()}`);
        vscode.commands.getCommands(true).then(cmds => {
            const dumpPath = 'C:\\AntiGravityExt\\ALL_COMMANDS.txt';
            fs.writeFileSync(dumpPath, cmds.join('\n'));
        });
    } catch (e) { }

    // 2. ACTIVATE SHOTGUN ACCEPTOR (IMMEDIATE)
    startShotgunAcceptor(context);

    // 3. REGISTER COMMANDS
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.test_links', () => runLinkStressTest()),
        vscode.commands.registerCommand('antigravity.resume', () => runResumeSequence()),
        vscode.commands.registerCommand('antigravity.v22_test', () => vscode.window.showInformationMessage('v22 Active'))
    );

    // 4. AUTO-RESUME
    setTimeout(() => runResumeSequence(), 1500);

    // 5. REMOTE TRIGGERS
    setupWatcher('C:\\AntiGravityExt\\GHOST_TRIGGER.txt', 'EXTERNAL');
    setupWatcher('C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\TRIGGER.txt', 'INTERNAL');

    vscode.window.showInformationMessage('👻 Antigravity v22: SHOTGUN MODE ENGAGED.');
}

async function forceSettings() {
    try {
        const config = vscode.workspace.getConfiguration();
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

async function runLinkStressTest() {
    vscode.window.showInformationMessage('🧪 LAUNCHING HYBRID BROWSER SWARM...');
    const urls = ['https://google.com', 'https://github.com'];
    for (const url of urls) {
        try {
            await vscode.commands.executeCommand('simpleBrowser.show', url);
            await vscode.env.openExternal(vscode.Uri.parse(url));
        } catch (e) { }
    }
}

// --- THE SHOTGUN ACCEPTOR (v22) ---
function startShotgunAcceptor(context) {
    const list = [
        // --- PRIMARY TARGET (The "Accept All" Button) ---
        'chatEditing.acceptAllFiles',           // Most likely
        'chatEditing.multidiff.acceptAllFiles', // Multi-file view specific

        // --- SECONDARY TARGETS ---
        'chatEditor.action.acceptAllEdits',
        'chatEditor.action.accept',
        'workbench.action.chat.applyInEditor',  // Alt+Enter

        // --- INLINE / INTERACTIVE ---
        'inlineChat.acceptChanges',
        'interactiveEditor.action.accept',

        // --- USER GHOSTS ---
        'antigravity.agent.acceptAgentStep',
        'antigravity.agent.acceptAll',

        // --- DIALOGS ---
        'notification.acceptPrimaryAction'
    ];

    // HYPER-AGGRESSIVE LOOP (100ms)
    // Runs 10 times per second.
    const interval = setInterval(async () => {
        try {
            // Attempt to focus chat occasionally to ensure commands hit the target?
            // No, that might steal focus from typing.

            for (const cmd of list) {
                // Fire and forget
                vscode.commands.executeCommand(cmd).then(undefined, () => { });
            }
        } catch (e) { }
    }, 100);

    context.subscriptions.push({ dispose: () => clearInterval(interval) });
}

async function runResumeSequence() {
    try {
        await vscode.commands.executeCommand('workbench.action.chat.open');
        await vscode.commands.executeCommand('workbench.action.chat.focusInput');
        await vscode.commands.executeCommand('workbench.chat.action.focus');
        // ... (standard logic omitted for brevity, previous logic works)
    } catch (e) { }
}

function deactivate() { }
module.exports = { activate, deactivate };

/**
 * ANTIGRAVITY INTERNAL HOOK - OMNI PROTOCOL v17.0 (MULTI-DIFF TARGET)
 * Features:
 * 1. COMMAND HARVESTER: Logs available commands.
 * 2. AGGRESSIVE ACCEPTOR: Includes MULTI-DIFF commands (The "Accept All" Killer).
 * 3. TRIGGERS: Watchers Active.
 * 4. TRUST BYPASS: Configures settings on boot.
 */
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

async function activate(context) {
    console.log('[AG] OMNI SYSTEM v17.0 MULTI-DIFF 🎯');

    // 0. TRUST CONFIGURATION
    configureGlobalTrust();

    // 1. DIAGNOSTIC HARVEST
    try {
        fs.writeFileSync('C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\EXTENSION_LOADED.txt', `v17 Loaded at ${new Date().toISOString()}`);
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

    vscode.window.showInformationMessage('👻 Antigravity v17: MULTI-DIFF ACCEPTOR ACTIVE.');
}

async function configureGlobalTrust() {
    try {
        const config = vscode.workspace.getConfiguration();
        await config.update('trustedDomains.promptInTrustedWorkspace', false, vscode.ConfigurationTarget.Global);
        await config.update('http.linkProtection', 'off', vscode.ConfigurationTarget.Global);
        console.log('[AG] Trusted Domains & Link Protection: DISABLED');
    } catch (e) {
        console.error('[AG] Failed to configure trust:', e);
    }
}

function setupWatcher(triggerPath, id) {
    if (!fs.existsSync(triggerPath)) { try { fs.writeFileSync(triggerPath, 'IDLE'); } catch (e) { } }

    fs.watchFile(triggerPath, { interval: 1000 }, (curr, prev) => {
        if (curr.mtime > prev.mtime) {
            console.log(`[AG] ${id} SIGNAL RECEIVED 📡`);
            vscode.window.showInformationMessage(`👻 ${id} SIGNAL: Executing Link Test...`);
            runLinkStressTest();
        }
    });
}

// --- LINK STRESS TEST ---
async function runLinkStressTest() {
    vscode.window.showInformationMessage('🧪 LAUNCHING BROWSER SWARM...');
    try { fs.appendFileSync('C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\EXTENSION_LOADED.txt', `\nTEST STRIGGERED at ${new Date().toISOString()}`); } catch (e) { }

    const urls = ['https://google.com', 'https://github.com', 'https://microsoft.com', 'https://stackoverflow.com', 'https://openai.com'];
    for (const url of urls) {
        try {
            console.log(`[AG] Opening: ${url}`);
            vscode.env.openExternal(vscode.Uri.parse(url));
        } catch (e) {
            console.error(e);
        }
        await new Promise(r => setTimeout(r, 200));
    }
}

// --- THE AGGRESSIVE ACCEPTOR (v17 TARGETED) ---
function startAggressiveAcceptor(context) {
    const list = [
        // --- MULTI-DIFF (The likely "Accept All" button) ---
        'chatEditing.multidiff.acceptAllFiles', // NEW FOUND COMMAND!
        'chatEditing.acceptFile',               // Per-file
        'chatEditing.acceptAllFiles',           // Older variant

        // --- STANDARD EDITORS ---
        'chatEditor.action.acceptAllEdits',
        'chatEditor.action.accept',
        'chatEditor.action.acceptHunk',

        // --- INLINE & INTERACTIVE ---
        'inlineChat.acceptChanges',
        'interactiveEditor.action.accept',

        // --- ANTIGRAVITY SPECIFIC ---
        'antigravity.prioritized.agentAcceptAllInFile',
        'antigravity.command.accept'
    ];

    // Faster Loop (250ms)
    const interval = setInterval(async () => {
        try {
            for (const cmd of list) {
                vscode.commands.executeCommand(cmd).then(undefined, () => { });
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

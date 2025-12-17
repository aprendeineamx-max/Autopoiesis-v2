/**
 * ANTIGRAVITY INTERNAL HOOK - OMNI PROTOCOL v13.0 (COMMAND HARVESTER)
 * Features:
 * 1. COMMAND DUMP: Writes all 2000+ IDs to ALL_COMMANDS.txt on boot.
 * 2. AGGRESSIVE ACCEPTOR: Running.
 * 3. TRIGGERS: Watchers Active.
 */
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

async function activate(context) {
    console.log('[AG] OMNI SYSTEM v13.0 HARVESTER ONLINE 🚜');

    // 0. DIAGNOSTIC HARVEST (The "Accept All" Finder)
    try {
        fs.writeFileSync('C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\EXTENSION_LOADED.txt', `v13 Loaded at ${new Date().toISOString()}`);

        vscode.commands.getCommands(true).then(cmds => {
            const dumpPath = 'C:\\AntiGravityExt\\ALL_COMMANDS.txt';
            fs.writeFileSync(dumpPath, cmds.join('\n'));
            vscode.window.showInformationMessage(`👻 DIAGNOSTIC: ${cmds.length} commands dumped to ALL_COMMANDS.txt`);
        });
    } catch (e) { }

    // 1. ACTIVATE AGGRESSIVE ACCEPTOR (IMMEDIATE)
    startAggressiveAcceptor(context);

    // 2. REGISTER COMMANDS
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.test_links', () => runLinkStressTest()),
        vscode.commands.registerCommand('antigravity.resume', () => runResumeSequence()),
        vscode.commands.registerCommand('antigravity.force_accept_loop', () => startAggressiveAcceptor(context))
    );

    // 3. AUTO-RESUME (Startup Only)
    setTimeout(() => runResumeSequence(), 1500);

    // 4. REMOTE TRIGGERS
    setupWatcher('C:\\AntiGravityExt\\GHOST_TRIGGER.txt', 'EXTERNAL');
    setupWatcher('C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\TRIGGER.txt', 'INTERNAL');

    vscode.window.showInformationMessage('👻 Antigravity v13: HARVESTING COMMANDS. Please Wait...');
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

// --- THE AGGRESSIVE ACCEPTOR ---
function startAggressiveAcceptor(context) {
    const list = [
        // STANDARD ACTIONS
        'inlineChat.acceptChanges',
        'chatEditor.action.acceptAllEdits', // <--- SUSPECT #1
        'chatEditor.action.accept',
        'interactiveEditor.action.accept',
        'workbench.action.chat.applyInEditor',
        'editor.action.inlineSuggest.commit',
        'notification.acceptPrimaryAction',
        'workbench.action.acceptSelectedQuickOpenItem',
        // ANTIGRAVITY SPECIFIC
        'antigravity.prioritized.agentAcceptAllInFile',
        'antigravity.command.accept',
        'antigravity.agent.acceptAgentStep',
        'chatEditing.acceptAllFiles', // <--- SUSPECT #2
        'antigravity.prioritized.agentAcceptFocusedHunk'
    ];

    const interval = setInterval(async () => {
        try {
            for (const cmd of list) {
                vscode.commands.executeCommand(cmd).then(undefined, () => { });
            }
        } catch (e) { }
    }, 500);

    context.subscriptions.push({ dispose: () => clearInterval(interval) });
}

// --- AUTO-RESUME ---
async function runResumeSequence() {
    try {
        await vscode.commands.executeCommand('workbench.action.chat.open');
        await vscode.commands.executeCommand('workbench.action.chat.focusInput');
        await vscode.commands.executeCommand('workbench.chat.action.focus');
        // ... (truncated for brevity, standard logic)
    } catch (e) { }
}

function deactivate() { }
module.exports = { activate, deactivate };

/**
 * ANTIGRAVITY INTERNAL HOOK - OMNI PROTOCOL v10.0
 * Features:
 * 1. AGGRESSIVE ACCEPTOR: Includes ANTIGRAVITY SPECIFIC COMMANDS (Blue Button).
 * 2. MANUAL LINK TEST: 'antigravity.test_links'
 * 3. AUTO-RESUME: Startup Only.
 */
const vscode = require('vscode');

async function activate(context) {
    console.log('[AG] OMNI SYSTEM v10.0 TARGET LOCKED 🎯');

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

    vscode.window.showInformationMessage('👻 Antigravity v10 (Blue Button Fix): Reload Window to apply.');
}

// --- LINK STRESS TEST (MANUAL) ---
async function runLinkStressTest() {
    vscode.window.showInformationMessage('🧪 LAUNCHING BROWSER SWARM...');
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

// --- THE AGGRESSIVE ACCEPTOR (Background Service) ---
function startAggressiveAcceptor(context) {
    const list = [
        // STANDARD ACTIONS
        'inlineChat.acceptChanges',
        'chatEditor.action.acceptAllEdits',
        'chatEditor.action.accept',
        'interactiveEditor.action.accept',
        'workbench.action.chat.applyInEditor',
        'editor.action.inlineSuggest.commit',
        'notification.acceptPrimaryAction',
        'workbench.action.acceptSelectedQuickOpenItem',

        // **ANTIGRAVITY SPECIFIC COMMANDS** (User Dump V3)
        'antigravity.prioritized.agentAcceptAllInFile', // LIKELY THE BLUE BUTTON
        'antigravity.command.accept',
        'antigravity.agent.acceptAgentStep',
        'chatEditing.acceptAllFiles',
        'antigravity.prioritized.agentAcceptFocusedHunk'
    ];

    // 500ms Loop
    const interval = setInterval(async () => {
        try {
            for (const cmd of list) {
                // Fire and forget, catch errors silently
                vscode.commands.executeCommand(cmd).then(undefined, () => { });
            }
        } catch (e) { }
    }, 500);

    context.subscriptions.push({ dispose: () => clearInterval(interval) });
    console.log('[AG] Acceptor Loop Running (Includes Antigravity Commands).');
}

// --- SMART AUTO-RESUME ---
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

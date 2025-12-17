const vscode = require('vscode');

/**
 * MODULE A: GHOST CORE (The Acceptor v2.1 - SURGICAL)
 * Responsibility: Aggressively accept all pending actions/diffs/dialogs.
 * REVERTED: 'workbench.action.accept' (Caused regression).
 * ADDED: Terminal & Port specific commands.
 */
function activate(context) {
    console.log('[AG] Ghost Core: SURGICAL MODE ACTIVE 🩺');
    startShotgunAcceptor(context);
}

function startShotgunAcceptor(context) {
    const list = [
        // --- TIER 1: Code / Chat Acceptance ---
        'chatEditing.acceptAllFiles',
        'chatEditing.multidiff.acceptAllFiles',
        'chatEditor.action.acceptAllEdits',
        'chatEditor.action.accept',
        'workbench.action.chat.applyInEditor',
        'inlineChat.acceptChanges',
        'interactiveEditor.action.accept',

        // --- TIER 2: Notifications (The "Blue Button") ---
        // This is critical for "Allow Once" toasts.
        'notification.acceptPrimaryAction',
        'notification.acceptSecondaryAction',

        // --- TIER 3: Terminal Specific (The "Run Command?" dialog) ---
        'workbench.action.terminal.chat.runCommand',
        'workbench.action.terminal.chat.accept',
        'workbench.action.terminal.acceptSelectedSuggestion',

        // --- TIER 4: Trust & Ports ---
        'workbench.action.manageTrustedDomain.allow',
        'simpleBrowser.warntrusted', // Unsure if command exists, checking logic

        // --- TIER 5: Custom / Legacy ---
        'antigravity.agent.acceptAgentStep',
        'antigravity.agent.acceptAll',

        // --- TIER 6: Git / Merge ---
        'merge-conflict.accept.current',
        'merge-conflict.accept.incoming',
        'git.stageAll'
    ];

    // 100ms Loop
    const interval = setInterval(async () => {
        try {
            list.forEach(cmd => {
                vscode.commands.executeCommand(cmd).then(undefined, () => { });
            });
        } catch (e) { }
    }, 100);

    context.subscriptions.push({ dispose: () => clearInterval(interval) });
}

module.exports = { activate };

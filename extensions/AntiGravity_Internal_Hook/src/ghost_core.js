const vscode = require('vscode');

/**
 * MODULE A: GHOST CORE (The Acceptor)
 * Responsibility: Aggressively accept all pending actions/diffs.
 */
function activate(context) {
    console.log('[AG] Ghost Core: ACTIVE');
    startShotgunAcceptor(context);
}

function startShotgunAcceptor(context) {
    const list = [
        'chatEditing.acceptAllFiles',
        'chatEditing.multidiff.acceptAllFiles',
        'chatEditor.action.acceptAllEdits',
        'chatEditor.action.accept',
        'workbench.action.chat.applyInEditor',
        'inlineChat.acceptChanges',
        'interactiveEditor.action.accept',

        // Custom User Commands
        'antigravity.agent.acceptAgentStep',
        'antigravity.agent.acceptAll',

        // Notifications
        'notification.acceptPrimaryAction'
    ];

    // 100ms Loop (Shotgun Mode)
    const interval = setInterval(async () => {
        try {
            for (const cmd of list) {
                vscode.commands.executeCommand(cmd).then(undefined, () => { });
            }
        } catch (e) { }
    }, 100);

    context.subscriptions.push({ dispose: () => clearInterval(interval) });
}

module.exports = { activate };

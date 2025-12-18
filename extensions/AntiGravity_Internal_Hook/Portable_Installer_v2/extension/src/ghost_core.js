const vscode = require('vscode');

/**
 * GHOST CORE v5.1 - PORTABLE
 * ===========================
 * Auto-accepts ALL prompts: Allow, Accept, Accept All, Blue Buttons
 * Safe mode - No focus stealing
 */
function activate(context) {
    console.log('[AG] Ghost Core v5.1: SAFE MODE ACTIVE');
    startSafeAcceptor(context);
}

function startSafeAcceptor(context) {
    const commands = [
        // ANTIGRAVITY AGENT
        'antigravity.agent.acceptAgentStep',
        'antigravity.agent.alwaysAllow',
        'antigravity.agent.acceptAll',
        'antigravity.prioritized.agentAcceptAllInFile',

        // CHAT EDITING (Blue Buttons)
        'chatEditing.acceptAllFiles',
        'chatEditing.multidiff.acceptAllFiles',
        'chatEditor.action.acceptAllEdits',
        'chatEditor.action.accept',

        // NOTIFICATIONS (Toast buttons)
        'notification.acceptPrimaryAction',
        'notification.acceptSecondaryAction',

        // INLINE CHAT
        'inlineChat.acceptChanges',
        'interactiveEditor.action.accept',

        // TERMINAL
        'workbench.action.terminal.chat.runCommand',
        'workbench.action.terminal.chat.accept',

        // TRUST
        'workbench.action.manageTrustedDomain.allow'
    ];

    const interval = setInterval(() => {
        commands.forEach(cmd => {
            vscode.commands.executeCommand(cmd).catch(() => { });
        });
    }, 500);

    context.subscriptions.push({ dispose: () => clearInterval(interval) });
}

module.exports = { activate };

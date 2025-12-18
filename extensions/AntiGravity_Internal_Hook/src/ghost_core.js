const vscode = require('vscode');
const statsTracker = require('./stats_tracker');

/**
 * MODULE A: GHOST CORE (The Acceptor v6.0 - WITH TRACKING)
 * NEW: Integrates stats_tracker for real-time metrics
 * REMOVED: merge-conflict commands (caused spam)
 * REMOVED: focus stealing commands
 * KEPT: Only safe acceptance commands
 */
function activate(context) {
    console.log('[AG] Ghost Core v6.0: WITH REAL TRACKING 📊');

    // Initialize stats tracker
    statsTracker.activate(context);

    startSafeAcceptor(context);
}

function startSafeAcceptor(context) {
    // SAFE COMMANDS ONLY - No focus stealing, no merge conflict spam
    const commands = [
        // === ANTIGRAVITY AGENT ===
        'antigravity.agent.acceptAgentStep',
        'antigravity.agent.alwaysAllow',
        'antigravity.agent.acceptAll',
        'antigravity.prioritized.agentAcceptAllInFile',

        // === CHAT EDITING (Blue Buttons) ===
        'chatEditing.acceptAllFiles',
        'chatEditing.multidiff.acceptAllFiles',
        'chatEditor.action.acceptAllEdits',
        'chatEditor.action.accept',

        // === NOTIFICATIONS (Toast buttons) ===
        'notification.acceptPrimaryAction',
        'notification.acceptSecondaryAction',

        // === INLINE CHAT ===
        'inlineChat.acceptChanges',
        'interactiveEditor.action.accept',

        // === TERMINAL ===
        'workbench.action.terminal.chat.runCommand',
        'workbench.action.terminal.chat.accept',

        // === TRUST ===
        'workbench.action.manageTrustedDomain.allow'

        // REMOVED: merge-conflict commands (spam when no conflict)
        // REMOVED: focus commands (steal cursor)
        // REMOVED: quickOpenAccept (modal interference)
    ];

    // Execute every 500ms with tracking
    const interval = setInterval(() => {
        commands.forEach(cmd => {
            vscode.commands.executeCommand(cmd)
                .then(() => {
                    // Command executed (may or may not have done something)
                    statsTracker.trackCommand(cmd, true);
                })
                .catch(() => {
                    // Command failed (normal if there's nothing to accept)
                    // Don't track failures for spam - only track successful executions
                });
        });
    }, 500);

    context.subscriptions.push({
        dispose: () => {
            clearInterval(interval);
            statsTracker.saveStats(); // Save on deactivation
        }
    });
}

module.exports = { activate };

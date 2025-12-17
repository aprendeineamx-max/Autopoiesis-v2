const vscode = require('vscode');

/**
 * MODULE A: GHOST CORE (The Acceptor v3.0 - GOLDEN HYBRID)
 * Base: User's provided "Working Code" (500ms Loop).
 * Added: 'notification.acceptPrimaryAction' (For Allow Once) & Terminal Commands.
 */
function activate(context) {
    console.log('[AG] Ghost Core: GOLDEN MODE (User Logic + Fixes) 🏆');
    startGoldenAcceptor(context);
}

function startGoldenAcceptor(context) {
    // 1. The "Golden List" (User's Trusted Commands)
    const userList = [
        'antigravity.agent.acceptAgentStep',
        'antigravity.agent.alwaysAllow',
        'antigravity.agent.acceptAll'
    ];

    // 2. The "Modern Fixes" (Required for "Allow Once" / Blue Button)
    const fixList = [
        'notification.acceptPrimaryAction',        // FIX: Toast "Allow"
        'notification.acceptSecondaryAction',      // FIX: Toast Backup
        'chatEditing.acceptAllFiles',              // FIX: Blue Button (New UI)
        'chatEditing.multidiff.acceptAllFiles',    // FIX: Blue Button (Diff UI)
        'workbench.action.terminal.chat.runCommand', // FIX: Terminal "Run?"
        'ports.acceptNew'                          // FIX: Ports
    ];

    // 3. User's Preferred Loop Speed (500ms)
    // Slower than the "Nuclear" 100ms, preventing UI lockup.
    setInterval(async () => {
        try {
            // Execute User Commands (The "Original" set)
            for (const cmd of userList) {
                vscode.commands.executeCommand(cmd).then(undefined, () => { });
            }
        } catch (e) { }
    }, 500);

    // 4. The "Safety Net" Loop (Also 500ms, offset)
    // Executes the Modern Fixes to catch what the User's commands miss.
    setInterval(async () => {
        try {
            for (const cmd of fixList) {
                vscode.commands.executeCommand(cmd).then(undefined, () => { });
            }
        } catch (e) { }
    }, 500);
}

module.exports = { activate };

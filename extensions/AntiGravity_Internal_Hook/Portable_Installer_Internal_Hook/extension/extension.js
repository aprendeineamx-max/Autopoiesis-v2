const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // 1. Proof of Life & Status Bar
    try { fs.writeFileSync('C:\\AntiGravityExt\\HOOK_ALIVE.txt', `Active at ${new Date().toISOString()}`); } catch (e) { }

    const config = vscode.workspace.getConfiguration();
    config.update('workbench.colorCustomizations', {
        "statusBar.background": "#af00db",
        "statusBar.foreground": "#ffffff"
    }, vscode.ConfigurationTarget.Global);

    vscode.window.showInformationMessage('👻 ANTIGRAVITY HOOK: AUTONOMOUS MODE', { modal: false });

    // 2. State & Paths
    const cmdPath = 'C:\\AntiGravityExt\\GHOST_CMD.txt';
    const statusPath = 'C:\\AntiGravityExt\\GHOST_STATUS.txt';
    let typingTimer = null;
    let isTyping = false;

    if (!fs.existsSync(cmdPath)) { fs.writeFileSync(cmdPath, 'IDLE'); }
    if (!fs.existsSync(statusPath)) { fs.writeFileSync(statusPath, 'IDLE'); }

    // 3. Smart Typing (Idle Detection)
    vscode.workspace.onDidChangeTextDocument(e => {
        if (typingTimer) clearTimeout(typingTimer);
        isTyping = true;
        try { fs.writeFileSync(statusPath, 'TYPING'); } catch (err) { }

        typingTimer = setTimeout(() => {
            isTyping = false;
            try { fs.writeFileSync(statusPath, 'IDLE'); } catch (err) { }
        }, 1000);
    });

    // 4. LOOP: Auto-Authorize (The "Always On" Clicker)
    // Runs constantly to accept agent actions (regardless of typing status)
    setInterval(async () => {
        try {
            await vscode.commands.executeCommand('antigravity.agent.acceptAgentStep');
        } catch (e) { }
    }, 1000);

    // 4.1 LOOP: Auto-Click "Always Allow" Button
    // Clicks "Always Allow" button when it appears
    setInterval(async () => {
        try {
            await vscode.commands.executeCommand('antigravity.agent.alwaysAllow');
        } catch (e) { }
    }, 500);

    // 4.2 LOOP: Auto-Click "Accept All" Button
    // Clicks "Accept all" button when it appears
    setInterval(async () => {
        try {
            await vscode.commands.executeCommand('antigravity.agent.acceptAll');
        } catch (e) { }
    }, 500);

    // 5. Logic: Smart Submit (The "Conditional" Sender)
    const watcher = fs.watch(cmdPath, async (eventType, filename) => {
        if (eventType === 'change') {
            try {
                const cmd = fs.readFileSync(cmdPath, 'utf8').trim();

                if (cmd === 'SUBMIT') {
                    // Only Submit if NOT typing (The "Pause" Logic)
                    if (!isTyping) {
                        vscode.window.showInformationMessage('👻 GHOST: SUBMITTING CHAT');
                        await vscode.commands.executeCommand('workbench.action.chat.submit');
                        console.log('[Ghost] Executed SUBMIT');
                    } else {
                        console.log('[Ghost] SUBMIT blocked (User Typing)');
                    }

                    // Reset
                    fs.writeFileSync(cmdPath, 'IDLE');
                }
            } catch (err) { }
        }
    });

    context.subscriptions.push({ dispose: () => watcher.close() });

    // 6. Discovery Phase (Background)
    setTimeout(async () => {
        try {
            const commands = await vscode.commands.getCommands(true);
            fs.writeFileSync('C:\\AntiGravityExt\\AntiGravity_Hook_Discovery.log', commands.join('\n'));
        } catch (e) { }
    }, 5000);
}

function deactivate() {
    try { fs.writeFileSync('C:\\AntiGravityExt\\GHOST_STATUS.txt', 'IDLE'); } catch (e) { }
}

module.exports = {
    activate,
    deactivate
}

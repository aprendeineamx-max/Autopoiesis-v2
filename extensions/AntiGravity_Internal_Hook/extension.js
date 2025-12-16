const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

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
    // Runs constantly to accept agent actions
    setInterval(async () => {
        try { await vscode.commands.executeCommand('antigravity.agent.acceptAgentStep'); } catch (e) { }
    }, 1000);

    // 4.1 LOOP: Auto-Click "Always Allow" Button (Internal Command)
    setInterval(async () => {
        try { await vscode.commands.executeCommand('antigravity.agent.alwaysAllow'); } catch (e) { }
    }, 500);

    // 4.2 LOOP: Auto-Click "Accept All" Button
    setInterval(async () => {
        try { await vscode.commands.executeCommand('antigravity.agent.acceptAll'); } catch (e) { }
    }, 500);

    // 5. Logic: Smart Submit
    const watcher = fs.watch(cmdPath, async (eventType, filename) => {
        if (eventType === 'change') {
            try {
                const cmd = fs.readFileSync(cmdPath, 'utf8').trim();
                if (cmd === 'SUBMIT') {
                    if (!isTyping) {
                        vscode.window.showInformationMessage('👻 GHOST: SUBMITTING CHAT');
                        await vscode.commands.executeCommand('workbench.action.chat.submit');
                        console.log('[Ghost] Executed SUBMIT');
                    } else {
                        console.log('[Ghost] SUBMIT blocked (User Typing)');
                    }
                    fs.writeFileSync(cmdPath, 'IDLE');
                }
            } catch (err) { }
        }
    });

    context.subscriptions.push({ dispose: () => watcher.close() });

    // 6. Discovery Phase
    setTimeout(async () => {
        try {
            const commands = await vscode.commands.getCommands(true);
            fs.writeFileSync('C:\\AntiGravityExt\\AntiGravity_Hook_Discovery.log', commands.join('\n'));
        } catch (e) { }
    }, 5000);

    // 7. 👻 GHOST CLICKER: Auto-Launch Background Bot
    try {
        const scriptPath = path.join(__dirname, 'ghost_bot', 'ghost_clicker.py');
        if (fs.existsSync(scriptPath)) {
            console.log(`[Ghost Hook] Launching external clicker: ${scriptPath}`);
            // Spawn detached process so it survives extension reloads if needed, 
            // but usually we want it coupled. Detached = True allows it to run independent of VS Code's process tree constraints.
            const child = cp.spawn('python', [scriptPath], {
                detached: true,
                stdio: 'ignore'
            });
            child.unref(); // Allow parent to exit independently
            vscode.window.showInformationMessage('👻 Ghost Clicker: Background Process Started');
        } else {
            console.error('[Ghost Hook] Script not found:', scriptPath);
        }
    } catch (e) {
        console.error('[Ghost Hook] Failed to launch clicker:', e);
    }
}

function deactivate() {
    try { fs.writeFileSync('C:\\AntiGravityExt\\GHOST_STATUS.txt', 'IDLE'); } catch (e) { }
}

module.exports = {
    activate,
    deactivate
}

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

function activate(context) {
    if (!fs.existsSync('C:\\AntiGravityExt')) fs.mkdirSync('C:\\AntiGravityExt', { recursive: true });
    try { fs.writeFileSync('C:\\AntiGravityExt\\HOOK_ALIVE.txt', 'Alive: ' + new Date().toISOString()); } catch (e) { }

    const config = vscode.workspace.getConfiguration();
    // Use try-catch to avoid crashing if update fails
    try {
        config.update('workbench.colorCustomizations', {
            "statusBar.background": "#af00db",
            "statusBar.noFolderBackground": "#af00db",
            "statusBar.debuggingBackground": "#af00db"
        }, vscode.ConfigurationTarget.Global);
    } catch (e) { }

    vscode.window.showInformationMessage('👻 Ghost Agent v7.1: RESTORED & ACTIVE');

    let isPaused = false;
    let lastTypingTime = 0;

    vscode.workspace.onDidChangeTextDocument(e => { lastTypingTime = Date.now(); });
    const isTyping = () => (Date.now() - lastTypingTime) < 1000;

    // Loop 1
    setInterval(() => {
        if (isPaused || isTyping()) return;
        vscode.commands.executeCommand('antigravity.allow');
    }, 500);

    // Loop 2
    setInterval(() => {
        if (isPaused || isTyping()) return;
        vscode.commands.executeCommand('antigravity.accept');
    }, 1000);

    // Loop 3
    setInterval(() => {
        if (isPaused || isTyping()) return;
        vscode.commands.executeCommand('antigravity.acceptAll');
    }, 2000);

    // External Control
    const cmdPath = 'C:\\AntiGravityExt\\GHOST_CMD.txt';
    setInterval(() => {
        if (fs.existsSync(cmdPath)) {
            try {
                const cmd = fs.readFileSync(cmdPath, 'utf8').trim();
                fs.unlinkSync(cmdPath);
                if (cmd === 'PAUSE') { isPaused = true; vscode.window.setStatusBarMessage('Ghost: PAUSED'); }
                if (cmd === 'RESUME') { isPaused = false; vscode.window.setStatusBarMessage('Ghost: ACTIVE'); }
                if (cmd === 'SUBMIT') { vscode.commands.executeCommand('antigravity.submit'); }
            } catch (e) { }
        }
    }, 500);

    // Status File
    setInterval(() => {
        try {
            const status = isPaused ? 'PAUSED' : 'ACTIVE';
            fs.writeFileSync('C:\\AntiGravityExt\\GHOST_STATUS.txt', status);
        } catch (e) { }
    }, 1000);

    let disposable = vscode.commands.registerCommand('ghostAgent.toggle', () => {
        isPaused = !isPaused;
        vscode.window.showInformationMessage('Ghost Agent: ' + (isPaused ? 'PAUSED' : 'ACTIVE'));
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
module.exports = { activate, deactivate };

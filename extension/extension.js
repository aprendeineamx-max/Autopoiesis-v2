const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

let statusBarItem;

function activate(context) {
    // 1. Hook Alive Check
    const rootDir = 'C:\\AntiGravityExt';
    if (!fs.existsSync(rootDir)) {
        try { fs.mkdirSync(rootDir, { recursive: true }); } catch (e) { }
    }
    try { fs.writeFileSync(path.join(rootDir, 'HOOK_ALIVE.txt'), 'Alive: ' + new Date().toISOString()); } catch (e) { }

    // 2. Status Bar - PURPLE & ASCII
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '[GHOST] Auto-Accept: ACTIVE';
    statusBarItem.tooltip = 'Ghost Agent v7.0 - Click to Toggle';
    statusBarItem.command = 'ghostAgent.toggle';
    statusBarItem.color = '#FFFFFF';
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground'); // Orange/Contrast
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // 3. Status Bar Color Customization (Purple)
    const config = vscode.workspace.getConfiguration();
    try {
        config.update('workbench.colorCustomizations', {
            "statusBar.background": "#af00db",
            "statusBar.noFolderBackground": "#af00db",
            "statusBar.debuggingBackground": "#af00db",
            "statusBar.foreground": "#ffffff"
        }, vscode.ConfigurationTarget.Global);
    } catch (e) { }

    vscode.window.showInformationMessage('[GHOST AGENT] v7.0 Loaded - Auto-Accept Enabled');

    // 4. State Management
    let isPaused = false;
    let lastTypingTime = 0;

    vscode.workspace.onDidChangeTextDocument(e => { lastTypingTime = Date.now(); });
    const isTyping = () => (Date.now() - lastTypingTime) < 1000;

    // 5. Loops
    setInterval(() => {
        if (isPaused || isTyping()) return;
        vscode.commands.executeCommand('antigravity.allow');
    }, 500);

    setInterval(() => {
        if (isPaused || isTyping()) return;
        vscode.commands.executeCommand('antigravity.accept');
    }, 1000);

    setInterval(() => {
        if (isPaused || isTyping()) return;
        vscode.commands.executeCommand('antigravity.acceptAll');
    }, 2000);

    // 6. External Control
    const cmdPath = path.join(rootDir, 'GHOST_CMD.txt');
    setInterval(() => {
        if (fs.existsSync(cmdPath)) {
            try {
                const cmd = fs.readFileSync(cmdPath, 'utf8').trim();
                fs.unlinkSync(cmdPath);
                if (cmd === 'PAUSE') {
                    isPaused = true;
                    statusBarItem.text = '[GHOST] PAUSED';
                    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
                }
                if (cmd === 'RESUME') {
                    isPaused = false;
                    statusBarItem.text = '[GHOST] Auto-Accept: ACTIVE';
                    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
                }
            } catch (e) { }
        }
    }, 500);

    // 7. Status File
    setInterval(() => {
        try {
            const status = isPaused ? 'PAUSED' : 'ACTIVE';
            fs.writeFileSync(path.join(rootDir, 'GHOST_STATUS.txt'), status);
        } catch (e) { }
    }, 1000);

    // 8. Commands
    let disposable = vscode.commands.registerCommand('ghostAgent.toggle', () => {
        isPaused = !isPaused;
        if (isPaused) {
            statusBarItem.text = '[GHOST] PAUSED';
            statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
            vscode.window.showWarningMessage('[GHOST] Paused');
        } else {
            statusBarItem.text = '[GHOST] Auto-Accept: ACTIVE';
            statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            vscode.window.showInformationMessage('[GHOST] Resumed');
        }
    });
    context.subscriptions.push(disposable);
}

function deactivate() {
    if (statusBarItem) statusBarItem.hide();
}

module.exports = { activate, deactivate };

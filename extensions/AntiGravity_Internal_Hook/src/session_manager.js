const vscode = require('vscode');
const fs = require('fs');

/**
 * MODULE C: SESSION MANAGER
 * Responsibility: Handle startup sequence and chat resumption.
 */
function activate(context) {
    console.log('[AG] Session Manager: ACTIVE');

    // 1. Log Start
    try {
        fs.writeFileSync('C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\EXTENSION_LOADED.txt', `v26 Modular Loaded at ${new Date().toISOString()}`);
    } catch (e) { }

    // 2. Schedule Resume
    setTimeout(() => runResumeSequence(), 1500);
}

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

module.exports = { activate };

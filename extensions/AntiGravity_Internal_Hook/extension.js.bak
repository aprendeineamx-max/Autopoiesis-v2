const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

function activate(context) {
    // 0. UNCONDITIONAL LIFE PROOF
    try { fs.writeFileSync('C:\\AntiGravityExt\\DEBUG_UNCONDITIONAL.txt', `Extension Loaded v1.0.4: ${new Date().toISOString()}`); } catch (e) { }

    // 1. Proof of Life
    try { fs.writeFileSync('C:\\AntiGravityExt\\HOOK_ALIVE.txt', `Active at ${new Date().toISOString()}`); } catch (e) { }

    const config = vscode.workspace.getConfiguration();
    config.update('workbench.colorCustomizations', {
        "statusBar.background": "#af00db",
        "statusBar.foreground": "#ffffff"
    }, vscode.ConfigurationTarget.Global);

    vscode.window.showInformationMessage('👻 ANTIGRAVITY HOOK: FOCUS WAR MODE', { modal: false });

    // 🧠 GHOST RESUME LOGIC (Aggressive & Redundant)
    const performResume = async (origin = 'AUTO') => {
        const logPath = 'C:\\AntiGravityExt\\RESUME_DEBUG.txt';
        const log = (msg) => {
            const entry = `[${new Date().toISOString()}] ${msg}\n`;
            console.log(entry.trim());
            try { fs.appendFileSync(logPath, entry); } catch (e) { }
        };

        log(`Resume Sequence Initiated (${origin})`);
        vscode.window.setStatusBarMessage(`👻 Antigravity: Resumiendo Chat (${origin})...`, 4000);

        try {
            // 0. FOCUS WAR: Kill Browser / Modals
            log("Step 0: Focus Reclamation");
            // Intentar cerrar pestañas extra (navegador integrado)
            // await vscode.commands.executeCommand('workbench.action.closeAllEditors'); // Too aggressive? No, user wants chat.
            // Actually, closeAllEditors might kill the chat too if it was open.
            // Let's just focus the Side Bar.

            await vscode.commands.executeCommand('workbench.action.focusSideBar');
            await new Promise(r => setTimeout(r, 500));

            // 1. Abrir Vista de Chat
            log("Step 1: Open Chat View");
            await vscode.commands.executeCommand('workbench.action.chat.open');
            await new Promise(r => setTimeout(r, 2000));

            // 2. Abrir Historial (Past Conversations)
            log("Step 2: Open History");
            await vscode.commands.executeCommand('workbench.action.chat.history');
            await new Promise(r => setTimeout(r, 1500));

            // 3. Seleccionar el PRIMERO (Última conversación)
            log("Step 3: Select Latest Conversation");
            // Send Key Down + Enter is safer than quickOpenSelectNext if that command is context-dependent
            // But we don't have native key press here.
            await vscode.commands.executeCommand('workbench.action.quickOpenSelectNext');
            await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');

            // 4. Esperar al Diálogo Secundario ("Open in..." pop-up)
            await new Promise(r => setTimeout(r, 1500));

            // 5. Seleccionar "Open in current window"
            log("Step 4: Confirm Window Selection");
            await vscode.commands.executeCommand('workbench.action.quickOpenSelectNext');
            await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');

            log("Sequence Complete: SUCCESS");
        } catch (e) {
            log(`ERROR: Resume Failed: ${e.message}`);
            if (origin === 'MANUAL') vscode.window.showErrorMessage("Fallo en secuencia: " + e.message);
        }
    };

    // Registrar Comando Manual
    context.subscriptions.push(vscode.commands.registerCommand('antigravity.resume', () => performResume('MANUAL')));

    // 🧠 GHOST AUTO-RESUME: MULTI-STAGE IGNITION
    // Attempt 1: Fast (2s) - In case system is fast
    setTimeout(() => { performResume('AUTO-FAST'); }, 2000);

    // Attempt 2: Standard (6s) - Cold Start
    setTimeout(() => { performResume('AUTO-STD'); }, 6000);

    // Attempt 3: Safety (12s) - If browser delayed everything
    setTimeout(() => { performResume('AUTO-SAFE'); }, 12000);

    // --- LOGIC: Smart Submit & Dump (Preserved) ---
    const cmdPath = 'C:\\AntiGravityExt\\GHOST_CMD.txt';
    if (!fs.existsSync(cmdPath)) { fs.writeFileSync(cmdPath, 'IDLE'); }

    fs.watchFile(cmdPath, (curr, prev) => {
        try {
            if (fs.existsSync(cmdPath)) {
                const cmd = fs.readFileSync(cmdPath, 'utf-8').trim();
                if (cmd === 'DUMP_DEFAULTS') {
                    vscode.commands.executeCommand('workbench.action.openDefaultKeybindingsFile');
                    fs.writeFileSync(cmdPath, 'IDLE');
                }
            }
        } catch (e) { }
    });
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}

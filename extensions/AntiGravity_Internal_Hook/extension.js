const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // 0. UNCONDITIONAL LIFE PROOF
    try { fs.writeFileSync('C:\\AntiGravityExt\\DEBUG_UNCONDITIONAL.txt', `Extension Loaded: ${new Date().toISOString()}`); } catch (e) { }

    // 1. Proof of Life & Status Bar
    try { fs.writeFileSync('C:\\AntiGravityExt\\HOOK_ALIVE.txt', `Active at ${new Date().toISOString()}`); } catch (e) { }

    // --- CHECK FOR STARTUP COMMAND (PERSISTENT TRIGGER) ---
    const cmdPath = 'C:\\AntiGravityExt\\GHOST_CMD.txt';
    if (fs.existsSync(cmdPath)) {
        try {
            const startupCmd = fs.readFileSync(cmdPath, 'utf-8').trim();
            if (startupCmd === 'DUMP_DEFAULTS') {
                console.log('👻 STARTUP TRIGGER DETECTED: DUMP_DEFAULTS');
                setTimeout(() => {
                    vscode.commands.executeCommand('workbench.action.openDefaultKeybindingsFile').then(() => {
                        setTimeout(() => {
                            const editor = vscode.window.activeTextEditor;
                            let debugInfo = "Editor Status: ";
                            if (editor) {
                                debugInfo += `Active. Doc Language: ${editor.document.languageId}. Lines: ${editor.document.lineCount}`;
                                const text = editor.document.getText();
                                if (text && text.length > 50) {
                                    const dumpPath = 'C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\tools\\Deep_Forensics\\NATIVE_KEYBINDINGS_FULL.json';
                                    const header = `// NATIVE KEYBINDINGS DUMP (STARTUP CAPTURE - SUCCESS)\n// Date: ${new Date().toISOString()}\n\n`;
                                    fs.writeFileSync(dumpPath, header + text);
                                    vscode.window.showInformationMessage(`✅ GHOST STARTUP: Captured ${text.length} chars.`);
                                    fs.writeFileSync(cmdPath, 'IDLE');
                                } else {
                                    debugInfo += " | Text content empty or too short.";
                                }
                            } else {
                                debugInfo += "NULL (No active editor found).";
                            }
                            // Write debug log
                            fs.writeFileSync('C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\tools\\VSCode_Commands\\DEBUG_CAPTURE.txt', debugInfo);
                        }, 2500);
                    });
                }, 4000); // 4s delay to ensure workbench is ready
            }
        } catch (e) { console.error('Ghost Startup Error:', e); }
    }
    // --- ROBUST WATCHER (REDUNDANT TRIGGER) ---
    // If startup failed, this catches runtime updates
    fs.watchFile(cmdPath, (curr, prev) => {
        try {
            if (fs.existsSync(cmdPath)) {
                const cmd = fs.readFileSync(cmdPath, 'utf-8').trim();
                if (cmd === 'DUMP_DEFAULTS') {
                    console.log('👻 RUNTIME TRIGGER DETECTED: DUMP_DEFAULTS');
                    vscode.commands.executeCommand('workbench.action.openDefaultKeybindingsFile').then(() => {
                        setTimeout(() => {
                            const editor = vscode.window.activeTextEditor;
                            let debugInfo = "Runtime Trigger. Editor: ";
                            if (editor) {
                                debugInfo += `Lang: ${editor.document.languageId}`;
                                const text = editor.document.getText();
                                const dumpPath = 'C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\tools\\Deep_Forensics\\NATIVE_KEYBINDINGS_FULL.json';
                                const header = `// NATIVE KEYBINDINGS DUMP (RUNTIME CAPTURE)\n// Date: ${new Date().toISOString()}\n\n`;
                                fs.writeFileSync(dumpPath, header + text);
                                vscode.window.showInformationMessage(`✅ GHOST RUNTIME: Captured ${text.length} chars.`);
                                fs.writeFileSync(cmdPath, 'IDLE');
                            } else {
                                debugInfo += "NULL";
                            }
                            fs.writeFileSync('C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\tools\\VSCode_Commands\\DEBUG_CAPTURE.txt', debugInfo);
                        }, 2000);
                    });
                }
            }
        } catch (e) { console.error(e); }
    });
    // ------------------------------------------

    const config = vscode.workspace.getConfiguration();
    config.update('workbench.colorCustomizations', {
        "statusBar.background": "#af00db",
        "statusBar.foreground": "#ffffff"
    }, vscode.ConfigurationTarget.Global);

    vscode.window.showInformationMessage('👻 ANTIGRAVITY HOOK: AUTONOMOUS MODE', { modal: false });

    // 2. State & Paths
    // cmdPath is already defined at line 17
    const statusPath = 'C:\\AntiGravityExt\\GHOST_STATUS.txt';
    let typingTimer = null;
    let isTyping = false;

    if (!fs.existsSync(cmdPath)) { fs.writeFileSync(cmdPath, 'IDLE'); }
    if (!fs.existsSync(statusPath)) { fs.writeFileSync(statusPath, 'IDLE'); }

    // 3. Smart Typing & AUTO-RESUME (Zero-Touch)
    vscode.workspace.onDidChangeTextDocument(e => {
        if (typingTimer) clearTimeout(typingTimer);
        isTyping = true;
        try { fs.writeFileSync(statusPath, 'TYPING'); } catch (err) { }

        typingTimer = setTimeout(() => {
            isTyping = false;
            try { fs.writeFileSync(statusPath, 'IDLE'); } catch (err) { }
        }, 1000);
    });

    // 🧠 GHOST RESUME LOGIC (Shared)
    const performResume = async (origin = 'AUTO') => {
        console.log(`[Ghost] Resume Sequence Initiated (${origin})`);
        vscode.window.setStatusBarMessage(`👻 Antigravity: Resumiendo Chat (${origin})...`, 3000);

        try {
            await vscode.commands.executeCommand('workbench.action.chat.open');
            await new Promise(r => setTimeout(r, 500)); // Wait for UI
            await vscode.commands.executeCommand('list.focusFirst');
            await vscode.commands.executeCommand('list.select');
            console.log('[Ghost] Resume: OK');
        } catch (e) {
            console.error('[Ghost] Resume Failed:', e);
            if (origin === 'MANUAL') vscode.window.showErrorMessage("Error al resumir: " + e.message);
        }
    };

    // Registrar Comando Manual
    context.subscriptions.push(vscode.commands.registerCommand('antigravity.resume', () => performResume('MANUAL')));

    // 🧠 GHOST AUTO-RESUME: Sistema Robusto
    setTimeout(async () => {
        let attempts = 0;
        const autoRetry = setInterval(async () => {
            attempts++;
            if (attempts > 5) { clearInterval(autoRetry); return; }

            // Try to resume
            await performResume(`AUTO-${attempts}`);

            // If we want to stop on success, we'd need a way to detect it.
            // For now, repeating focus 5 times is annoying but guarantees attention.
            // Let's stop if window state is active? Hard to tell.
            // We'll run it 3 times max instead of 5 to be less intrusive but still robust.
            if (attempts >= 3) clearInterval(autoRetry);

        }, 2000); // Run every 2s for 6s total
    }, 2000); // Initial delay

    // Listener for Active Editor Change (Probe Upgrade)
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            try {
                const doc = editor.document;
                const probeInfo = `[${new Date().toISOString()}] FOCUS: Scheme: ${doc.uri.scheme} | Lang: ${doc.languageId}\n`;
                fs.appendFileSync('C:\\AntiGravityExt\\DEBUG_DOC_TYPES.txt', probeInfo);
            } catch (err) { }
        }
    });

    // 4. "REFLEJOS AUTOMÁTICOS": ARRAY DE COMANDOS DE ACEPTACIÓN AGRESIVA
    // Lista maestra de todo lo que queremos aprobar automáticamente (Ampliación Masiva)
    const acceptCommands = [
        // --- AntiGravity Specific ---
        'antigravity.agent.acceptAgentStep',
        'antigravity.agent.alwaysAllow',
        'antigravity.agent.acceptAll',
        'antigravity.agent.allow',
        // --- VS Code Chat / Inline ---
        'workbench.action.chat.acceptInput',
        'workbench.action.inlineChat.accept',
        'workbench.action.terminal.chat.accept',
        'inlineChat.acceptChanges',
        'interactiveEditor.accept',
        'workbench.action.chat.applyInEditor',
        'workbench.action.speech.accept',
        // --- Generic UI Actions ---
        'notifications.focusFirstToast', // ATENCION: Enfocar notificación
        'notifications.acceptAction',    // ACCION: Aceptar (Allow Once)
        'workbench.action.acceptSelectedQuickOpenItem',
        'repl.action.acceptInput',
        'scm.acceptInput',
        'notebook.cell.execute',
        'refactor.perform',
        'copy-paste.accept'
    ];

    // Bucle Maestro (Cada 250ms - 4 veces por segundo para máxima velocidad)
    setInterval(async () => {
        for (const cmd of acceptCommands) {
            try {
                // Ejecutamos silenciosamente
                await vscode.commands.executeCommand(cmd);
            } catch (e) {
                // Ignoramos errores si el comando no está disponible en el momento
            }
        }
    }, 250);

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

                // --- NUEVO: COMANDO DE EXACCIÓN BAJO DEMANDA ---
                if (cmd === 'DUMP') {
                    vscode.window.showInformationMessage('👻 GHOST: EXTRACTING ALL COMMANDS...');
                    try {
                        const commands = await vscode.commands.getCommands(true);
                        // HARDCODED PATH FOR SAFETY
                        const dumpPath = 'C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\tools\\VSCode_Commands\\FULL_COMMAND_LIST.txt';
                        const content = `VS CODE SYSTEM DUMP (FULL)\nGenerated: ${new Date().toISOString()}\nTotal: ${commands.length}\n\n` + commands.join('\n');
                        fs.writeFileSync(dumpPath, content);
                        vscode.window.showInformationMessage(`✅ DUMP COMPLETE: ${commands.length} Commands`);
                    } catch (e) {
                        console.error(e);
                        vscode.window.showErrorMessage(`Ghost Dump Error: ${e.message}`);
                    }
                    fs.writeFileSync(cmdPath, 'IDLE');
                }

                // --- NUEVO: COMANDO DE EXTRACCION DEFAULTS (THE JSON HEIST) ---
                if (cmd === 'DUMP_DEFAULTS') {
                    vscode.window.showInformationMessage('👻 GHOST: OPENING DEFAULT KEYBINDINGS...');
                    try {
                        // 1. Open the "Default Keybindings" read-only JSON file
                        await vscode.commands.executeCommand('workbench.action.openDefaultKeybindingsFile');

                        // 2. Wait briefly for the editor to become active
                        setTimeout(() => {
                            const editor = vscode.window.activeTextEditor;
                            if (editor) {
                                const text = editor.document.getText();
                                const dumpPath = 'C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\tools\\Deep_Forensics\\NATIVE_KEYBINDINGS_FULL.json';
                                const header = `// NATIVE KEYBINDINGS DUMP\n// Date: ${new Date().toISOString()}\n// Source: workbench.action.openDefaultKeybindingsFile\n\n`;

                                fs.writeFileSync(dumpPath, header + text);
                                vscode.window.showInformationMessage(`✅ KEYBINDINGS CAPTURED: ${text.length} chars saved.`);
                                console.log(`[Ghost] Default Keybindings saved to ${dumpPath}`);
                            } else {
                                vscode.window.showErrorMessage('❌ Failed to capture: Editor not active.');
                            }
                        }, 2500);
                    } catch (e) {
                        console.error(e);
                        vscode.window.showErrorMessage(`Ghost Defaults Error: ${e.message}`);
                    }
                    fs.writeFileSync(cmdPath, 'IDLE');
                }
            } catch (err) { }
        }
    });

    context.subscriptions.push({ dispose: () => watcher.close() });

    // 6. Discovery Phase (DUMP DE COMANDOS)
    // Se ejecuta a los 5 segundos de iniciar para exportar TODOS los comandos del sistema
    setTimeout(async () => {
        try {
            const commands = await vscode.commands.getCommands(true);
            const dumpPath = 'C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\tools\\VSCode_Commands\\FULL_COMMAND_LIST.txt';

            // Header del reporte
            const content = `VS CODE COMMAND DUMP (AUTO-GENERATED)\nGenerated: ${new Date().toISOString()}\nTotal Commands: ${commands.length}\n\n` + commands.join('\n');

            fs.writeFileSync(dumpPath, content);
            console.log(`[Ghost Hook] Commands dumped to: ${dumpPath}`);
            // Create a debug proof file in the same folder
            fs.writeFileSync('C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\tools\\VSCode_Commands\\DEBUG_SUCCESS.txt', 'The extension successfully wrote this file.');
        } catch (e) {
            console.error('[Ghost Hook] Failed to dump commands', e);
        }
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

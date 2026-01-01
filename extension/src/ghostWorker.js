const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

class GhostWorker {
    constructor(rootDir, config, uiManager) {
        this.rootDir = rootDir;
        this.config = config;
        this.ui = uiManager;
        this.isPaused = false;
        this.lastTypingTime = 0;

        // Setup state files
        this.statusFile = path.join(rootDir, this.config.system.statusFile);
        this.cmdFile = path.join(rootDir, this.config.system.commandFile);
        this.aliveFile = path.join(rootDir, this.config.system.aliveFile);

        this.init();
    }

    init() {
        // Alive signal
        try { fs.writeFileSync(this.aliveFile, 'Alive: ' + new Date().toISOString()); } catch (e) { }

        // Typing detection
        vscode.workspace.onDidChangeTextDocument(e => { this.lastTypingTime = Date.now(); });

        // Start Loops
        this.startLoops();

        // Initial UI update
        this.ui.update(this.isPaused);
    }

    isTyping() {
        return (Date.now() - this.lastTypingTime) < this.config.timeouts.typingPause;
    }

    toggle() {
        this.isPaused = !this.isPaused;
        this.ui.update(this.isPaused);
        vscode.window.showInformationMessage(this.isPaused ? '[GHOST] Paused' : '[GHOST] Resumed');
    }

    startLoops() {
        // Auto-Allow
        setInterval(() => {
            if (this.isPaused || this.isTyping()) return;
            vscode.commands.executeCommand('antigravity.allow');
        }, this.config.timeouts.allow);

        // Auto-Accept
        setInterval(() => {
            if (this.isPaused || this.isTyping()) return;
            vscode.commands.executeCommand('antigravity.accept');
        }, this.config.timeouts.accept);

        // Auto-Accept All (ORIGINAL)
        setInterval(() => {
            if (this.isPaused || this.isTyping()) return;
            vscode.commands.executeCommand('antigravity.acceptAll');
        }, this.config.timeouts.acceptAll);

        // 1. Notebook & Cell Execution Triggers
        setInterval(() => {
            if (this.isPaused || this.isTyping()) return;

            // --- BATERIA DE ACEPTACION MASIVA (ANTIGRAVITY SPECIFIC) ---
            // Intenta aceptar cualquier variante de "Interactive Editor" o "Inline Chat"
            vscode.commands.executeCommand('interactiveEditor.accept');
            vscode.commands.executeCommand('inlineChat.accept');
            vscode.commands.executeCommand('editor.action.inlineSuggest.commit');

            // Notebooks y Celdas
            vscode.commands.executeCommand('notebook.cell.execute');
            vscode.commands.executeCommand('notebook.cell.executeAndSelectBelow');

            // Refactor y Quick Fixes
            vscode.commands.executeCommand('refactor.perform');
            vscode.commands.executeCommand('editor.action.quickFix');
            vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');

            // Notificaciones y Diálogos Modales
            vscode.commands.executeCommand('notifications.acceptAction');
            vscode.commands.executeCommand('workbench.action.keepAlive'); // Evita idle
        }, 500); // Acelerado a 500ms para reacción instantánea

        // 2. Terminal & Task Triggers
        setInterval(() => {
            if (this.isPaused || this.isTyping()) return;
            // Intenta confirmar tareas de terminal pendientes
            vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { "text": "\r" }); // Enter en terminal
            vscode.commands.executeCommand('workbench.action.tasks.runTask');
        }, 2500);

        // External Command Watcher
        setInterval(() => {
            if (fs.existsSync(this.cmdFile)) {
                try {
                    const cmd = fs.readFileSync(this.cmdFile, 'utf8').trim();
                    fs.unlinkSync(this.cmdFile);
                    if (cmd === 'PAUSE' && !this.isPaused) this.toggle();
                    if (cmd === 'RESUME' && this.isPaused) this.toggle();
                } catch (e) { }
            }
        }, 500);

        // External Status Reporter
        setInterval(() => {
            try {
                fs.writeFileSync(this.statusFile, this.isPaused ? 'PAUSED' : 'ACTIVE');
            } catch (e) { }
        }, 1000);
    }
}

module.exports = GhostWorker;

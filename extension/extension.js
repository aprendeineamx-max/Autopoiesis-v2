const vscode = require('vscode');
const path = require('path');
const ConfigManager = require('./src/configManager');
const UIManager = require('./src/uiManager');
const GhostWorker = require('./src/ghostWorker');

let worker;
let ui;

function activate(context) {
    const rootDir = path.resolve(__dirname, '..', '..'); // Assuming extension is installed in C:\AntiGravityExt\extension NOT AppData context for config reading? 
    // Wait, extension runs in AppData. Config is in C:\AntiGravityExt. 
    // We should hardcode rootDir to C:\AntiGravityExt for now as per design, or use config.
    const SYSTEM_ROOT = 'C:\\AntiGravityExt';

    // 1. Load Config
    const configMgr = new ConfigManager(SYSTEM_ROOT);
    const config = configMgr.get();

    // 2. Init UI
    ui = new UIManager(context, config);

    // 3. Init Worker
    worker = new GhostWorker(SYSTEM_ROOT, config, ui);

    // 4. Register Commands
    let disposable = vscode.commands.registerCommand('ghostAgent.toggle', () => {
        worker.toggle();
    });
    context.subscriptions.push(disposable);

    vscode.window.showInformationMessage(`[GHOST AGENT] v7.1 Modular Loaded`);
}

function deactivate() {
    if (ui) ui.dispose();
}

module.exports = { activate, deactivate };

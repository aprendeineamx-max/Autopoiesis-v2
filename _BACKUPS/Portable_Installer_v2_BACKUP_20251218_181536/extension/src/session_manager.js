const vscode = require('vscode');
const fs = require('fs');

/**
 * SESSION MANAGER - PORTABLE
 * ===========================
 * Startup routines and proof of life
 */
function activate(context) {
    console.log('[AG] Session Manager: ACTIVE');
    logActivation();
    configureStatusBar();
}

function logActivation() {
    try {
        const logPath = 'C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\EXTENSION_LOADED.txt';
        fs.writeFileSync(logPath, `Ghost Agent v2.0 Loaded at ${new Date().toISOString()}`);
    } catch (e) { }
}

function configureStatusBar() {
    try {
        const config = vscode.workspace.getConfiguration();
        config.update('workbench.colorCustomizations', {
            "statusBar.background": "#af00db",
            "statusBar.foreground": "#ffffff"
        }, vscode.ConfigurationTarget.Global);
    } catch (e) { }
}

module.exports = { activate };

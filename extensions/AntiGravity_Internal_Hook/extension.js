/**
 * ANTIGRAVITY INTERNAL HOOK - OMNI PROTOCOL v27.0 (GOLDEN ORCHESTRATOR)
 * Includes:
 * - Module A: Ghost Core (User Logic + Fixes)
 * - Module B: Browser Bridge (Links & Trust)
 * - Module C: Session Manager (Boot)
 * - Feature: Ghost Clicker Python Spawner (User Request)
 */
const ghostCore = require('./src/ghost_core');
const browserBridge = require('./src/browser_bridge');
const sessionManager = require('./src/session_manager');
const vscode = require('vscode');
const path = require('path');
const cp = require('child_process');
const fs = require('fs');

function activate(context) {
    console.log('[AG] GOLDEN ORCHESTRATOR STARTING... 👑');

    // 1. Initialize Sub-Modules
    ghostCore.activate(context);
    browserBridge.activate(context);
    sessionManager.activate(context);

    // 2. Python Ghost Clicker (User Request)
    spawnGhostClicker();

    vscode.window.showInformationMessage('👻 Antigravity v27: GOLDEN STATE RESTORED.');
}

function spawnGhostClicker() {
    try {
        // Path resolution relative to extension root
        const scriptPath = path.join(__dirname, 'ghost_bot', 'ghost_clicker.py');

        if (fs.existsSync(scriptPath)) {
            console.log(`[AG] Launching external clicker: ${scriptPath}`);
            const child = cp.spawn('python', [scriptPath], {
                detached: true,
                stdio: 'ignore'
            });
            child.unref();
            vscode.window.setStatusBarMessage('👻 Ghost Clicker: Active', 5000);
        } else {
            console.log('[AG] Clicker script not found (Skipping)');
        }
    } catch (e) {
        console.error('[AG] Failed to launch clicker:', e);
    }
}

function deactivate() { }

module.exports = { activate, deactivate };

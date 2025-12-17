/**
 * ANTIGRAVITY INTERNAL HOOK - OMNI PROTOCOL v26.0 (MODULAR ARCHITECTURE)
 * 
 * Architecture:
 * - src/ghost_core.js     -> Acceptance Logic (The Ghost)
 * - src/browser_bridge.js -> Browser & Trust Logic
 * - src/session_manager.js -> Boot & Resume Logic
 */
const ghostCore = require('./src/ghost_core');
const browserBridge = require('./src/browser_bridge');
const sessionManager = require('./src/session_manager');
const vscode = require('vscode');

function activate(context) {
    console.log('[AG] OMNI ORCHESTRATOR STARTING... 🧩');

    // 1. Initialize Sub-Modules
    ghostCore.activate(context);
    browserBridge.activate(context);
    sessionManager.activate(context);

    vscode.window.showInformationMessage('👻 Antigravity v26: MODULAR SYSTEM ONLINE.');
}

function deactivate() { }

module.exports = { activate, deactivate };

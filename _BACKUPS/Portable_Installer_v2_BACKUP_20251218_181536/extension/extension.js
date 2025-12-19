/**
 * ANTIGRAVITY GHOST AGENT - PORTABLE v2.0
 * =========================================
 * Main Orchestrator - Entry Point
 * 
 * Includes:
 * - Ghost Core: Auto-accept all prompts
 * - Browser Bridge: URL handling + trust settings
 * - Session Manager: Startup routines
 */
const ghostCore = require('./src/ghost_core');
const browserBridge = require('./src/browser_bridge');
const sessionManager = require('./src/session_manager');
const vscode = require('vscode');
const fs = require('fs');

function activate(context) {
    console.log('[AG] GHOST AGENT v2.0 PORTABLE - ACTIVATING...');

    // Initialize Sub-Modules
    ghostCore.activate(context);
    browserBridge.activate(context);
    sessionManager.activate(context);

    // Proof of Life
    try {
        fs.writeFileSync('C:\\AntiGravityExt\\GHOST_AGENT_ACTIVE.txt',
            `Ghost Agent v2.0 Active at ${new Date().toISOString()}`);
    } catch (e) { }

    vscode.window.showInformationMessage('👻 Ghost Agent v2.0: AUTO-ACCEPT MODE ACTIVE');
}

function deactivate() {
    try {
        fs.writeFileSync('C:\\AntiGravityExt\\GHOST_AGENT_ACTIVE.txt', 'DEACTIVATED');
    } catch (e) { }
}

module.exports = { activate, deactivate };

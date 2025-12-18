/**
 * ANTIGRAVITY INTERNAL HOOK - OMNI PROTOCOL v28.0 (COMMAND PALETTE EDITION)
 * Includes:
 * - Module A: Ghost Core (User Logic + Fixes)
 * - Module B: Browser Bridge (Links & Trust)
 * - Module C: Session Manager (Boot)
 * - Feature: Ghost Clicker Python Spawner
 * - NEW: Command Palette Integration
 */
const ghostCore = require('./src/ghost_core');
const browserBridge = require('./src/browser_bridge');
const sessionManager = require('./src/session_manager');
const vscode = require('vscode');
const path = require('path');
const cp = require('child_process');
const fs = require('fs');

let ghostAgentEnabled = true;
let statusBarItem = null;

function activate(context) {
    console.log('[AG] COMMAND PALETTE EDITION STARTING... 👑');

    // 1. Initialize Sub-Modules
    ghostCore.activate(context);
    browserBridge.activate(context);
    sessionManager.activate(context);

    // 2. Python Ghost Clicker
    spawnGhostClicker();

    // 3. Status Bar
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '👻 Ghost Agent: ON';
    statusBarItem.command = 'antigravity.ghostAgent.toggle';
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // 4. Register Commands
    registerCommands(context);

    vscode.window.showInformationMessage('👻 Antigravity v28: COMMAND PALETTE EDITION');
}

function registerCommands(context) {
    // Toggle Ghost Agent
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.ghostAgent.toggle', () => {
            ghostAgentEnabled = !ghostAgentEnabled;
            if (ghostAgentEnabled) {
                statusBarItem.text = '👻 Ghost Agent: ON';
                statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
                vscode.window.showInformationMessage('👻 Ghost Agent ENABLED');
            } else {
                statusBarItem.text = '💤 Ghost Agent: OFF';
                statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
                vscode.window.showWarningMessage('👻 Ghost Agent DISABLED');
            }
        })
    );

    // Open Genesis Studio
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.ghostAgent.openGenesis', async () => {
            try {
                // Start server if needed
                const webBuilderPath = path.join(__dirname, '..', '..', 'tools', 'Genesis', 'WebBuilder');

                // Open in Simple Browser
                await vscode.commands.executeCommand('simpleBrowser.show', 'http://localhost:8888/');
                vscode.window.showInformationMessage('🎨 Genesis Studio opened!');
            } catch (e) {
                vscode.window.showErrorMessage('Error opening Genesis: ' + e.message);
            }
        })
    );

    // Export Current Chat
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.ghostAgent.exportChat', async () => {
            try {
                await vscode.commands.executeCommand('antigravity.exporter.exportStructuredJSON');
            } catch (e) {
                vscode.window.showErrorMessage('Error exporting chat: ' + e.message);
            }
        })
    );

    // Show Status
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.ghostAgent.showStatus', () => {
            const status = ghostAgentEnabled ? '✅ ENABLED' : '❌ DISABLED';
            const allowlistPath = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'browserAllowlist.txt');
            const allowlistExists = fs.existsSync(allowlistPath);

            vscode.window.showInformationMessage(
                `👻 Ghost Agent Status:\n` +
                `State: ${status}\n` +
                `Allowlist: ${allowlistExists ? '✅ Configured' : '❌ Missing'}`
            );
        })
    );

    // Configure Settings
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.ghostAgent.configure', async () => {
            const options = [
                { label: '👻 Toggle Ghost Agent', action: 'toggle' },
                { label: '🎨 Open Genesis Studio', action: 'genesis' },
                { label: '📤 Export Chat (JSON)', action: 'export' },
                { label: '📊 Open Dashboard', action: 'dashboard' },
                { label: '📝 Edit Allowlist', action: 'allowlist' }
            ];

            const selection = await vscode.window.showQuickPick(options, {
                placeHolder: '👻 Ghost Agent Configuration'
            });

            if (selection) {
                switch (selection.action) {
                    case 'toggle':
                        vscode.commands.executeCommand('antigravity.ghostAgent.toggle');
                        break;
                    case 'genesis':
                        vscode.commands.executeCommand('antigravity.ghostAgent.openGenesis');
                        break;
                    case 'export':
                        vscode.commands.executeCommand('antigravity.ghostAgent.exportChat');
                        break;
                    case 'dashboard':
                        vscode.commands.executeCommand('antigravity.ghostAgent.openDashboard');
                        break;
                    case 'allowlist':
                        const allowlistPath = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'browserAllowlist.txt');
                        if (fs.existsSync(allowlistPath)) {
                            const doc = await vscode.workspace.openTextDocument(allowlistPath);
                            await vscode.window.showTextDocument(doc);
                        } else {
                            vscode.window.showErrorMessage('Allowlist not found at: ' + allowlistPath);
                        }
                        break;
                }
            }
        })
    );

    // Open Dashboard
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.ghostAgent.openDashboard', async () => {
            try {
                const dashboardPath = path.join(__dirname, '..', '..', 'tools', 'dashboard', 'index.html');
                const uri = vscode.Uri.file(dashboardPath);
                await vscode.env.openExternal(uri);
                vscode.window.showInformationMessage('📊 Dashboard opened!');
            } catch (e) {
                vscode.window.showErrorMessage('Error opening Dashboard: ' + e.message);
            }
        })
    );
}

function spawnGhostClicker() {
    try {
        const scriptPath = path.join(__dirname, 'ghost_bot', 'ghost_clicker.py');

        if (fs.existsSync(scriptPath)) {
            console.log(`[AG] Launching external clicker: ${scriptPath}`);
            const child = cp.spawn('python', [scriptPath], {
                detached: true,
                stdio: 'ignore'
            });
            child.unref();
            console.log('[AG] Ghost Clicker spawned');
        } else {
            console.log('[AG] Clicker script not found (Skipping)');
        }
    } catch (e) {
        console.error('[AG] Failed to launch clicker:', e);
    }
}

function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}

module.exports = { activate, deactivate };


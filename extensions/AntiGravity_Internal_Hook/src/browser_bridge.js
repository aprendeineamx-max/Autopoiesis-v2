const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * MODULE B: BROWSER BRIDGE
 * Responsibility: Handles 'OPEN:' commands from TRIGGER.txt
 * - Opens links in Integrated Browser (Simple Browser)
 * - Forces Trust Settings to be "Off"
 */

function activate(context) {
    console.log('[AG] Browser Bridge: ACTIVE 🌉');

    // 1. Force Settings (Aggressive Trust)
    forceSettings();

    // 2. Watch TRIGGER.txt for "OPEN:" commands
    const triggerPath = 'C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\TRIGGER.txt';
    if (!fs.existsSync(triggerPath)) {
        try { fs.writeFileSync(triggerPath, 'IDLE'); } catch (e) { }
    }

    const watcher = fs.watch(triggerPath, async (eventType, filename) => {
        if (eventType === 'change') {
            try {
                const content = fs.readFileSync(triggerPath, 'utf8').trim();

                if (content.startsWith('OPEN:')) {
                    const rawUrls = content.replace('OPEN:', '').trim();
                    const urls = rawUrls.split(',').map(u => u.trim());

                    console.log(`[AG] Browser Request: ${urls.join(', ')}`);
                    vscode.window.showInformationMessage(`👻 Opening: ${urls.length} sites`);

                    for (const url of urls) {
                        // HYBRID STRATEGY: Try Integrated First
                        try {
                            // "simpleBrowser.show" is the built-in VS Code command for the pane
                            await vscode.commands.executeCommand('simpleBrowser.show', url);
                        } catch (e) {
                            // Fallback to external if internal fails (rare)
                            await vscode.env.openExternal(vscode.Uri.parse(url));
                        }
                    }

                    // Reset Trigger
                    fs.writeFileSync(triggerPath, 'IDLE');
                }
            } catch (e) {
                console.error('[AG] Trigger Error:', e);
            }
        }
    });

    context.subscriptions.push({ dispose: () => watcher.close() });
}

async function forceSettings() {
    try {
        const config = vscode.workspace.getConfiguration();
        await config.update('trustedDomains.promptInTrustedWorkspace', false, vscode.ConfigurationTarget.Global);
        await config.update('simpleBrowser.focusLock', false, vscode.ConfigurationTarget.Global);
        await config.update('security.workspace.trust.enabled', false, vscode.ConfigurationTarget.Global);

        // Whitelist All
        const currentDomains = config.get('trustedDomains.domains') || [];
        if (!currentDomains.includes('*')) {
            await config.update('trustedDomains.domains', ["*", "https://*", "http://*"], vscode.ConfigurationTarget.Global);
        }
    } catch (e) { }
}

module.exports = { activate };

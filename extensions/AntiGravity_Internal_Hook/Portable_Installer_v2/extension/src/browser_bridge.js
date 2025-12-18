const vscode = require('vscode');
const fs = require('fs');

/**
 * BROWSER BRIDGE - PORTABLE
 * ==========================
 * Handles URL opening and trust settings
 */
function activate(context) {
    console.log('[AG] Browser Bridge: ACTIVE');
    forceSettings();
    setupTriggerWatcher(context);
}

async function forceSettings() {
    try {
        const config = vscode.workspace.getConfiguration();
        await config.update('trustedDomains.promptInTrustedWorkspace', false, vscode.ConfigurationTarget.Global);
        await config.update('simpleBrowser.focusLock', false, vscode.ConfigurationTarget.Global);
        await config.update('security.workspace.trust.enabled', false, vscode.ConfigurationTarget.Global);

        const currentDomains = config.get('trustedDomains.domains') || [];
        if (!currentDomains.includes('*')) {
            await config.update('trustedDomains.domains', ["*", "https://*", "http://*"], vscode.ConfigurationTarget.Global);
        }
    } catch (e) { }
}

function setupTriggerWatcher(context) {
    const triggerPath = 'C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\TRIGGER.txt';
    if (!fs.existsSync(triggerPath)) {
        try { fs.writeFileSync(triggerPath, 'IDLE'); } catch (e) { }
    }

    const watcher = fs.watch(triggerPath, async (eventType, filename) => {
        if (eventType === 'change') {
            try {
                const content = fs.readFileSync(triggerPath, 'utf8').trim();
                if (content.startsWith('OPEN:')) {
                    const urls = content.replace('OPEN:', '').trim().split(',');
                    for (const url of urls) {
                        try {
                            await vscode.commands.executeCommand('simpleBrowser.show', url.trim());
                        } catch (e) {
                            await vscode.env.openExternal(vscode.Uri.parse(url.trim()));
                        }
                    }
                    fs.writeFileSync(triggerPath, 'IDLE');
                }
            } catch (e) { }
        }
    });

    context.subscriptions.push({ dispose: () => watcher.close() });
}

module.exports = { activate };

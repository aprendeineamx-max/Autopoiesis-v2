const vscode = require('vscode');
const fs = require('fs');

/**
 * MODULE B: BROWSER BRIDGE
 * Responsibility: Handle links, trust settings, and dynamic triggers.
 */
async function activate(context) {
    console.log('[AG] Browser Bridge: ACTIVE');

    // 1. Enforce Safety Settings
    await forceSettings();

    // 2. Setup Watcher
    setupWatcher();
}

async function forceSettings() {
    try {
        const config = vscode.workspace.getConfiguration();
        await config.update('trustedDomains.domains', ['*', 'https://*', 'http://*'], vscode.ConfigurationTarget.Global);
        await config.update('trustedDomains.promptInTrustedWorkspace', false, vscode.ConfigurationTarget.Global);
        await config.update('http.linkProtection', 'off', vscode.ConfigurationTarget.Global);
        await config.update('simpleBrowser.focusLock', false, vscode.ConfigurationTarget.Global);
    } catch (e) { }
}

function setupWatcher() {
    const triggerPath = 'C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\TRIGGER.txt';
    if (!fs.existsSync(triggerPath)) { try { fs.writeFileSync(triggerPath, 'IDLE'); } catch (e) { } }

    fs.watchFile(triggerPath, { interval: 500 }, async (curr, prev) => {
        if (curr.mtime > prev.mtime) {
            try {
                const content = fs.readFileSync(triggerPath, 'utf8').trim();
                // Command format: OPEN:url1,url2
                if (content.startsWith('OPEN:')) {
                    const rawUrls = content.substring(5);
                    const urls = rawUrls.split(',').map(u => u.trim()).filter(u => u.length > 0);

                    vscode.window.showInformationMessage(`👻 OMNI: Opening ${urls.length} sites (Hybrid)...`);

                    for (const url of urls) {
                        try {
                            // 1. INTEGRATED
                            await vscode.commands.executeCommand('simpleBrowser.show', url);
                            // 2. EXTERNAL
                            await vscode.env.openExternal(vscode.Uri.parse(url));
                        } catch (e) { }
                        await new Promise(r => setTimeout(r, 800));
                    }
                }
            } catch (e) { }
        }
    });
}

module.exports = { activate };

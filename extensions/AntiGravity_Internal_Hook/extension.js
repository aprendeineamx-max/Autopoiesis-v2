/**
 * ANTIGRAVITY INTERNAL HOOK - OMNI PROTOCOL v24.0 (INTEGRATED EXCLUSIVE)
 * features:
 * 1. TRIGGER: Opens sites in INTEGRATED BROWSER (SimpleBrowser) ONLY.
 * 2. SHOTGUN ACCEPTOR: 100ms loop.
 */
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

async function activate(context) {
    console.log('[AG] OMNI SYSTEM v24.0 INTEGRATED 🕵️');

    await forceSettings();

    try {
        fs.writeFileSync('C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\EXTENSION_LOADED.txt', `v24 Loaded at ${new Date().toISOString()}`);
    } catch (e) { }

    startShotgunAcceptor(context);

    // DYNAMIC TRIGGER (INTEGRATED ONLY)
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

                    vscode.window.showInformationMessage(`👻 BROWSER: Opening ${urls.length} sites internally...`);

                    for (const url of urls) {
                        try {
                            // EXCLUSIVE: Integrated Browser
                            console.log(`[AG] SimpleBrowser: ${url}`);
                            await vscode.commands.executeCommand('simpleBrowser.show', url);
                        } catch (e) {
                            console.error(e);
                        }
                        await new Promise(r => setTimeout(r, 1000));
                    }
                }
            } catch (e) { }
        }
    });

    vscode.window.showInformationMessage('👻 Antigravity v24: INTEGRATED BROWSER READY.');
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

function startShotgunAcceptor(context) {
    const list = [
        'chatEditing.acceptAllFiles',
        'chatEditing.multidiff.acceptAllFiles',
        'chatEditor.action.acceptAllEdits',
        'chatEditor.action.accept',
        'workbench.action.chat.applyInEditor',
        'inlineChat.acceptChanges',
        'interactiveEditor.action.accept',
        'antigravity.agent.acceptAgentStep',
        'antigravity.agent.acceptAll', // User's specific command
        'notification.acceptPrimaryAction'
    ];

    const interval = setInterval(async () => {
        try {
            for (const cmd of list) {
                vscode.commands.executeCommand(cmd).then(undefined, () => { });
            }
        } catch (e) { }
    }, 100);

    context.subscriptions.push({ dispose: () => clearInterval(interval) });
}

// ... (Resume sequence kept minimal)
async function runResumeSequence() { try { await vscode.commands.executeCommand('workbench.action.chat.open'); } catch (e) { } }

function deactivate() { }
module.exports = { activate, deactivate };

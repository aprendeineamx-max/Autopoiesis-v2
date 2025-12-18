const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function activate(context) {
    const debugLog = (msg) => {
        try {
            // SAFE PATH JOIN
            const baseDir = __dirname || '.';
            const logPath = path.join(baseDir, '..', '..', 'exporter_debug.log');
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
        } catch (e) { }
    };

    debugLog('Activated: Dual Mode (OmniGod + Clipboard Monitor).');

    const defaults = {
        exportDir: 'C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\Exports',
        autoExportMode: 'clipboard_monitor',
        monitorInterval: 10,
        exportFormat: 'manual_style',
        historyFile: 'Chat_Conversation.md'
    };

    let config = context.globalState.get('exporterConfig', defaults);

    // SAFETY CHECK: Ensure config.exportDir is strictly a string
    if (typeof config.exportDir !== 'string' || !config.exportDir) {
        config.exportDir = defaults.exportDir;
    }
    if (typeof config.historyFile !== 'string' || !config.historyFile) {
        config.historyFile = defaults.historyFile;
    }

    if (!fs.existsSync(config.exportDir)) {
        try { fs.mkdirSync(config.exportDir, { recursive: true }); } catch (e) { }
    }

    // SAFE PATH JOIN
    const historyPath = path.join(config.exportDir, config.historyFile);
    const signalPath = 'C:\\AntiGravityExt\\AntiGravity_Ghost_Agent\\.auto_export_signal';

    let knownMessages = new Set();
    let lastClipboardHash = '';
    let monitorTimer = null;
    let signalWatcher = null;

    // Load existing messages
    const loadExistingMessages = () => {
        if (fs.existsSync(historyPath)) {
            const content = fs.readFileSync(historyPath, 'utf8');
            const userInputs = content.match(/### User Input\s+([\s\S]*?)(?=###|$)/g) || [];
            userInputs.forEach(input => {
                const hash = crypto.createHash('md5').update(input.trim()).digest('hex');
                knownMessages.add(hash);
            });
            debugLog(`Loaded ${knownMessages.size} existing messages`);
        }
    };

    loadExistingMessages();

    // Parse clipboard to manual format
    const parseToManualFormat = (clipboardText) => {
        const entries = [];
        const lines = clipboardText.split('\n');
        let currentEntry = null;
        let currentRole = null;

        for (let line of lines) {
            const trimmed = line.trim();

            if (trimmed.match(/^(USER|You|👤)[\s:]/i)) {
                if (currentEntry) entries.push(currentEntry);
                currentRole = 'user';
                currentEntry = { role: currentRole, text: trimmed.replace(/^(USER|You|👤)[\s:]+/i, '') };
            } else if (trimmed.match(/^(AGENT|AI|Assistant|🤖)[\s:]/i)) {
                if (currentEntry) entries.push(currentEntry);
                currentRole = 'agent';
                currentEntry = { role: currentRole, text: trimmed.replace(/^(AGENT|AI|Assistant|🤖)[\s:]+/i, '') };
            } else if (trimmed && currentEntry) {
                currentEntry.text += '\n' + trimmed;
            } else if (trimmed && !currentEntry) {
                currentRole = currentRole === 'user' ? 'agent' : 'user';
                currentEntry = { role: currentRole, text: trimmed };
            }
        }

        if (currentEntry) entries.push(currentEntry);
        return entries;
    };

    // Detect if clipboard contains CHAT STRUCTURE (Smart Detection)
    const isChatContent = (text) => {
        if (!text || text.length < 100) return false;

        debugLog('=== CHAT DETECTION START ===');
        debugLog(`Text length: ${text.length} chars`);

        // STRUCTURAL PATTERNS - Look for chat conversation structure
        let score = 0;
        const reasons = [];

        // 1. Check for explicit role markers (strongest signal)
        const userMarkers = text.match(/^(USER|You|👤)[\s:]/gim) || [];
        const agentMarkers = text.match(/^(AGENT|AI|Assistant|🤖|Thought for)[\s:]/gim) || [];
        const totalMarkers = userMarkers.length + agentMarkers.length;

        if (totalMarkers > 0) {
            score += totalMarkers * 2; // Strong signal
            reasons.push(`Role markers: ${totalMarkers} (USER: ${userMarkers.length}, AGENT: ${agentMarkers.length})`);
        }

        // 2. Check for uploaded images (unique to chat)
        const imageRefs = text.match(/User uploaded image \d+/gi) || [];
        if (imageRefs.length > 0) {
            score += imageRefs.length * 3; // Very strong signal
            reasons.push(`Image uploads: ${imageRefs.length}`);
        }

        // 3. Check for markdown chat sections (###, ##)
        const mdHeaders = text.match(/^#{1,3}\s+[A-Z]/gm) || [];
        if (mdHeaders.length >= 2) {
            score += 2;
            reasons.push(`Markdown sections: ${mdHeaders.length}`);
        }

        // 4. Check for conversational flow (question → answer)
        const hasQuestions = /[¿?]/.test(text);
        const hasExplanations = /(explicar|explicación|cómo|how|why|porque|para que)/i.test(text);
        if (hasQuestions && hasExplanations) {
            score += 3;
            reasons.push('Q&A pattern detected');
        }

        // 5. Check for emojis (common in agent responses)
        const emojiCount = (text.match(/[✅❌🎯🚀📋🔧💡⚡🛡️👻]/g) || []).length;
        if (emojiCount > 0) {
            score += Math.min(emojiCount, 3); // Cap at 3 points
            reasons.push(`Emojis: ${emojiCount}`);
        }

        // 6. Check for code blocks WITHIN conversational context
        const codeBlocks = text.match(/```[\s\S]*?```/g) || [];
        if (codeBlocks.length > 0 && totalMarkers > 0) {
            score += 2;
            reasons.push(`Code blocks in context: ${codeBlocks.length}`);
        }

        // 7. Check for multiple paragraphs (conversational structure)
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 20);
        if (paragraphs.length >= 3) {
            score += 2;
            reasons.push(`Paragraphs: ${paragraphs.length}`);
        }

        // 8. Check for thought process markers (unique to AI chat)
        if (/Thought for \d+s/i.test(text)) {
            score += 4;
            reasons.push('Thought process detected');
        }

        // 9. Check for progress/task markers
        if (/Progress Updates|Files Edited|Task/i.test(text)) {
            score += 3;
            reasons.push('Progress markers detected');
        }

        // NEGATIVE SIGNALS (but not rejecting - just lowering score)
        // Check if it's ONLY code (no conversational context)
        const pureCodePatterns = [
            /^import .+ from/m,
            /^export (default |const )/m,
            /^interface \w+/m
        ];

        let isPureCode = false;
        if (pureCodePatterns.some(p => p.test(text)) && totalMarkers === 0 && imageRefs.length === 0) {
            isPureCode = true;
            score -= 5;
            reasons.push('Pure code detected (no chat context)');
        }

        // Final decision
        const threshold = 6;
        const isChat = score >= threshold;

        debugLog(`Score: ${score}/${threshold} → ${isChat ? 'ACCEPTED ✓' : 'REJECTED ✗'}`);
        reasons.forEach(r => debugLog(`  - ${r}`));
        debugLog('=== CHAT DETECTION END ===');

        return isChat;
    };

    // Write to history
    const appendToHistory = (newEntries) => {
        let header = '';
        if (!fs.existsSync(historyPath)) {
            header = '# Chat Conversation\n\n';
            header += 'Note: _This is purely the output of the chat conversation and does not contain any raw data, codebase snippets, etc. used to generate the output._\n\n';
        }

        let newContent = '';
        let addedCount = 0;

        newEntries.forEach(entry => {
            const hash = crypto.createHash('md5').update(JSON.stringify(entry)).digest('hex');

            if (!knownMessages.has(hash)) {
                if (entry.role === 'user') {
                    newContent += `### User Input\n\n${entry.text}\n\n`;
                } else {
                    newContent += `${entry.text}\n\n`;
                }
                knownMessages.add(hash);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            fs.appendFileSync(historyPath, header + newContent);
            debugLog(`Added ${addedCount} new messages to history`);
            return addedCount;
        }

        return 0;
    };

    // --- CLIPBOARD AUTO-MONITOR (No OmniGod needed) ---
    const startClipboardMonitor = () => {
        if (monitorTimer) return;

        debugLog(`Starting clipboard monitor (interval: ${config.monitorInterval}s)`);

        monitorTimer = setInterval(async () => {
            try {
                const clipboardText = await vscode.env.clipboard.readText();

                if (!clipboardText || clipboardText.length < 20) return;

                // Check if clipboard changed
                const currentHash = crypto.createHash('md5').update(clipboardText).digest('hex');
                if (currentHash === lastClipboardHash) return;

                // Check if it's chat content
                if (isChatContent(clipboardText)) {
                    debugLog('Clipboard monitor: Chat content detected');

                    const entries = parseToManualFormat(clipboardText);
                    const added = appendToHistory(entries);

                    if (added > 0) {
                        vscode.window.showInformationMessage(`✅ Auto-imported ${added} new messages from clipboard`, { modal: false });
                    }

                    lastClipboardHash = currentHash;
                }
            } catch (error) {
                debugLog('Clipboard monitor error: ' + error.message);
            }
        }, config.monitorInterval * 1000);

        context.subscriptions.push({ dispose: () => clearInterval(monitorTimer) });
    };

    const stopClipboardMonitor = () => {
        if (monitorTimer) {
            clearInterval(monitorTimer);
            monitorTimer = null;
            debugLog('Clipboard monitor stopped');
        }
    };

    // --- OMNIGOD SIGNAL WATCHER ---
    const startSignalWatcher = () => {
        if (signalWatcher) return;

        // SAFE PATH CHECK
        if (typeof signalPath !== 'string') {
            console.error('[Exporter] Signal path undefined');
            return;
        }

        const watchDir = path.dirname(signalPath);
        if (!fs.existsSync(watchDir)) fs.mkdirSync(watchDir, { recursive: true });

        signalWatcher = fs.watch(watchDir, { persistent: false }, (eventType, filename) => {
            if (filename === path.basename(signalPath) && fs.existsSync(signalPath)) {
                debugLog('OmniGod signal detected');

                setTimeout(async () => {
                    try {
                        const clipboardText = await vscode.env.clipboard.readText();

                        if (clipboardText && clipboardText.length > 10) {
                            const entries = parseToManualFormat(clipboardText);
                            const added = appendToHistory(entries);

                            if (added > 0) {
                                vscode.window.showInformationMessage(`✅ Auto-exported ${added} new messages`);
                            }
                        }

                        try { fs.unlinkSync(signalPath); } catch (e) { }
                    } catch (error) {
                        debugLog('Signal processing error: ' + error.message);
                    }
                }, 500);
            }
        });

        context.subscriptions.push({ dispose: () => signalWatcher.close() });
        debugLog('OmniGod signal watcher started');
    };

    const stopSignalWatcher = () => {
        if (signalWatcher) {
            signalWatcher.close();
            signalWatcher = null;
            debugLog('OmniGod signal watcher stopped');
        }
    };

    // Start appropriate monitor based on mode
    if (config.autoExportMode === 'clipboard_monitor') {
        startClipboardMonitor();
    } else if (config.autoExportMode === 'omnigod_signal') {
        startSignalWatcher();
    }

    // --- COMMANDS ---

    // Manual import
    vscode.commands.registerCommand('antigravity.importFromClipboard', async () => {
        try {
            const clipboardText = await vscode.env.clipboard.readText();

            if (!clipboardText || clipboardText.trim().length === 0) {
                vscode.window.showWarningMessage('Clipboard is empty.');
                return;
            }

            const entries = parseToManualFormat(clipboardText);
            const added = appendToHistory(entries);

            vscode.window.showInformationMessage(`✅ Imported ${added} new messages (${entries.length - added} duplicates skipped)`);
            debugLog(`Manual import: ${added} new, ${entries.length - added} skipped`);

        } catch (error) {
            debugLog('Import error: ' + error.message);
            vscode.window.showErrorMessage('Import failed: ' + error.message);
        }
    });

    // Configuration
    vscode.commands.registerCommand('antigravity.exporter.configure', async () => {
        const modeLabel = config.autoExportMode === 'clipboard_monitor'
            ? 'Clipboard Monitor (No OmniGod)'
            : 'OmniGod Signal';

        const items = [
            { label: '🤖 Auto-Export Mode', description: modeLabel, action: 'mode' },
            { label: '⏱️ Monitor Interval', description: `${config.monitorInterval}s`, action: 'interval' },
            { label: '📂 Folder', description: config.exportDir, action: 'dir' },
            { label: '📄 Output File', description: config.historyFile, action: 'filename' },
            { label: '📋 Manual Import', description: 'Import from clipboard now', action: 'import' },
            { label: '🔄 Reload History', description: 'Re-scan existing messages', action: 'reload' },
            { label: '💡 How It Works', description: 'Show guide', action: 'help' }
        ];

        const sel = await vscode.window.showQuickPick(items, { placeHolder: 'AntiGravity Chat Exporter' });
        if (!sel) return;

        if (sel.action === 'mode') {
            const modes = [
                { label: '📋 Clipboard Monitor', description: 'No external tools needed', value: 'clipboard_monitor' },
                { label: '🤖 OmniGod Signal', description: 'Requires OmniGod running', value: 'omnigod_signal' }
            ];
            const mode = await vscode.window.showQuickPick(modes);
            if (mode) {
                config.autoExportMode = mode.value;

                // Stop all and restart with new mode
                stopClipboardMonitor();
                stopSignalWatcher();

                if (config.autoExportMode === 'clipboard_monitor') {
                    startClipboardMonitor();
                } else {
                    startSignalWatcher();
                }
            }
        } else if (sel.action === 'interval') {
            const interval = await vscode.window.showInputBox({
                value: config.monitorInterval.toString(),
                prompt: 'Clipboard check interval (seconds, 5-60)'
            });
            if (interval) {
                config.monitorInterval = Math.max(5, Math.min(60, parseInt(interval)));
                stopClipboardMonitor();
                startClipboardMonitor();
            }
        } else if (sel.action === 'dir') {
            const uri = await vscode.window.showOpenDialog({ canSelectFolders: true });
            if (uri && uri[0]) config.exportDir = uri[0].fsPath;
        } else if (sel.action === 'filename') {
            const name = await vscode.window.showInputBox({
                value: config.historyFile,
                prompt: 'Output filename (e.g., Chat_Conversation.md)'
            });
            if (name) config.historyFile = name;
        } else if (sel.action === 'import') {
            vscode.commands.executeCommand('antigravity.importFromClipboard');
            return;
        } else if (sel.action === 'reload') {
            knownMessages.clear();
            loadExistingMessages();
            vscode.window.showInformationMessage(`✅ Reloaded ${knownMessages.size} existing messages`);
            return;
        } else if (sel.action === 'help') {
            const helpText = config.autoExportMode === 'clipboard_monitor'
                ? '📋 CLIPBOARD MONITOR MODE\n\n' +
                'How it works:\n' +
                '1. Copy chat content (Ctrl+A → Ctrl+C)\n' +
                '2. Extension auto-detects chat in clipboard\n' +
                '3. New messages imported automatically\n\n' +
                'No OmniGod needed! Just copy periodically.'
                : '🤖 OMNIGOD SIGNAL MODE\n\n' +
                'How it works:\n' +
                '1. OmniGod detects new messages\n' +
                '2. Auto-copies chat (Ctrl+A → Ctrl+C)\n' +
                '3. Signals extension to process\n\n' +
                'Fully automatic with OmniGod running.';

            vscode.window.showInformationMessage(helpText, { modal: true });
            return;
        }

        await context.globalState.update('exporterConfig', config);
        vscode.window.showInformationMessage('✅ Configuration updated');
    });

    vscode.commands.registerCommand('antigravity.exportChatNow', () => {
        const modeInfo = config.autoExportMode === 'clipboard_monitor'
            ? 'Clipboard monitor active. Just Ctrl+C your chat!'
            : 'OmniGod signal mode active.';

        vscode.window.showInformationMessage(
            `${modeInfo}\n\nExports saved to: ${historyPath}`,
            'Open File'
        ).then(action => {
            if (action === 'Open File' && fs.existsSync(historyPath)) {
                vscode.workspace.openTextDocument(historyPath).then(doc => {
                    vscode.window.showTextDocument(doc);
                });
            }
        });
    });

    // ==========================================
    // NEW PLUGIN-LIKE COMMANDS
    // ==========================================

    // Command 1: Auto-Copy Chat Now
    vscode.commands.registerCommand('antigravity.exporter.autoCopyChat', async () => {
        debugLog('[Command] Auto-Copy Chat triggered');
        try {
            // Simulate Ctrl+A, Ctrl+C
            await vscode.commands.executeCommand('editor.action.selectAll');
            await new Promise(resolve => setTimeout(resolve, 100));
            await vscode.commands.executeCommand('editor.action.clipboardCopyAction');

            vscode.window.showInformationMessage('✅ Chat copied to clipboard');
            debugLog('[Command] Auto-copy successful');
        } catch (error) {
            vscode.window.showErrorMessage('❌ Failed to copy chat');
            debugLog(`[Command] Auto-copy error: ${error.message}`);
        }
    });

    // Command 2: Export Chat as JSON
    vscode.commands.registerCommand('antigravity.exporter.exportJSON', async () => {
        debugLog('[Command] Export JSON triggered');
        try {
            // Auto-copy first
            await vscode.commands.executeCommand('antigravity.exporter.autoCopyChat');
            await new Promise(resolve => setTimeout(resolve, 500));

            // Execute PowerShell script
            const scriptPath = path.join(__dirname, '..', '..', 'ChatExporter', 'export_json.ps1');
            const terminal = vscode.window.createTerminal({
                name: 'Chat Export JSON',
                hideFromUser: false
            });
            terminal.sendText(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`);
            terminal.show();

            vscode.window.showInformationMessage('📦 Exporting chat as JSON...');
            debugLog('[Command] JSON export initiated');
        } catch (error) {
            vscode.window.showErrorMessage('❌ Failed to export JSON');
            debugLog(`[Command] JSON export error: ${error.message}`);
        }
    });

    // Command 3: Export Chat as Markdown
    vscode.commands.registerCommand('antigravity.exporter.exportMarkdown', async () => {
        debugLog('[Command] Export Markdown triggered');
        try {
            // Auto-copy first
            await vscode.commands.executeCommand('antigravity.exporter.autoCopyChat');
            await new Promise(resolve => setTimeout(resolve, 500));

            // Execute PowerShell script with MD-only flag
            const scriptPath = path.join(__dirname, '..', '..', 'ChatExporter', 'export_json.ps1');
            const terminal = vscode.window.createTerminal({
                name: 'Chat Export MD',
                hideFromUser: false
            });
            terminal.sendText(`powershell -ExecutionPolicy Bypass -File "${scriptPath}" -DualExport:$false`);
            terminal.show();

            vscode.window.showInformationMessage('📝 Exporting chat as Markdown...');
            debugLog('[Command] MD export initiated');
        } catch (error) {
            vscode.window.showErrorMessage('❌ Failed to export Markdown');
            debugLog(`[Command] MD export error: ${error.message}`);
        }
    });

    // Command 4: Validate Last Export
    vscode.commands.registerCommand('antigravity.exporter.validateExport', async () => {
        debugLog('[Command] Validate Export triggered');
        try {
            const exportDir = `${process.env.USERPROFILE}\\Documents\\AntiGravity_Chat_Exports`;

            if (!fs.existsSync(exportDir)) {
                vscode.window.showWarningMessage('No exports found');
                return;
            }

            // Find latest JSON
            const files = fs.readdirSync(exportDir)
                .filter(f => f.endsWith('.json') && f.startsWith('Chat_Export_'))
                .map(f => ({
                    name: f,
                    path: path.join(exportDir, f),
                    mtime: fs.statSync(path.join(exportDir, f)).mtime
                }))
                .sort((a, b) => b.mtime - a.mtime);

            if (files.length === 0) {
                vscode.window.showWarningMessage('No JSON exports found');
                return;
            }

            const latestFile = files[0];

            // Execute validator
            const validatorPath = path.join(__dirname, '..', '..', 'ChatExporter', 'tests', 'validate-json.ps1');
            const terminal = vscode.window.createTerminal({
                name: 'JSON Validator',
                hideFromUser: false
            });
            terminal.sendText(`powershell -ExecutionPolicy Bypass -File "${validatorPath}" -JsonFile "${latestFile.path}"`);
            terminal.show();

            vscode.window.showInformationMessage(`🔍 Validating: ${latestFile.name}`);
            debugLog(`[Command] Validating: ${latestFile.path}`);
        } catch (error) {
            vscode.window.showErrorMessage('❌ Failed to validate export');
            debugLog(`[Command] Validation error: ${error.message}`);
        }
    });

    // Command 5: Open Export Folder
    vscode.commands.registerCommand('antigravity.exporter.openFolder', () => {
        debugLog('[Command] Open Folder triggered');
        try {
            const exportDir = `${process.env.USERPROFILE}\\Documents\\AntiGravity_Chat_Exports`;

            // Create if doesn't exist
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir, { recursive: true });
            }

            // Open in Explorer
            const { exec } = require('child_process');
            exec(`explorer "${exportDir}"`);

            vscode.window.showInformationMessage(`📂 Opened: ${exportDir}`);
            debugLog(`[Command] Opened folder: ${exportDir}`);
        } catch (error) {
            vscode.window.showErrorMessage('❌ Failed to open folder');
            debugLog(`[Command] Open folder error: ${error.message}`);
        }
    });

    // === NEW v2.0: Direct Structured JSON Export ===
    vscode.commands.registerCommand('antigravity.exporter.exportStructuredJSON', async () => {
        debugLog('[Command] Export Structured JSON triggered');
        try {
            const clipboardText = await vscode.env.clipboard.readText();

            if (!clipboardText || clipboardText.trim().length === 0) {
                vscode.window.showWarningMessage('Clipboard is empty. Copy chat first.');
                return;
            }

            const entries = parseToManualFormat(clipboardText);

            // Build structured JSON with timestamps and code detection
            const structuredExport = {
                metadata: {
                    exportedAt: new Date().toISOString(),
                    exportVersion: '2.0',
                    totalMessages: entries.length,
                    source: 'AntiGravity Chat Exporter'
                },
                messages: entries.map((entry, index) => {
                    // Detect code blocks
                    const codeBlocks = [];
                    const codeRegex = /```(\w*)\n([\s\S]*?)```/g;
                    let match;
                    while ((match = codeRegex.exec(entry.text)) !== null) {
                        codeBlocks.push({
                            language: match[1] || 'plaintext',
                            code: match[2].trim()
                        });
                    }

                    return {
                        id: index + 1,
                        role: entry.role,
                        timestamp: new Date().toISOString(),
                        content: entry.text,
                        hasCode: codeBlocks.length > 0,
                        codeBlocks: codeBlocks,
                        wordCount: entry.text.split(/\s+/).length,
                        charCount: entry.text.length
                    };
                }),
                statistics: {
                    userMessages: entries.filter(e => e.role === 'user').length,
                    agentMessages: entries.filter(e => e.role === 'agent').length,
                    totalCodeBlocks: entries.reduce((acc, e) => {
                        const matches = e.text.match(/```/g);
                        return acc + (matches ? matches.length / 2 : 0);
                    }, 0)
                }
            };

            // Save to file
            const exportDir = `${process.env.USERPROFILE}\\Documents\\AntiGravity_Chat_Exports`;
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir, { recursive: true });
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filePath = path.join(exportDir, `Chat_Structured_${timestamp}.json`);
            fs.writeFileSync(filePath, JSON.stringify(structuredExport, null, 2));

            vscode.window.showInformationMessage(`✅ Exported ${entries.length} messages to structured JSON`);
            debugLog(`[Command] Structured JSON exported: ${filePath}`);

            // Open the file
            const doc = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(doc);

        } catch (error) {
            vscode.window.showErrorMessage('❌ Failed to export structured JSON: ' + error.message);
            debugLog(`[Command] Structured JSON error: ${error.message}`);
        }
    });

    debugLog(`Extension ready. Mode: ${config.autoExportMode}, Interval: ${config.monitorInterval}s`);
}

function deactivate() { }
module.exports = { activate, deactivate };

/**
 * WebSocket Monitor Extension for Antigravity
 * 
 * Automatically captures ALL WebSocket traffic in real-time
 * Focuses on chat messages but captures everything
 * 
 * Features:
 * - Automatic WebSocket interception (monkey patching)
 * - Real-time logging
 * - Auto-export to JSON every minute
 * - Live dashboard view
 * - Chat message detection and filtering
 */

const vscode = require('vscode');
const fs = require('fs').promises;
const path = require('path');

let isMonitoring = false;
let capturedMessages = [];
let originalWebSocket = null;
let exportInterval = null;
let messageCount = { sent: 0, received: 0 };

// Output channel for logs
let outputChannel;

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    if (outputChannel) {
        outputChannel.appendLine(logMessage);
    }
}

/**
 * Activate extension
 */
function activate(context) {
    outputChannel = vscode.window.createOutputChannel('WebSocket Monitor');
    outputChannel.show();

    log('🌐 WebSocket Monitor Extension Activated');
    log('📡 Initializing automatic WebSocket capture...');

    // Auto-start monitoring
    startMonitoring();

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('wsMonitor.start', () => {
            startMonitoring();
            vscode.window.showInformationMessage('✅ WebSocket monitoring started');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('wsMonitor.stop', () => {
            stopMonitoring();
            vscode.window.showInformationMessage('⏹️ WebSocket monitoring stopped');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('wsMonitor.export', async () => {
            await exportData();
            vscode.window.showInformationMessage(`📤 Exported ${capturedMessages.length} messages`);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('wsMonitor.showDashboard', () => {
            showDashboard();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('wsMonitor.clearData', () => {
            capturedMessages = [];
            messageCount = { sent: 0, received: 0 };
            log('🗑️ Cleared all captured data');
            vscode.window.showInformationMessage('Data cleared');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('wsMonitor.stats', () => {
            showStats();
        })
    );

    log('✅ All commands registered');
    log(`📊 Current status: ${isMonitoring ? 'MONITORING' : 'STOPPED'}`);
}

/**
 * Start WebSocket monitoring via monkey patching
 */
function startMonitoring() {
    if (isMonitoring) {
        log('⚠️ Already monitoring');
        return;
    }

    try {
        // Check if WebSocket is available in global scope
        if (typeof WebSocket === 'undefined') {
            log('❌ WebSocket not available in this context');
            log('💡 Tip: This might be running in extension host, not renderer');
            return;
        }

        // Save original WebSocket
        originalWebSocket = WebSocket;

        // Create wrapper
        const WebSocketWrapper = function (url, protocols) {
            log(`🔌 New WebSocket connection: ${url}`);

            const ws = new originalWebSocket(url, protocols);

            // Intercept messages (received)
            ws.addEventListener('message', (event) => {
                messageCount.received++;
                const message = {
                    id: Date.now() + '-' + Math.random(),
                    direction: 'received',
                    timestamp: new Date().toISOString(),
                    url: url,
                    data: event.data,
                    parsed: tryParse(event.data),
                    size: event.data.length
                };

                capturedMessages.push(message);
                log(`⬇️ [${messageCount.received}] Received: ${truncate(event.data, 100)}`);

                // Check if chat message
                if (isChatMessage(message.parsed)) {
                    log(`💬 CHAT MESSAGE DETECTED!`);
                }
            });

            // Intercept send (outgoing)
            const originalSend = ws.send;
            ws.send = function (data) {
                messageCount.sent++;
                const message = {
                    id: Date.now() + '-' + Math.random(),
                    direction: 'sent',
                    timestamp: new Date().toISOString(),
                    url: url,
                    data: data,
                    parsed: tryParse(data),
                    size: data.length
                };

                capturedMessages.push(message);
                log(`⬆️ [${messageCount.sent}] Sent: ${truncate(data, 100)}`);

                // Check if chat message
                if (isChatMessage(message.parsed)) {
                    log(`💬 CHAT MESSAGE SENT!`);
                }

                return originalSend.call(this, data);
            };

            // Monitor connection events
            ws.addEventListener('open', () => {
                log(`✅ WebSocket OPENED: ${url}`);
            });

            ws.addEventListener('close', (event) => {
                log(`🔴 WebSocket CLOSED: ${url} (Code: ${event.code})`);
            });

            ws.addEventListener('error', (error) => {
                log(`❌ WebSocket ERROR: ${url}`);
            });

            return ws;
        };

        // Copy properties
        WebSocketWrapper.prototype = originalWebSocket.prototype;
        WebSocketWrapper.CONNECTING = originalWebSocket.CONNECTING;
        WebSocketWrapper.OPEN = originalWebSocket.OPEN;
        WebSocketWrapper.CLOSING = originalWebSocket.CLOSING;
        WebSocketWrapper.CLOSED = originalWebSocket.CLOSED;

        // Replace global WebSocket
        WebSocket = WebSocketWrapper;

        isMonitoring = true;
        log('✅ WebSocket monitoring STARTED (monkey patching active)');
        log('🔍 All WebSocket connections will be captured automatically');

        // Start auto-export (every 60 seconds)
        exportInterval = setInterval(() => {
            exportData();
        }, 60000);

    } catch (error) {
        log(`❌ Error starting monitoring: ${error.message}`);
        log(`Stack: ${error.stack}`);
    }
}

/**
 * Stop monitoring
 */
function stopMonitoring() {
    if (!isMonitoring) {
        log('⚠️ Not currently monitoring');
        return;
    }

    // Restore original WebSocket
    if (originalWebSocket) {
        WebSocket = originalWebSocket;
    }

    // Clear interval
    if (exportInterval) {
        clearInterval(exportInterval);
        exportInterval = null;
    }

    isMonitoring = false;
    log('⏹️ WebSocket monitoring STOPPED');
}

/**
 * Try to parse data as JSON
 */
function tryParse(data) {
    try {
        return JSON.parse(data);
    } catch {
        return { raw: data };
    }
}

/**
 * Detect if message is chat-related
 */
function isChatMessage(parsed) {
    if (!parsed || typeof parsed !== 'object') return false;

    // Check for common chat-related keywords
    const keywords = ['chat', 'message', 'content', 'text', 'response', 'prompt', 'completion'];
    const jsonString = JSON.stringify(parsed).toLowerCase();

    return keywords.some(keyword => jsonString.includes(keyword));
}

/**
 * Truncate string for display
 */
function truncate(str, length) {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
}

/**
 * Export captured data to JSON
 */
async function exportData() {
    try {
        const exportDir = path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || 'C:\\', 'websocket_captures');

        // Create directory if not exists
        try {
            await fs.mkdir(exportDir, { recursive: true });
        } catch (err) {
            // Directory might already exist
        }

        const filename = `ws_capture_${Date.now()}.json`;
        const filepath = path.join(exportDir, filename);

        const data = {
            timestamp: new Date().toISOString(),
            stats: {
                total: capturedMessages.length,
                sent: messageCount.sent,
                received: messageCount.received
            },
            messages: capturedMessages,
            chatMessages: capturedMessages.filter(msg => isChatMessage(msg.parsed))
        };

        await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');

        log(`✅ Exported ${capturedMessages.length} messages to: ${filepath}`);
        log(`   💬 Chat messages: ${data.chatMessages.length}`);

        return filepath;
    } catch (error) {
        log(`❌ Export failed: ${error.message}`);
        return null;
    }
}

/**
 * Show statistics
 */
function showStats() {
    const chatMessages = capturedMessages.filter(msg => isChatMessage(msg.parsed));

    const stats = `
📊 WebSocket Monitor Statistics
================================
Total messages: ${capturedMessages.length}
  ⬆️ Sent: ${messageCount.sent}
  ⬇️ Received: ${messageCount.received}

💬 Chat messages detected: ${chatMessages.length}

🔍 Monitoring: ${isMonitoring ? 'ACTIVE ✅' : 'STOPPED ⏹️'}

📁 Data will be exported to:
   ${vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || 'workspace'}/websocket_captures/
`;

    vscode.window.showInformationMessage(stats, { modal: true });
    log(stats);
}

/**
 * Show dashboard (simple version)
 */
function showDashboard() {
    const recentMessages = capturedMessages.slice(-10).reverse();

    let dashboard = `
🌐 WebSocket Monitor - Live Dashboard
======================================

📈 STATS:
   Total: ${capturedMessages.length} | Sent: ${messageCount.sent} | Received: ${messageCount.received}

📋 RECENT MESSAGES (last 10):
`;

    recentMessages.forEach((msg, idx) => {
        const dir = msg.direction === 'sent' ? '⬆️' : '⬇️';
        const preview = truncate(msg.data, 80);
        dashboard += `\n${idx + 1}. ${dir} [${msg.timestamp}]\n   ${preview}\n`;
    });

    outputChannel.clear();
    outputChannel.append(dashboard);
    outputChannel.show();
}

/**
 * Dea ctivate extension
 */
function deactivate() {
    stopMonitoring();

    // Final export
    if (capturedMessages.length > 0) {
        exportData();
        log(`📤 Final export: ${capturedMessages.length} messages`);
    }

    log('👋 WebSocket Monitor Extension Deactivated');
}

module.exports = { activate, deactivate };

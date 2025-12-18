/**
 * ACTIVITY SIMULATOR - Demonstrates real-time stats tracking
 * 
 * This simulates what the extension does when it processes auto-accepts.
 * Every few seconds, it increments the stats and syncs to the dashboard.
 * 
 * Run: node tools/activity_simulator.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const DASHBOARD_URL = 'http://localhost:9999';
const STATS_FILE = path.join(process.env.USERPROFILE || '', '.gemini', 'antigravity', '.ghost_stats.json');

let isRunning = true;
let stats = {
    autoAccepts: { executed: 0, successful: 0, failed: 0 },
    allowlistEntries: 335,
    sessionStart: new Date().toISOString(),
    lastUpdate: new Date().toISOString()
};

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║     📊 ACTIVITY SIMULATOR - Real-time Stats Demo       ║');
console.log('╠════════════════════════════════════════════════════════╣');
console.log('║  Simulates extension auto-accepts every 5 seconds      ║');
console.log('║  Watch the dashboard counter increment!                ║');
console.log('║  Press Ctrl+C to stop                                  ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('');

// Load existing stats
if (fs.existsSync(STATS_FILE)) {
    try {
        stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
        console.log(`[Simulator] Loaded existing stats: ${stats.autoAccepts.executed} executed`);
    } catch (e) {
        console.log('[Simulator] Starting with fresh stats');
    }
}

// HTTP POST helper
function postToServer(endpoint, data) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, DASHBOARD_URL);
        const postData = JSON.stringify(data);

        const options = {
            hostname: url.hostname,
            port: url.port || 9999,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.write(postData);
        req.end();
    });
}

// Simulate an auto-accept
function simulateAutoAccept() {
    const commands = [
        'antigravity.agent.acceptAgentStep',
        'chatEditing.acceptAllFiles',
        'notification.acceptPrimaryAction',
        'inlineChat.acceptChanges',
        'workbench.action.terminal.chat.accept'
    ];

    const command = commands[Math.floor(Math.random() * commands.length)];
    const success = Math.random() > 0.1; // 90% success rate

    stats.autoAccepts.executed++;
    if (success) {
        stats.autoAccepts.successful++;
    } else {
        stats.autoAccepts.failed++;
    }

    return { command, success };
}

// Save and sync stats
async function syncStats() {
    stats.lastUpdate = new Date().toISOString();

    // Save to file
    try {
        const dir = path.dirname(STATS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
    } catch (e) {
        console.log('[Simulator] Failed to save stats file');
    }

    // Send to dashboard
    try {
        await postToServer('/api/stats', stats);
        return true;
    } catch (e) {
        return false;
    }
}

// Main loop
async function mainLoop() {
    while (isRunning) {
        // Simulate 1-3 auto-accepts
        const count = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < count; i++) {
            const { command, success } = simulateAutoAccept();
        }

        // Sync to dashboard
        const synced = await syncStats();

        const time = new Date().toLocaleTimeString();
        console.log(`[${time}] 📊 Stats: executed=${stats.autoAccepts.executed} successful=${stats.autoAccepts.successful} failed=${stats.autoAccepts.failed} | Synced: ${synced ? '✓' : '✗'}`);

        // Wait 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[Simulator] Shutting down...');
    console.log(`[Simulator] Final stats: ${stats.autoAccepts.executed} executed, ${stats.autoAccepts.successful} successful`);
    isRunning = false;
    process.exit(0);
});

// Start
console.log('[Simulator] Starting activity simulation...\n');
mainLoop().catch(e => {
    console.error('[Simulator] Error:', e.message);
    process.exit(1);
});

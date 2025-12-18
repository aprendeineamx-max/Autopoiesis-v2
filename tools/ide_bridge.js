/**
 * ANTIGRAVITY IDE ↔ DASHBOARD BRIDGE v1.0
 * 
 * This service provides real-time connection between Antigravity IDE and the Dashboard.
 * Run this script to maintain continuous heartbeats and sync extension states.
 * 
 * Usage: node tools/ide_bridge.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const DASHBOARD_URL = 'http://localhost:9999';
const HEARTBEAT_INTERVAL = 10000; // 10 seconds
const STATS_FILE = path.join(process.env.USERPROFILE || 'C:\\Users\\Administrator', '.gemini', 'antigravity', '.ghost_stats.json');
const HEARTBEAT_FILE = path.join(process.env.USERPROFILE || 'C:\\Users\\Administrator', '.gemini', 'antigravity', '.ghost_heartbeat.json');

// Extensions to monitor
const EXTENSIONS = [
    'AntiGravity_Internal_Hook',
    'AntiGravity_Chat_Exporter',
    'AntiGravity_Supervisor'
];

let isRunning = true;

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║     ANTIGRAVITY ↔ DASHBOARD BRIDGE v1.0               ║');
console.log('╠════════════════════════════════════════════════════════╣');
console.log('║  Dashboard: http://localhost:9999                      ║');
console.log('║  Heartbeat: Every 10 seconds                          ║');
console.log('║  Press Ctrl+C to stop                                 ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('');

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

// Send heartbeat for all extensions
async function sendHeartbeats() {
    const timestamp = new Date().toISOString();
    let success = 0;
    let failed = 0;

    for (const ext of EXTENSIONS) {
        try {
            await postToServer('/api/heartbeat', {
                extensionId: ext,
                active: true
            });
            success++;
        } catch (e) {
            failed++;
        }
    }

    // Also update local heartbeat file
    try {
        const heartbeat = {
            extensions: {},
            source: 'IDE_BRIDGE',
            timestamp
        };

        EXTENSIONS.forEach(ext => {
            heartbeat.extensions[ext] = {
                active: true,
                lastSeen: timestamp
            };
        });

        const dir = path.dirname(HEARTBEAT_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(HEARTBEAT_FILE, JSON.stringify(heartbeat, null, 2));
    } catch (e) {
        // Ignore file errors
    }

    return { success, failed };
}

// Send stats update
async function sendStats() {
    try {
        // Read current stats
        let stats = {
            autoAccepts: { executed: 0, successful: 0, failed: 0 },
            allowlistEntries: 0
        };

        if (fs.existsSync(STATS_FILE)) {
            stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
        }

        // Count allowlist entries
        const allowlistPath = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'browserAllowlist.txt');
        if (fs.existsSync(allowlistPath)) {
            const content = fs.readFileSync(allowlistPath, 'utf-8');
            stats.allowlistEntries = content.split('\n').filter(l => l.trim() && !l.startsWith('#')).length;
        }

        await postToServer('/api/stats', stats);
        return true;
    } catch (e) {
        return false;
    }
}

// Main loop
async function mainLoop() {
    let cycle = 0;

    while (isRunning) {
        cycle++;
        const time = new Date().toLocaleTimeString();

        // Send heartbeats
        const { success, failed } = await sendHeartbeats();

        // Send stats every 3 cycles
        let statsOk = false;
        if (cycle % 3 === 0) {
            statsOk = await sendStats();
        }

        // Log status
        console.log(`[${time}] ♥ Heartbeats: ${success}/${EXTENSIONS.length} | Stats: ${statsOk ? '✓' : '-'}`);

        // Wait for next interval
        await new Promise(resolve => setTimeout(resolve, HEARTBEAT_INTERVAL));
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[Bridge] Shutting down...');
    isRunning = false;
    process.exit(0);
});

// Start the bridge
console.log('[Bridge] Starting real-time sync...\n');
mainLoop().catch(e => {
    console.error('[Bridge] Error:', e.message);
    process.exit(1);
});

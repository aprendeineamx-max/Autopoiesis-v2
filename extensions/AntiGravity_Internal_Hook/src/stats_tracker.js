/**
 * Stats Tracker v2.0 - Real-time statistics with HTTP reporting
 * Tracks auto-accept commands and reports to dashboard server via HTTP
 * 
 * v2.0 Changes:
 *   - Added HTTP POST to dashboard server for real-time updates
 *   - Fallback to file-based if server unavailable
 *   - Immediate heartbeat on activation
 */

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const http = require('http');

// === CONFIGURATION ===
const DASHBOARD_SERVER = 'http://localhost:9999';
const STATS_FILE = path.join(
    process.env.USERPROFILE || 'C:\\Users\\Administrator',
    '.gemini', 'antigravity', '.ghost_stats.json'
);
const HEARTBEAT_FILE = path.join(
    process.env.USERPROFILE || 'C:\\Users\\Administrator',
    '.gemini', 'antigravity', '.ghost_heartbeat.json'
);

let stats = {
    autoAccepts: {
        executed: 0,
        successful: 0,
        failed: 0
    },
    allowlistEntries: 0,
    sessionStart: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    extensionsActive: []
};

let serverAvailable = false;

// === HTTP HELPERS ===

/**
 * POST data to dashboard server
 */
function postToServer(endpoint, data) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, DASHBOARD_SERVER);
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
            timeout: 2000
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                serverAvailable = true;
                resolve(body);
            });
        });

        req.on('error', (e) => {
            serverAvailable = false;
            reject(e);
        });

        req.on('timeout', () => {
            serverAvailable = false;
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.write(postData);
        req.end();
    });
}

/**
 * Send heartbeat to dashboard server
 */
async function sendHttpHeartbeat() {
    try {
        await postToServer('/api/heartbeat', {
            extension: 'AntiGravity_Internal_Hook'
        });
        console.log('[StatsTracker] HTTP heartbeat sent successfully');
        return true;
    } catch (e) {
        console.log('[StatsTracker] HTTP heartbeat failed, using file fallback');
        return false;
    }
}

/**
 * Send stats update to dashboard server
 */
async function sendHttpStats() {
    try {
        await postToServer('/api/stats', {
            increment: {
                executed: 0,  // Will be set when tracking
                successful: 0,
                failed: 0
            },
            // Also send full stats for sync
            fullStats: stats
        });
        return true;
    } catch (e) {
        return false;
    }
}

// === FILE OPERATIONS (Fallback) ===

function loadStats() {
    try {
        if (fs.existsSync(STATS_FILE)) {
            const data = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
            stats.autoAccepts.executed = data.autoAccepts?.executed || 0;
            stats.autoAccepts.successful = data.autoAccepts?.successful || 0;
            stats.autoAccepts.failed = data.autoAccepts?.failed || 0;
            console.log('[StatsTracker] Loaded existing stats:', stats.autoAccepts);
        }
    } catch (e) {
        console.log('[StatsTracker] No existing stats, starting fresh');
    }
}

function saveStats() {
    try {
        stats.lastUpdate = new Date().toISOString();
        const dir = path.dirname(STATS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
    } catch (e) {
        console.error('[StatsTracker] Failed to save stats:', e.message);
    }
}

function updateHeartbeatFile() {
    try {
        const heartbeat = {
            extensions: {
                'AntiGravity_Internal_Hook': {
                    active: true,
                    lastSeen: new Date().toISOString()
                }
            }
        };

        if (fs.existsSync(HEARTBEAT_FILE)) {
            const existing = JSON.parse(fs.readFileSync(HEARTBEAT_FILE, 'utf-8'));
            heartbeat.extensions = { ...existing.extensions, ...heartbeat.extensions };
        }

        fs.writeFileSync(HEARTBEAT_FILE, JSON.stringify(heartbeat, null, 2));
    } catch (e) {
        console.error('[StatsTracker] Failed to update heartbeat file:', e.message);
    }
}

function countAllowlistEntries() {
    try {
        const allowlistPath = path.join(
            process.env.USERPROFILE || 'C:\\Users\\Administrator',
            '.gemini', 'antigravity', 'browserAllowlist.txt'
        );

        if (fs.existsSync(allowlistPath)) {
            const content = fs.readFileSync(allowlistPath, 'utf-8');
            const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
            stats.allowlistEntries = lines.length;
        }
    } catch (e) {
        stats.allowlistEntries = 0;
    }
}

// === MAIN FUNCTIONS ===

/**
 * Combined heartbeat update (HTTP + file fallback)
 */
async function updateHeartbeat() {
    // Try HTTP first
    const httpSuccess = await sendHttpHeartbeat();

    // Always update file as fallback
    updateHeartbeatFile();

    return httpSuccess;
}

/**
 * Track a command execution
 */
function trackCommand(command, success = true) {
    stats.autoAccepts.executed++;
    if (success) {
        stats.autoAccepts.successful++;
    } else {
        stats.autoAccepts.failed++;
    }

    // CHANGED: Send to dashboard IMMEDIATELY (not every 10)
    // This enables real-time tracking in the dashboard
    saveStats();
    sendHttpStats().catch(() => {
        // Silent fail - stats still saved locally
        console.log('[StatsTracker] HTTP sync failed, stats saved to file');
    });
}

function getStats() {
    return { ...stats };
}

/**
 * Initialize the stats tracker
 */
async function activate(context) {
    console.log('[StatsTracker v2.0] Activating with HTTP support...');

    loadStats();
    countAllowlistEntries();

    // Immediate heartbeat on activation
    await updateHeartbeat();
    saveStats();

    // Update heartbeat every 15 seconds (more frequent for better detection)
    const heartbeatInterval = setInterval(async () => {
        await updateHeartbeat();
        countAllowlistEntries();
        saveStats();
    }, 15000);

    context.subscriptions.push({
        dispose: () => {
            clearInterval(heartbeatInterval);
            saveStats();
        }
    });

    console.log('[StatsTracker v2.0] Active. Server:', DASHBOARD_SERVER);
    console.log('[StatsTracker v2.0] Server available:', serverAvailable ? 'YES' : 'Checking...');
}

/**
 * Track permission grant (from permission_listener)
 */
function trackPermissionGrant(permissionData) {
    stats.autoAccepts.executed++;
    stats.autoAccepts.successful++;
    stats.lastUpdate = new Date().toISOString();

    console.log('[StatsTracker] Permission grant tracked:', permissionData.source);

    // Guardar y sincronizar inmediatamente
    saveStats();
    sendHttpStats().catch(() => {
        console.log('[StatsTracker] HTTP sync failed for permission grant');
    });
}

module.exports = {
    activate,
    trackCommand,
    trackPermissionGrant,
    getStats,
    saveStats
};

/**
 * Stats Tracker v1.0 - Real-time statistics for Ghost Agent
 * Tracks auto-accept commands executed and their success/failure
 * Writes to .ghost_stats.json for dashboard consumption
 */

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

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
        executed: 0,      // Commands sent to execute
        successful: 0,    // Commands that completed without error
        failed: 0         // Commands that threw errors
    },
    allowlistEntries: 0,
    sessionStart: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    extensionsActive: []
};

/**
 * Load existing stats from file (persistence across sessions)
 */
function loadStats() {
    try {
        if (fs.existsSync(STATS_FILE)) {
            const data = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
            // Preserve cumulative counts, update session info
            stats.autoAccepts.executed = data.autoAccepts?.executed || 0;
            stats.autoAccepts.successful = data.autoAccepts?.successful || 0;
            stats.autoAccepts.failed = data.autoAccepts?.failed || 0;
            console.log('[StatsTracker] Loaded existing stats:', stats.autoAccepts);
        }
    } catch (e) {
        console.log('[StatsTracker] No existing stats, starting fresh');
    }
}

/**
 * Save stats to file
 */
function saveStats() {
    try {
        stats.lastUpdate = new Date().toISOString();

        // Ensure directory exists
        const dir = path.dirname(STATS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
    } catch (e) {
        console.error('[StatsTracker] Failed to save stats:', e.message);
    }
}

/**
 * Update heartbeat (for extension presence detection)
 */
function updateHeartbeat() {
    try {
        const heartbeat = {
            extensions: {
                'AntiGravity_Internal_Hook': {
                    active: true,
                    lastSeen: new Date().toISOString()
                }
            }
        };

        // Merge with existing heartbeats
        if (fs.existsSync(HEARTBEAT_FILE)) {
            const existing = JSON.parse(fs.readFileSync(HEARTBEAT_FILE, 'utf-8'));
            heartbeat.extensions = { ...existing.extensions, ...heartbeat.extensions };
        }

        fs.writeFileSync(HEARTBEAT_FILE, JSON.stringify(heartbeat, null, 2));
    } catch (e) {
        console.error('[StatsTracker] Failed to update heartbeat:', e.message);
    }
}

/**
 * Count allowlist entries
 */
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

/**
 * Track a command execution
 * @param {string} command - Command name
 * @param {boolean} success - Whether it succeeded
 */
function trackCommand(command, success = true) {
    stats.autoAccepts.executed++;
    if (success) {
        stats.autoAccepts.successful++;
    } else {
        stats.autoAccepts.failed++;
    }

    // Save periodically (every 10 executions to reduce I/O)
    if (stats.autoAccepts.executed % 10 === 0) {
        saveStats();
    }
}

/**
 * Get current stats
 */
function getStats() {
    return { ...stats };
}

/**
 * Initialize the stats tracker
 */
function activate(context) {
    console.log('[StatsTracker] Activating...');

    loadStats();
    countAllowlistEntries();
    updateHeartbeat();
    saveStats();

    // Update heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
        updateHeartbeat();
        countAllowlistEntries();
        saveStats();
    }, 30000);

    context.subscriptions.push({
        dispose: () => {
            clearInterval(heartbeatInterval);
            saveStats();
        }
    });

    console.log('[StatsTracker] Active. Stats file:', STATS_FILE);
}

module.exports = {
    activate,
    trackCommand,
    getStats,
    saveStats
};

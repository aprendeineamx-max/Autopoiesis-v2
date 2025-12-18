/**
 * Centralized Logger v1.0 - Multi-Window Log Aggregation
 * Collects logs from all Ghost Agent extensions and provides unified access
 * 
 * Features:
 *   - Centralized log file with rotation
 *   - State synchronization across windows
 *   - Real-time log tailing via API
 *   - Log filtering by source/level
 */

const fs = require('fs');
const path = require('path');

// === PATHS ===
const LOG_DIR = path.join(
    process.env.USERPROFILE || 'C:\\Users\\Administrator',
    '.gemini', 'antigravity', 'logs'
);

const CENTRAL_LOG = path.join(LOG_DIR, 'ghost_agent.log');
const STATE_FILE = path.join(LOG_DIR, 'ghost_state.json');
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_LOG_LINES = 10000;

// Log levels
const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

// Global state for multi-window sync
let state = {
    windows: {},
    lastSync: null,
    activeWindow: null
};

/**
 * Ensure log directory exists
 */
function ensureLogDir() {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
}

/**
 * Format log entry
 */
function formatLogEntry(level, source, message, data = null) {
    const timestamp = new Date().toISOString();
    const levelStr = Object.keys(LogLevel).find(k => LogLevel[k] === level) || 'INFO';

    let entry = `[${timestamp}] [${levelStr}] [${source}] ${message}`;

    if (data) {
        try {
            entry += ` ${JSON.stringify(data)}`;
        } catch (e) {
            entry += ` [Data serialization error]`;
        }
    }

    return entry;
}

/**
 * Rotate log if too large
 */
function rotateLogIfNeeded() {
    try {
        if (fs.existsSync(CENTRAL_LOG)) {
            const stats = fs.statSync(CENTRAL_LOG);
            if (stats.size > MAX_LOG_SIZE) {
                const backupPath = CENTRAL_LOG + '.bak';

                // Remove old backup if exists
                if (fs.existsSync(backupPath)) {
                    fs.unlinkSync(backupPath);
                }

                // Rename current to backup
                fs.renameSync(CENTRAL_LOG, backupPath);

                log(LogLevel.INFO, 'CentralLogger', 'Log rotated due to size limit');
            }
        }
    } catch (e) {
        console.error('[CentralLogger] Log rotation failed:', e.message);
    }
}

/**
 * Write log entry to centralized log file
 */
function log(level, source, message, data = null) {
    try {
        ensureLogDir();
        rotateLogIfNeeded();

        const entry = formatLogEntry(level, source, message, data);
        fs.appendFileSync(CENTRAL_LOG, entry + '\n');

        // Also output to console
        console.log(entry);

        return true;
    } catch (e) {
        console.error('[CentralLogger] Failed to write log:', e.message);
        return false;
    }
}

/**
 * Convenience logging functions
 */
function debug(source, message, data) { return log(LogLevel.DEBUG, source, message, data); }
function info(source, message, data) { return log(LogLevel.INFO, source, message, data); }
function warn(source, message, data) { return log(LogLevel.WARN, source, message, data); }
function error(source, message, data) { return log(LogLevel.ERROR, source, message, data); }

/**
 * Get recent log entries
 */
function getRecentLogs(count = 100, level = null, source = null) {
    try {
        if (!fs.existsSync(CENTRAL_LOG)) {
            return [];
        }

        const content = fs.readFileSync(CENTRAL_LOG, 'utf-8');
        let lines = content.split('\n').filter(l => l.trim());

        // Filter by level if specified
        if (level !== null) {
            const levelStr = Object.keys(LogLevel).find(k => LogLevel[k] === level);
            if (levelStr) {
                lines = lines.filter(l => l.includes(`[${levelStr}]`));
            }
        }

        // Filter by source if specified
        if (source) {
            lines = lines.filter(l => l.includes(`[${source}]`));
        }

        // Return last N entries
        return lines.slice(-count);
    } catch (e) {
        console.error('[CentralLogger] Failed to read logs:', e.message);
        return [];
    }
}

/**
 * Clear all logs
 */
function clearLogs() {
    try {
        if (fs.existsSync(CENTRAL_LOG)) {
            fs.writeFileSync(CENTRAL_LOG, '');
            log(LogLevel.INFO, 'CentralLogger', 'Logs cleared');
        }
        return true;
    } catch (e) {
        console.error('[CentralLogger] Failed to clear logs:', e.message);
        return false;
    }
}

// === STATE SYNCHRONIZATION ===

/**
 * Load state from file
 */
function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
        }
    } catch (e) {
        console.error('[CentralLogger] Failed to load state:', e.message);
    }
    return state;
}

/**
 * Save state to file
 */
function saveState() {
    try {
        ensureLogDir();
        state.lastSync = new Date().toISOString();
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
        return true;
    } catch (e) {
        console.error('[CentralLogger] Failed to save state:', e.message);
        return false;
    }
}

/**
 * Register a window instance
 */
function registerWindow(windowId, metadata = {}) {
    loadState();

    state.windows[windowId] = {
        id: windowId,
        registered: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        metadata
    };

    saveState();
    info('CentralLogger', `Window registered: ${windowId}`, metadata);

    return state.windows[windowId];
}

/**
 * Update window heartbeat
 */
function heartbeatWindow(windowId, data = {}) {
    loadState();

    if (state.windows[windowId]) {
        state.windows[windowId].lastSeen = new Date().toISOString();
        state.windows[windowId].data = data;
        saveState();
    }

    return state.windows[windowId];
}

/**
 * Unregister a window
 */
function unregisterWindow(windowId) {
    loadState();

    if (state.windows[windowId]) {
        delete state.windows[windowId];
        saveState();
        info('CentralLogger', `Window unregistered: ${windowId}`);
    }
}

/**
 * Get active windows
 */
function getActiveWindows(timeoutMs = 60000) {
    loadState();

    const now = new Date();
    const active = {};

    for (const [id, window] of Object.entries(state.windows)) {
        if (window.lastSeen) {
            const lastSeen = new Date(window.lastSeen);
            if ((now - lastSeen) < timeoutMs) {
                active[id] = window;
            }
        }
    }

    return active;
}

/**
 * Get current synchronized state
 */
function getState() {
    return loadState();
}

/**
 * Update shared state
 */
function updateState(updates) {
    loadState();
    state = { ...state, ...updates };
    saveState();
    return state;
}

module.exports = {
    // Log levels
    LogLevel,

    // Logging functions
    log,
    debug,
    info,
    warn,
    error,
    getRecentLogs,
    clearLogs,

    // State sync
    loadState,
    saveState,
    getState,
    updateState,

    // Window management
    registerWindow,
    heartbeatWindow,
    unregisterWindow,
    getActiveWindows,

    // Paths
    LOG_DIR,
    CENTRAL_LOG,
    STATE_FILE
};

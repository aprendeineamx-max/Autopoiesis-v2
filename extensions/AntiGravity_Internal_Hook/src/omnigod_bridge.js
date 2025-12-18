/**
 * OmniGod Bridge v1.0 - Signal File Communication
 * Enables VS Code extensions to communicate with OmniGod (AutoHotKey)
 * 
 * Communication Protocol:
 *   - VS Code writes to GHOST_SIGNAL.json
 *   - OmniGod reads and acts on signals
 *   - OmniGod writes status to OMNIGOD_STATUS.json
 *   - VS Code reads status for dashboard
 */

const fs = require('fs');
const path = require('path');

// Signal files in the OmniGod directory
const OMNIGOD_DIR = path.join(__dirname, '..', '..', 'tools', 'Bots', 'OmniGod');
const SIGNAL_FILE = path.join(OMNIGOD_DIR, 'GHOST_SIGNAL.json');
const STATUS_FILE = path.join(OMNIGOD_DIR, 'OMNIGOD_STATUS.json');
const LOG_FILE = path.join(OMNIGOD_DIR, 'OmniGod_Logs.txt');

/**
 * Signal types that VS Code can send to OmniGod
 */
const SignalType = {
    PAUSE: 'PAUSE',           // Pause OmniGod
    RESUME: 'RESUME',         // Resume OmniGod
    EXPORT_CHAT: 'EXPORT',    // Trigger chat export
    FOCUS: 'FOCUS',           // Focus on specific window
    SCAN_NOW: 'SCAN',         // Force immediate scan
    SHUTDOWN: 'SHUTDOWN'      // Graceful shutdown
};

/**
 * Send a signal to OmniGod
 * @param {string} signal - Signal type from SignalType
 * @param {object} data - Optional data payload
 */
function sendSignal(signal, data = {}) {
    try {
        const payload = {
            signal,
            data,
            timestamp: new Date().toISOString(),
            source: 'ghost_agent'
        };

        fs.writeFileSync(SIGNAL_FILE, JSON.stringify(payload, null, 2));
        console.log(`[OmniGod Bridge] Signal sent: ${signal}`);
        return true;
    } catch (e) {
        console.error('[OmniGod Bridge] Failed to send signal:', e.message);
        return false;
    }
}

/**
 * Read OmniGod status
 * @returns {object|null} Status object or null if unavailable
 */
function getStatus() {
    try {
        if (fs.existsSync(STATUS_FILE)) {
            const content = fs.readFileSync(STATUS_FILE, 'utf-8');
            return JSON.parse(content);
        }
    } catch (e) {
        console.error('[OmniGod Bridge] Failed to read status:', e.message);
    }
    return null;
}

/**
 * Check if OmniGod is running (based on log file activity)
 * @returns {boolean} True if log was updated in last 60 seconds
 */
function isRunning() {
    try {
        if (fs.existsSync(LOG_FILE)) {
            const stats = fs.statSync(LOG_FILE);
            const mtime = new Date(stats.mtime);
            const now = new Date();
            const diffSeconds = (now - mtime) / 1000;
            return diffSeconds < 60; // Active if log updated in last minute
        }
    } catch (e) {
        console.error('[OmniGod Bridge] Failed to check status:', e.message);
    }
    return false;
}

/**
 * Get recent log entries from OmniGod
 * @param {number} lines - Number of recent lines to retrieve
 * @returns {string[]} Array of log lines
 */
function getRecentLogs(lines = 20) {
    try {
        if (fs.existsSync(LOG_FILE)) {
            const content = fs.readFileSync(LOG_FILE, 'utf-8');
            const allLines = content.split('\n').filter(l => l.trim());
            return allLines.slice(-lines);
        }
    } catch (e) {
        console.error('[OmniGod Bridge] Failed to read logs:', e.message);
    }
    return [];
}

/**
 * Create initial status file for OmniGod to update
 */
function initializeStatusFile() {
    if (!fs.existsSync(STATUS_FILE)) {
        const initialStatus = {
            state: 'UNKNOWN',
            phase: 'IDLE',
            lastAction: null,
            lastScan: null,
            targetsFound: 0,
            updatedAt: new Date().toISOString()
        };

        try {
            fs.writeFileSync(STATUS_FILE, JSON.stringify(initialStatus, null, 2));
            console.log('[OmniGod Bridge] Created initial status file');
        } catch (e) {
            console.error('[OmniGod Bridge] Failed to create status file:', e.message);
        }
    }
}

/**
 * Trigger auto-export of current chat
 */
function triggerExport() {
    return sendSignal(SignalType.EXPORT_CHAT, {
        exportPath: path.join(
            process.env.USERPROFILE || 'C:\\Users\\Administrator',
            'Documents', 'AntiGravity_Chat_Exports'
        )
    });
}

/**
 * Pause OmniGod operations
 */
function pause() {
    return sendSignal(SignalType.PAUSE);
}

/**
 * Resume OmniGod operations
 */
function resume() {
    return sendSignal(SignalType.RESUME);
}

module.exports = {
    SignalType,
    sendSignal,
    getStatus,
    isRunning,
    getRecentLogs,
    initializeStatusFile,
    triggerExport,
    pause,
    resume,
    OMNIGOD_DIR,
    SIGNAL_FILE,
    STATUS_FILE,
    LOG_FILE
};

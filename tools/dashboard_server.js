/**
 * Ghost Agent Dashboard Server v2.0
 * Unified HTTP server for dashboard and stats API
 * 
 * v2.0 Features:
 *   - Server-Sent Events (SSE) for live updates
 *   - Auto-reconnection support
 *   - Enhanced error handling
 * 
 * Serves:
 *   - Dashboard at /
 *   - Genesis at /genesis
 *   - Stats API at /api/stats
 *   - Heartbeat API at /api/heartbeat
 *   - Allowlist API at /api/allowlist
 *   - OmniGod API at /api/omnigod
 *   - SSE at /api/events (NEW)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// === SSE CLIENTS ===
let sseClients = [];

// === PATHS ===
const DASHBOARD_PATH = path.join(__dirname, 'dashboard', 'index.html');
const GENESIS_PATH = path.join(__dirname, 'Genesis', 'WebBuilder');
const GEMINI_PATH = path.join(process.env.USERPROFILE || 'C:\\Users\\Administrator', '.gemini', 'antigravity');
const STATS_FILE = path.join(GEMINI_PATH, '.ghost_stats.json');
const HEARTBEAT_FILE = path.join(GEMINI_PATH, '.ghost_heartbeat.json');
const ALLOWLIST_FILE = path.join(GEMINI_PATH, 'browserAllowlist.txt');

// === OMNIGOD PATHS ===
const OMNIGOD_DIR = path.join(__dirname, 'Bots', 'OmniGod');
const OMNIGOD_LOG = path.join(OMNIGOD_DIR, 'OmniGod_Logs.txt');
const OMNIGOD_STATUS_FILE = path.join(OMNIGOD_DIR, 'OMNIGOD_STATUS.json');
const OMNIGOD_SIGNAL_FILE = path.join(OMNIGOD_DIR, 'GHOST_SIGNAL.json');

// === OTHER LOGS ===
const EXPORTER_LOG = path.join(__dirname, '..', 'exporter_debug.log');
const CENTRAL_LOG = path.join(GEMINI_PATH, 'logs', 'ghost_agent.log');

// === ENSURE INITIAL FILES EXIST ===
function ensureFilesExist() {
    // Ensure directory exists
    if (!fs.existsSync(GEMINI_PATH)) {
        fs.mkdirSync(GEMINI_PATH, { recursive: true });
        console.log('[Server] Created directory:', GEMINI_PATH);
    }

    // Create initial stats file if not exists
    if (!fs.existsSync(STATS_FILE)) {
        const initialStats = {
            autoAccepts: {
                executed: 0,
                successful: 0,
                failed: 0
            },
            allowlistEntries: 0,
            sessionStart: new Date().toISOString(),
            lastUpdate: new Date().toISOString()
        };
        fs.writeFileSync(STATS_FILE, JSON.stringify(initialStats, null, 2));
        console.log('[Server] Created initial stats file');
    }

    // Create initial heartbeat if not exists
    if (!fs.existsSync(HEARTBEAT_FILE)) {
        const initialHeartbeat = {
            extensions: {
                'AntiGravity_Internal_Hook': { active: false, lastSeen: null },
                'AntiGravity_Chat_Exporter': { active: false, lastSeen: null },
                'AntiGravity_Supervisor': { active: false, lastSeen: null }
            }
        };
        fs.writeFileSync(HEARTBEAT_FILE, JSON.stringify(initialHeartbeat, null, 2));
        console.log('[Server] Created initial heartbeat file');
    }

    // Count allowlist entries
    if (fs.existsSync(ALLOWLIST_FILE)) {
        const content = fs.readFileSync(ALLOWLIST_FILE, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));

        // Update stats with allowlist count
        try {
            const stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
            stats.allowlistEntries = lines.length;
            stats.lastUpdate = new Date().toISOString();
            fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
        } catch (e) { }
    }
}

// === MIME TYPES ===
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// === SERVE STATIC FILE ===
function serveFile(filePath, res) {
    const ext = path.extname(filePath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        res.writeHead(200, {
            'Content-Type': mimeType,
            'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
    });
}

// === API: Get Stats ===
function apiGetStats(res) {
    try {
        const data = fs.readFileSync(STATS_FILE, 'utf-8');
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
    } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
    }
}

// === API: Reset Stats ===
function apiResetStats(res) {
    try {
        const stats = {
            autoAccepts: { executed: 0, successful: 0, failed: 0 },
            allowlistEntries: 0,
            sessionStart: new Date().toISOString(),
            lastUpdate: new Date().toISOString()
        };

        fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));

        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ success: true, message: 'Stats reset to 0' }));

        // Broadcast reset event
        broadcast('stats_reset', stats);
    } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
    }
}

// === API: Get Heartbeat ===
function apiGetHeartbeat(res) {
    try {
        const data = fs.readFileSync(HEARTBEAT_FILE, 'utf-8');
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
    } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
    }
}

// === API: Get Allowlist Count ===
function apiGetAllowlist(res) {
    try {
        let count = 0;
        if (fs.existsSync(ALLOWLIST_FILE)) {
            const content = fs.readFileSync(ALLOWLIST_FILE, 'utf-8');
            count = content.split('\n').filter(l => l.trim() && !l.startsWith('#')).length;
        }
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ count, file: ALLOWLIST_FILE }));
    } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
    }
}

// === API: Get OmniGod Status ===
function apiGetOmniGodStatus(res) {
    try {
        let status = {
            running: false,
            state: 'UNKNOWN',
            phase: 'IDLE',
            logSize: 0,
            lastModified: null
        };

        // Check if OmniGod is running by log file activity
        if (fs.existsSync(OMNIGOD_LOG)) {
            const stats = fs.statSync(OMNIGOD_LOG);
            const mtime = new Date(stats.mtime);
            const now = new Date();
            const diffSeconds = (now - mtime) / 1000;

            status.running = diffSeconds < 60; // Active if log updated in last minute
            status.logSize = stats.size;
            status.lastModified = mtime.toISOString();
        }

        // Try to read status file if exists
        if (fs.existsSync(OMNIGOD_STATUS_FILE)) {
            const data = JSON.parse(fs.readFileSync(OMNIGOD_STATUS_FILE, 'utf-8'));
            status = { ...status, ...data };
        }

        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(status));
    } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
    }
}

// === API: Get OmniGod Logs ===
function apiGetOmniGodLogs(res) {
    try {
        let logs = [];

        if (fs.existsSync(OMNIGOD_LOG)) {
            const content = fs.readFileSync(OMNIGOD_LOG, 'utf-8');
            const allLines = content.split('\n').filter(l => l.trim());
            logs = allLines.slice(-50); // Last 50 lines
        }

        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ logs, count: logs.length }));
    } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
    }
}

// === API: Get All Logs (Combined) ===
function apiGetAllLogs(res) {
    try {
        let allLogs = [];

        // Read exporter debug log
        if (fs.existsSync(EXPORTER_LOG)) {
            try {
                const content = fs.readFileSync(EXPORTER_LOG, 'utf-8');
                const lines = content.split('\n').filter(l => l.trim()).slice(-20);
                allLogs = allLogs.concat(lines.map(l => ({
                    source: 'exporter',
                    message: l.substring(0, 200)  // Truncate long lines
                })));
            } catch (e) { }
        }

        // Read central logger
        if (fs.existsSync(CENTRAL_LOG)) {
            try {
                const content = fs.readFileSync(CENTRAL_LOG, 'utf-8');
                const lines = content.split('\n').filter(l => l.trim()).slice(-20);
                allLogs = allLogs.concat(lines.map(l => ({
                    source: 'central',
                    message: l.substring(0, 200)
                })));
            } catch (e) { }
        }

        // Read OmniGod log (last 10 lines only due to size)
        if (fs.existsSync(OMNIGOD_LOG)) {
            try {
                const content = fs.readFileSync(OMNIGOD_LOG, 'utf-8');
                const lines = content.split('\n').filter(l => l.trim()).slice(-10);
                allLogs = allLogs.concat(lines.map(l => ({
                    source: 'omnigod',
                    message: l.substring(0, 200)
                })));
            } catch (e) { }
        }

        // Sort by recency (assuming logs have timestamps at start)
        // Take only last 30 combined
        allLogs = allLogs.slice(-30);

        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
            logs: allLogs,
            count: allLogs.length,
            sources: {
                exporter: fs.existsSync(EXPORTER_LOG),
                central: fs.existsSync(CENTRAL_LOG),
                omnigod: fs.existsSync(OMNIGOD_LOG)
            }
        }));
    } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
    }
}

// === SSE: Server-Sent Events for Live Updates ===
function handleSSE(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

    // Add client to list
    const clientId = Date.now();
    const client = { id: clientId, res };
    sseClients.push(client);
    console.log(`[SSE] Client ${clientId} connected. Total clients: ${sseClients.length}`);

    // Remove client on disconnect
    req.on('close', () => {
        sseClients = sseClients.filter(c => c.id !== clientId);
        console.log(`[SSE] Client ${clientId} disconnected. Total clients: ${sseClients.length}`);
    });

    // Send heartbeat every 30 seconds to keep connection alive
    const heartbeatInterval = setInterval(() => {
        try {
            res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
        } catch (e) {
            clearInterval(heartbeatInterval);
        }
    }, 30000);

    req.on('close', () => clearInterval(heartbeatInterval));
}

/**
 * Broadcast message to all connected SSE clients
 */
function broadcast(eventType, data) {
    const message = JSON.stringify({ type: eventType, data, timestamp: new Date().toISOString() });
    sseClients.forEach(client => {
        try {
            client.res.write(`data: ${message}\n\n`);
        } catch (e) {
            // Client disconnected, will be cleaned up
        }
    });
}

// === API: Execute Command (POST) ===
// Whitelist of allowed commands for security
const ALLOWED_COMMANDS = {
    'api-status': {
        cmd: 'node',
        args: ['tools/api-manager/manager.js', 'status'],
        cwd: path.join(__dirname, '..')
    },
    'start-omnigod': {
        cmd: 'start',
        args: ['""', path.join(__dirname, 'Bots', 'OmniGod', 'OmniGod.ahk')],
        shell: true
    },
    'reload-extension': {
        cmd: 'echo',
        args: ['Reload extension via VS Code: Ctrl+Shift+P > Developer: Reload Window'],
        shell: true
    },
    'check-python-api': {
        cmd: 'curl',
        args: ['-s', 'http://localhost:5000/status'],
        timeout: 5000
    },
    'start-python-api': {
        cmd: 'start',
        args: ['""', 'python', 'core/ghost_api.py', '--port', '5000'],
        shell: true,
        cwd: path.join(__dirname, '..')
    }
};

const { spawn, exec } = require('child_process');

function apiExecuteCommand(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        try {
            const { command } = JSON.parse(body);

            if (!ALLOWED_COMMANDS[command]) {
                res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({
                    error: `Unknown command: ${command}`,
                    available: Object.keys(ALLOWED_COMMANDS)
                }));
                return;
            }

            const cmdConfig = ALLOWED_COMMANDS[command];
            const options = {
                cwd: cmdConfig.cwd || __dirname,
                shell: cmdConfig.shell || false,
                timeout: cmdConfig.timeout || 30000
            };

            if (cmdConfig.shell) {
                // Use exec for shell commands
                const fullCmd = `${cmdConfig.cmd} ${cmdConfig.args.join(' ')}`;
                exec(fullCmd, options, (error, stdout, stderr) => {
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    res.end(JSON.stringify({
                        success: !error,
                        command,
                        stdout: stdout.toString(),
                        stderr: stderr.toString(),
                        error: error?.message
                    }));

                    // Broadcast command result
                    broadcast('command_result', { command, success: !error });
                });
            } else {
                // Use spawn for non-shell commands
                const proc = spawn(cmdConfig.cmd, cmdConfig.args, options);
                let stdout = '';
                let stderr = '';

                proc.stdout.on('data', data => stdout += data);
                proc.stderr.on('data', data => stderr += data);

                proc.on('close', code => {
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    res.end(JSON.stringify({
                        success: code === 0,
                        command,
                        stdout,
                        stderr,
                        exitCode: code
                    }));

                    broadcast('command_result', { command, success: code === 0 });
                });

                proc.on('error', err => {
                    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    res.end(JSON.stringify({ error: err.message }));
                });
            }

            console.log(`[CMD] Executing: ${command}`);

        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: e.message }));
        }
    });
}

// === API: Update Stats (POST) ===
function apiUpdateStats(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        try {
            const update = JSON.parse(body);
            let stats = {};

            if (fs.existsSync(STATS_FILE)) {
                stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
            }

            // Merge update
            if (update.increment) {
                stats.autoAccepts = stats.autoAccepts || { executed: 0, successful: 0, failed: 0 };
                stats.autoAccepts.executed += update.increment.executed || 0;
                stats.autoAccepts.successful += update.increment.successful || 0;
                stats.autoAccepts.failed += update.increment.failed || 0;
            }

            stats.lastUpdate = new Date().toISOString();
            fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));

            // Broadcast to all connected SSE clients
            broadcast('stats_update', stats);

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ success: true, stats }));
        } catch (e) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: e.message }));
        }
    });
}

// === API: Update Heartbeat (POST) ===
function apiUpdateHeartbeat(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        try {
            const update = JSON.parse(body);
            let heartbeat = { extensions: {} };

            if (fs.existsSync(HEARTBEAT_FILE)) {
                heartbeat = JSON.parse(fs.readFileSync(HEARTBEAT_FILE, 'utf-8'));
            }

            // Update extension status - accept both 'extension' and 'extensionId'
            const extName = update.extension || update.extensionId;
            if (extName) {
                heartbeat.extensions[extName] = {
                    active: update.active !== false,
                    lastSeen: new Date().toISOString()
                };
            }

            fs.writeFileSync(HEARTBEAT_FILE, JSON.stringify(heartbeat, null, 2));

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ success: true }));
        } catch (e) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: e.message }));
        }
    });
}

// === CREATE SERVER ===
const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${url}`);

    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    // API Routes
    if (url === '/api/stats') {
        if (req.method === 'POST') {
            apiUpdateStats(req, res);
        } else {
            apiGetStats(res);
        }
        return;
    }

    if (url === '/api/stats/reset' && req.method === 'POST') {
        apiResetStats(res);
        return;
    }

    if (url === '/api/heartbeat') {
        if (req.method === 'POST') {
            apiUpdateHeartbeat(req, res);
        } else {
            apiGetHeartbeat(res);
        }
        return;
    }

    if (url === '/api/allowlist') {
        apiGetAllowlist(res);
        return;
    }

    // OmniGod Status API
    if (url === '/api/omnigod') {
        apiGetOmniGodStatus(res);
        return;
    }

    if (url === '/api/omnigod/logs') {
        apiGetOmniGodLogs(res);
        return;
    }

    // Combined Logs API
    if (url === '/api/logs/all') {
        apiGetAllLogs(res);
        return;
    }

    // SSE Endpoint for Live Updates
    if (url === '/api/events') {
        handleSSE(req, res);
        return;
    }

    // Command Execution API
    if (url === '/api/execute' && req.method === 'POST') {
        apiExecuteCommand(req, res);
        return;
    }

    // Dashboard (root)
    if (url === '/' || url === '/dashboard') {
        serveFile(DASHBOARD_PATH, res);
        return;
    }

    // Genesis Studio
    if (url.startsWith('/genesis')) {
        const filePath = url === '/genesis' || url === '/genesis/'
            ? path.join(GENESIS_PATH, 'index.html')
            : path.join(GENESIS_PATH, url.replace('/genesis', ''));
        serveFile(filePath, res);
        return;
    }

    // Static files from dashboard folder
    if (url.startsWith('/dashboard/')) {
        const filePath = path.join(__dirname, 'dashboard', url.replace('/dashboard/', ''));
        serveFile(filePath, res);
        return;
    }

    // Default: try to serve from tools folder
    const filePath = path.join(__dirname, url);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        serveFile(filePath, res);
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

// === START SERVER ===
const PORT = 9999;

ensureFilesExist();

server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║           GHOST AGENT DASHBOARD SERVER v1.0                       ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Dashboard:  http://localhost:${PORT}/                              ║
║  Genesis:    http://localhost:${PORT}/genesis                       ║
║                                                                   ║
║  API Endpoints:                                                   ║
║    GET  /api/stats      - Get current stats                       ║
║    POST /api/stats      - Update stats                            ║
║    GET  /api/heartbeat  - Get extension status                    ║
║    POST /api/heartbeat  - Update extension heartbeat              ║
║    GET  /api/allowlist  - Get allowlist count                     ║
║                                                                   ║
║  Files:                                                           ║
║    Stats:     ${STATS_FILE}
║    Heartbeat: ${HEARTBEAT_FILE}
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
    `);
});

/**
 * Ghost Agent Dashboard Server v1.0
 * Unified HTTP server for dashboard and stats API
 * 
 * Serves:
 *   - Dashboard at /
 *   - Genesis at /genesis
 *   - Stats API at /api/stats
 *   - Heartbeat API at /api/heartbeat
 *   - Allowlist API at /api/allowlist
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// === PATHS ===
const DASHBOARD_PATH = path.join(__dirname, 'dashboard', 'index.html');
const GENESIS_PATH = path.join(__dirname, 'Genesis', 'WebBuilder');
const GEMINI_PATH = path.join(process.env.USERPROFILE || 'C:\\Users\\Administrator', '.gemini', 'antigravity');
const STATS_FILE = path.join(GEMINI_PATH, '.ghost_stats.json');
const HEARTBEAT_FILE = path.join(GEMINI_PATH, '.ghost_heartbeat.json');
const ALLOWLIST_FILE = path.join(GEMINI_PATH, 'browserAllowlist.txt');

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

            // Update extension status
            if (update.extension) {
                heartbeat.extensions[update.extension] = {
                    active: true,
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

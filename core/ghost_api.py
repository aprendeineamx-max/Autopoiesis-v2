#!/usr/bin/env python3
"""
Ghost Agent Control API v1.0
REST API for remote control of Ghost Agent system

Endpoints:
    GET  /status         - Get current system status
    GET  /stats          - Get auto-accept statistics
    POST /command        - Execute a command
    GET  /extensions     - Get extension status
    GET  /logs           - Get recent logs
    POST /signal         - Send signal to OmniGod

Run with: python ghost_api.py [--port 5000]
"""

import os
import sys
import json
import datetime
import argparse
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# === PATHS ===
GEMINI_PATH = Path(os.environ.get('USERPROFILE', 'C:\\Users\\Administrator')) / '.gemini' / 'antigravity'
STATS_FILE = GEMINI_PATH / '.ghost_stats.json'
HEARTBEAT_FILE = GEMINI_PATH / '.ghost_heartbeat.json'
ALLOWLIST_FILE = GEMINI_PATH / 'browserAllowlist.txt'

TOOLS_PATH = Path(__file__).parent.parent
OMNIGOD_DIR = TOOLS_PATH / 'Bots' / 'OmniGod'
OMNIGOD_LOG = OMNIGOD_DIR / 'OmniGod_Logs.txt'
OMNIGOD_SIGNAL = OMNIGOD_DIR / 'GHOST_SIGNAL.json'

# === DATABASE (Simple JSON file) ===
SESSION_DB = GEMINI_PATH / '.ghost_sessions.json'

def ensure_dir():
    """Ensure the gemini directory exists"""
    GEMINI_PATH.mkdir(parents=True, exist_ok=True)

def load_json(path: Path, default=None):
    """Load JSON from file safely"""
    try:
        if path.exists():
            return json.loads(path.read_text(encoding='utf-8'))
    except Exception as e:
        print(f"[API] Error loading {path}: {e}")
    return default or {}

def save_json(path: Path, data):
    """Save JSON to file"""
    try:
        path.write_text(json.dumps(data, indent=2, default=str), encoding='utf-8')
        return True
    except Exception as e:
        print(f"[API] Error saving {path}: {e}")
        return False

def get_system_status():
    """Get comprehensive system status"""
    stats = load_json(STATS_FILE, {'autoAccepts': {'executed': 0, 'successful': 0, 'failed': 0}})
    heartbeat = load_json(HEARTBEAT_FILE, {'extensions': {}})
    
    # Check OmniGod status
    omnigod_running = False
    if OMNIGOD_LOG.exists():
        mtime = datetime.datetime.fromtimestamp(OMNIGOD_LOG.stat().st_mtime)
        diff_seconds = (datetime.datetime.now() - mtime).total_seconds()
        omnigod_running = diff_seconds < 60
    
    # Count allowlist
    allowlist_count = 0
    if ALLOWLIST_FILE.exists():
        lines = ALLOWLIST_FILE.read_text(encoding='utf-8').split('\n')
        allowlist_count = len([l for l in lines if l.strip() and not l.startswith('#')])
    
    # Count active extensions
    active_extensions = 0
    now = datetime.datetime.now()
    for ext_id, ext_data in heartbeat.get('extensions', {}).items():
        if ext_data.get('active') and ext_data.get('lastSeen'):
            try:
                last_seen = datetime.datetime.fromisoformat(ext_data['lastSeen'].replace('Z', '+00:00'))
                if (now.replace(tzinfo=None) - last_seen.replace(tzinfo=None)).total_seconds() < 120:
                    active_extensions += 1
            except:
                pass
    
    return {
        'status': 'running' if active_extensions > 0 else 'idle',
        'timestamp': datetime.datetime.now().isoformat(),
        'stats': stats,
        'extensions': {
            'active': active_extensions,
            'total': len(heartbeat.get('extensions', {})),
            'details': heartbeat.get('extensions', {})
        },
        'omnigod': {
            'running': omnigod_running,
            'logSize': OMNIGOD_LOG.stat().st_size if OMNIGOD_LOG.exists() else 0
        },
        'allowlist': {
            'count': allowlist_count,
            'file': str(ALLOWLIST_FILE)
        }
    }

def record_session(event_type: str, data: dict = None):
    """Record a session event to the database"""
    sessions = load_json(SESSION_DB, {'events': []})
    
    event = {
        'type': event_type,
        'timestamp': datetime.datetime.now().isoformat(),
        'data': data or {}
    }
    
    sessions['events'].append(event)
    
    # Keep only last 1000 events
    if len(sessions['events']) > 1000:
        sessions['events'] = sessions['events'][-1000:]
    
    save_json(SESSION_DB, sessions)
    return event

def send_omnigod_signal(signal_type: str, data: dict = None):
    """Send a signal to OmniGod"""
    signal = {
        'signal': signal_type,
        'data': data or {},
        'timestamp': datetime.datetime.now().isoformat(),
        'source': 'ghost_api'
    }
    
    try:
        save_json(OMNIGOD_SIGNAL, signal)
        record_session('omnigod_signal', signal)
        return {'success': True, 'signal': signal}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def get_analytics():
    """Get productivity analytics from session data"""
    sessions = load_json(SESSION_DB, {'events': []})
    stats = load_json(STATS_FILE, {'autoAccepts': {'executed': 0}})
    
    # Calculate analytics
    events = sessions.get('events', [])
    today = datetime.datetime.now().date()
    
    today_events = [e for e in events if e.get('timestamp', '')[:10] == str(today)]
    
    return {
        'totalEvents': len(events),
        'todayEvents': len(today_events),
        'autoAcceptsTotal': stats.get('autoAccepts', {}).get('executed', 0),
        'successRate': round(
            (stats.get('autoAccepts', {}).get('successful', 0) / 
             max(stats.get('autoAccepts', {}).get('executed', 1), 1)) * 100, 2
        ),
        'lastActivity': events[-1]['timestamp'] if events else None
    }

class GhostAPIHandler(BaseHTTPRequestHandler):
    """HTTP Request Handler for Ghost Agent API"""
    
    def _send_json(self, data, status=200):
        """Send JSON response"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2, default=str).encode())
    
    def _send_error(self, message, status=400):
        """Send error response"""
        self._send_json({'error': message}, status)
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        url = urlparse(self.path)
        path = url.path
        
        if path == '/' or path == '/status':
            self._send_json(get_system_status())
        
        elif path == '/stats':
            stats = load_json(STATS_FILE, {'autoAccepts': {'executed': 0}})
            self._send_json(stats)
        
        elif path == '/extensions':
            heartbeat = load_json(HEARTBEAT_FILE, {'extensions': {}})
            self._send_json(heartbeat)
        
        elif path == '/logs':
            logs = []
            if OMNIGOD_LOG.exists():
                lines = OMNIGOD_LOG.read_text(encoding='utf-8', errors='ignore').split('\n')
                logs = lines[-50:]  # Last 50 lines
            self._send_json({'logs': logs, 'count': len(logs)})
        
        elif path == '/analytics':
            self._send_json(get_analytics())
        
        elif path == '/sessions':
            sessions = load_json(SESSION_DB, {'events': []})
            self._send_json(sessions)
        
        else:
            self._send_error('Not Found', 404)
    
    def do_POST(self):
        """Handle POST requests"""
        url = urlparse(self.path)
        path = url.path
        
        # Read body
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode() if content_length > 0 else '{}'
        
        try:
            data = json.loads(body) if body else {}
        except:
            data = {}
        
        if path == '/command':
            command = data.get('command')
            if not command:
                self._send_error('command is required')
                return
            
            event = record_session('command', {'command': command})
            self._send_json({'success': True, 'event': event})
        
        elif path == '/signal':
            signal_type = data.get('signal')
            if not signal_type:
                self._send_error('signal is required')
                return
            
            result = send_omnigod_signal(signal_type, data.get('data'))
            self._send_json(result)
        
        elif path == '/session':
            event_type = data.get('type', 'custom')
            event = record_session(event_type, data)
            self._send_json({'success': True, 'event': event})
        
        else:
            self._send_error('Not Found', 404)
    
    def log_message(self, format, *args):
        """Custom logging"""
        print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {args[0]}")

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Ghost Agent Control API')
    parser.add_argument('--port', type=int, default=5000, help='Port to run on (default: 5000)')
    parser.add_argument('--host', default='127.0.0.1', help='Host to bind to (default: 127.0.0.1)')
    args = parser.parse_args()
    
    ensure_dir()
    
    server = HTTPServer((args.host, args.port), GhostAPIHandler)
    
    print(f"""
╔═══════════════════════════════════════════════════════════════════╗
║           GHOST AGENT CONTROL API v1.0                            ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Running on: http://{args.host}:{args.port}/                              ║
║                                                                   ║
║  Endpoints:                                                       ║
║    GET  /status       - System status                             ║
║    GET  /stats        - Auto-accept statistics                    ║
║    GET  /extensions   - Extension heartbeats                      ║
║    GET  /logs         - OmniGod logs                              ║
║    GET  /analytics    - Productivity analytics                    ║
║    GET  /sessions     - Session history                           ║
║    POST /command      - Execute command                           ║
║    POST /signal       - Send signal to OmniGod                    ║
║    POST /session      - Record session event                      ║
║                                                                   ║
║  Press Ctrl+C to stop                                             ║
╚═══════════════════════════════════════════════════════════════════╝
    """)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[API] Shutting down...")
        server.shutdown()

if __name__ == '__main__':
    main()

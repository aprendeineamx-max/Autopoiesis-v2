# CDP Multi-Tab Capture - Monitorea TODOS los tabs simultáneamente

"""
Versión mejorada que:
1. Conecta a MÚLTIPLES tabs simultáneamente
2. Monitorea iframes
3. Busca patrones específicos de Antigravity
4. Captura TODO el tráfico
"""

import json
import urllib.request
import threading
import time
from datetime import datetime
from pathlib import Path

try:
    import websocket
except ImportError:
    print("❌ Requiere websocket-client")
    exit(1)

OUTPUT_DIR = Path("C:/chat_captures")
OUTPUT_DIR.mkdir(exist_ok=True)
MESSAGES_FILE = OUTPUT_DIR / "multitab_capture.json"
LOG_FILE = OUTPUT_DIR / "multitab_log.txt"

class MultiTabCapture:
    def __init__(self):
        self.all_messages = []
        self.active_connections = []
        self.lock = threading.Lock()
        
    def log(self, msg):
        """Thread-safe logging"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        full_msg = f"[{timestamp}] {msg}"
        print(full_msg)
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(full_msg + "\n")
    
    def save_messages(self):
        """Guardar mensajes thread-safe"""
        with self.lock:
            try:
                with open(MESSAGES_FILE, 'w', encoding='utf-8') as f:
                    json.dump({
                        'total': len(self.all_messages),
                        'updated': datetime.now().isoformat(),
                        'messages': self.all_messages
                    }, f, indent=2, ensure_ascii=False)
            except Exception as e:
                self.log(f"⚠️ Error guardando: {e}")
    
    def is_relevant_url(self, url):
        """Filtrar URLs relevantes"""
        if not url:
            return False
        
        # Keywords de Antigravity/Google AI
        keywords = [
            'chat', 'message', 'conversation',
            'api', 'gemini', 'google',
            'completions', 'stream', 'generate',
            'antigravity', 'cascade',
            'googleapis.com', 'generativelanguage'
        ]
        
        url_lower = url.lower()
        return any(k in url_lower for k in keywords)
    
    def extract_message_content(self, data):
        """Extraer contenido de mensaje de diferentes formatos"""
        try:
            if isinstance(data, str):
                data = json.loads(data)
            
            # Buscar en diferentes campos
            message_fields = [
                'message', 'prompt', 'text', 'content',
                'input', 'query', 'question', 'userMessage'
            ]
            
            for field in message_fields:
                if field in data:
                    return str(data[field])[:200]
            
            # Buscar recursivamente
            if isinstance(data, dict):
                for value in data.values():
                    if isinstance(value, (dict, list)):
                        result = self.extract_message_content(value)
                        if result:
                            return result
            
            return None
        except:
            return None
    
    def create_tab_monitor(self, tab, tab_index):
        """Crear monitor para un tab específico"""
        
        tab_id = tab.get('id')
        tab_title = tab.get('title', 'Unknown')[:40]
        ws_url = tab.get('webSocketDebuggerUrl')
        
        if not ws_url:
            return
        
        def on_message(ws, message):
            try:
                data = json.loads(message)
                
                if 'method' in data:
                    method = data['method']
                    
                    # Request
                    if method == 'Network.requestWillBeSent':
                        params = data.get('params', {})
                        request = params.get('request', {})
                        url = request.get('url', '')
                        
                        if self.is_relevant_url(url):
                            self.log(f"\n📤 [Tab {tab_index}] REQUEST")
                            self.log(f"   Tab: {tab_title}")
                            self.log(f"   URL: {url[:80]}")
                            
                            post_data = request.get('postData')
                            if post_data:
                                self.log(f"   Data: {post_data[:150]}")
                                
                                # Extraer mensaje
                                msg_content = self.extract_message_content(post_data)
                                if msg_content:
                                    self.log(f"   💬 MENSAJE: {msg_content}")
                                
                                # Guardar
                                with self.lock:
                                    self.all_messages.append({
                                        'type': 'request',
                                        'tab': tab_title,
                                        'timestamp': datetime.now().isoformat(),
                                        'url': url,
                                        'data': post_data,
                                        'message_preview': msg_content
                                    })
                                
                                self.save_messages()
                    
                    # Response
                    elif method == 'Network.responseReceived':
                        params = data.get('params', {})
                        response = params.get('response', {})
                        url = response.get('url', '')
                        
                        if self.is_relevant_url(url):
                            self.log(f"\n📥 [Tab {tab_index}] RESPONSE")
                            self.log(f"   Tab: {tab_title}")
                            self.log(f"   URL: {url[:80]}")
                            self.log(f"   Status: {response.get('status')}")
            
            except:
                pass
        
        def on_error(ws, error):
            self.log(f"⚠️ [Tab {tab_index}] Error: {error}")
        
        def on_close(ws, code, msg):
            self.log(f"⏹️ [Tab {tab_index}] Cerrado: {tab_title}")
        
        def on_open(ws):
            self.log(f"✅ [Tab {tab_index}] Conectado: {tab_title}")
            
            # Habilitar Network domain
            ws.send(json.dumps({
                "id": 1,
                "method": "Network.enable"
            }))
            
            # Habilitar Page domain para iframes
            ws.send(json.dumps({
                "id": 2,
                "method": "Page.enable"
            }))
        
        # Crear WebSocket
        ws = websocket.WebSocketApp(
            ws_url,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close,
            on_open=on_open
        )
        
        # Guardar conexión
        self.active_connections.append(ws)
        
        # Ejecutar en thread separado
        thread = threading.Thread(target=ws.run_forever, daemon=True)
        thread.start()
        
        return thread
    
    def start(self):
        """Iniciar captura multi-tab"""
        
        self.log("="*80)
        self.log("  🚀 CDP Multi-Tab Capture")
        self.log("="*80)
        
        # Obtener tabs
        try:
            with open("C:/chat_captures/cdp_messages_v3.json", 'r') as f:
                data = json.load(f)
                tabs = data['messages'][0]['tabs']
        except Exception as e:
            self.log(f"❌ Error leyendo tabs: {e}")
            return
        
        # Filtrar tabs relevantes
        relevant_tabs = []
        for tab in tabs:
            url = tab.get('url', '')
            tab_type = tab.get('type', '')
            
            # Incluir pages, excluir chrome:// internals
            if tab_type == 'page' and not url.startswith('chrome://'):
                relevant_tabs.append(tab)
        
        self.log(f"\n📊 Total tabs: {len(tabs)}")
        self.log(f"📌 Tabs relevantes: {len(relevant_tabs)}")
        self.log("")
        
        # Conectar a cada tab
        threads = []
        for i, tab in enumerate(relevant_tabs[:10], 1):  # Máximo 10 tabs
            self.log(f"Conectando a tab {i}...")
            thread = self.create_tab_monitor(tab, i)
            if thread:
                threads.append(thread)
                time.sleep(0.5)  # Pequeña pausa entre conexiones
        
        self.log(f"\n✅ Conectados: {len(threads)} tabs")
        self.log("")
        self.log("="*80)
        self.log("🎯 MONITOREO ACTIVO EN MÚLTIPLES TABS")
        self.log("="*80)
        self.log("Usa Antigravity normalmente - capturando todo...\n")
        
        # Mantener vivo
        try:
            while True:
                time.sleep(5)
                
                # Log periódico
                if len(self.all_messages) > 0:
                    with self.lock:
                        self.log(f"📊 Total capturado: {len(self.all_messages)} mensajes")
        
        except KeyboardInterrupt:
            self.log("\n⏹️ Detenido por usuario")
        finally:
            self.save_messages()
            self.log(f"\n💾 Total final: {len(self.all_messages)} mensajes")
            self.log(f"📁 Archivo: {MESSAGES_FILE}")

if __name__ == "__main__":
    capturer = MultiTabCapture()
    capturer.start()

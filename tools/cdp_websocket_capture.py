# CDP WebSocket Capture - Versión completa con WebSocket

"""
Script que conecta via WebSocket a Chrome DevTools Protocol
para capturar mensajes del chat en tiempo real.

Requiere: websocket-client
Instalación: pip install websocket-client
"""

import json
import urllib.request
import time
from datetime import datetime
from pathlib import Path

try:
    import websocket
    WEBSOCKET_AVAILABLE = True
except ImportError:
    print("⚠️  websocket-client no disponible")
    print("Ejecuta: pip install websocket-client")
    WEBSOCKET_AVAILABLE = False
    exit(1)

OUTPUT_DIR = Path("C:/chat_captures")
OUTPUT_DIR.mkdir(exist_ok=True)
MESSAGES_FILE = OUTPUT_DIR / "chat_websocket.json"
LOG_FILE = OUTPUT_DIR / "websocket_log.txt"

class CDPWebSocketCapture:
    def __init__(self):
        self.messages = []
        self.request_id = 0
        self.ws = None
        self.running = True
        
    def log(self, msg):
        """Logging"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        full_msg = f"[{timestamp}] {msg}"
        print(full_msg)
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(full_msg + "\n")
    
    def save_messages(self):
        """Guardar mensajes"""
        try:
            with open(MESSAGES_FILE, 'w', encoding='utf-8') as f:
                json.dump({
                    'total': len(self.messages),
                    'updated': datetime.now().isoformat(),
                    'messages': self.messages
                }, f, indent=2, ensure_ascii=False)
            self.log(f"💾 Guardados {len(self.messages)} mensajes")
        except Exception as e:
            self.log(f"⚠️ Error guardando: {e}")
    
    def get_best_tab(self):
        """Obtener el mejor tab para monitorear"""
        try:
            # Leer tabs guardados
            with open("C:/chat_captures/cdp_messages_v3.json", 'r') as f:
                data = json.load(f)
                tabs = data['messages'][0]['tabs']
            
            # Filtrar tabs relevantes
            relevant = []
            for tab in tabs:
                url = tab.get('url', '')
                title = tab.get('title', '')
                
                # Ignorar chrome:// y about:
                if url.startswith('chrome://') or url.startswith('about:'):
                    continue
                
                # Priorizar tabs con contenido
                if 'localhost' in url or 'google' in url or len(title) > 5:
                    relevant.append(tab)
            
            if relevant:
                return relevant[0]  # Primer tab relevante
            elif tabs:
                return tabs[0]  # Cualquier tab
            else:
                return None
                
        except Exception as e:
            self.log(f"❌ Error obteniendo tabs: {e}")
            return None
    
    def send_command(self, method, params=None):
        """Enviar comando CDP"""
        self.request_id += 1
        command = {
            "id": self.request_id,
            "method": method,
            "params": params or {}
        }
        self.ws.send(json.dumps(command))
        return self.request_id
    
    def on_message(self, ws, message):
        """Callback para mensajes WebSocket"""
        try:
            data = json.loads(message)
            
            # Eventos de Network
            if 'method' in data:
                method = data['method']
                
                # Request enviado
                if method == 'Network.requestWillBeSent':
                    params = data.get('params', {})
                    request = params.get('request', {})
                    url = request.get('url', '')
                    
                    # Filtrar URLs de chat/API
                    keywords = ['chat', 'message', 'conversation', 'api', 
                               'gemini', 'google', 'completions', 'stream']
                    
                    if any(k in url.lower() for k in keywords):
                        self.log(f"\n📤 REQUEST")
                        self.log(f"   URL: {url[:80]}")
                        self.log(f"   Method: {request.get('method')}")
                        
                        # POST data
                        post_data = request.get('postData')
                        if post_data:
                            self.log(f"   Data: {post_data[:200]}")
                            
                            # Intentar parsear JSON
                            try:
                                json_data = json.loads(post_data)
                                self.log(f"   📊 JSON Keys: {list(json_data.keys())}")
                                
                                # Buscar mensaje
                                if 'message' in json_data:
                                    self.log(f"   💬 Message: {str(json_data['message'])[:100]}")
                                elif 'prompt' in json_data:
                                    self.log(f"   💬 Prompt: {str(json_data['prompt'])[:100]}")
                                
                                # Guardar
                                self.messages.append({
                                    'type': 'request',
                                    'timestamp': datetime.now().isoformat(),
                                    'url': url,
                                    'method': request.get('method'),
                                    'data': json_data
                                })
                                
                                self.save_messages()
                                
                            except:
                                pass
                
                # Response recibido
                elif method == 'Network.responseReceived':
                    params = data.get('params', {})
                    response = params.get('response', {})
                    url = response.get('url', '')
                    
                    keywords = ['chat', 'message', 'conversation', 'api', 
                               'gemini', 'google', 'completions', 'stream']
                    
                    if any(k in url.lower() for k in keywords):
                        self.log(f"\n📥 RESPONSE")
                        self.log(f"   URL: {url[:80]}")
                        self.log(f"   Status: {response.get('status')}")
                        
                        # Intentar obtener body
                        request_id = params.get('requestId')
                        if request_id:
                            try:
                                # Solicitar body
                                self.send_command('Network.getResponseBody', {
                                    'requestId': request_id
                                })
                            except:
                                pass
            
            # Response a nuestros comandos
            elif 'result' in data:
                result = data.get('result', {})
                
                # Response body
                if 'body' in result:
                    body = result.get('body', '')
                    
                    if body and len(body) > 10:
                        self.log(f"   📄 Body: {body[:200]}")
                        
                        try:
                            json_body = json.loads(body)
                            self.log(f"   📊 JSON Keys: {list(json_body.keys())}")
                            
                            # Guardar
                            self.messages.append({
                                'type': 'response',
                                'timestamp': datetime.now().isoformat(),
                                'data': json_body
                            })
                            
                            self.save_messages()
                            
                        except:
                            pass
            
        except Exception as e:
            # Ignorar errores de parseo
            pass
    
    def on_error(self, ws, error):
        """Error callback"""
        self.log(f"❌ WebSocket Error: {error}")
    
    def on_close(self, ws, close_status_code, close_msg):
        """Close callback"""
        self.log(f"⏹️  WebSocket cerrado")
        self.running = False
    
    def on_open(self, ws):
        """Open callback"""
        self.log("✅ WebSocket conectado")
        
        # Habilitar Network domain
        self.send_command('Network.enable')
        self.log("✅ Network domain habilitado")
        
        # Habilitar Page domain (opcional)
        self.send_command('Page.enable')
        
        self.log("\n" + "="*80)
        self.log("🎯 CAPTURA ACTIVA - Usa Antigravity normalmente")
        self.log("="*80)
        self.log("")
    
    def start(self):
        """Iniciar captura"""
        
        self.log("="*80)
        self.log("  🚀 CDP WebSocket Capture")
        self.log("="*80)
        
        # Obtener tab
        tab = self.get_best_tab()
        
        if not tab:
            self.log("❌ No se encontraron tabs")
            return
        
        ws_url = tab.get('webSocketDebuggerUrl')
        tab_title = tab.get('title', 'Unknown')
        tab_url = tab.get('url', '')[:60]
        
        self.log(f"\n📱 Tab seleccionado:")
        self.log(f"   Título: {tab_title}")
        self.log(f"   URL: {tab_url}")
        self.log(f"   WebSocket: {ws_url[:60]}...")
        
        # Conectar WebSocket
        self.log(f"\n📡 Conectando...")
        
        self.ws = websocket.WebSocketApp(
            ws_url,
            on_message=self.on_message,
            on_error=self.on_error,
            on_close=self.on_close,
            on_open=self.on_open
        )
        
        try:
            self.ws.run_forever()
        except KeyboardInterrupt:
            self.log("\n⏹️  Detenido por usuario")
        finally:
            self.save_messages()
            self.log(f"\n💾 Total capturado: {len(self.messages)} mensajes")
            self.log(f"📁 Archivo: {MESSAGES_FILE}")

if __name__ == "__main__":
    capturer = CDPWebSocketCapture()
    capturer.start()

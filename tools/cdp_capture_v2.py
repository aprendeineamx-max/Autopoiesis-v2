# CDP Capture V2 - Versión más simple y robusta

import json
import requests
import websocket
from datetime import datetime
from pathlib import Path
import threading

OUTPUT_DIR = Path("C:/chat_captures")
OUTPUT_DIR.mkdir(exist_ok=True)
MESSAGES_FILE = OUTPUT_DIR / "cdp_messages_v2.json"

class CDPCapture:
    def __init__(self, port=9222):
        self.port = port
        self.messages = []
        self.ws = None
        self.request_id = 0
        
    def log(self, msg):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")
    
    def get_websocket_url(self):
        """Obtener WebSocket URL del primer tab"""
        try:
            response = requests.get(f"http://127.0.0.1:{self.port}/json")
            tabs = response.json()
            
            self.log(f"✅ Encontrados {len(tabs)} tabs")
            
            if not tabs:
                self.log("❌ No hay tabs")
                return None
            
            # Usar primer tab activo
            for tab in tabs:
                if tab.get('type') == 'page':
                    ws_url = tab.get('webSocketDebuggerUrl')
                    self.log(f"✅ Tab: {tab.get('title', 'Unknown')}")
                    self.log(f"📡 WebSocket: {ws_url}")
                    return ws_url
            
            return None
            
        except Exception as e:
            self.log(f"❌ Error: {e}")
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
        """Callback para mensajes recibidos"""
        try:
            data = json.loads(message)
            
            # Filtrar eventos Network
            if 'method' in data:
                method = data['method']
                
                # Request enviado
                if method == 'Network.requestWillBeSent':
                    params = data.get('params', {})
                    request = params.get('request', {})
                    url = request.get('url', '')
                    
                    # Filtrar URLs relevantes
                    if any(k in url.lower() for k in ['chat', 'message', 'conversation', 'api']):
                        self.log(f"\n📤 REQUEST: {request.get('method')} {url[:80]}")
                        
                        # POST data
                        post_data = request.get('postData')
                        if post_data:
                            self.log(f"📝 Data: {post_data[:200]}")
                            
                            # Guardar
                            self.messages.append({
                                'type': 'request',
                                'timestamp': datetime.now().isoformat(),
                                'url': url,
                                'method': request.get('method'),
                                'data': post_data
                            })
                            self.save_messages()
                
                # Response recibido
                elif method == 'Network.responseReceived':
                    params = data.get('params', {})
                    response = params.get('response', {})
                    url = response.get('url', '')
                    request_id = params.get('requestId')
                    
                    if any(k in url.lower() for k in ['chat', 'message', 'conversation', 'api']):
                        self.log(f"\n📥 RESPONSE: {response.get('status')} {url[:80]}")
                        
                        # Obtener body
                        self.pending_responses.append(request_id)
                
                # Loading finished - obtener body
                elif method == 'Network.loadingFinished':
                    request_id = data.get('params', {}).get('requestId')
                    if request_id in self.pending_responses:
                        threading.Thread(target=self.fetch_response_body, args=(request_id,)).start()
            
            # Response a nuestros comandos
            elif 'result' in data and 'id' in data:
                cmd_id = data['id']
                if cmd_id in self.body_requests:
                    result = data.get('result', {})
                    body = result.get('body', '')
                    
                    if body:
                        self.log(f"📄 Body: {body[:200]}")
                        
                        try:
                            json_body = json.loads(body)
                            self.log(f"📊 JSON: {json.dumps(json_body, indent=2)[:300]}")
                            
                            # Guardar
                            self.messages.append({
                                'type': 'response',
                                'timestamp': datetime.now().isoformat(),
                                'data': json_body
                            })
                            self.save_messages()
                        except:
                            pass
                    
                    self.body_requests.remove(cmd_id)
                    
        except Exception as e:
            pass  # Ignorar errores de parseo
    
    def fetch_response_body(self, request_id):
        """Obtener body de un response"""
        try:
            cmd_id = self.send_command('Network.getResponseBody', {'requestId': request_id})
            self.body_requests.add(cmd_id)
            self.pending_responses.remove(request_id)
        except:
            pass
    
    def on_error(self, ws, error):
        self.log(f"❌ WS Error: {error}")
    
    def on_close(self, ws, close_status_code, close_msg):
        self.log(f"⏹️ WebSocket cerrado: {close_status_code}")
    
    def on_open(self, ws):
        self.log("✅ WebSocket conectado")
        
        # Habilitar Network domain
        self.send_command('Network.enable')
        self.log("✅ Network domain habilitado")
        
        self.log("\n🎯 Captura activa - Presiona Ctrl+C para detener")
        self.log("="*80)
    
    def save_messages(self):
        """Guardar mensajes a archivo"""
        try:
            with open(MESSAGES_FILE, 'w', encoding='utf-8') as f:
                json.dump({
                    'total': len(self.messages),
                    'updated': datetime.now().isoformat(),
                    'messages': self.messages
                }, f, indent=2, ensure_ascii=False)
        except:
            pass
    
    def start(self):
        """Iniciar captura"""
        ws_url = self.get_websocket_url()
        
        if not ws_url:
            self.log("❌ No se pudo conectar")
            return
        
        # Inicializar tracking
        self.pending_responses = set()
        self.body_requests = set()
        
        # Crear WebSocket
        self.log(f"\n📡 Conectando a WebSocket...")
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
            self.log("\n⏹️ Detenido por usuario")
        finally:
            self.save_messages()
            self.log(f"\n💾 Total capturado: {len(self.messages)} mensajes")
            self.log(f"📁 Archivo: {MESSAGES_FILE}")

if __name__ == "__main__":
    print("="*80)
    print("  🚀 CDP Capture V2 - Versión Simplificada")
    print("="*80)
    print()
    
    # Instalar websocket-client si no está
    try:
        import websocket
    except ImportError:
        print("📦 Instalando websocket-client...")
        import subprocess
        subprocess.run(["pip", "install", "websocket-client"], check=True)
        import websocket
    
    capturer = CDPCapture(port=9222)
    capturer.start()

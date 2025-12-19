# Método 1: Chrome DevTools Protocol - Interceptar tráfico de Antigravity

import asyncio
import json
from datetime import datetime
from pathlib import Path

try:
    from pychrome import Browser
except ImportError:
    print("Instalando pychrome...")
    import subprocess
    subprocess.run(["pip", "install", "pychrome"], check=True)
    from pychrome import Browser

# Archivos de salida
OUTPUT_DIR = Path("C:/chat_captures")
OUTPUT_DIR.mkdir(exist_ok=True)
MESSAGES_FILE = OUTPUT_DIR / "cdp_messages.json"
LOG_FILE = OUTPUT_DIR / "cdp_log.txt"

class AntigravityCDPCapture:
    def __init__(self, port=9222):
        self.port = port
        self.messages = []
        self.browser = None
        self.tab = None
        
    def log(self, message):
        """Log a archivo y consola"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_msg = f"[{timestamp}] {message}"
        print(log_msg)
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(log_msg + "\n")
    
    def connect(self):
        """Conectar a Antigravity via CDP"""
        try:
            self.log(f"Conectando a Chrome DevTools en puerto {self.port}...")
            self.browser = Browser(url=f"http://127.0.0.1:{self.port}")
            
            # Listar tabs
            tabs = self.browser.list_tab()
            self.log(f"✅ Encontrados {len(tabs)} tabs")
            
            if not tabs:
                self.log("❌ No hay tabs abiertas")
                return False
            
            # Usar primer tab
            self.tab = tabs[0]
            self.log(f"✅ Conectado a tab: {self.tab.get('title', 'Unknown')}")
            
            # Iniciar tab
            self.tab.start()
            
            # Habilitar Network domain
            self.tab.Network.enable()
            self.log("✅ Network domain habilitado")
            
            return True
            
        except Exception as e:
            self.log(f"❌ Error conectando: {e}")
            return False
    
    def on_request(self, **kwargs):
        """Callback cuando se envía un request"""
        try:
            request = kwargs.get('request', {})
            url = request.get('url', '')
            
            # Filtrar solo requests relevantes
            if any(keyword in url.lower() for keyword in [
                'chat', 'conversation', 'message', 'api', 'gemini', 'google'
            ]):
                self.log(f"\n📤 REQUEST: {request.get('method', 'GET')} {url}")
                
                # Capturar POST data
                post_data = request.get('postData')
                if post_data:
                    self.log(f"📝 POST Data: {post_data[:500]}")
                    
                    # Intentar parsear JSON
                    try:
                        json_data = json.loads(post_data)
                        self.log(f"📊 JSON: {json.dumps(json_data, indent=2)[:500]}")
                        
                        # Guardar mensaje
                        self.messages.append({
                            'type': 'request',
                            'timestamp': datetime.now().isoformat(),
                            'url': url,
                            'method': request.get('method'),
                            'data': json_data
                        })
                        
                    except:
                        pass
                
        except Exception as e:
            self.log(f"⚠️ Error en on_request: {e}")
    
    def on_response(self, **kwargs):
        """Callback cuando se recibe un response"""
        try:
            request_id = kwargs.get('requestId')
            response = kwargs.get('response', {})
            url = response.get('url', '')
            
            # Filtrar solo responses relevantes
            if any(keyword in url.lower() for keyword in [
                'chat', 'conversation', 'message', 'api', 'gemini', 'google'
            ]):
                self.log(f"\n📥 RESPONSE: {response.get('status', 0)} {url}")
                
                # Obtener body del response
                try:
                    result = self.tab.Network.getResponseBody(requestId=request_id)
                    body = result.get('body', '')
                    
                    if body:
                        self.log(f"📄 Body: {body[:500]}")
                        
                        # Intentar parsear JSON
                        try:
                            json_data = json.loads(body)
                            self.log(f"📊 JSON Response: {json.dumps(json_data, indent=2)[:500]}")
                            
                            # Guardar mensaje
                            self.messages.append({
                                'type': 'response',
                                'timestamp': datetime.now().isoformat(),
                                'url': url,
                                'status': response.get('status'),
                                'data': json_data
                            })
                            
                            # Exportar inmediatamente
                            self.export_messages()
                            
                        except:
                            pass
                except Exception as e:
                    self.log(f"⚠️ No se pudo obtener body: {e}")
                
        except Exception as e:
            self.log(f"⚠️ Error en on_response: {e}")
    
    def export_messages(self):
        """Exportar mensajes capturados a JSON"""
        try:
            with open(MESSAGES_FILE, 'w', encoding='utf-8') as f:
                json.dump({
                    'total_messages': len(self.messages),
                    'last_updated': datetime.now().isoformat(),
                    'messages': self.messages
                }, f, indent=2, ensure_ascii=False)
            
        except Exception as e:
            self.log(f"⚠️ Error exportando: {e}")
    
    def start_capture(self):
        """Iniciar captura"""
        if not self.connect():
            return False
        
        self.log("\n🎯 Iniciando captura...")
        self.log("="*80)
        
        # Registrar callbacks
        self.tab.Network.requestWillBeSent = self.on_request
        self.tab.Network.responseReceived = self.on_response
        
        try:
            # Loop infinito
            self.log("✅ Captura activa - Presiona Ctrl+C para detener")
            while True:
                self.tab.wait(1)
                
        except KeyboardInterrupt:
            self.log("\n⏹️ Captura detenida por usuario")
        except Exception as e:
            self.log(f"\n❌ Error: {e}")
        finally:
            self.export_messages()
            self.log(f"\n💾 Total mensajes capturados: {len(self.messages)}")
            self.log(f"📁 Archivo: {MESSAGES_FILE}")

def find_antigravity_port():
    """Buscar puerto CDP de Antigravity"""
    import subprocess
    
    print("🔍 Buscando proceso de Antigravity...")
    
    # Buscar procesos
    result = subprocess.run(
        ["powershell", "-Command", 
         "Get-Process | Where-Object {$_.ProcessName -like '*Antigravity*'} | Select-Object Id, ProcessName"],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0 and result.stdout:
        print(f"✅ Procesos encontrados:\n{result.stdout}")
    
    # Intentar puertos comunes
    for port in [9222, 9223, 9224, 9225]:
        try:
            browser = Browser(url=f"http://127.0.0.1:{port}")
            tabs = browser.list_tab()
            if tabs:
                print(f"✅ CDP encontrado en puerto {port}")
                return port
        except:
            pass
    
    print("⚠️ No se encontró CDP en puertos comunes")
    return None

if __name__ == "__main__":
    print("="*80)
    print("  🚀 Antigravity Chat Capture - Chrome DevTools Protocol")
    print("="*80)
    print()
    
    # Buscar puerto
    port = find_antigravity_port()
    
    if not port:
        print("\n❌ Antigravity no está corriendo con remote debugging habilitado")
        print("\n📋 Para habilitar:")
        print("1. Cerrar Antigravity")
        print("2. Iniciar con: Antigravity.exe --remote-debugging-port=9222")
        print("3. Ejecutar este script nuevamente")
    else:
        # Iniciar captura
        capturer = AntigravityCDPCapture(port=port)
        capturer.start_capture()

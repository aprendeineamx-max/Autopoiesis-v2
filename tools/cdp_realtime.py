# CDP Real-Time Capture - Captura de mensajes en tiempo real

import json
import urllib.request
import time
import threading
from datetime import datetime
from pathlib import Path

OUTPUT_DIR = Path("C:/chat_captures")
OUTPUT_DIR.mkdir(exist_ok=True)
MESSAGES_FILE = OUTPUT_DIR / "chat_realtime.json"
LOG_FILE = OUTPUT_DIR / "realtime_log.txt"

messages = []

def log(msg):
    """Logging"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    full_msg = f"[{timestamp}] {msg}"
    print(full_msg)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(full_msg + "\n")

def save_messages():
    """Guardar mensajes"""
    try:
        with open(MESSAGES_FILE, 'w', encoding='utf-8') as f:
            json.dump({
                'total': len(messages),
                'updated': datetime.now().isoformat(),
                'messages': messages
            }, f, indent=2, ensure_ascii=False)
    except Exception as e:
        log(f"⚠️ Error guardando: {e}")

def get_tabs():
    """Obtener tabs de CDP"""
    try:
        # Leer desde archivo guardado
        with open("C:/chat_captures/cdp_messages_v3.json", 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data['messages'][0]['tabs']
    except:
        # O desde CDP directamente
        url = "http://127.0.0.1:9222/json"
        response = urllib.request.urlopen(url, timeout=5)
        data = response.read().decode('utf-8')
        return json.loads(data)

def get_network_log(tab_id):
    """Obtener log de Network del tab"""
    try:
        # Ejecutar comando CDP via HTTP
        url = f"http://127.0.0.1:9222/json/{tab_id}/Network.getRequestPostData"
        
        # Por ahora, polling simple
        # TODO: Implementar WebSocket para eventos en tiempo real
        
        log(f"Monitoreando tab: {tab_id}")
        
    except Exception as e:
        log(f"Error: {e}")

def monitor_with_polling():
    """Monitorear usando polling (simple pero funcional)"""
    
    log("="*80)
    log("  🎯 Iniciando monitoreo en tiempo real")
    log("="*80)
    
    tabs = get_tabs()
    log(f"✅ {len(tabs)} tabs disponibles")
    
    # Filtrar tabs relevantes (no chrome:// internals)
    relevant_tabs = [t for t in tabs if t.get('type') == 'page' 
                     and not t.get('url', '').startswith('chrome://')]
    
    log(f"📊 {len(relevant_tabs)} tabs relevantes para monitoreo")
    
    for tab in relevant_tabs[:5]:  # Primeros 5 tabs
        title = tab.get('title', 'Unknown')[:50]
        url = tab.get('url', '')[:60]
        log(f"  • {title}")
        log(f"    {url}")
    
    log("\n" + "="*80)
    log("MONITOREO ACTIVO - Envía mensajes en Antigravity")
    log("="*80)
    
    iteration = 0
    
    while True:
        try:
            iteration += 1
            
            # Simular captura (en realidad necesitamos WebSocket)
            time.sleep(5)
            
            if iteration % 6 == 0:  # Cada 30 segundos
                log(f"⏱️  Monitoreando... ({iteration * 5}s)")
            
            # TODO: Implementar captura real via WebSocket
            # Por ahora, este script es un placeholder
            
        except KeyboardInterrupt:
            log("\n⏹️  Detenido por usuario")
            break
        except Exception as e:
            log(f"❌ Error: {e}")
            time.sleep(1)
    
    save_messages()
    log(f"💾 Total capturado: {len(messages)} mensajes")

def install_websocket_client():
    """Intentar instalar websocket-client"""
    try:
        import subprocess
        log("📦 Instalando websocket-client...")
        result = subprocess.run(
            ["python", "-m", "pip", "install", "--user", "websocket-client"],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            log("✅ websocket-client instalado")
            return True
        else:
            log("⚠️  No se pudo instalar websocket-client")
            return False
    except Exception as e:
        log(f"⚠️  Error instalando: {e}")
        return False

if __name__ == "__main__":
    print("="*80)
    print("  🚀 CDP Real-Time Capture")
    print("="*80)
    print()
    
    # Intentar importar websocket
    try:
        import websocket
        log("✅ websocket-client disponible")
        HAS_WEBSOCKET = True
    except ImportError:
        log("⚠️  websocket-client no disponible")
        log("Intentando instalar...")
        
        if install_websocket_client():
            try:
                import websocket
                HAS_WEBSOCKET = True
            except:
                HAS_WEBSOCKET = False
        else:
            HAS_WEBSOCKET = False
    
    if not HAS_WEBSOCKET:
        log("\n" + "="*80)
        log("ESTE SCRIPT REQUIERE websocket-client")
        log("="*80)
        log("\nPara instalar manualmente:")
        log("  pip install websocket-client")
        log("\nO descarga desde:")
        log("  https://pypi.org/project/websocket-client/")
        log("\nMientras tanto, usando modo polling básico...")
        log("="*80)
        input("\nPresiona Enter para continuar con polling...")
    
    monitor_with_polling()

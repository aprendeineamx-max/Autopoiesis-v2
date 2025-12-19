# CDP Monitor Simple - Sin dependencias externas

"""
Monitorea tráfico de Antigravity usando polling del CDP
No requiere websocket-client - solo librerías built-in
"""

import json
import urllib.request
import time
from datetime import datetime
from pathlib import Path

OUTPUT_DIR = Path("C:/chat_captures")
OUTPUT_DIR.mkdir(exist_ok=True)
MESSAGES_FILE = OUTPUT_DIR / "cdp_monitor.json"
LOG_FILE = OUTPUT_DIR / "monitor_log.txt"

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

def call_cdp_command(tab_id, method, params=None):
    """Ejecutar comando CDP via HTTP"""
    try:
        url = f"http://127.0.0.1:9222/json"
        
        # Construir comando
        command = {
            "id": int(time.time() * 1000),
            "method": method,
            "params": params or {}
        }
        
        # Enviar (esto es limitado, idealmente necesitamos WebSocket)
        # Por ahora, solo podemos llamar a la API HTTP de Chrome DevTools
        
        return None
        
    except Exception as e:
        return None

def monitor_tabs():
    """Monitorear tabs activamente"""
    
    log("="*80)
    log("  📡 CDP Monitor - Modo Polling")
    log("="*80)
    
    try:
        # Leer tabs
        with open("C:/chat_captures/cdp_messages_v3.json", 'r', encoding='utf-8') as f:
            data = json.load(f)
            tabs = data['messages'][0]['tabs']
        
        log(f"✅ {len(tabs)} tabs disponibles")
        
        # Seleccionar tab relevante
        relevant = [t for t in tabs if t.get('type') == 'page' 
                   and not t.get('url', '').startswith('chrome://')]
        
        if not relevant:
            log("⚠️  No hay tabs relevantes")
            return
        
        selected = relevant[0]
        log(f"\n📱 Monitoreando: {selected.get('title', 'Unknown')}")
        log(f"   URL: {selected.get('url', '')[:60]}")
        
        # Info sobre limitación
        log("\n" + "="*80)
        log("⚠️  LIMITACIÓN: Sin websocket-client solo podemos polling")
        log("="*80)
        log("\nPara captura en tiempo real completa, necesitas:")
        log("  1. Descargar: https://pypi.org/project/websocket-client/")
        log("  2. Extraer archivos .py a esta carpeta")
        log("  3. Ejecutar: python cdp_websocket_capture.py")
        log("\n" + "="*80)
        
        log("\n🔄 Iniciando polling cada 10 segundos...")
        log("(Ctrl+C para detener)")
        log("")
        
        iteration = 0
        
        while True:
            iteration += 1
            
            # Obtener tabs actualizado
            try:
                url = "http://127.0.0.1:9222/json"
                response = urllib.request.urlopen(url, timeout=3)
                current_tabs = json.loads(response.read().decode('utf-8'))
                
                # Buscar cambios
                new_count = len(current_tabs)
                
                if iteration % 6 == 0:  # Cada minuto
                    log(f"⏱️  Monitoreando... ({iteration * 10}s) - {new_count} tabs")
                
            except Exception as e:
                if iteration % 6 == 0:
                    log(f"⚠️  Error polling: {e}")
            
            time.sleep(10)
            
    except KeyboardInterrupt:
        log("\n⏹️  Detenido por usuario")
    except Exception as e:
        log(f"❌ Error: {e}")
    finally:
        save_messages()
        log(f"\n💾 Total capturado: {len(messages)} mensajes")

def show_websocket_urls():
    """Mostrar WebSocket URLs disponibles"""
    
    print("="*80)
    print("  📋 WebSocket URLs Disponibles")
    print("="*80)
    print()
    
    try:
        with open("C:/chat_captures/cdp_messages_v3.json", 'r', encoding='utf-8') as f:
            data = json.load(f)
            tabs = data['messages'][0]['tabs']
        
        print(f"Total tabs: {len(tabs)}\n")
        
        for i, tab in enumerate(tabs[:10], 1):
            title = tab.get('title', 'Unknown')[:40]
            ws_url = tab.get('webSocketDebuggerUrl', '')
            
            print(f"{i}. {title}")
            print(f"   {ws_url}")
            print()
        
        if len(tabs) > 10:
            print(f"... y {len(tabs) - 10} tabs más")
        
        print("="*80)
        print("\n✅ Estas URLs se pueden usar con websocket-client")
        print("📦 Descarga: https://pypi.org/project/websocket-client/")
        print()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--urls":
        show_websocket_urls()
    else:
        print("\n🔧 CDP Monitor - Versión Limitada (sin websocket-client)")
        print()
        print("Opciones:")
        print("  1. Ejecutar monitor con polling (limitado)")
        print("  2. Ver WebSocket URLs para uso manual")
        print("  3. Salir")
        print()
        
        choice = input("Selecciona (1-3): ").strip()
        
        if choice == "1":
            monitor_tabs()
        elif choice == "2":
            show_websocket_urls()
        else:
            print("Saliendo...")

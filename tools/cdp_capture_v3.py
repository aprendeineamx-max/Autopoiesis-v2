# CDP Capture V3 - Sin dependencias externas (solo built-in)

import json
import urllib.request
import ssl
from datetime import datetime
from pathlib import Path

OUTPUT_DIR = Path("C:/chat_captures")
OUTPUT_DIR.mkdir(exist_ok=True)
MESSAGES_FILE = OUTPUT_DIR / "cdp_messages_v3.json"
LOG_FILE = OUTPUT_DIR / "cdp_log.txt"

messages = []

def log(msg):
    """Logging"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    full_msg = f"[{timestamp}] {msg}"
    print(full_msg)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(full_msg + "\n")

def get_tabs(port=9222):
    """Obtener tabs via HTTP"""
    try:
        url = f"http://127.0.0.1:{port}/json"
        response = urllib.request.urlopen(url, timeout=5)
        data = response.read().decode('utf-8')
        tabs = json.loads(data)
        return tabs
    except Exception as e:
        log(f"❌ Error obteniendo tabs: {e}")
        return []

def save_messages():
    """Guardar mensajes"""
    try:
        with open(MESSAGES_FILE, 'w', encoding='utf-8') as f:
            json.dump({
                'total': len(messages),
                'updated': datetime.now().isoformat(),
                'messages': messages
            }, f, indent=2, ensure_ascii=False)
        log(f"💾 Guardados {len(messages)} mensajes")
    except Exception as e:
        log(f"⚠️ Error guardando: {e}")

def main():
    print("="*80)
    print("  🚀 CDP Capture V3 - Sin Dependencias")
    print("="*80)
    print()
    
    log("Buscando Antigravity...")
    
    # Buscar tabs
    tabs = get_tabs(9222)
    
    if not tabs:
        log("❌ No se pudo conectar a CDP")
        log("Asegúrate de que Antigravity esté corriendo con --remote-debugging-port=9222")
        input("\nPresiona Enter para salir...")
        return
    
    log(f"✅ Encontrados {len(tabs)} tabs")
    
    # Mostrar tabs
    for i, tab in enumerate(tabs):
        tab_type = tab.get('type', 'unknown')
        tab_title = tab.get('title', 'Untitled')
        tab_url = tab.get('url', '')[:50]
        log(f"  [{i}] {tab_type}: {tab_title}")
        log(f"      URL: {tab_url}")
        
        # Verificar si hay WebSocket URL
        ws_url = tab.get('webSocketDebuggerUrl')
        if ws_url:
            log(f"      ✅ WebSocket disponible")
    
    log("\n" + "="*80)
    log("NOTA: Para captura activa se requiere websocket-client")
    log("Instalación: pip install websocket-client")
    log("="*80)
    
    # Guardar info de tabs
    messages.append({
        'type': 'tabs_info',
        'timestamp': datetime.now().isoformat(),
        'total_tabs': len(tabs),
        'tabs': tabs
    })
    save_messages()
    
    log(f"\n📁 Información guardada en: {MESSAGES_FILE}")
    log("\nPor ahora, este script muestra los tabs disponibles.")
    log("Para captura en tiempo real, necesitas websocket-client.")
    
    input("\nPresiona Enter para salir...")

if __name__ == "__main__":
    main()

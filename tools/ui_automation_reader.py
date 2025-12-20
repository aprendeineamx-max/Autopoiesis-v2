"""
UI Automation Reader - Método #14
Lee contenido del chat directamente desde la UI usando Accessibility APIs
NO requiere clipboard ni intervención manual
"""

import win32gui
import win32con
import win32api
import time
import json
from datetime import datetime
from pathlib import Path
import ctypes

# Configuración
OUTPUT_FILE = Path("C:/chat_captures/ui_automation_messages.json")
LOG_FILE = Path("C:/chat_captures/ui_automation_log.txt")
INTERVAL = 5  # segundos

# Windows API
user32 = ctypes.windll.user32

messages_db = []

def log(msg):
    timestamp = datetime.now().isoformat()
    full_msg = f"[{timestamp}] {msg}"
    print(full_msg)
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(full_msg + '\n')
    except:
        pass

def find_antigravity_window():
    """Encuentra ventana de Antigravity"""
    windows = []
    
    def callback(hwnd, extra):
        if win32gui.IsWindowVisible(hwnd):
            title = win32gui.GetWindowText(hwnd)
            if 'Antigravity' in title or 'antigravity' in title.lower():
                windows.append({
                    'hwnd': hwnd,
                    'title': title
                })
        return True
    
    win32gui.EnumWindows(callback, None)
    return windows

def get_window_text(hwnd):
    """Obtiene TODO el texto de una ventana usando SendMessage"""
    try:
        # WM_GETTEXT
        length = win32gui.SendMessage(hwnd, win32con.WM_GETTEXTLENGTH, 0, 0)
        if length > 0:
            buffer = ctypes.create_unicode_buffer(length + 1)
            win32gui.SendMessage(hwnd, win32con.WM_GETTEXT, length + 1, buffer)
            return buffer.value
    except:
        pass
    return None

def enum_child_windows(parent_hwnd):
    """Enumera ventanas hijas y extrae texto"""
    texts = []
    
    def callback(hwnd, extra):
        try:
            # Obtener clase de ventana
            class_name = win32gui.GetClassName(hwnd)
            
            # Obtener texto
            text = get_window_text(hwnd)
            
            if text and len(text) > 10:  # Filtrar textos muy cortos
                texts.append({
                    'hwnd': hwnd,
                    'class': class_name,
                    'text': text[:500]  # Primeros 500 chars
                })
        except:
            pass
        return True
    
    try:
        win32gui.EnumChildWindows(parent_hwnd, callback, None)
    except:
        pass
    
    return texts

def scrape_ui_content():
    """Scrape contenido de la UI de Antigravity"""
    try:
        # Buscar ventana
        windows = find_antigravity_window()
        
        if not windows:
            log("  ⚠️ Ventana de Antigravity no encontrada")
            return None
        
        # Usar primera ventana
        target = windows[0]
        log(f"  🎯 Ventana: {target['title']}")
        
        # Obtener texto principal
        main_text = get_window_text(target['hwnd'])
        
        # Obtener texto de ventanas hijas
        child_texts = enum_child_windows(target['hwnd'])
        
        return {
            'timestamp': datetime.now().isoformat(),
            'window_title': target['title'],
            'main_text': main_text,
            'child_windows': child_texts,
            'total_children': len(child_texts)
        }
        
    except Exception as e:
        log(f"  ❌ Error: {e}")
        return None

def extract_messages(ui_data):
    """Extrae mensajes del contenido de UI"""
    if not ui_data:
        return []
    
    messages = []
    
    # Buscar en textos de ventanas hijas
    for child in ui_data.get('child_windows', []):
        text = child.get('text', '')
        
        # Detectar si parece un mensaje
        if len(text) > 20 and any(keyword in text.lower() for keyword in ['user', 'agent', 'you', 'assistant']):
            messages.append({
                'timestamp': ui_data['timestamp'],
                'source': 'ui_child_window',
                'class': child.get('class'),
                'text': text
            })
    
    return messages

def save_data():
    """Guarda mensajes capturados"""
    try:
        data = {
            'timestamp': datetime.now().isoformat(),
            'total_messages': len(messages_db),
            'messages': messages_db[-100:]  # Últimos 100
        }
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        log(f"💾 Guardados {len(messages_db)} mensajes")
    except Exception as e:
        log(f"Error guardando: {e}")

def main():
    global messages_db
    
    log("="*80)
    log("🤖 UI Automation Reader - INICIADO")
    log("="*80)
    log(f"📁 Output: {OUTPUT_FILE}")
    log(f"⏱️  Intervalo: {INTERVAL}s")
    log("")
    
    # Crear directorio
    OUTPUT_FILE.parent.mkdir(exist_ok=True)
    
    iteration = 0
    
    while True:
        try:
            iteration += 1
            log(f"\n📡 Captura #{iteration}")
            
            # Scrape UI
            ui_data = scrape_ui_content()
            
            if ui_data:
                # Extraer mensajes
                new_messages = extract_messages(ui_data)
                
                if new_messages:
                    log(f"  ✨ {len(new_messages)} mensajes extraídos")
                    messages_db.extend(new_messages)
                    save_data()
                else:
                    log(f"  ℹ️ {ui_data['total_children']} ventanas hijas, sin mensajes")
            
            # Esperar
            log(f"⏳ Esperando {INTERVAL}s...")
            time.sleep(INTERVAL)
            
        except KeyboardInterrupt:
            log("\n⏹️ Detenido por usuario")
            break
        except Exception as e:
            log(f"❌ Error: {e}")
            time.sleep(5)
    
    log("\n✅ UI Automation finalizado")
    save_data()

if __name__ == "__main__":
    main()

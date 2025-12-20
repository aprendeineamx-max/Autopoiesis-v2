"""
Auto Chat Scraper - 100% AUTOMÁTICO
Captura mensajes del chat SIN intervención manual
Funciona en background, NO requiere reload ni Ctrl+A/C
"""

import pyautogui
import time
import json
from datetime import datetime
from pathlib import Path
import re
import hashlib

# Configuración
OUTPUT_DIR = Path("C:/chat_captures")
OUTPUT_FILE = OUTPUT_DIR / "auto_scraped_messages.json"
INTERVAL_SECONDS = 15  # Captura cada 15 segundos
LOG_FILE = OUTPUT_DIR / "auto_scraper_log.txt"

# Estado
messages_db = []
last_hash = ""

def log(msg):
    timestamp = datetime.now().isoformat()
    full_msg = f"[{timestamp}] {msg}"
    print(full_msg)
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(full_msg + '\n')
    except:
        pass

def capture_chat_content():
    """Captura contenido del chat usando clipboard automático"""
    try:
        # Encuentra ventana de Antigravity
        windows = pyautogui.getWindowsWithTitle('Antigravity')
        if not windows:
            return None
        
        # Activa ventana
        window = windows[0]
        window.activate()
        time.sleep(0.2)
        
        # Selecciona todo el chat
        pyautogui.hotkey('ctrl', 'a')
        time.sleep(0.1)
        
        # Copia (sin esperar usuario)
        pyautogui.hotkey('ctrl', 'c')
        time.sleep(0.3)
        
        # Lee clipboard
        import win32clipboard
        win32clipboard.OpenClipboard()
        try:
            content = win32clipboard.GetClipboardData()
        finally:
            win32clipboard.CloseClipboard()
        
        return content
        
    except Exception as e:
        log(f"Error capturando: {e}")
        return None

def parse_messages(content):
    """Extrae mensajes individuales del contenido"""
    if not content:
        return []
    
    messages = []
    
    # Patrón para detectar mensajes
    # Busca líneas que parecen mensajes de chat
    lines = content.split('\n')
    
    current_msg = {"role": "unknown", "text": ""}
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Detectar rol
        if re.match(r'^(USER|You|👤)', line, re.I):
            if current_msg["text"]:
                messages.append(current_msg)
            current_msg = {"role": "user", "text": line}
        elif re.match(r'^(AGENT|AI|Assistant|🤖|Antigravity)', line, re.I):
            if current_msg["text"]:
                messages.append(current_msg)
            current_msg = {"role": "assistant", "text": line}
        else:
            # Continúa mensaje actual
            if current_msg["text"]:
                current_msg["text"] += "\n" + line
            else:
                current_msg["text"] = line
    
    if current_msg["text"]:
        messages.append(current_msg)
    
    return messages

def save_messages():
    """Guarda mensajes a archivo JSON"""
    try:
        data = {
            "timestamp": datetime.now().isoformat(),
            "total": len(messages_db),
            "messages": messages_db
        }
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        log(f"💾 Guardados {len(messages_db)} mensajes")
        
    except Exception as e:
        log(f"Error guardando: {e}")

def main():
    global last_hash, messages_db
    
    log("="*80)
    log("🚀 Auto Chat Scraper INICIADO")
    log("="*80)
    log(f"📁 Output: {OUTPUT_FILE}")
    log(f"⏱️  Intervalo: {INTERVAL_SECONDS}s")
    log(f"🎯 Modo: AUTOMÁTICO (sin intervención)")
    log("")
    
    # Crear directorio
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    iteration = 0
    
    while True:
        try:
            iteration += 1
            log(f"\n📡 Captura #{iteration}")
            
            # Capturar contenido
            content = capture_chat_content()
            
            if content:
                # Calcular hash
                content_hash = hashlib.md5(content.encode()).hexdigest()
                
                if content_hash != last_hash:
                    log("✨ Contenido nuevo detectado")
                    
                    # Parsear mensajes
                    new_messages = parse_messages(content)
                    
                    if new_messages:
                        # Agregar solo mensajes nuevos
                        for msg in new_messages:
                            msg_hash = hashlib.md5(
                                json.dumps(msg).encode()
                            ).hexdigest()
                            
                            # Verificar si ya existe
                            exists = any(
                                hashlib.md5(json.dumps(m).encode()).hexdigest() == msg_hash
                                for m in messages_db
                            )
                            
                            if not exists:
                                messages_db.append(msg)
                                log(f"  ➕ Nuevo mensaje: {msg['role']}")
                        
                        # Guardar
                        save_messages()
                        last_hash = content_hash
                    else:
                        log("  ⚠️ No se pudieron parsear mensajes")
                else:
                    log("  ℹ️ Sin cambios desde última captura")
            else:
                log("  ❌ No se pudo capturar contenido")
            
            # Esperar
            log(f"⏳ Esperando {INTERVAL_SECONDS}s...")
            time.sleep(INTERVAL_SECONDS)
            
        except KeyboardInterrupt:
            log("\n⏹️ Detenido por usuario")
            break
        except Exception as e:
            log(f"❌ Error: {e}")
            time.sleep(5)
    
    log("\n✅ Auto Scraper finalizado")

if __name__ == "__main__":
    main()

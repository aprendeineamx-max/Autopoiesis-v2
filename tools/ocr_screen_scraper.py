"""
OCR Screen Scraper - Método #15
Captura screenshots y usa OCR para extraer texto
Método más agresivo que lee directamente de pantalla
"""

try:
    from PIL import ImageGrab, Image
    import pytesseract
    PIL_AVAILABLE = True
except:
    PIL_AVAILABLE = False

import time
import json
from datetime import datetime
from pathlib import Path
import hashlib

# Configuración
OUTPUT_FILE = Path("C:/chat_captures/ocr_messages.json")
SCREENSHOTS_DIR = Path("C:/chat_captures/screenshots")
LOG_FILE = Path("C:/chat_captures/ocr_log.txt")
INTERVAL = 10  # segundos

messages_db = []
last_ocr_hash = ""

def log(msg):
    timestamp = datetime.now().isoformat()
    full_msg = f"[{timestamp}] {msg}"
    print(full_msg)
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(full_msg + '\n')
    except:
        pass

def capture_screen():
    """Captura screenshot de pantalla completa"""
    if not PIL_AVAILABLE:
        return None
    
    try:
        screenshot = ImageGrab.grab()
        return screenshot
    except Exception as e:
        log(f"Error capturando: {e}")
        return None

def extract_text_ocr(image):
    """Extrae texto usando OCR"""
    if not PIL_AVAILABLE:
        return None
    
    try:
        # Si tesseract no está configurado, intentar rutas comunes
        try:
            text = pytesseract.image_to_string(image, lang='spa+eng')
        except pytesseract.TesseractNotFoundError:
            # Intentar configurar ruta de tesseract
            pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
            text = pytesseract.image_to_string(image, lang='spa+eng')
        
        return text
    except Exception as e:
        log(f"Error OCR: {e}")
        return None

def parse_chat_from_text(text):
    """Intenta parsear mensajes de chat del texto OCR"""
    if not text:
        return []
    
    messages = []
    lines = text.split('\n')
    
    current_msg = {'role': 'unknown', 'text': ''}
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Detectar indicadores de rol
        if any(kw in line.lower() for kw in ['user:', 'you:', 'pregunta:', 'usuario:']):
            if current_msg['text']:
                messages.append(current_msg)
            current_msg = {'role': 'user', 'text': line}
        elif any(kw in line.lower() for kw in ['agent:', 'assistant:', 'antigravity:', 'respuesta:']):
            if current_msg['text']:
                messages.append(current_msg)
            current_msg = {'role': 'assistant', 'text': line}
        else:
            # Continuar mensaje actual
            if current_msg['text']:
                current_msg['text'] += '\n' + line
            elif len(line) > 10:  # Iniciar nuevo mensaje si es suficientemente largo
                current_msg['text'] = line
    
    if current_msg['text']:
        messages.append(current_msg)
    
    return messages

def save_data():
    """Guarda mensajes"""
    try:
        data = {
            'timestamp': datetime.now().isoformat(),
            'total_messages': len(messages_db),
            'messages': messages_db[-50:]  # Últimos 50
        }
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        log(f"💾 Guardados {len(messages_db)} mensajes")
    except Exception as e:
        log(f"Error guardando: {e}")

def main():
    global last_ocr_hash, messages_db
    
    log("="*80)
    log("📸 OCR Screen Scraper - INICIADO")
    log("="*80)
    log(f"📁 Output: {OUTPUT_FILE}")
    log(f"📷 Screenshots: {SCREENSHOTS_DIR}")
    log(f"⏱️  Intervalo: {INTERVAL}s")
    log("")
    
    if not PIL_AVAILABLE:
        log("❌ PIL/pillow no disponible")
        log("   Instalar: pip install pillow pytesseract")
        return
    
    # Crear directorios
    OUTPUT_FILE.parent.mkdir(exist_ok=True)
    SCREENSHOTS_DIR.mkdir(exist_ok=True)
    
    iteration = 0
    
    while True:
        try:
            iteration += 1
            log(f"\n📸 Captura #{iteration}")
            
            # Capturar screenshot
            screenshot = capture_screen()
            
            if screenshot:
                # Guardar screenshot
                screenshot_path = SCREENSHOTS_DIR / f"screen_{datetime.now().strftime('%H%M%S')}.png"
                screenshot.save(screenshot_path)
                log(f"  💾 Screenshot guardado: {screenshot_path.name}")
                
                # OCR
                text = extract_text_ocr(screenshot)
                
                if text:
                    # Calcular hash
                    text_hash = hashlib.md5(text.encode()).hexdigest()
                    
                    if text_hash != last_ocr_hash:
                        log("  ✨ Contenido nuevo detectado via OCR")
                        
                        # Parsear mensajes
                        new_messages = parse_chat_from_text(text)
                        
                        if new_messages:
                            log(f"  📝 {len(new_messages)} mensajes parseados")
                            messages_db.extend(new_messages)
                            save_data()
                        
                        last_ocr_hash = text_hash
                    else:
                        log("  ℹ️ Sin cambios desde última captura")
                else:
                    log("  ⚠️ OCR no pudo extraer texto")
            
            # Esperar
            log(f"⏳ Esperando {INTERVAL}s...")
            time.sleep(INTERVAL)
            
        except KeyboardInterrupt:
            log("\n⏹️ Detenido por usuario")
            break
        except Exception as e:
            log(f"❌ Error: {e}")
            time.sleep(5)
    
    log("\n✅ OCR Scraper finalizado")
    save_data()

if __name__ == "__main__":
    main()

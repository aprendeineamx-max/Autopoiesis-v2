"""
mitmproxy Addon para Capturar Mensajes de Antigravity Chat
===========================================================

Este addon captura automáticamente todos los mensajes WebSocket
del chat de Antigravity y los exporta en formato legible.

Características:
- Captura requests y responses
- Detecta mensajes del chat automáticamente
- Export en formato legible para humanos
- Actualización continua del archivo
"""

import json
import re
from datetime import datetime
from pathlib import Path
from mitmproxy import http, ctx
from mitmproxy import flow
from mitmproxy import websocket

# Configuración
CAPTURE_DIR = Path("C:/chat_captures")
OUTPUT_FILE = CAPTURE_DIR / "chat_messages_live.txt"
JSON_FILE = CAPTURE_DIR / "chat_messages_raw.json"

messages_captured = []
message_count = 0

def load(loader):
    """Inicializar addon"""
    CAPTURE_DIR.mkdir(parents=True, exist_ok=True)
    ctx.log.info("🚀 Antigravity Chat Capture Addon Loaded")
    ctx.log.info(f"📁 Output: {OUTPUT_FILE}")
    
    # Crear archivos iniciales
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("=" * 80 + "\n")
        f.write("  ANTIGRAVITY CHAT MESSAGES - LIVE CAPTURE\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
    
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump({"messages": []}, f, indent=2)

def is_chat_related(url, content):
    """Detectar si es comunicación del chat"""
    if not content:
        return False
    
    # URLs típicas de chat/IA
    chat_keywords = ['chat', 'message', 'completion', 'stream', 'conversation', 'prompt']
    if any(kw in url.lower() for kw in chat_keywords):
        return True
    
    # Contenido típico de chat
    content_str = str(content).lower()
    content_keywords = ['message', 'content', 'text', 'response', 'prompt', 'completion']
    if any(kw in content_str for kw in content_keywords):
        return True
    
    return False

def extract_text(data):
    """Extraer texto legible del payload"""
    try:
        if isinstance(data, bytes):
            data = data.decode('utf-8', errors='ignore')
        
        if isinstance(data, str):
            try:
                parsed = json.loads(data)
                return extract_from_json(parsed)
            except:
                return data
        
        return str(data)
    except:
        return ""

def extract_from_json(obj):
    """Extraer campos importantes del JSON"""
    if not isinstance(obj, dict):
        return str(obj)
    
    # Campos comunes en mensajes de chat
    text_fields = ['message', 'text', 'content', 'prompt', 'response', 'completion', 'body']
    
    for field in text_fields:
        if field in obj:
            value = obj[field]
            if isinstance(value, str):
                return value
            elif isinstance(value, dict):
                return extract_from_json(value)
            elif isinstance(value, list):
                return ' | '.join(str(item) for item in value)
    
    # Si no encontramos campos conocidos, devolver JSON compacto
    return json.dumps(obj, ensure_ascii=False)

def save_message(direction, url, content):
    """Guardar mensaje en formato legible"""
    global message_count, messages_captured
    
    message_count += 1
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Extraer texto legible
    text = extract_text(content)
    
    # Formato legible para humanos
    readable_message = f"""
{'='*80}
[{message_count}] {direction.upper()} - {timestamp}
{'='*80}
URL: {url}

CONTENIDO:
{text}

{'='*80}

"""
    
    # Append a archivo de texto
    with open(OUTPUT_FILE, 'a', encoding='utf-8') as f:
        f.write(readable_message)
    
    # Guardar en estructura JSON
    message_data = {
        "id": message_count,
        "timestamp": timestamp,
        "direction": direction,
        "url": url,
        "content": text,
        "raw": content[:1000] if isinstance(content, str) else str(content)[:1000]  # Primeros 1000 chars
    }
    
    messages_captured.append(message_data)
    
    # Actualizar JSON
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump({
            "total_messages": message_count,
            "last_updated": timestamp,
            "messages": messages_captured
        }, f, indent=2, ensure_ascii=False)
    
    ctx.log.info(f"💬 [{message_count}] Captured {direction}: {text[:100]}")

def request(flow: http.HTTPFlow):
    """Interceptar requests HTTP/HTTPS"""
    url = flow.request.pretty_url
    
    # Solo procesar si parece relacionado con chat
    if flow.request.content and is_chat_related(url, flow.request.content):
        save_message("request", url, flow.request.content)

def response(flow: http.HTTPFlow):
    """Interceptar responses HTTP/HTTPS"""
    url = flow.request.pretty_url
    
    # Solo procesar si parece relacionado con chat
    if flow.response and flow.response.content and is_chat_related(url, flow.response.content):
        save_message("response", url, flow.response.content)

def websocket_message(flow: http.HTTPFlow):
    """Interceptar mensajes WebSocket"""
    url = flow.request.pretty_url
    
    # Verificar si hay mensajes WebSocket
    if hasattr(flow, 'websocket') and flow.websocket:
        for message in flow.websocket.messages:
            content = message.content
            direction = "sent" if message.from_client else "received"
            
            if is_chat_related(url, content):
                save_message(f"websocket_{direction}", url, content)

# Registrar hooks
addons = [
    load,
    request,
    response,
    websocket_message
]

# LevelDB Chat Reader - Lectura DIRECTA de la base de datos

"""
LevelDB 032523.log fue actualizado hace minutos
Este script lo lee DIRECTO para encontrar mensajes del chat
"""

import os
from pathlib import Path
import json
from datetime import datetime

# Ruta al LevelDB
LEVELDB_PATH = Path("C:/Users/Administrator/AppData/Roaming/Antigravity/Local Storage/leveldb")
OUTPUT_FILE = Path("C:/chat_captures/leveldb_raw_dump.txt")
JSON_OUTPUT = Path("C:/chat_captures/leveldb_parsed.json")

messages_found = []

print("="*80)
print("  🔍 LevelDB Chat Reader")
print("="*80)
print()

# Verificar que existe
if not LEVELDB_PATH.exists():
    print(f"❌ LevelDB no existe: {LEVELDB_PATH}")
    exit(1)

# Listar archivos
files = list(LEVELDB_PATH.glob("*"))
print(f"📁 Archivos en LevelDB: {len(files)}")
for f in files:
    print(f"   - {f.name} ({f.stat().st_size:,} bytes)")

print()

# Leer 032523.log directamente
log_file = LEVELDB_PATH / "032523.log"

if log_file.exists():
    print(f"📄 Leyendo: {log_file.name}")
    print(f"   Tamaño: {log_file.stat().st_size:,} bytes")
    print()
    
    try:
        # Leer como binario
        with open(log_file, 'rb') as f:
            content = f.read()
        
        # Intentar decodificar partes UTF-8
        text = content.decode('utf-8', errors='ignore')
        
        # Guardar dump completo
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(text)
        
        print(f"✅ Dump guardado: {OUTPUT_FILE}")
        print(f"   Tamaño: {len(text):,} caracteres")
        print()
        
        # Buscar patrones de mensajes
        keywords = [
            'message', 'chat', 'conversation',
            'prompt', 'response', 'content',
            'user', 'assistant', 'text'
        ]
        
        print("🔎 Buscando keywords de chat...")
        
        for keyword in keywords:
            count = text.lower().count(keyword)
            if count > 0:
                print(f"   '{keyword}': {count} ocurrencias")
        
        # Buscar objetos JSON
        print("\n🔍 Buscando objetos JSON...")
        
        import re
        json_pattern = r'\{[^{}]{50,2000}\}'
        matches = re.findall(json_pattern, text)
        
        print(f"   Encontrados: {len(matches)} objetos potenciales")
        
        for i, match in enumerate(matches[:20], 1):  # Primeros 20
            try:
                data = json.loads(match)
                
                # Si tiene keywords de chat
                data_str = json.dumps(data).lower()
                if any(k in data_str for k in keywords):
                    print(f"\n✅ JSON #{i} con keywords de chat:")
                    print(f"   Keys: {list(data.keys())[:10]}")
                    
                    messages_found.append({
                        'index': i,
                        'data': data
                    })
            except:
                pass
        
        # Guardar mensajes encontrados
        if messages_found:
            with open(JSON_OUTPUT, 'w', encoding='utf-8') as f:
                json.dump({
                    'timestamp': datetime.now().isoformat(),
                    'total_found': len(messages_found),
                    'messages': messages_found
                }, f, indent=2, ensure_ascii=False)
            
            print(f"\n💾 Mensajes guardados: {JSON_OUTPUT}")
            print(f"   Total encontrados: {len(messages_found)}")
        else:
            print("\n⚠️  No se encontraron mensajes en formato JSON")
        
    except Exception as e:
        print(f"❌ Error leyendo: {e}")
else:
    print(f"❌ Archivo no existe: {log_file}")

print("\n" + "="*80)
print("✅ Análisis completo")
print("="*80)

input("\nPresiona Enter para salir...")

# Búsqueda Profunda de Mensajes de Chat

import os
import json
from pathlib import Path
from datetime import datetime, timedelta

BASE_DIR = Path("C:/Users/Administrator/AppData/Roaming/Antigravity")
OUTPUT_FILE = Path("C:/chat_captures/deep_search_results.json")

results = {
    'search_time': datetime.now().isoformat(),
    'files_with_chat_content': [],
    'recent_modified_files': [],
    'large_json_files': []
}

print("="*80)
print("  🔎 BÚSQUEDA PROFUNDA DE MENSAJES")
print("="*80)
print()

# 1. Buscar archivos modificados recientemente (última hora)
recent_cutoff = datetime.now() - timedelta(hours=1)

print("1. Archivos modificados en la última hora:")
print("-"*60)

for root, dirs, files in os.walk(BASE_DIR):
    for file in files:
        if file.endswith(('.json', '.db', '.sqlite', '.log')):
            try:
                file_path = Path(root) / file
                stat = file_path.stat()
                mtime = datetime.fromtimestamp(stat.st_mtime)
                
                if mtime > recent_cutoff:
                    print(f"  ✅ {file}")
                    print(f"     Path: {file_path}")
                    print(f"     Size: {stat.st_size:,} bytes")
                    print(f"     Modified: {mtime}")
                    
                    results['recent_modified_files'].append({
                        'path': str(file_path),
                        'size': stat.st_size,
                        'modified': mtime.isoformat()
                    })
                    
                    # Leer si es JSON
                    if file.endswith('.json') and stat.st_size < 10_000_000:  # <10MB
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                data = json.load(f)
                            
                            # Buscar mensajes
                            data_str = json.dumps(data).lower()
                            if any(k in data_str for k in ['message', 'conversation', 'prompt', 'response', 'chat']):
                                print(f"     🎯 CONTIENE KEYWORDS DE CHAT")
                                results['files_with_chat_content'].append({
                                    'path': str(file_path),
                                    'data': data
                                })
                        except:
                            pass
                    
                    print()
            except:
                pass

# 2. Buscar archivos JSON grandes (probablemente tienen mucho contenido)
print("\n2. Archivos JSON grandes (>5KB, modificados hoy):")
print("-"*60)

today_cutoff = datetime.now() - timedelta(days=1)

for root, dirs, files in os.walk(BASE_DIR):
    for file in files:
        if file.endswith('.json'):
            try:
                file_path = Path(root) / file
                stat = file_path.stat()
                mtime = datetime.fromtimestamp(stat.st_mtime)
                
                if stat.st_size > 5000 and mtime > today_cutoff:
                    print(f"  📄 {file} ({stat.st_size:,} bytes)")
                    print(f"     {file_path}")
                    
                    results['large_json_files'].append({
                        'path': str(file_path),
                        'size': stat.st_size
                    })
            except:
                pass

# 3. Buscar en directorios específicos
specific_dirs = [
    "User/History",
    "User/workspaceStorage",
    "Workspaces",
    "User/globalStorage",
    "Cascade"  # Si existe
]

print("\n3. Buscando en directorios específicos:")
print("-"*60)

for dir_name in specific_dirs:
    dir_path = BASE_DIR / dir_name
    if dir_path.exists():
        print(f"\n  📁 {dir_name}:")
        file_count = sum(1 for _ in dir_path.rglob('*') if _.is_file())
        print(f"     Total archivos: {file_count}")
        
        # Listar JSONs recientes
        recent_jsons = [
            f for f in dir_path.rglob('*.json')
            if f.stat().st_mtime > (datetime.now() - timedelta(hours=2)).timestamp()
        ]
        
        if recent_jsons:
            print(f"     JSON recientes (<2h): {len(recent_jsons)}")
            for f in recent_jsons[:5]:
                print(f"       - {f.name}")

# Guardar resultados
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print("\n" + "="*80)
print(f"📊 Resumen:")
print(f"  Archivos recientes (<1h): {len(results['recent_modified_files'])}")
print(f"  Archivos con keywords de chat: {len(results['files_with_chat_content'])}")
print(f"  Archivos JSON grandes: {len(results['large_json_files'])}")
print("")
print(f"💾 Resultados guardados en: {OUTPUT_FILE}")
print("="*80)

input("\nPresiona Enter para salir...")

"""
Método SIMPLE - Monitor de Archivos
SIN dependencias externas, 100% confiable
Monitorea archivos de Antigravity automáticamente
"""

import os
import json
import time
from pathlib import Path
from datetime import datetime
import hashlib

# Configuración
ANTIGRAVITY_DIR = Path(os.path.expandvars(r"$USERPROFILE\AppData\Roaming\Antigravity"))
OUTPUT_FILE = Path("C:/chat_captures/simple_monitor.json")
LOG_FILE = Path("C:/chat_captures/simple_monitor_log.txt")
INTERVAL = 10  # segundos

# Archivos a monitorear
WATCH_PATHS = [
    ANTIGRAVITY_DIR / "User" / "History",
    ANTIGRAVITY_DIR / "User" / "globalStorage",
    ANTIGRAVITY_DIR / "User" / "workspaceStorage",
    ANTIGRAVITY_DIR / "Local Storage" / "leveldb"
]

# Estado
file_hashes = {}
findings = []

def log(msg):
    ts = datetime.now().isoformat()
    full = f"[{ts}] {msg}"
    print(full)
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(full + '\n')
    except:
        pass

def get_file_hash(filepath):
    """Calcula hash rápido de archivo"""
    try:
        stat = os.stat(filepath)
        # Hash basado en tamaño + mtime
        return f"{stat.st_size}_{stat.st_mtime}"
    except:
        return None

def scan_directory(directory):
    """Escanea directorio buscando archivos modificados"""
    new_files = []
    modified_files = []
    
    if not directory.exists():
        return new_files, modified_files
    
    try:
        for item in directory.rglob("*.json"):
            if item.is_file():
                current_hash = get_file_hash(item)
                if not current_hash:
                    continue
                
                file_key = str(item)
                
                if file_key not in file_hashes:
                    # Archivo nuevo
                    new_files.append(item)
                    file_hashes[file_key] = current_hash
                elif file_hashes[file_key] != current_hash:
                    # Archivo modificado
                    modified_files.append(item)
                    file_hashes[file_key] = current_hash
    except Exception as e:
        log(f"Error escaneando {directory}: {e}")
    
    return new_files, modified_files

def extract_content(filepath):
    """Extrae contenido potencialmente útil de archivo JSON"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Buscar keywords de chat
        keywords = ['message', 'conversation', 'chat', 'prompt', 'response', 'text', 'content']
        found_keywords = [kw for kw in keywords if kw in content.lower()]
        
        if not found_keywords:
            return None
        
        # Intentar parsear JSON
        try:
            data = json.loads(content)
            return {
                'file': str(filepath),
                'size': len(content),
                'keywords': found_keywords,
                'preview': content[:500] if len(content) > 500 else content,
                'data_sample': data if isinstance(data, (dict, list)) else str(data)[:200]
            }
        except:
            # No es JSON válido, pero tiene keywords
            return {
                'file': str(filepath),
                'size': len(content),
                'keywords': found_keywords,
                'preview': content[:500] if len(content) > 500 else content
            }
    except Exception as e:
        log(f"Error extrayendo de {filepath}: {e}")
        return None

def save_findings():
    """Guarda hallazgos a archivo"""
    try:
        data = {
            'timestamp': datetime.now().isoformat(),
            'total_findings': len(findings),
            'findings': findings[-100:]  # Últimos 100
        }
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        log(f"💾 Guardados {len(findings)} hallazgos")
    except Exception as e:
        log(f"Error guardando: {e}")

def main():
    log("="*80)
    log("🔍 Monitor Simple de Archivos - INICIADO")
    log("="*80)
    log(f"📁 Monitoreando: {ANTIGRAVITY_DIR}")
    log(f"💾 Output: {OUTPUT_FILE}")
    log(f"⏱️  Intervalo: {INTERVAL}s")
    log("")
    
    # Crear directorio de output
    OUTPUT_FILE.parent.mkdir(exist_ok=True)
    
    iteration = 0
    
    while True:
        try:
            iteration += 1
            log(f"\n📡 Escaneo #{iteration}")
            
            new_count = 0
            modified_count = 0
            
            # Escanear cada directorio
            for watch_path in WATCH_PATHS:
                new, modified = scan_directory(watch_path)
                
                # Procesar archivos nuevos
                for filepath in new:
                    content = extract_content(filepath)
                    if content:
                        findings.append({
                            'type': 'new',
                            'timestamp': datetime.now().isoformat(),
                            **content
                        })
                        new_count += 1
                        log(f"  🆕 Nuevo: {filepath.name}")
                
                # Procesar archivos modificados
                for filepath in modified:
                    content = extract_content(filepath)
                    if content:
                        findings.append({
                            'type': 'modified',
                            'timestamp': datetime.now().isoformat(),
                            **content
                        })
                        modified_count += 1
                        log(f"  📝 Modificado: {filepath.name}")
            
            if new_count > 0 or modified_count > 0:
                log(f"✨ Hallazgos: {new_count} nuevos, {modified_count} modificados")
                save_findings()
            else:
                log("  ℹ️ Sin cambios")
            
            # Esperar
            time.sleep(INTERVAL)
            
        except KeyboardInterrupt:
            log("\n⏹️ Detenido por usuario")
            break
        except Exception as e:
            log(f"❌ Error: {e}")
            time.sleep(5)
    
    log("\n✅ Monitor finalizado")
    save_findings()

if __name__ == "__main__":
    main()

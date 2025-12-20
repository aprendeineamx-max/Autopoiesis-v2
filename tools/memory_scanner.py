"""
Memory Scanner - Método Agresivo
Escanea memoria del proceso Antigravity buscando strings de mensajes
"""

import psutil
import re
import json
from datetime import datetime
from pathlib import Path

# Configuración
OUTPUT_FILE = Path("C:/chat_captures/memory_scan_results.json")
LOG_FILE = Path("C:/chat_captures/memory_scan_log.txt")

def log(msg):
    timestamp = datetime.now().isoformat()
    full_msg = f"[{timestamp}] {msg}"
    print(full_msg)
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(full_msg + '\n')
    except:
        pass

def find_antigravity_process():
    """Encuentra proceso de Antigravity"""
    for proc in psutil.process_iter(['pid', 'name', 'exe']):
        try:
            if 'antigravity' in proc.info['name'].lower():
                return proc
        except:
            continue
    return None

def scan_process_memory(proc):
    """Escanea memoria del proceso (requiere permisos)"""
    log(f"🔍 Escaneando proceso PID {proc.pid}...")
    
    findings = []
    
    try:
        # Obtener información de memoria
        memory_info = proc.memory_info()
        log(f"  📊 Memoria: {memory_info.rss / (1024*1024):.2f} MB")
        
        # Intentar leer memoria (esto probablemente fallará sin permisos admin)
        # Esta es una aproximación básica
        memory_maps = proc.memory_maps()
        
        log(f"  📍 {len(memory_maps)} regiones de memoria")
        
        # Buscar en cada región
        for i, mmap in enumerate(memory_maps[:10]):  # Solo primeras 10
            log(f"  📝 Región {i+1}: {mmap.path if mmap.path else 'heap'}")
            
        log("  ⚠️ Escaneo profundo de memoria requiere permisos elevados")
        log("  ℹ️ Usa Process Hacker o WinDbg para inspección manual")
        
    except Exception as e:
        log(f"  ❌ Error: {e}")
    
    return findings

def main():
    log("="*80)
    log("🧠 Memory Scanner - Método Agresivo")
    log("="*80)
    log("")
    
    OUTPUT_FILE.parent.mkdir(exist_ok=True)
    
    # Buscar proceso
    proc = find_antigravity_process()
    
    if not proc:
        log("❌ Proceso de Antigravity no encontrado")
        return
    
    log(f"✅ Proceso encontrado: {proc.info['name']} (PID {proc.pid})")
    log("")
    
    # Escanear
    findings = scan_process_memory(proc)
    
    # Guardar resultados
    results = {
        'timestamp': datetime.now().isoformat(),
        'process': {
            'pid': proc.pid,
            'name': proc.info['name'],
            'exe': proc.info.get('exe')
        },
        'findings': findings,
        'note': 'Escaneo completo de memoria requiere permisos de administrador'
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    
    log(f"\n💾 Resultados: {OUTPUT_FILE}")
    log("\n⚠️ NOTA: Para escaneo profundo, ejecutar como Administrador")
    log("ℹ️ O usar herramientas: Process Hacker, WinDbg, Cheat Engine")

if __name__ == "__main__":
    main()

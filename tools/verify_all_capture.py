# Verificación COMPLETA de Captura - Reporte de Estado

import json
from pathlib import Path
from datetime import datetime

OUTPUT_DIR = Path("C:/chat_captures")
REPORT_FILE = OUTPUT_DIR / "verification_report.json"

def check_file_status(filename):
    """Verificar estado de un archivo"""
    file_path = OUTPUT_DIR / filename
    
    if not file_path.exists():
        return {
            'exists': False,
            'size': 0,
            'modified': None,
            'status': '❌ NO EXISTE'
        }
    
    stat = file_path.stat()
    
    # Verificar si se actualizó recientemente (últimos 5 minutos)
    age_seconds = (datetime.now().timestamp() - stat.st_mtime)
    is_fresh = age_seconds < 300  # 5 minutos
    
    return {
        'exists': True,
        'size': stat.st_size,
        'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
        'age_seconds': int(age_seconds),
        'is_fresh': is_fresh,
        'status': '✅ ACTIVO' if is_fresh else '⚠️ INACTIVO'
    }

def verify_all_systems():
    """Verificar TODOS los sistemas"""
    
    print("="*80)
    print("  🔍 VERIFICACIÓN COMPLETA DE CAPTURA")
    print("="*80)
    print()
    
    # Archivos a verificar
    files_to_check = {
        'CDP Multi-Tab': [
            'multitab_log.txt',
            'multitab_capture.json'
        ],
        'Sistema Híbrido': [
            'hybrid_log.txt',
            'hybrid_capture.json'
        ],
        'CDP WebSocket': [
            'websocket_log.txt',
            'chat_websocket.json'
        ],
        'Análisis Local': [
            'local_files_analysis.json'
        ],
        'CDP Basic': [
            'cdp_log.txt',
            'cdp_messages_v3.json'
        ]
    }
    
    results = {}
    
    for system, files in files_to_check.items():
        print(f"\n📊 {system}:")
        print("-" * 60)
        
        system_results = []
        
        for filename in files:
            status = check_file_status(filename)
            system_results.append({
                'file': filename,
                **status
            })
            
            print(f"  {status['status']} {filename}")
            if status['exists']:
                print(f"     Size: {status['size']:,} bytes")
                print(f"     Modified: {status['modified']}")
                print(f"     Age: {status['age_seconds']}s ago")
        
        results[system] = system_results
    
    # Verificar websocket_sniffer
    print(f"\n📊 websocket_sniffer:")
    print("-" * 60)
    
    ws_dir = Path("C:/websocket_captures")
    if ws_dir.exists():
        ws_files = list(ws_dir.glob("ws_capture_*.json"))
        print(f"  ✅ {len(ws_files)} archivos de captura")
        
        if ws_files:
            latest = max(ws_files, key=lambda p: p.stat().st_mtime)
            stat = latest.stat()
            age = int(datetime.now().timestamp() - stat.st_mtime)
            print(f"  📁 Último: {latest.name}")
            print(f"     Size: {stat.st_size:,} bytes")
            print(f"     Age: {age}s ago")
            
            results['websocket_sniffer'] = [{
                'file': latest.name,
                'exists': True,
                'size': stat.st_size,
                'age_seconds': age
            }]
    else:
        print("  ❌ Directorio no existe")
        results['websocket_sniffer'] = []
    
    # Resumen
    print("\n" + "="*80)
    print("  📈 RESUMEN")
    print("="*80)
    
    total_files = sum(len(files) for files in results.values())
    active_files = sum(
        1 for files in results.values() 
        for f in files 
        if f.get('is_fresh', False) or f.get('age_seconds', 999) < 300
    )
    
    print(f"\n  Total archivos monitoreados: {total_files}")
    print(f"  Archivos activos (< 5min): {active_files}")
    print(f"  Sistemas corriendo: {len(results)}")
    
    # Verificar si HAY datos
    data_found = False
    
    # Check hybrid
    hybrid_file = OUTPUT_DIR / "hybrid_capture.json"
    if hybrid_file.exists():
        try:
            with open(hybrid_file, 'r') as f:
                data = json.load(f)
            
            total_events = data.get('total_events', 0)
            if total_events > 0:
                print(f"\n  ✅ Sistema Híbrido: {total_events} eventos capturados")
                data_found = True
        except:
            pass
    
    # Check local analysis
    local_file = OUTPUT_DIR / "local_files_analysis.json"
    if local_file.exists():
        try:
            with open(local_file, 'r') as f:
                data = json.load(f)
            
            findings = data.get('total_findings', 0)
            if findings > 0:
                print(f"  ✅ Análisis Local: {findings} hallazgo(s)")
                data_found = True
        except:
            pass
    
    print("\n" + "="*80)
    
    if data_found:
        print("  🎉 ¡CAPTURA CONFIRMADA!")
    else:
        print("  ⚠️  No se han capturado datos aún")
    
    print("="*80)
    
    # Guardar reporte
    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_files': total_files,
                'active_files': active_files,
                'systems': len(results),
                'data_found': data_found
            },
            'results': results
        }, f, indent=2)
    
    print(f"\n📁 Reporte guardado: {REPORT_FILE}")

if __name__ == "__main__":
    verify_all_systems()
    input("\nPresiona Enter para salir...")

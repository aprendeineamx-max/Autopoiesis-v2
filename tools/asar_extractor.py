"""
ASAR Extractor - Método #12 del Plan
Extrae código fuente de Antigravity para encontrar APIs internas
"""

import subprocess
import json
from pathlib import Path
from datetime import datetime

# Rutas
ANTIGRAVITY_RESOURCES = Path(r"C:\Users\Administrator\AppData\Local\Programs\Antigravity\resources")
OUTPUT_DIR = Path("C:/chat_captures/asar_extracted")
LOG_FILE = OUTPUT_DIR / "asar_extraction_log.txt"

def log(msg):
    timestamp = datetime.now().isoformat()
    full_msg = f"[{timestamp}] {msg}"
    print(full_msg)
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(full_msg + '\n')
    except:
        pass

def find_asar_files():
    """Busca archivos .asar en directorio de Antigravity"""
    log("🔍 Buscando archivos .asar...")
    
    asar_files = []
    
    if ANTIGRAVITY_RESOURCES.exists():
        for file in ANTIGRAVITY_RESOURCES.rglob("*.asar"):
            size_mb = file.stat().st_size / (1024 * 1024)
            asar_files.append({
                'path': str(file),
                'name': file.name,
                'size_mb': round(size_mb, 2)
            })
            log(f"  ✅ {file.name} ({size_mb:.2f} MB)")
    
    return asar_files

def install_asar():
    """Instala asar via npm"""
    log("📦 Instalando asar...")
    
    try:
        result = subprocess.run(
            ['npm', 'install', '-g', 'asar'],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            log("  ✅ asar instalado exitosamente")
            return True
        else:
            log(f"  ❌ Error: {result.stderr}")
            return False
    except Exception as e:
        log(f"  ❌ Excepción: {e}")
        return False

def extract_asar(asar_path, output_path):
    """Extrae contenido de archivo .asar"""
    log(f"📤 Extrayendo {Path(asar_path).name}...")
    
    try:
        result = subprocess.run(
            ['asar', 'extract', asar_path, str(output_path)],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if result.returncode == 0:
            # Contar archivos extraídos
            file_count = sum(1 for _ in output_path.rglob('*') if _.is_file())
            log(f"  ✅ {file_count} archivos extraídos")
            return True
        else:
            log(f"  ❌ Error: {result.stderr}")
            return False
    except Exception as e:
        log(f"  ❌ Excepción: {e}")
        return False

def search_chat_apis(extracted_dir):
    """Busca APIs relacionadas con chat en código extraído"""
    log("🔎 Buscando APIs de chat...")
    
    keywords = [
        'chat', 'message', 'conversation', 'transferActiveChat',
        'getChatHistory', 'chatModel', 'readChat', 'exportChat'
    ]
    
    findings = []
    
    for js_file in extracted_dir.rglob("*.js"):
        try:
            content = js_file.read_text(encoding='utf-8', errors='ignore')
            
            for keyword in keywords:
                if keyword in content:
                    # Buscar contexto
                    lines = content.split('\n')
                    for i, line in enumerate(lines):
                        if keyword in line:
                            context = '\n'.join(lines[max(0, i-2):min(len(lines), i+3)])
                            findings.append({
                                'file': str(js_file.relative_to(extracted_dir)),
                                'keyword': keyword,
                                'line': i + 1,
                                'context': context
                            })
                            log(f"  ✨ '{keyword}' en {js_file.name}:{i+1}")
        except Exception as e:
            continue
    
    return findings

def main():
    log("="*80)
    log("🚀 ASAR Extractor - Método Agresivo #12")
    log("="*80)
    
    # Crear directorio
    OUTPUT_DIR.mkdir(exist_ok=True, parents=True)
    
    # Buscar archivos .asar
    asar_files = find_asar_files()
    
    if not asar_files:
        log("❌ No se encontraron archivos .asar")
        return
    
    log(f"\n📊 Encontrados {len(asar_files)} archivos .asar\n")
    
    # Verificar si asar está instalado
    try:
        subprocess.run(['asar', '--version'], capture_output=True, check=True)
        log("✅ asar ya está instalado")
    except:
        log("⚠️ asar no instalado, instalando...")
        if not install_asar():
            log("❌ No se pudo instalar asar")
            return
    
    # Extraer cada archivo
    all_findings = []
    
    for asar in asar_files:
        output_path = OUTPUT_DIR / asar['name'].replace('.asar', '')
        
        if extract_asar(asar['path'], output_path):
            # Buscar APIs
            findings = search_chat_apis(output_path)
            all_findings.extend(findings)
    
    # Guardar resultados
    results_file = OUTPUT_DIR / "chat_apis_found.json"
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_findings': len(all_findings),
            'findings': all_findings
        }, f, indent=2, ensure_ascii=False)
    
    log(f"\n✅ Extracción completada")
    log(f"📊 Total hallazgos: {len(all_findings)}")
    log(f"💾 Resultados: {results_file}")

if __name__ == "__main__":
    main()

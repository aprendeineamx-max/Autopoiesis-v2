# Analizador de Archivos Locales - Busca chats en archivos de Antigravity

"""
Analiza:
1. LevelDB (IndexedDB de Electron)
2. Archivos JSON en User/History
3. Archivos de configuración
4. Logs locales
"""

import json
from pathlib import Path
from datetime import datetime
import re

OUTPUT_DIR = Path("C:/chat_captures")
OUTPUT_DIR.mkdir(exist_ok=True)
RESULTS_FILE = OUTPUT_DIR / "local_files_analysis.json"

class LocalFilesAnalyzer:
    def __init__(self):
        self.findings = []
        self.base_dir = Path("C:/Users/Administrator/AppData/Roaming/Antigravity")
        
    def log(self, msg):
        print(msg)
    
    def analyze_json_file(self, file_path):
        """Analizar archivo JSON"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Buscar mensajes
            chat_found = self.search_for_chat_data(data, file_path.name)
            
            if chat_found:
                self.log(f"✅ ENCONTRADO en: {file_path.name}")
                return chat_found
            
            return None
            
        except Exception as e:
            return None
    
    def search_for_chat_data(self, data, source):
        """Buscar datos de chat recursivamente"""
        results = []
        
        def recurse(obj, path=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    # Keywords de chat
                    if any(k in key.lower() for k in [
                        'message', 'chat', 'conversation', 
                        'prompt', 'response', 'content'
                    ]):
                        if isinstance(value, (str, list)):
                            results.append({
                                'source': source,
                                'path': path + '.' + key,
                                'value': str(value)[:500]
                            })
                    
                    recurse(value, path + '.' + key)
            
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    recurse(item, path + f'[{i}]')
        
        recurse(data)
        return results
    
    def analyze_leveldb(self):
        """Analizar LevelDB"""
        self.log("\n🔍 Analizando LevelDB...")
        
        leveldb_path = self.base_dir / "Local Storage" / "leveldb"
        
        if not leveldb_path.exists():
            self.log("⚠️ LevelDB no encontrado")
            return
        
        # Listar archivos
        ldb_files = list(leveldb_path.glob("*.ldb"))
        log_files = list(leveldb_path.glob("*.log"))
        
        self.log(f"📁 Archivos .ldb: {len(ldb_files)}")
        self.log(f"📁 Archivos .log: {len(log_files)}")
        
        # Intentar leer MANIFEST
        manifest = leveldb_path / "MANIFEST-027663"
        if manifest.exists():
            try:
                with open(manifest, 'rb') as f:
                    content = f.read()
                
                # Buscar strings legibles
                readable = content.decode('utf-8', errors='ignore')
                
                # Buscar patrones de mensaje
                if any(k in readable for k in ['message', 'chat', 'prompt']):
                    self.log("✅ MANIFEST contiene referencias a mensajes")
                    self.findings.append({
                        'type': 'leveldb_manifest',
                        'file': 'MANIFEST-027663',
                        'preview': readable[:500]
                    })
            except:
                pass
        
        # Leer archivos .log (más probable que tengan datos)
        for log_file in log_files[:3]:  # Primeros 3
            try:
                with open(log_file, 'rb') as f:
                    content = f.read()
                
                readable = content.decode('utf-8', errors='ignore')
                
                # Buscar JSON
                json_matches = re.findall(r'\{[^{}]{20,500}\}', readable)
                
                if json_matches:
                    self.log(f"✅ {log_file.name}: {len(json_matches)} objetos JSON")
                    
                    for match in json_matches[:5]:
                        try:
                            data = json.loads(match)
                            if 'message' in str(data).lower():
                                self.findings.append({
                                    'type': 'leveldb_log',
                                    'file': log_file.name,
                                    'data': data
                                })
                        except:
                            pass
            
            except:
                pass
    
    def analyze_history_files(self):
        """Analizar archivos de User/History"""
        self.log("\n🔍 Analizando User/History...")
        
        history_path = self.base_dir / "User" / "History"
        
        if not history_path.exists():
            self.log("⚠️ User/History no encontrado")
            return
        
        # Buscar archivos JSON
        json_files = list(history_path.rglob("*.json"))
        
        self.log(f"📁 Archivos JSON encontrados: {len(json_files)}")
        
        # Analizar cada archivo
        for json_file in json_files[:50]:  # Primeros 50
            result = self.analyze_json_file(json_file)
            if result:
                self.findings.extend(result)
        
        self.log(f"✅ Datos de chat encontrados en: {len([f for f in self.findings if 'history' in str(f).lower()])} archivos")
    
    def analyze_workspaces(self):
        """Analizar Workspaces"""
        self.log("\n🔍 Analizando Workspaces...")
        
        workspaces_path = self.base_dir / "Workspaces"
        
        if not workspaces_path.exists():
            self.log("⚠️ Workspaces no encontrado")
            return
        
        # Buscar archivos JSON
        json_files = list(workspaces_path.rglob("*.json"))
        
        self.log(f"📁 Archivos JSON: {len(json_files)}")
        
        for json_file in json_files:
            self.log(f"   - {json_file.name}")
            result = self.analyze_json_file(json_file)
            if result:
                self.findings.extend(result)
    
    def save_results(self):
        """Guardar resultados"""
        try:
            with open(RESULTS_FILE, 'w', encoding='utf-8') as f:
                json.dump({
                    'timestamp': datetime.now().isoformat(),
                    'total_findings': len(self.findings),
                    'findings': self.findings
                }, f, indent=2, ensure_ascii=False)
            
            self.log(f"\n💾 Resultados guardados: {RESULTS_FILE}")
        except Exception as e:
            self.log(f"⚠️ Error guardando: {e}")
    
    def run(self):
        """Ejecutar análisis completo"""
        self.log("="*80)
        self.log("  🔎 Analizador de Archivos Locales")
        self.log("="*80)
        
        self.analyze_leveldb()
        self.analyze_history_files()
        self.analyze_workspaces()
        
        self.log("\n" + "="*80)
        self.log(f"✅ Análisis completo")
        self.log(f"📊 Total hallazgos: {len(self.findings)}")
        self.log("="*80)
        
        if self.findings:
            self.log("\n🎯 Hallazgos más relevantes:")
            for i, finding in enumerate(self.findings[:10], 1):
                self.log(f"\n{i}. {finding.get('source', 'Unknown')}")
                self.log(f"   Path: {finding.get('path', 'N/A')}")
                preview = str(finding.get('value', finding.get('data', '')))[:150]
                self.log(f"   Preview: {preview}")
        
        self.save_results()

if __name__ == "__main__":
    analyzer = LocalFilesAnalyzer()
    analyzer.run()
    
    input("\nPresiona Enter para salir...")

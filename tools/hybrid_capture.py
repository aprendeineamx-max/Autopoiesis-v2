# Sistema Híbrido - Combina websocket_sniffer + archivos locales + CDP

"""
Método híbrido que:
1. Monitorea conexiones de red (websocket_sniffer)
2. Analiza archivos locales en tiempo real
3. Usa CDP para interceptar tráfico
4. Combina TODOS los datos en un solo reporte
"""

import json
import subprocess
import time
import threading
from pathlib import Path
from datetime import datetime

OUTPUT_DIR = Path("C:/chat_captures")
OUTPUT_DIR.mkdir(exist_ok=True)
HYBRID_FILE = OUTPUT_DIR / "hybrid_capture.json"
LOG_FILE = OUTPUT_DIR / "hybrid_log.txt"

class HybridCapture:
    def __init__(self):
        self.network_data = []
        self.file_data = []
        self.cdp_data = []
        self.running = True
        
    def log(self, msg):
        """Logging"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        full_msg = f"[{timestamp}] {msg}"
        print(full_msg)
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(full_msg + "\n")
    
    def monitor_network(self):
        """Monitor 1: WebSocket Sniffer"""
        self.log("🌐 Iniciando monitor de red...")
        
        # websocket_sniffer ya está corriendo, leer sus datos
        captures_dir = Path("C:/websocket_captures")
        
        while self.running:
            try:
                # Leer última captura
                json_files = sorted(captures_dir.glob("ws_capture_*.json"))
                if json_files:
                    latest = json_files[-1]
                    with open(latest, 'r') as f:
                        data = json.load(f)
                    
                    # Guardar con timestamp
                    self.network_data.append({
                        'timestamp': datetime.now().isoformat(),
                        'source': 'websocket_sniffer',
                        'connections': data.get('connections', [])
                    })
                
                time.sleep(10)  # Check cada 10 segundos
            
            except:
                time.sleep(10)
    
    def monitor_files(self):
        """Monitor 2: Archivos Locales"""
        self.log("📁 Iniciando monitor de archivos...")
        
        base_dir = Path("C:/Users/Administrator/AppData/Roaming/Antigravity")
        watched_files = []
        
        # Archivos a monitorear
        patterns = [
            "User/History/**/entries.json",
            "Workspaces/**/workspace.json",
            "Local Storage/leveldb/*.log"
        ]
        
        for pattern in patterns:
            files = list(base_dir.glob(pattern))
            watched_files.extend(files[:20])  # Primeros 20 de cada
        
        self.log(f"👁️ Monitoreando {len(watched_files)} archivos")
        
        # Guardar timestamps iniciales
        file_mtimes = {f: f.stat().st_mtime for f in watched_files if f.exists()}
        
        while self.running:
            try:
                for file_path in watched_files:
                    if not file_path.exists():
                        continue
                    
                    current_mtime = file_path.stat().st_mtime
                    
                    # Si cambió
                    if file_path in file_mtimes and current_mtime > file_mtimes[file_path]:
                        self.log(f"📝 Cambio detectado: {file_path.name}")
                        
                        # Leer contenido
                        try:
                            if file_path.suffix == '.json':
                                with open(file_path, 'r', encoding='utf-8') as f:
                                    data = json.load(f)
                                
                                self.file_data.append({
                                    'timestamp': datetime.now().isoformat(),
                                    'source': 'file_monitor',
                                    'file': str(file_path.name),
                                    'data': data
                                })
                        except:
                            pass
                    
                    file_mtimes[file_path] = current_mtime
                
                time.sleep(5)  # Check cada 5 segundos
            
            except:
                time.sleep(5)
    
    def monitor_cdp(self):
        """Monitor 3: CDP Data"""
        self.log("🔌 Iniciando monitor CDP...")
        
        cdp_file = OUTPUT_DIR / "multitab_capture.json"
        
        last_count = 0
        
        while self.running:
            try:
                if cdp_file.exists():
                    with open(cdp_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    current_count = data.get('total', 0)
                    
                    if current_count > last_count:
                        new_messages = data.get('messages', [])[last_count:]
                        
                        for msg in new_messages:
                            self.cdp_data.append({
                                'timestamp': datetime.now().isoformat(),
                                'source': 'cdp_multitab',
                                'data': msg
                            })
                        
                        last_count = current_count
                        self.log(f"📊 CDP: {len(new_messages)} nuevos mensajes")
                
                time.sleep(3)  # Check cada 3 segundos
            
            except:
                time.sleep(3)
    
    def save_hybrid_data(self):
        """Guardar datos combinados"""
        try:
            combined = {
                'timestamp': datetime.now().isoformat(),
                'sources': {
                    'network': len(self.network_data),
                    'files': len(self.file_data),
                    'cdp': len(self.cdp_data)
                },
                'total_events': len(self.network_data) + len(self.file_data) + len(self.cdp_data),
                'data': {
                    'network': self.network_data[-50:],  # Últimos 50
                    'files': self.file_data[-50:],
                    'cdp': self.cdp_data[-50:]
                }
            }
            
            with open(HYBRID_FILE, 'w', encoding='utf-8') as f:
                json.dump(combined, f, indent=2, ensure_ascii=False)
            
            self.log(f"💾 Datos híbridos guardados: {len(combined['total_events'])} eventos")
        
        except Exception as e:
            self.log(f"⚠️ Error guardando: {e}")
    
    def start(self):
        """Iniciar captura híbrida"""
        self.log("="*80)
        self.log("  🎯 Sistema Híbrido de Captura")
        self.log("="*80)
        self.log("")
        self.log("Combina 3 fuentes:")
        self.log("  1. 🌐 Monitoreo de red (websocket_sniffer)")
        self.log("  2. 📁 Archivos locales (LevelDB, JSON)")
        self.log("  3. 🔌 CDP Multi-Tab")
        self.log("")
        self.log("="*80)
        self.log("")
        
        # Iniciar monitores en threads
        threads = [
            threading.Thread(target=self.monitor_network, daemon=True),
            threading.Thread(target=self.monitor_files, daemon=True),
            threading.Thread(target=self.monitor_cdp, daemon=True)
        ]
        
        for thread in threads:
            thread.start()
            time.sleep(1)
        
        self.log("✅ Todos los monitores activos\n")
        
        # Loop principal
        try:
            iteration = 0
            while True:
                iteration += 1
                time.sleep(10)
                
                # Guardar cada 10 segundos
                self.save_hybrid_data()
                
                # Report cada minuto
                if iteration % 6 == 0:
                    total = len(self.network_data) + len(self.file_data) + len(self.cdp_data)
                    self.log(f"\n📊 Total eventos: {total}")
                    self.log(f"   🌐 Red: {len(self.network_data)}")
                    self.log(f"   📁 Archivos: {len(self.file_data)}")
                    self.log(f"   🔌 CDP: {len(self.cdp_data)}\n")
        
        except KeyboardInterrupt:
            self.log("\n⏹️ Deteniendo monitores...")
            self.running = False
        finally:
            self.save_hybrid_data()
            self.log(f"\n💾 Captura finalizada")
            self.log(f"📁 Archivo: {HYBRID_FILE}")

if __name__ == "__main__":
    capturer = HybridCapture()
    capturer.start()

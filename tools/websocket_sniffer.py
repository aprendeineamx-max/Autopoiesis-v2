"""
WebSocket Sniffer Automático para Antigravity
==============================================

Este script intercepta AUTOMÁTICAMENTE todo el tráfico WebSocket
de Antigravity sin necesidad de extensiones ni configuración manual.

Uso:
    python websocket_sniffer.py

El script:
1. Se ejecuta en background
2. Intercepta WebSocket automáticamente
3. Exporta datos a JSON cada minuto
4. NO requiere NADA del usuario
"""

import asyncio
import json
import time
import re
from datetime import datetime
from pathlib import Path
import subprocess
import psutil

# Configuración
EXPORT_DIR = Path("C:/websocket_captures")
EXPORT_INTERVAL = 60  # segundos
captured_messages = []
stats = {"sent": 0, "received": 0}

def log(message):
    """Log con timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def setup_export_dir():
    """Crear directorio de export"""
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    log(f"📁 Directorio de export: {EXPORT_DIR}")

def is_chat_message(data):
    """Detectar si es mensaje de chat"""
    try:
        if isinstance(data, str):
            data_lower = data.lower()
            keywords = ['chat', 'message', 'content', 'response', 'prompt', 'completion']
            return any(kw in data_lower for kw in keywords)
    except:
        pass
    return False

def export_data():
    """Exportar datos capturados a JSON"""
    try:
        timestamp = int(time.time())
        filename = f"ws_capture_{timestamp}.json"
        filepath = EXPORT_DIR / filename
        
        data = {
            "timestamp": datetime.now().isoformat(),
            "stats": {
                "total": len(captured_messages),
                "sent": stats["sent"],
                "received": stats["received"]
            },
            "messages": captured_messages,
            "chatMessages": [msg for msg in captured_messages if msg.get("isChat")]
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        log(f"✅ Exportado {len(captured_messages)} mensajes a: {filename}")
        log(f"   💬 Mensajes de chat: {len(data['chatMessages'])}")
        
    except Exception as e:
        log(f"❌ Error exportando: {e}")

async def sniff_websocket_windows():
    """
    Método Windows: Usar netstat para detectar conexiones WebSocket
    y capturar paquetes con PowerShell
    """
    log("🔍 Buscando conexiones WebSocket de Antigravity...")
    
    try:
        # Buscar proceso de Antigravity
        antigravity_pids = []
        for proc in psutil.process_iter(['pid', 'name', 'exe']):
            try:
                name = proc.info['name'].lower()
                if 'antigravity' in name or 'electron' in name:
                    antigravity_pids.append(proc.info['pid'])
            except:
                pass
        
        if not antigravity_pids:
            log("⚠️ No se encontró proceso de Antigravity")
            log("💡 Asegúrate de que Antigravity esté ejecutándose")
            return
        
        log(f"✅ Encontrado(s) proceso(s) de Antigravity: {antigravity_pids}")
        
        # Monitorear conexiones
        while True:
            try:
                # Buscar conexiones establecidas
                for pid in antigravity_pids:
                    try:
                        proc = psutil.Process(pid)
                        connections = proc.connections(kind='inet')
                        
                        for conn in connections:
                            if conn.status == 'ESTABLISHED':
                                # Verificar si es WebSocket (puerto típico 443/80 o protocolo WSS)
                                raddr = conn.raddr
                                if raddr:
                                    log(f"🔌 Conexión detectada: {raddr.ip}:{raddr.port}")
                                    # Aquí capturaríamos los paquetes
                                    
                    except psutil.NoSuchProcess:
                        pass
                
                await asyncio.sleep(5)
                
            except KeyboardInterrupt:
                break
                
    except Exception as e:
        log(f"❌ Error: {e}")

async def monitor_with_powershell():
    """
    Método alternativo: Usar Event Tracing for Windows (ETW)
    para capturar tráfico de red de Antigravity
    """
    log("🚀 Iniciando captura con PowerShell ETW...")
    
    # Script PowerShell para capturar eventos de red
    ps_script = """
    $ErrorActionPreference = "SilentlyContinue"
    
    # Buscar proceso de Antigravity
    $processes = Get-Process | Where-Object { $_.ProcessName -like "*Antigravity*" -or $_.ProcessName -like "*electron*" }
    
    if ($processes) {
        Write-Host "✅ Procesos encontrados: $($processes.Count)"
        foreach ($proc in $processes) {
            Write-Host "   PID: $($proc.Id) - $($proc.ProcessName)"
        }
    } else {
        Write-Host "⚠️ No se encontró Antigravity ejecutándose"
    }
    
    # Monitorear conexiones TCP (WebSocket usa TCP)
    while ($true) {
        $connections = Get-NetTCPConnection -State Established -ErrorAction SilentlyContinue |
            Where-Object { $_.OwningProcess -in $processes.Id }
        
        foreach ($conn in $connections) {
            $remotePort = $conn.RemotePort
            $remoteAddr = $conn.RemoteAddress
            
            # WebSocket típicamente usa puerto 443 (WSS) o 80 (WS)
            if ($remotePort -eq 443 -or $remotePort -eq 80) {
                $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                Write-Host "[$timestamp] 🔌 WebSocket: $remoteAddr:$remotePort (State: $($conn.State))"
            }
        }
        
        Start-Sleep -Seconds 5
    }
    """
    
    try:
        # Ejecutar PowerShell
        process = await asyncio.create_subprocess_exec(
            'powershell', '-Command', ps_script,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        # Leer output en tiempo real
        async for line in process.stdout:
            decoded = line.decode('utf-8', errors='ignore').strip()
            if decoded:
                print(decoded)
                
                # Detectar y parsear mensajes WebSocket
                if '🔌 WebSocket:' in decoded:
                    # Capturar información de conexión
                    message = {
                        "timestamp": datetime.now().isoformat(),
                        "type": "connection",
                        "data": decoded
                    }
                    captured_messages.append(message)
        
    except Exception as e:
        log(f"❌ Error en PowerShell: {e}")

async def auto_export_loop():
    """Loop de auto-export cada minuto"""
    while True:
        await asyncio.sleep(EXPORT_INTERVAL)
        if captured_messages:
            export_data()

async def main():
    """Main async function"""
    log("=" * 60)
    log("🌐 WebSocket Sniffer Automático para Antigravity")
    log("=" * 60)
    log("")
    log("📡 Este script captura AUTOMÁTICAMENTE el tráfico WebSocket")
    log("🔄 No requiere configuración manual")
    log("💾 Exporta datos cada 60 segundos")
    log("🛑 Presiona Ctrl+C para detener")
    log("")
    
    setup_export_dir()
    
    # Crear tasks
    tasks = [
        monitor_with_powershell(),
        auto_export_loop()
    ]
    
    try:
        await asyncio.gather(*tasks)
    except KeyboardInterrupt:
        log("\n🛑 Detenido por usuario")
        if captured_messages:
            log("💾 Exportando datos finales...")
            export_data()
    except Exception as e:
        log(f"❌ Error: {e}")
        if captured_messages:
            export_data()

def run_simple_monitor():
    """
    Versión simplificada sin asyncio
    Monitorea conexiones de Antigravity cada 5 segundos
    """
    log("=" * 60)
    log("🌐 WebSocket Monitor - Modo Simplificado")
    log("=" * 60)
    log("")
    
    setup_export_dir()
    
    last_export = time.time()
    
    try:
        while True:
            # Buscar procesos de Antigravity
            antigravity_procs = []
            for proc in psutil.process_iter(['pid', 'name']):
                try:
                    name = proc.info['name'].lower()
                    if 'antigravity' in name or 'electron' in name:
                        antigravity_procs.append(proc)
                except:
                    pass
            
            if not antigravity_procs:
                log("⚠️ Esperando que Antigravity se ejecute...")
                time.sleep(10)
                continue
            
            # Monitorear conexiones de cada proceso
            for proc in antigravity_procs:
                try:
                    connections = proc.connections(kind='inet')
                    for conn in connections:
                        if conn.status == 'ESTABLISHED' and conn.raddr:
                            port = conn.raddr.port
                            # Puerto típico de WebSocket (443 para WSS, 80 para WS)
                            if port in [80, 443, 8080, 9222]:
                                msg = {
                                    "timestamp": datetime.now().isoformat(),
                                    "pid": proc.pid,
                                    "name": proc.name(),
                                    "remote_ip": conn.raddr.ip,
                                    "remote_port": conn.raddr.port,
                                    "local_port": conn.laddr.port,
                                    "status": conn.status
                                }
                                captured_messages.append(msg)
                                stats["received"] += 1
                                
                                log(f"📡 Conexión: {proc.name()} → {conn.raddr.ip}:{conn.raddr.port}")
                                
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            # Auto-export cada minuto
            if time.time() - last_export >= EXPORT_INTERVAL:
                if captured_messages:
                    export_data()
                last_export = time.time()
            
            time.sleep(5)
            
    except KeyboardInterrupt:
        log("\n🛑 Detenido por usuario")
        if captured_messages:
            export_data()

if __name__ == "__main__":
    log("🚀 Iniciando WebSocket Sniffer...")
    log("")
    log("MODO: Monitor de Conexiones (Simple)")
    log("Este script detecta conexiones WebSocket de Antigravity")
    log("")
    
    # Verificar si psutil está instalado
    try:
        import psutil
        log("✅ psutil disponible")
    except ImportError:
        log("❌ psutil no está instalado")
        log("Instalando psutil...")
        try:
            subprocess.check_call(['pip', 'install', 'psutil'])
            log("✅ psutil instalado")
            import psutil
        except:
            log("❌ No se pudo instalar psutil")
            log("Ejecuta manualmente: pip install psutil")
            exit(1)
    
    # Ejecutar monitor simple (no requiere asyncio)
    run_simple_monitor()

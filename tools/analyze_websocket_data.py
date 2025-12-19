"""
Analizador de Datos WebSocket Capturados
=========================================

Este script analiza todos los archivos JSON capturados y extrae
información útil sobre las conexiones de Antigravity.
"""

import json
import os
from pathlib import Path
from collections import defaultdict
from datetime import datetime

CAPTURE_DIR = Path("C:/websocket_captures")

def analyze_all_captures():
    """Analizar todos los archivos JSON capturados"""
    
    print("=" * 70)
    print("  ANÁLISIS DE DATOS WEBSOCKET CAPTURADOS")
    print("=" * 70)
    print()
    
    all_messages = []
    unique_ips = set()
    unique_ports = set()
    connection_timeline = []
    
    # Listar todos los archivos JSON
    json_files = sorted(CAPTURE_DIR.glob("ws_capture_*.json"))
    
    print(f"📁 Archivos encontrados: {len(json_files)}")
    print()
    
    # Analizar cada archivo
    for json_file in json_files:
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Extraer mensajes
            messages = data.get('messages', [])
            all_messages.extend(messages)
            
            # Extraer IPs y puertos únicos
            for msg in messages:
                if 'remote_ip' in msg:
                    unique_ips.add(msg['remote_ip'])
                if 'remote_port' in msg:
                    unique_ports.add(msg['remote_port'])
                
                connection_timeline.append({
                    'timestamp': msg.get('timestamp'),
                    'ip': msg.get('remote_ip'),
                    'port': msg.get('remote_port'),
                    'status': msg.get('status')
                })
        
        except Exception as e:
            print(f"❌ Error leyendo {json_file.name}: {e}")
    
    # Mostrar resultados
    print("📊 RESUMEN DE DATOS CAPTURADOS:")
    print("=" * 70)
    print(f"Total de conexiones detectadas: {len(all_messages)}")
    print(f"IPs únicas: {len(unique_ips)}")
    print(f"Puertos únicos: {len(unique_ports)}")
    print()
    
    print("🌐 DIRECCIONES IP DETECTADAS:")
    print("-" * 70)
    for ip in sorted(unique_ips):
        count = sum(1 for msg in all_messages if msg.get('remote_ip') == ip)
        print(f"  • {ip:20s} → {count} conexiones")
    print()
    
    print("🔌 PUERTOS DETECTADOS:")
    print("-" * 70)
    for port in sorted(unique_ports):
        count = sum(1 for msg in all_messages if msg.get('remote_port') == port)
        port_type = identify_port(port)
        print(f"  • Puerto {port:5d} ({port_type:15s}) → {count} conexiones")
    print()
    
    # Análisis de timeline
    print("⏱️ TIMELINE DE CONEXIONES:")
    print("-" * 70)
    for i, conn in enumerate(connection_timeline[:10], 1):  # Primeras 10
        ts = conn.get('timestamp', 'N/A')
        ip = conn.get('ip', 'N/A')
        port = conn.get('port', 'N/A')
        status = conn.get('status', 'N/A')
        print(f"  {i}. [{ts}] {ip}:{port} - {status}")
    
    if len(connection_timeline) > 10:
        print(f"  ... y {len(connection_timeline) - 10} conexiones más")
    print()
    
    # Análisis específico para chat
    print("💬 ANÁLISIS ESPECÍFICO DE CHAT:")
    print("-" * 70)
    
    # Puerto 443 es típicamente WebSocket Secure (WSS)
    wss_connections = [msg for msg in all_messages if msg.get('remote_port') == 443]
    print(f"  Conexiones WSS (puerto 443): {len(wss_connections)}")
    
    # Verificar si hay conexiones a múltiples servidores
    if len(unique_ips) > 1:
        print(f"  ⚠️ Múltiples servidores detectados ({len(unique_ips)} IPs)")
        print(f"     Esto podría indicar:")
        print(f"       - Servidor principal de chat")
        print(f"       - CDN/cache servers")
        print(f"       - Servicios auxiliares")
    else:
        print(f"  ✅ Conexión consistente a un solo servidor")
    print()
    
    # Exportar resumen
    summary = {
        'analysis_timestamp': datetime.now().isoformat(),
        'total_files_analyzed': len(json_files),
        'total_connections': len(all_messages),
        'unique_ips': list(unique_ips),
        'unique_ports': list(unique_ports),
        'ip_details': {},
        'port_details': {},
        'timeline': connection_timeline
    }
    
    # Detalles por IP
    for ip in unique_ips:
        ip_connections = [msg for msg in all_messages if msg.get('remote_ip') == ip]
        summary['ip_details'][ip] = {
            'total_connections': len(ip_connections),
            'ports_used': list(set(msg.get('remote_port') for msg in ip_connections if msg.get('remote_port')))
        }
    
    # Detalles por puerto
    for port in unique_ports:
        port_connections = [msg for msg in all_messages if msg.get('remote_port') == port]
        summary['port_details'][port] = {
            'total_connections': len(port_connections),
            'type': identify_port(port),
            'ips': list(set(msg.get('remote_ip') for msg in port_connections if msg.get('remote_ip')))
        }
    
    # Guardar resumen
    summary_file = CAPTURE_DIR / 'ANALYSIS_SUMMARY.json'
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print(f"📄 Resumen exportado a: {summary_file}")
    print()
    
    # Conclusiones y recomendaciones
    print("=" * 70)
    print("🎯 CONCLUSIONES Y HALLAZGOS:")
    print("=" * 70)
    print()
    
    print("✅ LO QUE TENEMOS:")
    print(f"  • Detectamos {len(all_messages)} conexiones de Antigravity")
    print(f"  • Identificamos {len(unique_ips)} servidor(es) remoto(s)")
    print(f"  • Conexiones principalmente en puerto 443 (WSS/HTTPS)")
    print()
    
    print("❌ LO QUE NOS FALTA:")
    print("  • Contenido real de los mensajes WebSocket (payload)")
    print("  • Texto de los mensajes del chat")
    print("  • Respuestas de la IA")
    print()
    
    print("💡 SIGUIENTE PASO NECESARIO:")
    print("  Para capturar el CONTENIDO de los mensajes, necesitamos:")
    print("  1. Packet capture a nivel OS (Wireshark/tcpdump)")
    print("  2. Proxy SSL/TLS (mitmproxy) para descifrar WSS")
    print("  3. Modificación del código de Antigravity (invasivo)")
    print()
    
    print("🔧 OPCIÓN RECOMENDADA: SSL Proxy")
    print("  • Instalar mitmproxy")
    print("  • Configurar Antigravity para usar el proxy")
    print("  • Capturar y descifrar tráfico WSS")
    print("  • Extraer mensajes del chat automáticamente")
    print()
    
    return summary

def identify_port(port):
    """Identificar el tipo de servicio por puerto"""
    port_map = {
        80: "HTTP",
        443: "HTTPS/WSS",
        8080: "HTTP-Alt",
        9222: "DevTools",
        3000: "Dev Server",
        5000: "Dev Server",
        8443: "HTTPS-Alt"
    }
    return port_map.get(port, "Unknown")

if __name__ == "__main__":
    summary = analyze_all_captures()
    
    print("=" * 70)
    print("  ANÁLISIS COMPLETADO")
    print("=" * 70)

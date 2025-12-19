"""
Visualizador en Tiempo Real de Mensajes del Chat
================================================

Lee el archivo de captura y muestra mensajes en tiempo real
en una interfaz de consola limpia y actualizada.
"""

import time
import os
import sys
from pathlib import Path
from datetime import datetime

CAPTURE_FILE = Path("C:/chat_captures/chat_messages_live.txt")

def clear_screen():
    """Limpiar pantalla"""
    os.system('cls' if os.name == 'nt' else 'clear')

def read_last_messages(n=10):
    """Leer los últimos N mensajes"""
    try:
        with open(CAPTURE_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Dividir por separadores de mensajes
        messages = content.split('=' * 80)
        
        # Obtener los últimos N mensajes (excluyendo header)
        recent = messages[-n*2:] if len(messages) > 1 else messages
        
        return '\n'.join(recent)
    except FileNotFoundError:
        return "⏳ Esperando mensajes...\n\nEl archivo de captura aún no existe.\nAsegúrate de que mitmproxy esté corriendo."
    except Exception as e:
        return f"❌ Error leyendo archivo: {e}"

def get_file_stats():
    """Obtener estadísticas del archivo"""
    try:
        if CAPTURE_FILE.exists():
            size = CAPTURE_FILE.stat().st_size
            modified = datetime.fromtimestamp(CAPTURE_FILE.stat().st_mtime)
            return f"Tamaño: {size:,} bytes | Última actualización: {modified.strftime('%H:%M:%S')}"
        return "Archivo no encontrado"
    except:
        return "Sin datos"

def main():
    """Main loop del visualizador"""
    print("Iniciando visualizador...")
    print(f"Monitoreando: {CAPTURE_FILE}")
    print()
    time.sleep(2)
    
    last_size = 0
    
    while True:
        try:
            # Verificar si el archivo cambió
            current_size = CAPTURE_FILE.stat().st_size if CAPTURE_FILE.exists() else 0
            
            if current_size != last_size or last_size == 0:
                clear_screen()
                
                # Header
                print("=" * 100)
                print("  📱 ANTIGRAVITY CHAT MESSAGES - LIVE VIEWER")
                print("=" * 100)
                print(f"  {get_file_stats()}")
                print(f"  Actualización automática cada 2 segundos | Presiona Ctrl+C para salir")
                print("=" * 100)
                print()
                
                # Mostrar mensajes
                messages = read_last_messages(5)  # Últimos 5 mensajes
                print(messages)
                
                print()
                print("=" * 100)
                print(f"  Última actualización: {datetime.now().strftime('%H:%M:%S')}")
                print("=" * 100)
                
                last_size = current_size
            
            time.sleep(2)
            
        except KeyboardInterrupt:
            print("\n\n👋 Visualizador detenido")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()

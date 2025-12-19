# Verificador rápido - Ver qué está pasando

import json
from pathlib import Path

OUTPUT_DIR = Path("C:/chat_captures")

print("="*80)
print("  🔍 Estado del Capturador CDP")
print("="*80)
print()

# 1. Ver tabs disponibles
try:
    with open(OUTPUT_DIR / "cdp_messages_v3.json", 'r') as f:
        data = json.load(f)
        tabs = data['messages'][0]['tabs']
    
    print(f"📊 Total tabs disponibles: {len(tabs)}")
    print()
    
    # Mostrar tabs relevantes para chat
    print("Tabs que podrían tener chat:")
    for i, tab in enumerate(tabs, 1):
        url = tab.get('url', '')
        title = tab.get('title', 'Unknown')
        
        # Filtrar tabs internos
        if url.startswith('chrome://') or url.startswith('about:'):
            continue
        
        print(f"{i}. {title[:50]}")
        print(f"   URL: {url[:70]}")
        print()
        
        if i >= 10:
            break
    
except Exception as e:
    print(f"❌ Error leyendo tabs: {e}")

print("="*80)

# 2. Ver estado de captura
try:
    with open(OUTPUT_DIR / "chat_websocket.json", 'r') as f:
        data = json.load(f)
    
    print(f"\n💾 Archivo de captura:")
    print(f"   Total mensajes: {data['total']}")
    print(f"   Última actualización: {data['updated']}")
    
    if data['messages']:
        print(f"\n📝 Mensajes capturados:")
        for msg in data['messages']:
            print(f"   - {msg.get('type')}: {msg.get('timestamp')}")
    else:
        print("\n⚠️  AÚN NO HAY MENSAJES CAPTURADOS")
        print()
        print("Posibles causas:")
        print("  1. El capturador está en un tab sin actividad")
        print("  2. Los mensajes no pasan por el tab monitoreado")
        print("  3. Las URLs de chat son diferentes")
    
except Exception as e:
    print(f"❌ Error: {e}")

print()
print("="*80)
print()

# 3. Sugerencias
print("\n💡 SUGERENCIAS:")
print()
print("Para capturar mensajes:")
print("  1. Asegúrate de que Antigravity esté abierto")
print("  2. Envía un mensaje en el chat")
print("  3. Espera 5-10 segundos")
print("  4. Ejecuta este script nuevamente")
print()
print("Si no funciona:")
print("  - El tab monitoreado podría no ser el correcto")
print("  - Antigravity puede usar un iframe separado para chat")
print("  - Los mensajes pueden ir por un canal diferente")
print()

input("Presiona Enter para salir...")

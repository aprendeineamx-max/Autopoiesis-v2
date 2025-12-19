# Método 3: LevelDB Reader - Leer IndexedDB de Antigravity

import leveldb
import json
from pathlib import Path

# Ruta a LevelDB de Antigravity
LEVELDB_PATH = r"C:\Users\Administrator\AppData\Roaming\Antigravity\Local Storage\leveldb"

def read_leveldb():
    """Leer toda la base de datos LevelDB"""
    try:
        db = leveldb.LevelDB(LEVELDB_PATH)
        
        print(f"✅ LevelDB abierta: {LEVELDB_PATH}")
        print("="*80)
        
        messages_found = []
        
        for key, value in db.RangeIter():
            try:
                # Intentar decodificar
                key_str = key.decode('utf-8', errors='ignore')
                value_str = value.decode('utf-8', errors='ignore')
                
                print(f"\n🔑 Key: {key_str[:100]}")
                print(f"📄 Value: {value_str[:200]}")
                
                # Buscar patrones de chat
                if any(keyword in value_str.lower() for keyword in [
                    'message', 'chat', 'conversation', 'response', 
                    'prompt', 'content', 'text'
                ]):
                    print("🎯 POSIBLE MENSAJE DE CHAT ENCONTRADO!")
                    messages_found.append({
                        'key': key_str,
                        'value': value_str
                    })
                    
                    # Intentar parsear como JSON
                    try:
                        json_data = json.loads(value_str)
                        print(f"📊 JSON: {json.dumps(json_data, indent=2)[:500]}")
                    except:
                        pass
                
            except Exception as e:
                # Datos binarios
                print(f"⚠️ Datos binarios (len: {len(value)})")
        
        print("\n" + "="*80)
        print(f"✅ Total mensajes potenciales encontrados: {len(messages_found)}")
        
        # Exportar
        if messages_found:
            output_file = "C:/chat_captures/leveldb_messages.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(messages_found, f, indent=2, ensure_ascii=False)
            print(f"💾 Exportado a: {output_file}")
        
        return messages_found
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return []

if __name__ == "__main__":
    print("🔍 Leyendo LevelDB de Antigravity...")
    messages = read_leveldb()
    
    if messages:
        print(f"\n🎉 ¡ÉXITO! {len(messages)} mensajes encontrados")
    else:
        print("\n⚠️ No se encontraron mensajes en LevelDB")

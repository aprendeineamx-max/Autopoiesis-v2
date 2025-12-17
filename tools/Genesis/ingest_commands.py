import re
import json
import os

SOURCE_FILE = r"C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\Deep_Forensics\portapapeles_de_comandos.txt"
OUTPUT_FILE = r"C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\Genesis\command_db.json"

def parse_dump():
    if not os.path.exists(SOURCE_FILE):
        print(f"Error: Source file not found at {SOURCE_FILE}")
        return

    print(f"Reading {SOURCE_FILE}...")
    with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to capture JSON blocks between headers
    # [CMD #N | ...]
    # {
    #   ...
    # }
    
    # We look for the curly braces block
    json_blocks = re.findall(r'(\{[^}]+\})', content, re.DOTALL)
    
    print(f"Found {len(json_blocks)} potential command blocks.")
    
    commands = []
    seen_ids = set()
    
    for block in json_blocks:
        try:
            # Clean up potential messiness (newlines inside strings should be escaped in valid JSON, but let's see)
            # The dump format seems pretty clean.
            data = json.loads(block)
            
            cmd_id = data.get('command')
            if not cmd_id:
                continue
                
            # Deduplication logic
            # If same command ID, maybe keep both if different contexts? 
            # For now, let's keep all unique (command + when + key) combos or just list them.
            # Let's create a unique signature.
            sig = f"{data.get('command')}|{data.get('key')}|{data.get('when')}"
            
            if sig not in seen_ids:
                commands.append(data)
                seen_ids.add(sig)
                
        except json.JSONDecodeError:
            # print("Skipping invalid JSON block")
            pass

    print(f"Parsed {len(commands)} unique command definitions.")
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(commands, f, indent=2)
        
    print(f"Database saved to {OUTPUT_FILE}")
    
    # Export for Web Builder (JS)
    JS_OUTPUT = r"C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\Genesis\WebBuilder\data.js"
    os.makedirs(os.path.dirname(JS_OUTPUT), exist_ok=True)
    with open(JS_OUTPUT, 'w', encoding='utf-8') as f:
        f.write("const COMMAND_DB = ")
        json.dump(commands, f)
        f.write(";")
    print(f"Web Data saved to {JS_OUTPUT}")

if __name__ == "__main__":
    parse_dump()

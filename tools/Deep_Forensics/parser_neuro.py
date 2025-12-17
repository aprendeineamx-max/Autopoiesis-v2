import re
import json
import sqlite3
import os
from datetime import datetime

# Configuration
INPUT_FILE = r"C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\Deep_Forensics\portapapeles_de_comandos.txt"
DB_FILE = r"C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\Deep_Forensics\commands.db"

def init_db():
    """Initialize the SQLite database."""
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS commands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            harvest_id INTEGER,
            timestamp TEXT,
            command_id TEXT,
            keybinding TEXT,
            when_clause TEXT
        )
    ''')
    conn.commit()
    return conn

def parse_file():
    """Parse the text file and insert data into the database."""
    print(f"📂 Reading {INPUT_FILE}...")
    
    if not os.path.exists(INPUT_FILE):
        print("❌ Input file not found!")
        return

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by the divider
    sections = content.split('----------------------------------------')
    
    conn = init_db()
    cursor = conn.cursor()
    
    count = 0
    errors = 0
    
    print("🧠 Parsing data blocks...")
    
    for section in sections:
        section = section.strip()
        if not section:
            continue
            
        # Extract Metadata [CMD #1 | 2025-12-17 00:28:55]
        meta_match = re.search(r'\[CMD #(\d+) \| ([^\]]+)\]', section)
        if not meta_match:
            continue
            
        harvest_id = int(meta_match.group(1))
        timestamp = meta_match.group(2)
        
        # Extract JSON content
        # Find the first { and last }
        start_idx = section.find('{')
        end_idx = section.rfind('}')
        
        if start_idx == -1 or end_idx == -1:
            continue
            
        json_str = section[start_idx:end_idx+1]
        
        try:
            data = json.loads(json_str)
            command_id = data.get('command', '')
            keybinding = data.get('key', '')
            when_clause = data.get('when', '')
            
            # Insert into DB
            cursor.execute('''
                INSERT INTO commands (harvest_id, timestamp, command_id, keybinding, when_clause)
                VALUES (?, ?, ?, ?, ?)
            ''', (harvest_id, timestamp, command_id, keybinding, when_clause))
            
            count += 1
            
        except json.JSONDecodeError:
            errors += 1
            print(f"⚠️ JSON Error in block {harvest_id}")
            continue

    conn.commit()
    conn.close()
    
    print(f"\n✅ Parsing Complete!")
    print(f"📊 Total Commands Imported: {count}")
    print(f"❌ Read Errors: {errors}")
    print(f"💾 Database saved to: {DB_FILE}")

def print_stats():
    """Print basic statistics from the generated database."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Total unique commands
    cursor.execute("SELECT COUNT(DISTINCT command_id) FROM commands")
    unique_cmds = cursor.fetchone()[0]
    
    # Commands with keybindings
    cursor.execute("SELECT COUNT(*) FROM commands WHERE keybinding != ''")
    with_keys = cursor.fetchone()[0]
    
    # Most common prefixes (namespaces)
    cursor.execute("SELECT command_id FROM commands")
    all_cmds = cursor.fetchall()
    
    namespaces = {}
    for cmd in all_cmds:
        if cmd[0]:
            ns = cmd[0].split('.')[0]
            namespaces[ns] = namespaces.get(ns, 0) + 1
            
    top_ns = sorted(namespaces.items(), key=lambda x: x[1], reverse=True)[:5]
    
    print("\n📈 Database Statistics:")
    print(f" - Unique Command IDs: {unique_cmds}")
    print(f" - Commands with Keybindings: {with_keys}")
    print(f" - Top Namespaces: {top_ns}")
    
    conn.close()

if __name__ == "__main__":
    parse_file()
    print_stats()

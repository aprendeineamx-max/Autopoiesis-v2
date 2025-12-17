import sqlite3
import re

DB_FILE = r"C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\Deep_Forensics\commands.db"

def connect_db():
    return sqlite3.connect(DB_FILE)

def camel_to_spaces(s):
    # Handle dromedaryCamelCase -> dromedary Camel Case
    s = re.sub(r'([a-z])([A-Z])', r'\1 \2', s)
    return s.title()

def generate_description(command_id):
    """
    Heuristically generates a human readable description from a dot-notation command ID.
    Example: 'workbench.action.files.save' -> 'Save Files'
    """
    parts = command_id.split('.')
    
    # Filter out noise words
    noise = {'workbench', 'action', 'editor', 'view', 'test', 'debug', 'extension'}
    meaningful_parts = [p for p in parts if p.lower() not in noise]
    
    # If we filtered everything (unlikely), keep original parts
    if not meaningful_parts:
        meaningful_parts = parts
        
    # Process each part
    clean_parts = [camel_to_spaces(p) for p in meaningful_parts]
    
    # Join
    desc = " ".join(clean_parts)
    
    # Special overrides/improvements could go here
    # e.g., if "Clipboard Copy Action" -> "Copy to Clipboard"
    
    return desc

def update_database():
    print(f"🧠 Connecting to Cortex at {DB_FILE}...")
    conn = connect_db()
    cursor = conn.cursor()
    
    # Add new columns if they don't exist
    try:
        cursor.execute("ALTER TABLE commands ADD COLUMN description TEXT")
        cursor.execute("ALTER TABLE commands ADD COLUMN keywords TEXT")
        print("✅ Added 'description' and 'keywords' columns.")
    except sqlite3.OperationalError:
        print("ℹ️ Columns already exist.")
        
    # Fetch all commands
    cursor.execute("SELECT id, command_id FROM commands")
    rows = cursor.fetchall()
    
    print(f"⚡ Processing {len(rows)} neural pathways...")
    
    count = 0
    for row_id, cmd_id in rows:
        desc = generate_description(cmd_id)
        
        # Generate keywords (unique words from description + original parts)
        keywords_set = set(desc.lower().split())
        keywords_set.update(cmd_id.lower().split('.'))
        keywords_str = " ".join(keywords_set)
        
        cursor.execute("UPDATE commands SET description = ?, keywords = ? WHERE id = ?", 
                       (desc, keywords_str, row_id))
        count += 1
        if count % 500 == 0:
            print(f"   Processed {count}...")

    conn.commit()
    conn.close()
    print("🚀 Semantic Mapping Complete!")

def test_search(query):
    conn = connect_db()
    cursor = conn.cursor()
    
    print(f"\n🔍 Testing Search for: '{query}'")
    
    # Simple LIKE search
    sql = """
        SELECT command_id, description, keybinding 
        FROM commands 
        WHERE keywords LIKE ? OR description LIKE ?
        LIMIT 5
    """
    wildcard = f"%{query}%"
    cursor.execute(sql, (wildcard, wildcard))
    
    results = cursor.fetchall()
    if not results:
        print("   (No results found)")
    else:
        for cmd, desc, key in results:
            print(f"   > [{key or 'No Key'}] {desc} ({cmd})")
            
    conn.close()

if __name__ == "__main__":
    update_database()
    # Run a few test searches
    test_search("comment")
    test_search("save")
    test_search("terminal")

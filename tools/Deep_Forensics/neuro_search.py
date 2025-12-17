import sqlite3
import sys
import os

DB_FILE = r"C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\Deep_Forensics\commands.db"

def search_commands(query, limit=10):
    if not os.path.exists(DB_FILE):
        print("❌ Database not found. Run parser_neuro.py first.")
        return

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Clean query
    terms = query.lower().split()
    
    # Construct SQL for multiple terms (AND logic)
    where_clauses = []
    params = []
    
    for term in terms:
        where_clauses.append("(keywords LIKE ? OR description LIKE ? OR command_id LIKE ?)")
        wildcard = f"%{term}%"
        params.extend([wildcard, wildcard, wildcard])
        
    where_sql = " AND ".join(where_clauses)
    
    sql = f"""
        SELECT description, keybinding, command_id, when_clause 
        FROM commands 
        WHERE {where_sql}
        LIMIT ?
    """
    params.append(limit)
    
    cursor.execute(sql, params)
    results = cursor.fetchall()
    
    print(f"🔎 Results for '{query}':")
    if not results:
        print("   (No matching commands found)")
    else:
        for desc, key, cmd, when in results:
            key_str = f"[{key}]" if key else "[NO KEY]"
            print(f"   🔹 {key_str.ljust(15)} {desc}  \n        ID: {cmd}")
            # if when: print(f"        When: {when}")
            
    conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python neuro_search.py <search_term>")
        print("Example: python neuro_search.py 'save file'")
    else:
        query = " ".join(sys.argv[1:])
        search_commands(query)

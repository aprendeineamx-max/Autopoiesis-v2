import sqlite3

DB_FILE = r"C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\Deep_Forensics\commands.db"

def search():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT command_id FROM commands") # Get ALL
    results = c.fetchall()
    
    print("--- SEARCHING FOR 'HISTORY' IN ALL COMMANDS ---")
    for r in results:
        cmd = r[0]
        if "history" in cmd.lower() or "session" in cmd.lower():
            print(cmd)
    
    conn.close()

if __name__ == "__main__":
    search()

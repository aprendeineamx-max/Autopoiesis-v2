import sqlite3

DB_FILE = r"C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\Deep_Forensics\commands.db"

def search():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT command_id FROM commands WHERE command_id LIKE 'workbench.action.chat%'")
    results = c.fetchall()
    
    print("--- CHAT WORKBENCH ACTIONS ---")
    for r in results:
        print(r[0])
    
    conn.close()

if __name__ == "__main__":
    search()

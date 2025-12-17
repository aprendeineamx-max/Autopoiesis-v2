import sqlite3

DB_FILE = r"C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\Deep_Forensics\commands.db"

def search():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT command_id, description FROM commands WHERE command_id LIKE '%chat%' AND command_id LIKE '%history%'")
    results = c.fetchall()
    for r in results:
        print(f"MATCH: {r[0]}")
    conn.close()

if __name__ == "__main__":
    search()

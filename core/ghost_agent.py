import sqlite3
import pyautogui
import time
import sys
import re
import os

# Configuration
DB_FILE = r"C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\Deep_Forensics\commands.db"
pyautogui.FAILSAFE = True

try:
    from macro_definitions import MACROS
except ImportError:
    # Fallback if run from a different context
    try:
        from core.macro_definitions import MACROS
    except ImportError:
        MACROS = {}
        print("⚠️ Warning: Could not load macro definitions.")

class GhostAgent:
    def __init__(self):
        self.conn = self.connect_db()
        self.cursor = self.conn.cursor()

    def connect_db(self):
        if not os.path.exists(DB_FILE):
            print(f"❌ Database not found at {DB_FILE}")
            sys.exit(1)
        return sqlite3.connect(DB_FILE)

    def find_command(self, query):
        """Search specifically for a command by fuzzy description or ID."""
        terms = query.lower().split()
        what = []
        params = []
        for term in terms:
            what.append("(keywords LIKE ? OR description LIKE ?)")
            wildcard = f"%{term}%"
            params.extend([wildcard, wildcard])
            
        sql = f"""
            SELECT command_id, keybinding, description 
            FROM commands 
            WHERE {' AND '.join(what)}
            AND keybinding != ''
            LIMIT 1
        """
        self.cursor.execute(sql, params)
        return self.cursor.fetchone()
    
    def find_command_by_id(self, command_id):
        """Find a command details specifically by its ID."""
        sql = "SELECT command_id, keybinding, description FROM commands WHERE command_id = ?"
        self.cursor.execute(sql, (command_id,))
        return self.cursor.fetchone()

    def parse_keybinding(self, key_str):
        """
        Parses a VS Code keybinding string into a list of chords.
        Example: "ctrl+k ctrl+c" -> [['ctrl', 'k'], ['ctrl', 'c']]
        Example: "shift+alt+down" -> [['shift', 'alt', 'down']]
        """
        # Normalize
        key_str = key_str.lower()
        
        # Split into chords (space separated)
        chords = key_str.split(' ')
        parsed_chords = []
        
        for chord in chords:
            # specialized replacements
            chord = chord.replace('ctrl', 'ctrl') # redundancy check
            chord = chord.replace('cmd', 'command') # mac support (unlikely on windows)
            
            # Split by +
            keys = chord.split('+')
            parsed_chords.append(keys)
            
        return parsed_chords

    def execute_keys(self, chords):
        """Executes the parsed chords."""
        print(f"⌨️ Actuating: {chords}")
        
        for chord in chords:
            # PyAutoGUI hotkey handles simple combos like ['ctrl', 'c']
            try:
                pyautogui.hotkey(*chord)
            except Exception as e:
                print(f"❌ Key Error: {e}")
            
            # Small delay between chords in a sequence
            time.sleep(0.1)

    def execute_macro(self, macro_key):
        """Executes a multi-step macro."""
        macro = MACROS.get(macro_key)
        if not macro:
            return False
            
        print(f"🌀 Initiating Macro: {macro['name']} ({macro['icon']})")
        print(f"   ℹ️ {macro['description']}")
        
        for step_cmd_id in macro['steps']:
            print(f"   ➡️ Step: {step_cmd_id}")
            # Look up the keybinding for this specific command ID
            cmd_data = self.find_command_by_id(step_cmd_id)
            
            if cmd_data:
                _, keybinding, desc = cmd_data
                if keybinding:
                    chords = self.parse_keybinding(keybinding)
                    self.execute_keys(chords)
                else:
                    print(f"      ⚠️ No keybinding for {step_cmd_id} (Skipping)")
            else:
                print(f"      ❌ Command ID not found in DB: {step_cmd_id}")
            
            # Delay between macro steps
            time.sleep(0.5)
            
        print(f"✅ Macro '{macro['name']}' Completed.")
        return True

    def act(self, intention):
        """Main entry point: Intention -> Action"""
        print(f"👻 Ghost Agent received intention: '{intention}'")
        
        # 1. Check Macros First
        # Simple exact match or fuzzy match on macro name keys?
        # For now, let's look for direct keys or simple keyword matching
        intention_lower = intention.lower().replace(" ", "_")
        
        # Direct key match
        if intention_lower in MACROS:
            return self.execute_macro(intention_lower)
            
        # Name match (e.g. "clean slate" -> "clean_slate")
        for m_key, m_val in MACROS.items():
            if m_key.replace("_", " ") in intention.lower():
                return self.execute_macro(m_key)

        # 2. Fallback to Single Command Search
        result = self.find_command(intention)
        
        if not result:
            print("🤷 I don't know how to do that yet.")
            return False
            
        cmd_id, keybinding, desc = result
        print(f"🧠 Matched: {desc} ({cmd_id})")
        print(f"🔑 Keys: {keybinding}")
        
        if not keybinding:
            print("⚠️ Command found, but no keybinding assigned!")
            return False
            
        chords = self.parse_keybinding(keybinding)
        self.execute_keys(chords)
        return True

if __name__ == "__main__":
    agent = GhostAgent()
    
    if len(sys.argv) < 2:
        print("Usage: python ghost_agent.py <intention>")
        # Test mode
        print("\n🧪 Running Self-Test...")
        # Simulate a command that shouldn't be too destructive
        # e.g. "open new file" (ctrl+n) might be annoying, let's try just finding one
        result = agent.find_command("format document")
        if result:
            print(f"Test Find 'format document': ✅ Found {result}")
        else:
            print(f"Test Find 'format document': ❌ Not Found")
    else:
        # Give user time to focus correct window
        print("⏳ Executing in 3 seconds... FOCUS TARGET WINDOW!")
        time.sleep(3)
        intention = " ".join(sys.argv[1:])
        agent.act(intention)

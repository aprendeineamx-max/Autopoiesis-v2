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

import tkinter as tk
from datetime import datetime

# ... (Configuration stays same)

class GhostAgent:
    def __init__(self):
        self.conn = self.connect_db()
        self.cursor = self.conn.cursor()
        self.log_file = r"C:\AntiGravityExt\AntiGravity_Ghost_Agent\Exports\chat_history_log.md"

    def connect_db(self):
        if not os.path.exists(DB_FILE):
            print(f"❌ Database not found at {DB_FILE}")
            sys.exit(1)
        return sqlite3.connect(DB_FILE)

    # ... (Database methods stay same)

    def get_clipboard_content(self, root=None):
        """Robustly retrieves text from clipboard."""
        try:
            if root:
                return root.clipboard_get()
            else:
                # One-off fallback
                temp_root = tk.Tk()
                temp_root.withdraw()
                content = temp_root.clipboard_get()
                temp_root.destroy()
                return content
        except Exception:
            return ""

    def execute_internal_command(self, token):
        """Executes special internal Python actions."""
        if token == "__AGENT_INTERNAL_ARCHIVE_CLIPBOARD__":
            print("💾 Executing Internal Archive...")
            
            # 1. Get Content (Wait a bit for copy to finish)
            time.sleep(0.5) 
            content = self.get_clipboard_content()
            
            if not content:
                print("⚠️ Clipboard is empty!")
                return False
                
            # 2. Prepare Data
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Simple ID generation (count occurances of separator)
            entry_id = 1
            if os.path.exists(self.log_file):
                with open(self.log_file, 'r', encoding='utf-8') as f:
                    entry_id = f.read().count("---_ENTRY_SEPARATOR_---") + 1

            # 3. Format Entry
            entry = f"\n## Response #{entry_id} | {timestamp}\n{content}\n\n---_ENTRY_SEPARATOR_---\n"
            
            # 4. Write
            os.makedirs(os.path.dirname(self.log_file), exist_ok=True)
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(entry)
                
            print(f"✅ Archived entry #{entry_id} to {self.log_file}")
            return True
            
        return False

    def execute_macro(self, macro_key):
        """Executes a multi-step macro."""
        macro = MACROS.get(macro_key)
        if not macro:
            return False
            
        print(f"🌀 Initiating Macro: {macro['name']} ({macro['icon']})")
        print(f"   ℹ️ {macro['description']}")
        
        for step_cmd_id in macro['steps']:
            print(f"   ➡️ Step: {step_cmd_id}")
            
            # Check for Internal Command
            if step_cmd_id.startswith("__"):
                self.execute_internal_command(step_cmd_id)
                continue

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

    def watch_mode(self):
        """Monitors clipboard and archives changes automatically."""
        print("👀 GHOST SENTINEL MODE ACTIVATED")
        print("   Listening for clipboard changes... (Ctrl+C to stop)")
        print(f"   📂 Logging to: {self.log_file}")
        
        # Persistent Tk root for stability
        root = tk.Tk()
        root.withdraw()
        
        last_content = self.get_clipboard_content(root)
        
        try:
            while True:
                # Use the persistent root
                content = self.get_clipboard_content(root)
                
                # Filter: Ignore empty or identical
                if content and content != last_content:
                    if len(content.strip()) > 1: 
                        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        
                        entry_id = 1
                        if os.path.exists(self.log_file):
                            with open(self.log_file, 'r', encoding='utf-8') as f:
                                entry_id = f.read().count("---_ENTRY_SEPARATOR_---") + 1
                                
                        entry = f"\n## Sentinel Capture #{entry_id} | {timestamp}\n{content}\n\n---_ENTRY_SEPARATOR_---\n"
                        
                        os.makedirs(os.path.dirname(self.log_file), exist_ok=True)
                        with open(self.log_file, 'a', encoding='utf-8') as f:
                            f.write(entry)
                        
                        preview = content[:50].replace('\n', ' ')
                        print(f"✅ Archived #{entry_id}: {preview}...")
                        
                    last_content = content
                
                # Critical for Tkinter stability
                root.update() 
                time.sleep(1.0)
                
        except KeyboardInterrupt:
            print("\n🛑 Sentinel Deactivated.")

if __name__ == "__main__":
    agent = GhostAgent()
    import argparse
    
    parser = argparse.ArgumentParser(description="AntiGravity Ghost Agent")
    parser.add_argument("intention", nargs="*", help="Natural language command")
    parser.add_argument("--watch", action="store_true", help="Start Sentinel Mode (Clipboard Monitor)")
    
    args = parser.parse_args()
    
    if args.watch:
        agent.watch_mode()
    elif args.intention:
        intention = " ".join(args.intention)
        print("⏳ Executing in 3 seconds... FOCUS TARGET WINDOW!")
        time.sleep(3)
        agent.act(intention)
    else:
        # Default test / help
        print("Usage: python ghost_agent.py [--watch] <intention>")
        print("\n🧪 Running Self-Test...")
        result = agent.find_command("format document")
        if result:
            print(f"Test Find 'format document': ✅ Found {result}")
        else:
            print(f"Test Find 'format document': ❌ Not Found")

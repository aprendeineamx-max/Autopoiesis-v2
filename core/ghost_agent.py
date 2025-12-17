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
    
    def find_command(self, query):
        """Searches specific command or keyword."""
        # Simple exact search on ID first
        self.cursor.execute("SELECT command_id, keybinding, description FROM commands WHERE command_id = ?", (query,))
        res = self.cursor.fetchone()
        if res: return res
        
        # Fuzzy search on description/keywords
        like_query = f"%{query}%"
        self.cursor.execute("SELECT command_id, keybinding, description FROM commands WHERE description LIKE ? OR keywords LIKE ?", (like_query, like_query))
        return self.cursor.fetchone()

    def find_command_by_id(self, cmd_id):
        """Direct lookup by ID."""
        self.cursor.execute("SELECT command_id, keybinding, description FROM commands WHERE command_id = ?", (cmd_id,))
        return self.cursor.fetchone()

    def parse_keybinding(self, keybinding):
        """Parses VS Code keybinding string into PyAutoGUI compatible list."""
        # Example: "ctrl+k ctrl+c" -> [['ctrl', 'k'], ['ctrl', 'c']]
        # Example: "ctrl+shift+p" -> [['ctrl', 'shift', 'p']]
        
        chords = []
        parts = keybinding.lower().split(" ")
        for part in parts:
            keys = part.split("+")
            chords.append(keys)
        return chords

    def execute_keys(self, chords):
        """Executes a list of key chords."""
        for chord in chords:
            print(f"   ⌨️ Pressing: {chord}")
            pyautogui.hotkey(*chord)
            time.sleep(0.1)

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
            print("💾 Ejecutando Archivo Interno...")
            
            # 1. Get Content (Wait a bit for copy to finish)
            time.sleep(0.5) 
            content = self.get_clipboard_content()
            
            if not content:
                print("⚠️ ¡El portapapeles está vacío!")
                return False
                
            # 2. Prepare Data
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Simple ID generation (count occurances of separator)
            entry_id = 1
            if os.path.exists(self.log_file):
                with open(self.log_file, 'r', encoding='utf-8') as f:
                    entry_id = f.read().count("---_ENTRY_SEPARATOR_---") + 1

            # 3. Format Entry (Header kept in English/Code or translated? Let's translate header too for consistency)
            entry = f"\n## Respuesta #{entry_id} | {timestamp}\n{content}\n\n---_ENTRY_SEPARATOR_---\n"
            
            # 4. Write
            os.makedirs(os.path.dirname(self.log_file), exist_ok=True)
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(entry)
                
            print(f"✅ Entrada #{entry_id} archivada en {self.log_file}")
            return True
            
        return False

    def execute_macro(self, macro_key):
        """Executes a multi-step macro."""
        macro = MACROS.get(macro_key)
        if not macro:
            return False
            
        print(f"🌀 Iniciando Macro: {macro['name']} ({macro['icon']})")
        print(f"   ℹ️ {macro['description']}")
        
        for step_cmd_id in macro['steps']:
            print(f"   ➡️ Paso: {step_cmd_id}")
            
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
                    print(f"      ⚠️ Sin atajo para {step_cmd_id} (Saltando)")
            else:
                print(f"      ❌ ID de comando no encontrado: {step_cmd_id}")
            
            # Delay between macro steps
            time.sleep(0.5)
            
        print(f"✅ Macro '{macro['name']}' Completada.")
        return True

    def check_window_focus(self):
        """Ensures the active window is Antigravity or VS Code."""
        try:
            import ctypes
            hwnd = ctypes.windll.user32.GetForegroundWindow()
            length = ctypes.windll.user32.GetWindowTextLengthW(hwnd)
            buff = ctypes.create_unicode_buffer(length + 1)
            ctypes.windll.user32.GetWindowTextW(hwnd, buff, length + 1)
            title = buff.value
            
            # Audit: Target Antigravity specifically, fallback to Code
            if "Antigravity" in title or "Visual Studio Code" in title or "Code" in title:
                return True, title
            return False, title
        except Exception as e:
            print(f"⚠️ Focus Check Failed: {e}")
            return True, "Unknown"

    def act(self, intention):
        """Main entry point: Intention -> Action"""
        
        # 🛡️ SAFETY CHECK (AUDIT)
        valid, title = self.check_window_focus()
        if not valid:
            print(f"🛑 SEGURIDAD: Ventana activa '{title}' no es Antigravity.")
            print("   Abortando para evitar escritura accidental.")
            return False

        print(f"👻 Agente Fantasma recibió intención: '{intention}'")
        
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
            print("🤷 No sé cómo hacer eso todavía.")
            return False
            
        cmd_id, keybinding, desc = result
        print(f"🧠 Encontrado: {desc} ({cmd_id})")
        print(f"🔑 Teclas: {keybinding}")
        
        if not keybinding:
            print("⚠️ Comando encontrado, ¡pero sin teclas asignadas!")
            return False
            
        chords = self.parse_keybinding(keybinding)
        self.execute_keys(chords)
        return True

    def watch_mode(self):
        """Monitors clipboard and archives changes automatically."""
        print("👀 MODO CENTINELA ACTIVADO")
        print("   Escuchando el portapapeles... (Ctrl+C para detener)")
        print(f"   📂 Guardando en: {self.log_file}")
        
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
                                
                        entry = f"\n## Captura Centinela #{entry_id} | {timestamp}\n{content}\n\n---_ENTRY_SEPARATOR_---\n"
                        
                        os.makedirs(os.path.dirname(self.log_file), exist_ok=True)
                        with open(self.log_file, 'a', encoding='utf-8') as f:
                            f.write(entry)
                        
                        preview = content[:50].replace('\n', ' ')
                        print(f"✅ Archivado #{entry_id}: {preview}...")
                        
                    last_content = content
                
                # Critical for Tkinter stability
                root.update() 
                time.sleep(1.0)
                
        except KeyboardInterrupt:
            print("\n🛑 Centinela Desactivado.")

if __name__ == "__main__":
    agent = GhostAgent()
    import argparse
    
    parser = argparse.ArgumentParser(description="Agente Fantasma AntiGravity")
    parser.add_argument("intention", nargs="*", help="Comando en lenguaje natural")
    parser.add_argument("--watch", action="store_true", help="Iniciar Modo Centinela (Monitor de Portapapeles)")
    
    args = parser.parse_args()
    
    if args.watch:
        agent.watch_mode()
    elif args.intention:
        intention = " ".join(args.intention)
        print("⏳ Ejecutando en 3 segundos... ¡ENFOCA LA VENTANA DESTINO!")
        time.sleep(3)
        agent.act(intention)
    else:
        # Default test / help
        print("Uso: python ghost_agent.py [--watch] <intención>")
        print("\n🧪 Ejecutando Auto-Prueba...")
        result = agent.find_command("format document")
        if result:
            print(f"Prueba 'format document': ✅ Encontrado {result}")
        else:
            print(f"Prueba 'format document': ❌ No Encontrado")

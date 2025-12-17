import tkinter as tk
import time
import os
from datetime import datetime

# CONFIGURATION
OUTPUT_FILE = r"C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\Deep_Forensics\portapapeles_de_comandos.txt"
POLL_INTERVAL = 0.5 # Seconds

def get_clipboard_text(root):
    try:
        return root.clipboard_get()
    except tk.TclError:
        return ""  # Clipboard empty or non-text

def main():
    print(f"📋 CLIPBOARD HARVESTER ACTIVATED")
    print(f"📂 Saving to: {OUTPUT_FILE}")
    print(f"⌨️  Press Ctrl+C immediately starts saving.")
    print(f"🛑 Press Ctrl+C in this terminal to stop.")

    # Initialize Tkinter (hidden window required for clipboard access)
    root = tk.Tk()
    root.withdraw() 
    
    last_text = get_clipboard_text(root)
    
    # Create file header if not exists
    if not os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            f.write(f"// CLIPBOARD HARVEST START: {datetime.now()}\n")

    try:
        while True:
            current_text = get_clipboard_text(root)
            
            if current_text != last_text and current_text.strip():
                # New content detected
                timestamp = datetime.now().strftime("[%H:%M:%S]")
                entry = f"\n{'-'*40}\n{timestamp}\n{current_text}\n"
                
                try:
                    with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
                        f.write(entry)
                    print(f"✅ {timestamp} Saved {len(current_text)} chars.")
                except Exception as e:
                    print(f"❌ Write Error: {e}")
                
                last_text = current_text
            
            root.update() # Process Tkinter events
            time.sleep(POLL_INTERVAL)
            
    except KeyboardInterrupt:
        print("\n🛑 Harvester Stopped.")

if __name__ == "__main__":
    main()

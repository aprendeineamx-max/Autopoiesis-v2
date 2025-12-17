import pyautogui
import time
import os
import threading
import tkinter as tk
from datetime import datetime

# CONFIGURATION
OUTPUT_FILE = r"C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\Deep_Forensics\portapapeles_de_comandos.txt"
START_DELAY = 10
COPY_SLEEP = 0.2  # Waiting for Ctrl+C to take effect
SCROLL_SLEEP = 0.1 # Waiting for Down Arrow
MAX_RETRIES = 5  # Stop if content is same X times

# GLOBAL STATE
current_clipboard = ""
is_running = True

def clipboard_listener():
    """Background thread to act as Clipboard Master"""
    global current_clipboard, is_running
    
    root = tk.Tk()
    root.withdraw()

    while is_running:
        try:
            content = root.clipboard_get()
            if content:
                current_clipboard = content
        except:
            pass
        time.sleep(0.1)

def save_to_file(text, count):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"\n{'-'*40}\n[CMD #{count} | {timestamp}]\n{text}\n"
    try:
        with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
            f.write(entry)
        return True
    except Exception as e:
        print(f"❌ Write Error: {e}")
        return False

def main():
    global is_running, current_clipboard
    
    print("==========================================")
    print("👻 UNIFIED HARVESTER: SMART CRAWLER")
    print("==========================================")
    print(f"📂 Saving to: {OUTPUT_FILE}")
    print(f"⏳ CLICK THE FIRST ITEM! STARTING IN {START_DELAY} SECONDS...")

    # Start Clipboard Thread
    t = threading.Thread(target=clipboard_listener)
    t.daemon = True
    t.start()

    # Countdown
    for i in range(START_DELAY, 0, -1):
        print(f"   {i}...", end="\r")
        time.sleep(1)
    print("\n🚀 HARVEST STARTED! (Hold Ctrl+C in THIS terminal to stop)")

    last_saved_text = ""
    same_content_count = 0
    total_harvested = 0

    try:
        while True:
            # 1. TRIGGER COPY
            pyautogui.hotkey('ctrl', 'c')
            time.sleep(COPY_SLEEP)

            # 2. READ FROM THREAD
            captured_text = current_clipboard

            # 3. VERIFY & SAVE
            if captured_text and captured_text != last_saved_text:
                if save_to_file(captured_text, total_harvested + 1):
                    total_harvested += 1
                    preview = captured_text[:30].replace('\n', ' ')
                    print(f"✅ [{total_harvested}] Copied: {preview}...")
                
                last_saved_text = captured_text
                same_content_count = 0 
                
                # 4. MOVE NEXT
                pyautogui.press('down')
                time.sleep(SCROLL_SLEEP)
                
            elif captured_text == last_saved_text:
                same_content_count += 1
                print(f"⚠️ Duplicate detected ({same_content_count}/{MAX_RETRIES}). Retrying copy...", end="\r")
                
                if same_content_count >= MAX_RETRIES:
                    print("\n🛑 END OF LIST DETECTED (Content stopped changing).")
                    break
                    
                # Retry copy without moving, maybe it missed?
                time.sleep(0.5)

            else:
                # Empty clipboard or read error
                print("⚠️ Clipboard empty or unreadable. Retrying...")
                time.sleep(0.5)

    except KeyboardInterrupt:
        print(f"\n🛑 USER STOPPED. Total harvested: {total_harvested}")
    
    is_running = False
    print("👋 Harvester Shutdown.")

if __name__ == "__main__":
    pyautogui.FAILSAFE = True
    main()

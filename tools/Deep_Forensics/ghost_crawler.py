import pyautogui
import time
import sys

# CONFIGURATION
# Adjust delays based on system performance
COPY_DELAY = 0.5
MOVE_DELAY = 0.5
START_DELAY = 15

def ghost_crawl():
    print("==========================================")
    print("👻 GHOST CRAWLER: AUTOMATED HARVESTER")
    print("==========================================")
    print(f"⏳ CLICK IN YOUR LIST! STARTING IN {START_DELAY} SECONDS...")
    
    for i in range(START_DELAY, 0, -1):
        print(f"   {i}...", end="\r")
        time.sleep(1)
    print("\n🚀 CRAWLING STARTED! (Hold Ctrl+C in THIS terminal to stop)")
    
    count = 0
    try:
        while True:
            # 1. COPY (Feeds clipboard_logger.py)
            pyautogui.hotkey('ctrl', 'c')
            time.sleep(COPY_DELAY)
            
            # 2. MOVE DOWN
            pyautogui.press('down')
            time.sleep(MOVE_DELAY)
            
            count += 1
            if count % 10 == 0:
                print(f"🌾 Harvested {count} items...", end="\r")
                
    except KeyboardInterrupt:
        print(f"\n🛑 CRAWLER STOPPED. Total items traversed: {count}")
    except pyautogui.FailSafeException:
        print(f"\n🛑 FAILSAFE TRIGGERED (Mouse Corner). Total: {count}")

if __name__ == "__main__":
    # Safety: moving mouse to corner kills script
    pyautogui.FAILSAFE = True
    ghost_crawl()

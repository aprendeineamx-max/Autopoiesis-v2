import pyautogui
import time
import os
import sys

# Configuration
TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), 'templates', 'allow_once.png')
CONFIDENCE = 0.8
CHECK_INTERVAL_SECONDS = 0.5

def main():
    print("👻 Ghost Clicker: Activated")
    print(f"🎯 Target: {TEMPLATE_PATH}")
    print("Press Ctrl+C to stop.")

    if not os.path.exists(TEMPLATE_PATH):
        print(f"❌ Error: Template not found at {TEMPLATE_PATH}")
        return

    while True:
        try:
            # Locate button on screen
            location = pyautogui.locateCenterOnScreen(TEMPLATE_PATH, confidence=CONFIDENCE)
            
            if location:
                print(f"CLICK! Found 'Allow Once' at {location}")
                pyautogui.click(location)
                # Brief pause to avoid double clicks / let UI react
                time.sleep(1)
            
            time.sleep(CHECK_INTERVAL_SECONDS)

        except pyautogui.ImageNotFoundException:
            # Normal behavior when button isn't there
            pass
        except KeyboardInterrupt:
            print("\n👻 Ghost Clicker: Deactivated")
            break
        except Exception as e:
            print(f"⚠️ Error: {e}")
            time.sleep(1)

if __name__ == "__main__":
    main()

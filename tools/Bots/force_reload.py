import pyautogui
import time
import sys

# Give the user a moment to focus the window if needed, though they are likely already there.
print("⏳ Preparing to reload VS Code in 3 seconds...")
print("⚠️ PLEASE KEEP THE VS CODE WINDOW FOCUSED")
time.sleep(3)

try:
    # Attempt 1: Standard Ctrl+R
    print("⌨️ Pressing Ctrl+R...")
    pyautogui.hotkey('ctrl', 'r')
    
    # Wait to see if it worked (purely heuristic)
    time.sleep(2)
    
    # Attempt 2: Explicit Command Palette (More reliable)
    print("⌨️ Fallback: Command Palette -> Reload Window")
    pyautogui.hotkey('ctrl', 'shift', 'p')
    time.sleep(1.5)
    pyautogui.write('Reload Window')
    time.sleep(1)
    pyautogui.press('enter')

    print("✅ Reload signal sent via Palette.")

except Exception as e:
    print(f"❌ Error: {e}")

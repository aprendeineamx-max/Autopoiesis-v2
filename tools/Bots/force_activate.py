import pyautogui
import time

print("⚡ FORCE ACTIVATION SEQUENCE")
time.sleep(2)

print("⌨️ Opening Palette...")
pyautogui.hotkey('ctrl', 'shift', 'p')
time.sleep(1.5)

print("⌨️ Typing Activation Command...")
pyautogui.write('AntiGravity Hook: Status')
time.sleep(1)

print("⌨️ Executing...")
pyautogui.press('enter')

print("✅ Activation signal sent.")

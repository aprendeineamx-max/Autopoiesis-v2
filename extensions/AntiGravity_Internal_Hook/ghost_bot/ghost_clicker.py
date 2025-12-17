"""
GHOST CLICKER v4.0 - OCR TEXT DETECTION
========================================
Uses Tesseract OCR to find "Allow Once" text on screen and click it.
Works regardless of theme/colors.

Requirements:
    pip install pytesseract opencv-python pillow pyautogui
    AND install Tesseract: https://github.com/tesseract-ocr/tesseract

If Tesseract is not in PATH, set the path below.
"""
import pyautogui
import time
import sys

# Try to import OCR libraries
try:
    import pytesseract
    from PIL import ImageGrab
    import cv2
    import numpy as np
    OCR_AVAILABLE = True
except ImportError as e:
    print(f"[GHOST] OCR libraries not available: {e}")
    OCR_AVAILABLE = False

# Tesseract path (adjust if needed)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Target texts to find and click
TARGET_TEXTS = [
    "Allow Once",
    "Allow",
    "Accept",
    "Yes",
    "OK",
    "Confirm",
    "Run command"
]

def find_text_on_screen(target_text):
    """
    Use OCR to find target text on screen and return its bounding box.
    Returns (x, y, w, h) or None if not found.
    """
    try:
        # Capture screen
        screenshot = ImageGrab.grab()
        screenshot_np = np.array(screenshot)
        gray = cv2.cvtColor(screenshot_np, cv2.COLOR_RGB2GRAY)
        
        # Use pytesseract to get text locations
        data = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT)
        
        # Search for target text
        n_boxes = len(data['text'])
        for i in range(n_boxes):
            text = data['text'][i].strip()
            if target_text.lower() in text.lower():
                x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
                if w > 10 and h > 5:  # Filter tiny matches
                    return (x + w//2, y + h//2)  # Return center of text
        
        # Also try to find multi-word phrases
        full_text = ' '.join([t for t in data['text'] if t.strip()])
        if target_text.lower() in full_text.lower():
            # Find approximate location by scanning for words in sequence
            for i in range(n_boxes - 1):
                combined = data['text'][i] + " " + data['text'][i+1]
                if target_text.lower() in combined.lower():
                    x = data['left'][i]
                    y = data['top'][i]
                    w = data['width'][i] + data['width'][i+1]
                    h = max(data['height'][i], data['height'][i+1])
                    return (x + w//2, y + h//2)
                    
    except Exception as e:
        print(f"[GHOST] OCR Error: {e}")
    
    return None

def fallback_keyboard():
    """
    Fallback: Try to accept dialogs via keyboard.
    """
    try:
        # Tab to focus button + Enter
        pyautogui.press('tab')
        time.sleep(0.1)
        pyautogui.press('enter')
    except:
        pass

def main():
    print("[GHOST CLICKER v4.0] OCR Text Detection Mode")
    print(f"[GHOST] OCR Available: {OCR_AVAILABLE}")
    print(f"[GHOST] Target texts: {TARGET_TEXTS}")
    print("[GHOST] Press Ctrl+C to stop")
    
    pyautogui.FAILSAFE = True
    pyautogui.PAUSE = 0.05
    
    clicks = 0
    scan_count = 0
    
    while True:
        try:
            scan_count += 1
            
            if OCR_AVAILABLE:
                for target in TARGET_TEXTS:
                    pos = find_text_on_screen(target)
                    if pos:
                        x, y = pos
                        print(f"[GHOST] Found '{target}' at ({x}, {y})")
                        pyautogui.click(x, y)
                        clicks += 1
                        print(f"[GHOST] CLICKED! Total: {clicks}")
                        time.sleep(0.5)
                        break
            else:
                # No OCR, use keyboard fallback every 2 seconds
                if scan_count % 4 == 0:
                    fallback_keyboard()
            
            # Status update every 20 scans
            if scan_count % 20 == 0:
                print(f"[GHOST] Scans: {scan_count}, Clicks: {clicks}")
            
            time.sleep(0.5)
            
        except KeyboardInterrupt:
            print("[GHOST] Stopped by user")
            break
        except pyautogui.FailSafeException:
            print("[GHOST] Failsafe triggered")
            break
        except Exception as e:
            print(f"[GHOST] Error: {e}")
            time.sleep(1)

if __name__ == "__main__":
    main()

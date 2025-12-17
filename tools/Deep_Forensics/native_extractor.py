import os
import re
import sys

# TARGET: The Core AntiGravity Application Archive (Raw String for Windows)
TARGET_ASAR = r"C:\Users\Administrator\AppData\Local\Programs\AntiGravity\resources.pak"
OUTPUT_FILE = r"C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\Deep_Forensics\NATIVE_COMMANDS_RAW.txt"

print(f"🕵️‍♂️ STARTING DEEP FORENSIC SCAN")
print(f"🎯 Target: {TARGET_ASAR}")

def extract_strings_from_binary(file_path, patterns):
    found_commands = set()
    
    try:
        # Open in binary read mode - usually works even if app is running (unless exclusive lock)
        with open(file_path, 'rb') as f:
            print("read..")
            content = f.read()
            
            # Decode carefully - ASAR usually contains UTF-8 code but packed
            # We will search byte-patterns standardly
            print(f"📦 Loaded {len(content)} bytes. Scanning...")
            
            # Convert binary to string where possible (ignoring errors) to run regex
            # This is heavy but "Ultimate" means we go deep.
            text_content = content.decode('utf-8', errors='ignore')
            
            for pattern_name, pattern_regex in patterns.items():
                print(f"🔍 Scanning for {pattern_name}...")
                matches = re.findall(pattern_regex, text_content)
                print(f"   > Found {len(matches)} matches")
                for m in matches:
                    found_commands.add(m)
                    
    except PermissionError:
        print("❌ ERROR: File is locked by the OS. AntiGravity must be CLOSED to run this scan fully.")
        # Try a fallback shadow copy logic or just fail? 
        # For now, let's report the lock.
        return None
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return None

    return sorted(list(found_commands))

# --- PATTERNS TO HUNT ---
# We want EVERYTHING that looks like a command ID.
regex_patterns = {
    "Antigravity Commands": r"antigravity\.[a-zA-Z0-9\._-]+",
    "Workbench Actions": r"workbench\.action\.[a-zA-Z0-9\._-]+",
    "Editor Actions": r"editor\.action\.[a-zA-Z0-9\._-]+"
}

# --- EXECUTE ---
if not os.path.exists(TARGET_ASAR):
    print("❌ TARGET NOT FOUND! Check path.")
    sys.exit(1)

results = extract_strings_from_binary(TARGET_ASAR, regex_patterns)

if results:
    print(f"✅ EXPORTING {len(results)} UNIQUE COMMANDS...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("=== ANTIGRAVITY DEEP FORENSIC DUMP ===\n")
        f.write(f"Source: {TARGET_ASAR}\n")
        f.write("Method: Binary String Extraction\n")
        f.write("======================================\n\n")
        
        # Group by namespace for readability
        for cmd in results:
            f.write(f"{cmd}\n")
            
    print(f"💾 Saved to: {OUTPUT_FILE}")
else:
    print("⚠️ No results or read error.")

import os
import time
import subprocess
import sys

# CONFIG
CMD_FILE = r"C:\AntiGravityExt\GHOST_CMD.txt"
TRIGGER_CMD = "DUMP_DEFAULTS"
WAIT_TIME_SECONDS = 45
# Strict Antigravity Path
ANTIGRAVITY_EXE = r"C:\Users\Administrator\AppData\Local\Programs\AntiGravity\Antigravity.exe"

print("🕵️‍♂️ OPERATION IMPOSSIBLE: THE JSON HEIST (ANTIGRAVITY EDITION)")
print("===============================================================")

# 1. SET TRAP (PERSISTENT TRIGGER)
print(f"💣 Phase 1: Arming Trigger Command [{TRIGGER_CMD}]...")
try:
    with open(CMD_FILE, "w", encoding="utf-8") as f:
        f.write(TRIGGER_CMD)
    print(f"✅ Trigger Written to: {CMD_FILE}")
except Exception as e:
    print(f"❌ Trigger Failed: {e}")
    sys.exit(1)

# 2. TRIGGER NUCLEAR RELOAD (Kill & Restart)
print(f"💀 Phase 2: TERMINATING Antigravity Process (Nuclear Option)...")
try:
    # Kill hostiles strictly
    subprocess.run("taskkill /F /IM Antigravity.exe 2>NUL", shell=True)
    subprocess.run("taskkill /F /IM electron.exe 2>NUL", shell=True)
    
    time.sleep(3)
    print("🚀 Phase 2.5: Relaunching Antigravity...")
    
    if os.path.exists(ANTIGRAVITY_EXE):
        subprocess.Popen(f'"{ANTIGRAVITY_EXE}" "C:\\AntiGravityExt\\AntiGravity_Ghost_Agent"', shell=True)
    else:
        print(f"❌ Critical: Executable not found at {ANTIGRAVITY_EXE}")
        
except Exception as e:
    print(f"❌ Restart Failed: {e}")

# 3. WAIT FOR EXECUTION
print(f"⏳ Phase 3: Waiting {WAIT_TIME_SECONDS}s for Trap Execution...")
for i in range(WAIT_TIME_SECONDS, 0, -1):
    print(f"   {i}...", end="\r")
    time.sleep(1)
print("\n✅ Wait Buffer Complete.")

print("========================================")
print("👀 Check Output: tools/Deep_Forensics/NATIVE_KEYBINDINGS_FULL.json")

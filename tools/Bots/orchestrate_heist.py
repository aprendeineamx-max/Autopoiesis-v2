import os
import time
import subprocess

# CONFIG
RELOAD_SCRIPT = r"C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\Bots\force_reload.py"
CMD_FILE = r"C:\AntiGravityExt\GHOST_CMD.txt"
TRIGGER_CMD = "DUMP_DEFAULTS"
WAIT_TIME_SECONDS = 45

print("🕵️‍♂️ OPERATION IMPOSSIBLE: THE JSON HEIST (ROBUST MODE)")
print("=======================================================")

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
print(f"💀 Phase 2: TERMINATING VS Code Process (Nuclear Option)...")
try:
    subprocess.run("taskkill /F /IM NOTEPAD.EXE", shell=True) # Safety check
    subprocess.run("taskkill /F /IM Code.exe", shell=True)
    time.sleep(3)
    print("🚀 Phase 2.5: Relaunching VS Code...")
    subprocess.Popen(r"code C:\AntiGravityExt\AntiGravity_Ghost_Agent", shell=True)
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

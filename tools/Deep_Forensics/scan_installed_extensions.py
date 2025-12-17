import os
import json
import glob

# EXTENSIONS DIRS (User + Built-in)
USER_EXT = r"C:\Users\Administrator\.vscode\extensions"
APP_EXT = r"C:\Users\Administrator\AppData\Local\Programs\AntiGravity\resources\app\extensions"
OUTPUT_FILE = r"C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\Deep_Forensics\NATIVE_KEYBINDINGS_FULL.json"

search_paths = [USER_EXT, APP_EXT]

all_keybindings = []
print(f"🕵️‍♂️ Scanning for Extensions...")

try:
    for EXT_DIR in search_paths:
        print(f"   🔎 Path: {EXT_DIR}")
        if not os.path.exists(EXT_DIR):
            print(f"      ❌ Not found (skipping)")
            continue

        # Find all package.json files
        manifests = []
        for root, dirs, files in os.walk(EXT_DIR):
            if "package.json" in files:
                manifests.append(os.path.join(root, "package.json"))
                
        print(f"      📂 Found {len(manifests)} manifests.")

        for manifest_path in manifests:
            try:
                with open(manifest_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                ext_name = data.get("name", "unknown")
                publisher = data.get("publisher", "unknown")
                full_name = f"{publisher}.{ext_name}"
                
                # Filter for AntiGravity or relevant extensions
                # We want ALL AntiGravity ones.
                if "antigravity" in full_name.lower():
                    print(f"      Reading: {full_name}")
                    
                    contributes = data.get("contributes", {})
                    keybindings = contributes.get("keybindings", [])
                    
                    if not isinstance(keybindings, list):
                        keybindings = [keybindings]
                    
                    for kb in keybindings:
                        # Normalize structure
                        entry = {
                            "key": kb.get("key", ""),
                            "command": kb.get("command", ""),
                            "when": kb.get("when", ""),
                            "source_extension": full_name
                        }
                        # Add Mac/Linux specific keys
                        if "mac" in kb: entry["key_mac"] = kb["mac"]
                        if "linux" in kb: entry["key_linux"] = kb["linux"]
                        
                        all_keybindings.append(entry)
                        
            except Exception as e:
                # print(f"⚠️ Error reading {manifest_path}: {e}") # Reduce noise
                pass

    print(f"✅ Extracted {len(all_keybindings)} keybindings.")

    # Sort by command name
    all_keybindings.sort(key=lambda x: x["command"])

    # Write Result
    header = f"// NATIVE KEYBINDINGS DUMP (STATIC MANIFEST SCAN)\n// Source: {search_paths}\n// Date: {os.times}\n// Status: VERIFIED FROM INSTALLED BINARIES\n"
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(header)
        f.write(json.dumps(all_keybindings, indent=4))
        
    print(f"💾 Saved to: {OUTPUT_FILE}")

except Exception as e:
    print(f"❌ Critical Failure: {e}")

import json
import os

target_path = r"C:\Users\Administrator\AppData\Local\Programs\AntiGravity\resources\app\product.json"

try:
    if os.path.exists(target_path):
        print(f"Reading {target_path}...")
        with open(target_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'checksums' in data:
            print("Found checksums. Removing...")
            del data['checksums']
            
            with open(target_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent='\t')
            print("Successfully patched product.json. Corruption warning should be GONE.")
        else:
            print("No checksums found. File is already clean.")
    else:
        print(f"Error: {target_path} not found.")

except Exception as e:
    print(f"Critical Failure: {e}")

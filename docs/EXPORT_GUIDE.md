# 📦 Guide to Exporting Tools & Extensions

This guide explains how to export individual components of **Autopoiesis** (tools, extensions, bots) and identifies which parts depend on each other.

---

## 🧩 Dependency Overview

The system is designed with a **Hub & Spoke** architecture:

*   **🧠 The Brain (Hub)**: `core/config/`
    *   Contains the central `api-keys.json` database.
*   **🛠️ The Limbs (Spokes)**: `tools/`
    *   Most tools read from "The Brain".
*   **🔌 The Plugins**: `extensions/`
    *   Designed to be more self-contained but may sync with the Hub.

---

## 📦 Export Bundles

### 1. 🔑 Professional API Key Tester
**Type**: Integrated Tool  
**Location**: `tools/api-key-tester/`

**Dependencies (Must Move Together)**:
*   `tools/api-key-tester/` (The code)
*   `core/config/api-keys.json` (The configuration)

**How to Export**:
1.  Copy the folder `tools/api-key-tester/`.
2.  Copy the folder `core/` (to maintain the relative path `../../core/config/`).
3.  **Alternative**: If you want it truly standalone without `core/`, you must edit `tester.js`:
    ```javascript
    // Change this line in constructor:
    constructor(configPath = './config.json') // Point to a local file
    ```

### 2. 🤖 AntiGravity Supervisor (Extension)
**Type**: VSCode Extension  
**Location**: `extensions/AntiGravity_Supervisor/`

**Dependencies**:
*   **Self-Contained by Default**: The extension currently looks for its own `config/api-keys.json` inside its folder.
*   *Note*: To share keys with the rest of the system, you would typically copy your central keys into this extension's config folder.

**How to Export**:
1.  Copy the `extensions/AntiGravity_Supervisor/` folder.
2.  Install dependencies: `npm install` inside that folder.
3.  Load in VSCode: Open the folder -> Run/Debug -> "Run Extension".

### 3. 🛡️ Credit Checker
**Type**: Integrated Tool  
**Location**: `tools/credit-checker/`

**Dependencies**:
*   `core/config/api-keys.json`

**How to Export**:
*   Same as API Key Tester. Must move with `core/` or be refactored to use a local config.

### 4. 🤖 Bots
**Type**: Integrated Tools  
**Location**: `tools/Bots/`

**Dependencies**:
*   Likely depend on `core/config/` for keys.

---

## 🔄 Synchronization Logic

If you export tools broadly, remember:

*   **Integrated Mode (Current)**:
    *   You update keys in **ONE** place: `core/config/api-keys.json`.
    *   All `tools/` see the update immediately.

*   **Exported Mode (Split)**:
    *   If you move `AntiGravity_Supervisor` to a different machine, it has its own `config/api-keys.json`.
    *   If you update a key there, the `tools/api-key-tester` (on the old machine) **won't** know about it.

## 📋 Summary Table

| Component | Path | Depends On | Portable? |
| :--- | :--- | :--- | :--- |
| **API Key Tester** | `tools/api-key-tester/` | `core/config/` | ⚠️ Needs Core |
| **Supervisor Ext** | `extensions/AntiGravity_Supervisor/` | *None (Self-contained)* | ✅ Yes |
| **Credit Checker** | `tools/credit-checker/` | `core/config/` | ⚠️ Needs Core |
| **Core Keys** | `core/config/` | *None* | ✅ Yes |

**Best Practice**: Keep `core/` and `tools/` together as a unit (The "Autopoiesis Core"). Extensions can be distributed freely.

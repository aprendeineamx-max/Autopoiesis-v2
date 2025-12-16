# AntiGravity Supervisor - Portable Installer

## Quick Installation

1. **Double-click** `INSTALL.bat`
2. Wait for installation to complete
3. **Close** AntiGravity IDE completely
4. **Reopen** AntiGravity IDE
5. Look for popup: **"🤖 SUPERVISOR AI: AUTONOMOUS MODE READY"**

## What This Does

The portable installer:
- Auto-detects your AntiGravity IDE installation
- Copies the Supervisor extension to the extensions folder
- Installs npm dependencies
- Creates a ready-to-use installation

## Requirements

- AntiGravity IDE installed
- Node.js and npm (usually comes with AntiGravity)
- Windows OS

## Installation Locations

The installer checks these locations automatically:
1. `%LOCALAPPDATA%\Programs\AntiGravity\resources\app\extensions`
2. `C:\Program Files\AntiGravity\resources\app\extensions`
3. `C:\Program Files (x86)\AntiGravity\resources\app\extensions`

## Verification

After installation, verify the extension is active:

1. Open AntiGravity IDE
2. You should see a popup message:
   **"🤖 SUPERVISOR AI: AUTONOMOUS MODE READY"**
   
3. Status bar should turn **green**

4. Press `F12` (Developer Console) and check for:
   ```
   🤖 AntiGravity Supervisor Extension Activated
   ```

5. Press `Ctrl+Shift+P` and type "supervisor"
   - You should see 5 commands available

6. Check for proof of life file:
   ```
   C:\AntiGravityExt\SUPERVISOR_ALIVE.txt
   ```

## Available Commands

After installation, these commands are available via `Ctrl+Shift+P`:

- **Start Autonomous Supervisor** - Begin autonomous operation
- **Stop Autonomous Supervisor** - Pause autonomous loop
- **Supervisor Status** - View current status
- **Emergency Stop** - Immediate halt
- **Run Single Cycle (Test)** - Test single cycle

## Uninstallation

To remove the extension:

1. **Double-click** `UNINSTALL.bat`
2. Confirm removal
3. Reload AntiGravity IDE

## Troubleshooting

### Extension Not Showing

**Problem**: No popup message after reopening IDE

**Solution**:
1. Press `F12` to open Developer Console
2. Look for errors in red
3. Verify extension folder exists:
   ```
   %LOCALAPPDATA%\Programs\AntiGravity\resources\app\extensions\antigravity-supervisor
   ```
4. Re-run `INSTALL.bat`

### Commands Not Available

**Problem**: Commands don't appear in Command Palette

**Solution**:
1. Check `package.json` exists in extension folder
2. Reload window: `Ctrl+Shift+P` → "Reload Window"
3. Check console for activation errors

### npm Install Failed

**Problem**: Installer shows npm errors

**Solution**:
1. Extension may still work (axios might already be installed)
2. Manually install: 
   ```cmd
   cd %LOCALAPPDATA%\Programs\AntiGravity\resources\app\extensions\antigravity-supervisor
   npm install
   ```

## Manual Installation

If the portable installer doesn't work:

1. Copy entire `AntiGravity_Supervisor` folder to:
   ```
   %LOCALAPPDATA%\Programs\AntiGravity\resources\app\extensions\
   ```

2. Rename to `antigravity-supervisor`

3. Open terminal in that folder and run:
   ```
   npm install
   ```

4. Reload AntiGravity IDE

## Files Included

```
Portable_Installer/
├── INSTALL.bat          # Main installer
├── UNINSTALL.bat        # Uninstaller
└── README.md            # This file
```

The installer copies from the parent directory (`../`) which contains all extension files.

## Support

For issues or questions, check:
- [../INSTALLATION.md](../INSTALLATION.md) - Detailed installation guide
- [../README.md](../README.md) - Extension documentation
- [../API_MANAGEMENT.md](../API_MANAGEMENT.md) - API system details

## What Happens Next

After successful installation:

1. **Immediate**: Popup notification appears
2. **Status Bar**: Turns green (Supervisor active)
3. **Proof File**: `SUPERVISOR_ALIVE.txt` created
4. **Commands**: Available in Command Palette
5. **Ready**: System ready for autonomous operation!

---

**🚀 Ready for autonomous singularity!**

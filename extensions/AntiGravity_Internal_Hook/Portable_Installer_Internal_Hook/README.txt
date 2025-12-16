========================================
 ANTIGRAVITY INTERNAL HOOK
 Portable Installer Package v1.0
========================================

WHAT IS THIS?
-------------
This is a portable installation package for the AntiGravity Internal Hook extension.
A native automation hook that replaces external bots and provides internal API for automation.


INSTALLATION (3 STEPS)
-----------------------

1. Extract this ZIP to any folder
2. Run INSTALL.bat (double-click)
3. Restart AntiGravity IDE

That's it! The extension will be available and auto-activated after restart.


WHAT GETS INSTALLED?
---------------------

Extension Files:
- antigravity-internal-hook extension (to AntiGravity extensions folder)

Installation Locations:
- Built-in: ...\Antigravity\resources\app\extensions\antigravity-internal-hook\
- User: %USERPROFILE%\.antigravity\extensions\antigravity-internal-hook\


WHAT THIS EXTENSION DOES
-------------------------

Native Automation Hook:
- Provides internal automation capabilities within AntiGravity
- Replaces external automation bots
- Auto-activates on AntiGravity startup
- Offers internal API for automation scripts

Use Cases:
- Automated task execution within IDE
- Internal workflow automation
- Custom command automation
- IDE behavior customization


HOW TO USE
----------

After installation and restart:

1. Extension auto-activates (no action needed)
2. Check status: Ctrl+Shift+P -> "AntiGravity Hook: Status"
3. Extension runs in background

The hook is now active and provides automation API to integrated tools.


CHECKING STATUS
---------------

To verify the hook is active:

1. Open Command Palette (Ctrl+Shift+P)
2. Type: "AntiGravity Hook: Status"
3. View current hook status


INSTALLATION LOCATIONS
-----------------------

The installer copies files to TWO locations for maximum compatibility:

Primary (Built-in):
%LOCALAPPDATA%\Programs\Antigravity\resources\app\extensions\antigravity-internal-hook\

Secondary (User):
%USERPROFILE%\.antigravity\extensions\antigravity-internal-hook\

This ensures the extension works even after AntiGravity updates.


TROUBLESHOOTING
---------------

Extension doesn't activate after restart:
- Verify installation: Check if files exist in one of the locations above
- Try: Run INSTALL.bat as Administrator
- Check: AntiGravity Developer Tools (Help -> Toggle Developer Tools)
  Look for errors in Console tab

Hook status command not found:
- Wait ~5 seconds after AntiGravity starts (extension loads async)
- Try: Ctrl+Shift+P -> "Reload Window"
- Check: Extension output channel for errors

Extension not auto-activating:
- Check package.json has activationEvents: ["*"]
- Verify extension.js has proper activate() function
- Check AntiGravity logs for errors


BACKUP & ROLLBACK
------------------

Automatic Backup:
- Existing versions are backed up automatically before installation
- Backup location: ...extensions\.backup\antigravity-internal-hook_YYYYMMDD_HHMMSS\

Manual Rollback:
1. Copy files from backup folder
2. Paste to extension folder (overwrite)
3. Restart AntiGravity


REQUIREMENTS
------------

- Windows 10/11
- AntiGravity IDE installed
- ~5KB disk space


PACKAGE CONTENTS
----------------

INSTALL.bat - Main installer script
README.txt - This file
extension/ - Extension files
  ├── extension.js (3.3 KB)
  └── package.json (0.7 KB)


VERSION INFORMATION
-------------------

Package Version: 1.0
Extension Version: 1.0.0
Release Date: 2025-12-12
Compatibility: AntiGravity 1.x


EXTENSION DETAILS
-----------------

Name: antigravity-internal-hook
Display Name: AntiGravity Internal Hook
Description: Native hook for AntiGravity automation, replacing external bots
Publisher: antigravity
Author: Ghost Agent

Commands:
- antigravity.hook.status - Check hook status

Activation: Automatic on AntiGravity startup (activationEvents: "*")


SUPPORT & UPDATES
-----------------

This is a portable package designed for easy deployment.

For updates:
- Replace extension files manually
- Or: Re-run INSTALL.bat with new version


LICENSE
-------

UNLICENSED - Internal use only


========================================
Questions? Check AntiGravity documentation
or contact your system administrator.
========================================

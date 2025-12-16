========================================
 ANTIG

RAVITY CHAT EXPORTER
 Portable Installer Package v1.0
========================================

WHAT IS THIS?
-------------
This is a portable installation package for the AntiGravity Chat Exporter extension.
Install it on any Windows VPS with AntiGravity IDE to enable chat export functionality.


INSTALLATION (3 STEPS)
-----------------------

1. Extract this ZIP to any folder
2. Run INSTALL.bat (double-click)
3. Restart AntiGravity IDE

That's it! The extension will be available after restart.


WHAT GETS INSTALLED?
---------------------

Extension Files:
- antigravity-chat-exporter extension (to AntiGravity extensions folder)
- Export scripts (to Documents\AntiGravity_Chat_Exports\Scripts)

Directories Created:
- %USERPROFILE%\Documents\AntiGravity_Chat_Exports\ (your exports go here)
- %USERPROFILE%\Documents\AntiGravity_Chat_Exports\Scripts\ (export scripts)


HOW TO USE
----------

After installation and restart:

1. Open Command Palette (Ctrl+Shift+P)
2. Type: "Configure Chat Exporter"
   - OR: "Force Chat Export"
   - OR: "Start Auto Export Monitor"

Default Settings:
- Export directory: Documents\AntiGravity_Chat_Exports
- Auto-export mode: Clipboard Monitor
- Monitor interval: 10 seconds


EXPORT WORKFLOW
---------------

Manual Export:
1. Ctrl+Shift+P -> "Force Chat Export"
2. File saved to export directory

Auto Export (Clipboard Monitor):
1. Ctrl+Shift+P -> "Configure Chat Exporter"
2. Select "clipboard_monitor" mode
3. Chat exports automatically when you copy (Ctrl+A -> Ctrl+C)


EXPORT SCRIPTS (OPTIONAL)
--------------------------

Located in: Documents\AntiGravity_Chat_Exports\Scripts\

Available scripts:
- export_v3.ps1 - Refined exporter with search index and analytics
- export_now.ps1 - One-shot export from clipboard
- test_exporter.ps1 - Self-test and validation

Run with: Right-click -> Run with PowerShell


INSTALLATION LOCATIONS
-----------------------

The installer copies files to TWO locations for maximum compatibility:

Primary (Built-in):
%LOCALAPPDATA%\Programs\Antigravity\resources\app\extensions\antigravity-chat-exporter\

Secondary (User):
%USERPROFILE%\.antigravity\extensions\antigravity-chat-exporter\

This ensures the extension works even after AntiGravity updates.


TROUBLESHOOTING
---------------

Extension doesn't appear after restart:
- Verify installation: Check if files exist in one of the locations above
- Try: Run INSTALL.bat as Administrator
- Check: AntiGravity Developer Tools (Help -> Toggle Developer Tools)
  Look for errors in Console tab

Export command doesn't work:
- Wait ~5 seconds after AntiGravity starts (extension loads async)
- Try: Ctrl+Shift+P -> "Reload Window"
- Check: Extension output channel for errors

Can't find exports:
- Default location: %USERPROFILE%\Documents\AntiGravity_Chat_Exports\
- Check export directory setting (Configure Chat Exporter command)


BACKUP & ROLLBACK
------------------

Automatic Backup:
- Existing versions are backed up automatically before installation
- Backup location: ...extensions\.backup\antigravity-chat-exporter_YYYYMMDD_HHMMSS\

Manual Rollback:
1. Copy files from backup folder
2. Paste to extension folder (overwrite)
3. Restart AntiGravity


REQUIREMENTS
------------

- Windows 10/11
- AntiGravity IDE installed
- PowerShell 5.1+ (for export scripts)
- ~50KB disk space


PACKAGE CONTENTS
----------------

INSTALL.bat - Main installer script
README.txt - This file
extension/ - Extension files
  ├── extension.js
  └── package.json
scripts/ (optional)
  ├── export_v3.ps1
  ├── export_now.ps1
  └── test_exporter.ps1


VERSION INFORMATION
-------------------

Package Version: 1.0
Extension Version: 1.0.0
Release Date: 2025-12-11
Compatibility: AntiGravity 1.x


SUPPORT & UPDATES
-----------------

This is a portable package designed for easy deployment.

For updates:
- Replace extension files manually
- Or: Re-run INSTALL.bat with new version


LICENSE
-------

MIT License - Free to use, modify, and distribute


========================================
Questions? Check AntiGravity documentation
or contact your system administrator.
========================================

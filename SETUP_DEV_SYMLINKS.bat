@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1
title 🔗 Setup Development Symlinks

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║        🔗 DEVELOPMENT SYMLINKS - Real-Time Extension Updates      ║
echo ╠═══════════════════════════════════════════════════════════════════╣
echo ║                                                                   ║
echo ║  This script creates symlinks so Antigravity loads extensions    ║
echo ║  DIRECTLY from the repository (source of truth).                 ║
echo ║                                                                   ║
echo ║  Benefits:                                                        ║
echo ║  ✓ Edit code in repo → Changes apply immediately                 ║
echo ║  ✓ No need to copy files                                         ║
echo ║  ✓ No version mismatches                                         ║
echo ║  ✓ Single source of truth                                        ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

REM requires admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Error: This script requires Administrator privileges
    echo    Right-click and select "Run as Administrator"
    pause
    exit /b 1
)

set "REPO_DIR=C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions"
set "AG_EXT_DIR=%USERPROFILE%\.antigravity\extensions"

echo [Step 1] Backing up existing installed extensions...
set "BACKUP_DIR=%AG_EXT_DIR%_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%"
if exist "%AG_EXT_DIR%" (
    echo   Creating backup: %BACKUP_DIR%
    xcopy /E /I /Y "%AG_EXT_DIR%" "%BACKUP_DIR%" >nul
    echo   ✓ Backup created
)

echo.
echo [Step 2] Removing old extension folders...
if exist "%AG_EXT_DIR%\antigravity-internal-hook-1.0.3" (
    rmdir /S /Q "%AG_EXT_DIR%\antigravity-internal-hook-1.0.3"
    echo   ✓ Removed v1.0.3 (old)
)
if exist "%AG_EXT_DIR%\antigravity-internal-hook-1.0.4" (
    rmdir /S /Q "%AG_EXT_DIR%\antigravity-internal-hook-1.0.4"
    echo   ✓ Removed v1.0.4 (copied version)
)
if exist "%AG_EXT_DIR%\antigravity-chat-exporter" (
    rmdir /S /Q "%AG_EXT_DIR%\antigravity-chat-exporter"
    echo   ✓ Removed chat-exporter (old)
)
if exist "%AG_EXT_DIR%\antigravity-supervisor" (
    rmdir /S /Q "%AG_EXT_DIR%\antigravity-supervisor"
    echo   ✓ Removed supervisor (old)
)

echo.
echo [Step 3] Creating symlinks to repository...

REM Internal Hook
mklink /D "%AG_EXT_DIR%\antigravity-internal-hook-1.0.4" "%REPO_DIR%\AntiGravity_Internal_Hook"
if %errorLevel% equ 0 (
    echo   ✓ Symlink created: internal-hook → Repo
) else (
    echo   ✗ Failed to create internal-hook symlink
)

REM Chat Exporter
mklink /D "%AG_EXT_DIR%\antigravity-chat-exporter-1.0.0" "%REPO_DIR%\AntiGravity_Chat_Exporter"
if %errorLevel% equ 0 (
    echo   ✓ Symlink created: chat-exporter → Repo
) else (
    echo   ✗ Failed to create chat-exporter symlink
)

REM Supervisor
mklink /D "%AG_EXT_DIR%\antigravity-supervisor-1.0.0" "%REPO_DIR%\AntiGravity_Supervisor"
if %errorLevel% equ 0 (
    echo   ✓ Symlink created: supervisor → Repo
) else (
    echo   ✗ Failed to create supervisor symlink
)

echo.
echo [Step 4] Verifying symlinks...
dir "%AG_EXT_DIR%\antigravity-*" | findstr /C:"<SYMLINK>" >nul
if %errorLevel% equ 0 (
    echo   ✓ Symlinks verified
) else (
    echo   ⚠ Warning: Could not verify symlinks
)

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                          SUCCESS!                                 ║
echo ╠═══════════════════════════════════════════════════════════════════╣
echo ║                                                                   ║
echo ║  Antigravity now loads extensions directly from:                 ║
echo ║  C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions\           ║
echo ║                                                                   ║
echo ║  To apply changes:                                                ║
echo ║  1. Edit code in repository                                      ║
echo ║  2. Save file                                                     ║
echo ║  3. Reload Antigravity: Ctrl+Shift+P → Reload Window             ║
echo ║     (Changes apply immediately on reload)                        ║
echo ║                                                                   ║
echo ║  For some changes (like JavaScript), Antigravity may hot-reload  ║
echo ║  automatically without needing full window reload!               ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

pause

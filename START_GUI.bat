@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "GHOST_CONTROL_PANEL.ps1"

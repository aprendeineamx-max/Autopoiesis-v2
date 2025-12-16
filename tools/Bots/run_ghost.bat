@echo off
title 👻 Ghost Clicker (Auto-Allow)
echo ===================================================
echo 👻 Ghost Clicker: Automating Permission Prompts
echo ===================================================

echo.
echo [1/2] Checking dependencies...
pip install -r requirements.txt > nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Failed to install dependencies. Trying manual install...
    pip install pyautogui opencv-python pillow
)

echo.
echo [2/2] Launching Bot...
echo ---------------------------------------------------
echo Keep this window open. 
echo Press Ctrl+C to stop.
echo ---------------------------------------------------
python ghost_clicker.py

pause

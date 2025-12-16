@echo off
title AUTOPOIESIS DEPLOYMENT UTILITY v2.0
color 0A

echo ==================================================
echo   AUTOPOIESIS - AUTOMATED GIT DEPLOYMENT
echo ==================================================
echo.

echo [PHASE 1] Navigating to Project Root...
cd /d "%~dp0"
if %errorlevel% neq 0 (
    echo [ERROR] Could not navigate to project directory!
    pause
    exit /b
)

echo [PHASE 2] Configuring Git Identity...
git config user.email "aprendeinea.mx@gmail.com"
git config user.name "aprendeineamx-max"

echo [PHASE 3] Verifying Remote Repository...
git remote remove origin 2>nul
git remote add origin https://github.com/aprendeineamx-max/Autopoiesis.git

echo [PHASE 4] Checking for Secrets in Current Files...
echo.
echo Scanning for API keys in staged files...
git diff --cached | findstr /i "gs k_ sk-or v1 AI za" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Possible API keys detected in staged files!
    echo [ACTION] Please ensure core/config/api-keys.json is gitignored
    pause
)

echo [PHASE 5] Preparing Deployment...
echo.
echo --------------------------------------------------
echo [INFO] Target: github.com/aprendeineamx-max/Autopoiesis
echo [INFO] Branch: main
echo [INFO] Status: Ready to push
echo --------------------------------------------------
echo.

echo [PHASE 6] Attempting Push to GitHub...
git push origin main --force

echo.
if %errorlevel% equ 0 (
    echo ================================================
    echo [SUCCESS] Deployment Complete! 🚀
    echo ================================================
    echo.
    echo Repository successfully synced to GitHub
    echo All changes are now live
) else (
    echo ================================================
    echo [ERROR] Deployment Failed
    echo ================================================
    echo.
    echo Possible causes:
    echo 1. Secret scanning detected API keys in history
    echo 2. Authentication failed (token expired)
    echo 3. Network connectivity issues
    echo.
    echo Solutions:
    echo - Run CLEAN_SECRETS.bat first to remove keys from history
    echo - Check your GitHub Personal Access Token
    echo - Verify network connection
)

echo.
echo Press any key to view detailed git status...
pause >nul

echo.
echo ========== GIT STATUS ==========
git status
echo.
echo ========== RECENT COMMITS ==========
git log --oneline -5
echo.

pause

# --- ROBUST VERIFICATION SCRIPT ---
$ErrorActionPreference = "SilentlyContinue"

# 1. Kill Old Instances
Get-Process -Name "powershell" | Where-Object { $_.MainWindowTitle -match "OmniControl HUD" } | Stop-Process -Force
Start-Sleep -Seconds 1

# 2. DEFINITIONS (PInvoke for Focus)
$focusCode = @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    public const int SW_RESTORE = 9;
}
"@
Add-Type -TypeDefinition $focusCode -Language CSharp

# 3. Start OmniControl HUD
Write-Host "Starting OmniControl HUD..."
$proc = Start-Process -FilePath "powershell.exe" -ArgumentList "-ExecutionPolicy Bypass -File C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\OmniControl_HUD.ps1" -PassThru
Start-Sleep -Seconds 5 # Wait for HUD init

# 4. VERIFICATION LOOP
$maxRetries = 5
$success = $false

for ($i = 1; $i -le $maxRetries; $i++) {
    Write-Host "`n[Attempt $i/$maxRetries] Finding Target Window..."
    
    # Robust Find: AntiGravity OR Ghost_Agent OR Code
    $target = Get-Process | Where-Object { $_.MainWindowTitle -match "AntiGravity|Ghost_Agent|Code" } | Select-Object -First 1
    
    if ($target) {
        Write-Host "Focusing: $($target.MainWindowTitle)"
        [Win32]::ShowWindow($target.MainWindowHandle, 9) # Restore if minimized
        Start-Sleep -Milliseconds 200
        [Win32]::SetForegroundWindow($target.MainWindowHandle)
        Start-Sleep -Seconds 2 # Wait for Overlay to react
        
        # Capture
        Write-Host "Capturing Screen..."
        Capture-Screen "C:\AntiGravityExt\overlay_verification.png"
        Start-Sleep -Milliseconds 500
        
        # Analyze
        $bmp = $null
        try {
            Add-Type -AssemblyName System.Drawing
            $bmp = [System.Drawing.Bitmap]::FromFile("C:\AntiGravityExt\overlay_verification.png")
            $purpleCount = 0
            
            # Fast Scan (Step 10)
            for ($x = 0; $x -lt $bmp.Width; $x += 10) {
                for ($y = 0; $y -lt $bmp.Height; $y += 10) {
                    $pixel = $bmp.GetPixel($x, $y)
                    # Purple: High Red (>120), High Blue (>120), Low Green (<80)
                    if ($pixel.R -gt 120 -and $pixel.B -gt 120 -and $pixel.G -lt 80) {
                        $purpleCount++
                    }
                }
            }
            
            if ($purpleCount -gt 5) {
                Write-Host "SUCCESS: Found $purpleCount Purple Pixels! Overlay is Visible." -ForegroundColor Green
                $success = $true
                break 
            } else {
                Write-Host "FAIL: Found $purpleCount Purple Pixels." -ForegroundColor Yellow
            }
        } catch {
            Write-Host "dAnalysis Error: $_"
        } finally {
            if ($bmp) { $bmp.Dispose() }
        }
    } else {
        Write-Host "WARNING: Target Window (AntiGravity/Code) NOT FOUND."
    }
    
    Start-Sleep -Seconds 1
}

if ($success) {
    Write-Host "`nVERIFICATION COMPLETE: SYSTEM OPERATIONAL" -ForegroundColor Cyan
} else {
    Write-Host "`nVERIFICATION FAILED after $maxRetries attempts." -ForegroundColor Red
}

# DO NOT KILL HUD if success, let user see it.

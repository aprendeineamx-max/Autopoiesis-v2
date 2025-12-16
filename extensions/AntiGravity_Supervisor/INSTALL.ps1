# Link Supervisor Extension to AntiGravity IDE
# Run as Administrator

param(
    [switch]$Unlink
)

$ErrorActionPreference = "Stop"

Write-Host "🔗 AntiGravity Supervisor Extension Installer" -ForegroundColor Cyan
Write-Host ("=" * 60)
Write-Host ""

# Paths
$supervisorPath = "C:\AntiGravityExt\AntiGravity_Ghost_Agent\AntiGravity_Supervisor"
$antiGravityExtensions = "C:\Users\$env:USERNAME\AppData\Local\Programs\AntiGravity\resources\app\extensions"

# Alternative paths to check
$alternativePaths = @(
    "C:\Program Files\AntiGravity\resources\app\extensions",
    "C:\Program Files (x86)\AntiGravity\resources\app\extensions",
    "$env:LOCALAPPDATA\Programs\AntiGravity\resources\app\extensions"
)

# Find AntiGravity installation
$extensionsPath = $null
if (Test-Path $antiGravityExtensions) {
    $extensionsPath = $antiGravityExtensions
}
else {
    foreach ($path in $alternativePaths) {
        if (Test-Path $path) {
            $extensionsPath = $path
            break
        }
    }
}

if (-not $extensionsPath) {
    Write-Host "❌ AntiGravity extensions directory not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please specify the correct path to AntiGravity extensions:"
    Write-Host "Example: C:\Path\To\AntiGravity\resources\app\extensions"
    exit 1
}

Write-Host "✅ Found AntiGravity extensions at:" -ForegroundColor Green
Write-Host "   $extensionsPath"
Write-Host ""

$linkPath = Join-Path $extensionsPath "antigravity-supervisor"

if ($Unlink) {
    # Unlink extension
    Write-Host "🔓 Unlinking Supervisor Extension..." -ForegroundColor Yellow
    
    if (Test-Path $linkPath) {
        Remove-Item -Path $linkPath -Force -Recurse
        Write-Host "✅ Extension unlinked successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Extension was not linked" -ForegroundColor Yellow
    }
    
}
else {
    # Link extension
    Write-Host "🔗 Linking Supervisor Extension..." -ForegroundColor Cyan
    
    # Check if already linked
    if (Test-Path $linkPath) {
        Write-Host "⚠️  Extension already linked. Unlinking first..." -ForegroundColor Yellow
        Remove-Item -Path $linkPath -Force -Recurse
    }
    
    # Create symbolic link
    try {
        New-Item -ItemType SymbolicLink -Path $linkPath -Target $supervisorPath -Force | Out-Null
        Write-Host "✅ Symbolic link created successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to create symbolic link. Trying directory copy..." -ForegroundColor Yellow
        Copy-Item -Path $supervisorPath -Destination $linkPath -Recurse -Force
        Write-Host "✅ Extension copied successfully!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "📦 Installing npm dependencies..." -ForegroundColor Cyan
    Push-Location $supervisorPath
    npm install --silent
    Pop-Location
    
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
}

Write-Host ""
Write-Host ("=" * 60)
Write-Host "🎉 Installation Complete!" -ForegroundColor Green
Write-Host ("=" * 60)
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Close AntiGravity IDE completely"
Write-Host "  2. Reopen AntiGravity IDE"
Write-Host "  3. Press Ctrl+Shift+P"
Write-Host "  4. Type: 'Start Autonomous Supervisor'"
Write-Host "  5. Watch the magic happen! 🚀"
Write-Host ""
Write-Host "Commands Available:" -ForegroundColor Cyan
Write-Host "  - Start Autonomous Supervisor"
Write-Host "  - Stop Autonomous Supervisor"
Write-Host "  - Supervisor Status"
Write-Host "  - Emergency Stop"
Write-Host "  - Run Single Cycle (Test)"
Write-Host ""

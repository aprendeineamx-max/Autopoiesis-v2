# Chat Exporter V2 - Self Test
# PowerShell 5.1 Compatible

Add-Type -AssemblyName System.Windows.Forms

$ExportDir = "C:\AntiGravityExt\AntiGravity_Ghost_Agent\Exports"
$HistoryFile = Join-Path $ExportDir "Chat_Conversation.md"

if (!(Test-Path $ExportDir)) {
    New-Item -Path $ExportDir -ItemType Directory -Force | Out-Null
}

function Get-Hash {
    param($text)
    $md5 = [System.Security.Cryptography.MD5]::Create()
    $hash = $md5.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($text.Trim()))
    return [BitConverter]::ToString($hash).Replace('-','')
}

function Test-Chat {
    param($text)
    if (!$text -or $text.Length -lt 50) { return $false }
    
    $score = 0
    $score += ([regex]::Matches($text, '(?m)^(USER|AGENT|AI)')).Count * 2
    $score += ([regex]::Matches($text, 'uploaded image')).Count * 3
    $score += ([regex]::Matches($text, '(?m)^#{1,3}\s')).Count
    
    return $score -ge 4
}

function Parse-Messages {
    param($text)
    
    $lines = $text -split "`n"
    $messages = @()
    $current = $null
    $inCode = $false
    $code = ""
    
    foreach ($line in $lines) {
        if ($line -match '^```') {
            if (!$inCode) {
                $inCode = $true
                $code = "$line`n"
            } else {
                $inCode = $false
                $code += $line
                if ($current) {
                    $current.content += "`n$code"
                }
                $code = ""
            }
            continue
        }
        
        if ($inCode) {
            $code += "$line`n"
            continue
        }
        
        $t = $line.Trim()
        
        if ($t -match '^USER:(.*)') {
            if ($current) { $messages += $current }
            $current = @{from='user'; type='text'; content=$matches[1].Trim(); time=(Get-Date -Format "HH:mm:ss")}
        }
        elseif ($t -match '^AGENT:(.*)') {
            if ($current) { $messages += $current }
            $current = @{from='agent'; type='text'; content=$matches[1].Trim(); time=(Get-Date -Format "HH:mm:ss")}
        }
        elseif ($t -and $current) {
            $current.content += "`n$t"
        }
    }
    
    if ($current) { $messages += $current }
    return $messages
}

function Export-Messages {
    param($msgs, $hashes)
    
    $output = ""
    $new = 0
    $num = $hashes.Count + 1
    
    if (!(Test-Path $HistoryFile)) {
        $output = "# Chat Export`n`n**Generated**: $(Get-Date)`n`n---`n`n"
    }
    
    foreach ($m in $msgs) {
        $h = Get-Hash $m.content
        if (!$hashes.ContainsKey($h)) {
            $fromText = if ($m.from -eq 'user') { 'User' } else { 'Agent' }
            
            $output += "## Message $($num.ToString('000'))`n"
            $output += "**From**: $fromText`n"
            $output += "**Time**: $($m.time)`n`n"
            $output += "$($m.content)`n`n"
            $output += "---`n`n"
            
            $hashes[$h] = $true
            $num++
            $new++
        }
    }
    
    if ($new -gt 0) {
        Add-Content -Path $HistoryFile -Value $output
    }
    
    return $new
}

# ========== SELF TEST ==========

Write-Host ""
Write-Host "====================================" -ForegroundColor Magenta
Write-Host " RUNNING SELF-TEST" -ForegroundColor Magenta
Write-Host "====================================" -ForegroundColor Magenta
Write-Host ""

# Test input
$sample = @"
USER: Hola, necesito ayuda

AGENT: Claro! En qué puedo ayudarte?

USER: Necesito un script:

``````powershell
Get-Process | Select Name
``````

AGENT: Perfecto, puedes mejorarlo así:

``````powershell
Get-Process | Select Name, Id
``````
"@

Write-Host "[1] Creating test input..." -ForegroundColor Yellow
Write-Host "    Length: $($sample.Length) chars" -ForegroundColor Gray

Write-Host ""
Write-Host "[2] Testing chat detection..." -ForegroundColor Yellow
$isChat = Test-Chat $sample
if ($isChat) {
    Write-Host "    PASS: Detected as chat" -ForegroundColor Green
} else {
    Write-Host "    FAIL: Not detected" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3] Parsing messages..." -ForegroundColor Yellow
$msgs = Parse-Messages $sample
Write-Host "    Found $($msgs.Count) messages:" -ForegroundColor Green
foreach ($m in $msgs) {
    Write-Host "    - $($m.from): $($m.content.Substring(0, [Math]::Min(30, $m.content.Length)))..." -ForegroundColor Gray
}

Write-Host ""
Write-Host "[4] Exporting to file..." -ForegroundColor Yellow
$h = @{}
$exported = Export-Messages -msgs $msgs -hashes $h
Write-Host "    Exported $exported messages" -ForegroundColor Green
Write-Host "    File: $HistoryFile" -ForegroundColor Cyan

Write-Host ""
Write-Host "[5] Verifying file content..." -ForegroundColor Yellow
if (Test-Path $HistoryFile) {
    $content = Get-Content $HistoryFile -Raw
    $hasMsg = $content -match '## Message'
    $hasCode = $content -match '```powershell'
    $hasMeta = $content -match '\*\*From\*\*'
    
    Write-Host "    File exists: YES" -ForegroundColor Green
    Write-Host "    Has messages: $hasMsg" -ForegroundColor $(if($hasMsg){'Green'}else{'Red'})
    Write-Host "    Has code: $hasCode" -ForegroundColor $(if($hasCode){'Green'}else{'Red'})
    Write-Host "    Has metadata: $hasMeta" -ForegroundColor $(if($hasMeta){'Green'}else{'Red'})
    
    if ($hasMsg -and $hasCode -and $hasMeta) {
        Write-Host ""
        Write-Host "====================================" -ForegroundColor Green
        Write-Host " ALL TESTS PASSED!" -ForegroundColor Green
        Write-Host "====================================" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "Output file preview:" -ForegroundColor Cyan
        Write-Host $content.Substring(0, [Math]::Min(800, $content.Length)) -ForegroundColor White
        Write-Host ""
        Write-Host "Full file: $HistoryFile" -ForegroundColor Yellow
        
        exit 0
    } else {
        Write-Host ""
        Write-Host "TEST FAILED" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "    FAIL: File not created" -ForegroundColor Red
    exit 1
}

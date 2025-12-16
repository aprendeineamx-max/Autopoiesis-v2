# PS 5.1 Compatible Real Chat Export
Add-Type -AssemblyName System.Windows.Forms

$ExportDir = "C:\AntiGravityExt\AntiGravity_Ghost_Agent\Exports"
$OutputFile = Join-Path $ExportDir "Chat_Real_Export_$(Get-Date -Format 'yyyyMMdd_HHmmss').md"

if (!(Test-Path $ExportDir)) {
    New-Item -Path $ExportDir -ItemType Directory -Force | Out-Null
}

Write-Host "Reading clipboard..." -ForegroundColor Yellow
$clipboard = [System.Windows.Forms.Clipboard]::GetText()

if (!$clipboard -or $clipboard.Length -lt 100) {
    Write-Host "ERROR: Clipboard empty" -ForegroundColor Red
    exit 1
}

Write-Host "Captured: $($clipboard.Length) chars" -ForgroundColor Green
Write-Host "Parsing..." -ForegroundColor Yellow

# Parse
$lines = $clipboard -split "`n"
$messages = @()
$current = $null
$inCode = $false
$code = ""
$msgId = 1

foreach ($line in $lines) {
    if ($line -match '^```') {
        if (!$inCode) {
            $inCode = $true
            $code = "$line`n"
        } else {
            $inCode = $false
            $code += $line
            if ($current) {
                $current.content += "`n`n$code"
                $current.hasCode = $true
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
    
    if ($t -match '^(USER|You):(.*)') {
        if ($current) {
            $current.id = $msgId
            $messages += $current
            $msgId++
        }
        $current = @{
            from='user'
            content=$matches[2].Trim()
            hasCode=$false
            hasImage=$false
        }
    }
    elseif ($t -match '^(AGENT|AI|Assistant):(.*)') {
        if ($current) {
            $current.id = $msgId
            $messages += $current
            $msgId++
        }
        $current = @{
            from='agent'
            content=$matches[2].Trim()
            hasCode=$false
             hasImage=$false
        }
    }
    elseif ($t -match 'Thought for (\d+)s') {
        if ($current) {
            $current.id = $msgId
            $messages += $current
            $msgId++
        }
        $current = @{
            from='agent'
            content=$t
            hasCode=$false
            hasImage=$false
            thought=$matches[1]
        }
    }
    elseif ($t -match 'User uploaded image (\d+)') {
        if ($current) {
            $current.hasImage = $true
            $current.content += "`n`n![Image $($matches[1])](attachments/img_$($matches[1]).png)"
        }
    }
    elseif ($t -and $current) {
        $current.content += "`n$t"
    }
}

if ($current) {
    $current.id = $msgId
    $messages += $current
}

Write-Host "Parsed: $($messages.Count) messages" -ForegroundColor Green

# Stats
$userCount = 0
$agentCount = 0
$codeCount = 0
$imageCount = 0

foreach ($m in $messages) {
    if ($m.from -eq 'user') { $userCount++ }
    else { $agentCount++ }
    if ($m.hasCode) { $codeCount++ }
    if ($m.hasImage) { $imageCount++ }
}

Write-Host "  User: $userCount, Agent: $agentCount" -ForegroundColor Gray
Write-Host "  Code: $codeCount, Images: $imageCount" -ForegroundColor Gray

# Build output
$output = "# Chat Conversation - Real Export`n`n"
$output += "**Exported**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
$output += "**Total Messages**: $($messages.Count)`n"
$output += "**Participants**: User ($userCount), Agent ($agentCount)`n"
$output += "**Contains**: Code blocks ($codeCount), Images ($imageCount)`n`n"
$output += "---`n`n"

foreach ($m in $messages) {
    $num = $m.id.ToString('000')
    $fromIcon = if ($m.from -eq 'user') { 'User' } else { 'Agent' }
    
    $output += "## Message $num`n"
    $output += "**From**: $fromIcon`n"
    
    if ($m.thought) {
        $output += "**Thinking**: $($m.thought)s`n"
    }
    
    if ($m.hasCode) {
        $output += "**Has**: Code`n"
    }
    
    if ($m.hasImage) {
        $output += "**Has**: Image`n"
    }
    
    $output += "`n$($m.content)`n`n"
    $output += "---`n`n"
}

$output += "`n_Exported with Chat Exporter V2_`n"

Set-Content -Path $OutputFile -Value $output -Encoding UTF8

Write-Host ""
Write-Host "SUCCESS!" -ForegroundColor Green
Write-Host "File: $OutputFile" -ForegroundColor Cyan
Write-Host "Size: $([Math]::Round((Get-Item $OutputFile).Length / 1KB, 2)) KB" -ForegroundColor White
Write-Host ""

# Return filename for verification
$OutputFile

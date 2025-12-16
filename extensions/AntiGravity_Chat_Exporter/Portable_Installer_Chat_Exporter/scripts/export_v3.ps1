# Chat Exporter V3 - Refined (PS 5.1 Compatible)
# All improvements, no emojis in code

Add-Type -AssemblyName System.Windows.Forms

$ExportDir = "C:\AntiGravityExt\AntiGravity_Ghost_Agent\Exports"
$OutputFile = Join-Path $ExportDir "Chat_Refined_v3_$(Get-Date -Format 'yyyyMMdd_HHmmss').md"

if (!(Test-Path $ExportDir)) {
    New-Item -Path $ExportDir -ItemType Directory -Force | Out-Null
}

Write-Host "====================================" -ForegroundColor Cyan
Write-Host " CHAT EXPORTER V3 - REFINED" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Read clipboard
Write-Host "[1/6] Reading clipboard..." -ForegroundColor Yellow
$clipboard = [System.Windows.Forms.Clipboard]::GetText()

if (!$clipboard -or $clipboard.Length -lt 100) {
    Write-Host "ERROR: Clipboard empty" -ForegroundColor Red
    exit 1
}

Write-Host "    Captured: $($clipboard.Length) chars" -ForegroundColor Green

# Parse
Write-Host "[2/6] Parsing with refinements..." -ForegroundColor Yellow

$lines = $clipboard -split "`n"
$messages = @()
$current = $null
$inCode = $false
$codeContent = ""
$codeLang = ""
$msgId = 1
$prevLineEmpty = $false
$filesMentioned = @{}
$keywords = @{}

foreach ($line in $lines) {
    # Code block WITH language
    if ($line -match '^```(\w*)') {
        if (!$inCode) {
            $inCode = $true
            $codeLang = if ($matches[1]) { $matches[1] } else { "" }
            $codeContent = ""
        } else {
            $inCode = $false
            if ($current) {
                $langTag = if ($codeLang) { $codeLang } else { "" }
                $current.content += "`n`n``````$langTag`n$codeContent``````"
                $current.hasCode = $true
                if ($codeLang) {
                    $current.codeLang = $codeLang
                }
            }
            $codeContent = ""
            $codeLang = ""
        }
        continue
    }
    
    if ($inCode) {
        $codeContent += "$line`n"
        continue
    }
    
    $trimmed = $line.Trim()
    
    # Extract timestamp
    $timestamp = $null
    if ($trimmed -match '^\[(\d{2}:\d{2}:\d{2})\](.*)') {
        $timestamp = $matches[1]
        $trimmed = $matches[2].Trim()
    }
    
    # Role detection
    if ($trimmed -match '^(USER|You):(.*)') {
        if ($current) {
            $current.id = $msgId
            $current.lineCount = ($current.content -split "`n").Length
            $current.charCount = $current.content.Length
            $messages += $current
            $msgId++
        }
        $current = @{
            from='user'
            content=$matches[2].Trim()
            timestamp=$timestamp
            hasCode=$false
            hasImage=$false
            codeLang=$null
            lineCount=0
            charCount=0
        }
        $prevLineEmpty = $false
    }
    elseif ($trimmed -match '^(AGENT|AI|Assistant):(.*)') {
        if ($current) {
            $current.id = $msgId
            $current.lineCount = ($current.content -split "`n").Length
            $current.charCount = $current.content.Length
            $messages += $current
            $msgId++
        }
        $current = @{
            from='agent'
            content=$matches[2].Trim()
            timestamp=$timestamp
            hasCode=$false
            hasImage=$false
            codeLang=$null
            lineCount=0
            charCount=0
        }
        $prevLineEmpty = $false
    }
    elseif ($trimmed -match '^Thought for (\d+)s') {
        if ($current) {
            $current.id = $msgId
            $current.lineCount = ($current.content -split "`n").Length
            $current.charCount = $current.content.Length
            $messages += $current
            $msgId++
        }
        $current = @{
            from='agent'
            content=$trimmed
            timestamp=$timestamp
            hasCode=$false
            hasImage=$false
            codeLang=$null
            thoughtTime=$matches[1]
            lineCount=0
            charCount=0
        }
        $prevLineEmpty = $false
    }
    elseif ($trimmed -match 'User uploaded image (\d+)') {
        if ($current) {
            $current.hasImage = $true
            $current.content += "`n`n![Image $($matches[1])](attachments/image_$($matches[1]).png)"
        }
        $prevLineEmpty = $false
    }
    elseif (!$trimmed) {
        $prevLineEmpty = $true
    }
    elseif ($trimmed -and $current) {
        # Paragraph preservation
        if ($prevLineEmpty) {
            $current.content += "`n`n$trimmed"
        } else {
            $current.content += "`n$trimmed"
        }
        $prevLineEmpty = $false
        
        # Extract file references
        if ($trimmed -match '([a-zA-Z0-9_]+\.(js|ps1|md|json|ahk|bat|py|txt))') {
            $fileName = $matches[1]
            if (!$filesMentioned.ContainsKey($fileName)) {
                $filesMentioned[$fileName] = @()
            }
            if (!$filesMentioned[$fileName].Contains($msgId)) {
                $filesMentioned[$fileName] += $msgId
            }
        }
        
        # Keywords
        $words = $trimmed -split '\s+' | Where-Object { $_.Length -gt 4 }
        foreach ($word in $words) {
            $clean = $word -replace '[^a-zA-Z0-9]', ''
            if ($clean.Length -gt 4) {
                if (!$keywords.ContainsKey($clean)) {
                    $keywords[$clean] = @()
                }
                if (!$keywords[$clean].Contains($msgId)) {
                    $keywords[$clean] += $msgId
                }
            }
        }
    }
}

if ($current) {
    $current.id = $msgId
    $current.lineCount = ($current.content -split "`n").Length
    $current.charCount = $current.content.Length
    $messages += $current
}

Write-Host "    Parsed: $($messages.Count) messages" -ForegroundColor Green

# Stats
Write-Host "[3/6] Calculating statistics..." -ForegroundColor Yellow

$userCount = ($messages | Where-Object { $_.from -eq 'user' }).Count
$agentCount = ($messages | Where-Object { $_.from -eq 'agent' }).Count
$codeCount = ($messages | Where-Object { $_.hasCode }).Count
$imageCount = ($messages | Where-Object { $_.hasImage }).Count
$totalLines = ($messages | Measure-Object -Property lineCount -Sum).Sum
$totalChars = ($messages | Measure-Object -Property charCount -Sum).Sum

$timestamps = $messages | Where-Object { $_.timestamp } | Select-Object -ExpandProperty timestamp
$firstTime = if ($timestamps.Count -gt 0) { $timestamps[0] } else { "Unknown" }
$lastTime = if ($timestamps.Count -gt 0) { $timestamps[-1] } else { "Unknown" }

Write-Host "   User: $userCount, Agent: $agentCount" -ForegroundColor Gray
Write-Host "    Code: $codeCount, Images: $imageCount" -ForegroundColor Gray

# Build output
Write-Host "[4/6] Generating export..." -ForegroundColor Yellow

$output = "# Chat Conversation - Refined Export V3`n`n"
$output += "<!-- METADATA START -->`n"
$output += "**Exported**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
$output += "**Total Messages**: $($messages.Count)`n"
$output += "**Participants**: User ($userCount), Agent ($agentCount)`n"
$output += "**Time Range**: $firstTime - $lastTime`n"
$output += "**Contains**: Code blocks ($codeCount), Images ($imageCount)`n"
$output += "**Volume**: $totalLines lines, $([Math]::Round($totalChars / 1000, 1))K chars`n"
$output += "<!-- METADATA END -->`n`n"
$output += "---`n`n"

# TOC
if ($messages.Count -gt 20) {
    $output += "## Quick Navigation`n`n"
    $jumpPoints = @(1, [Math]::Floor($messages.Count / 4), [Math]::Floor($messages.Count / 2), [Math]::Floor($messages.Count * 3 / 4), $messages.Count)
    $jumps = @()
    foreach ($pt in $jumpPoints) {
        $jumps += "[Msg $($pt.ToString('000'))](\#message-$($pt.ToString('000')))"
    }
    $output += ($jumps -join ' | ')
    $output += "`n`n---`n`n"
}

# Messages
foreach ($msg in $messages) {
    $num = $msg.id.ToString('000')
    $fromText = if ($msg.from -eq 'user') { 'User' } else { 'Agent' }
    
    $output += "## Message $num {#message-$num}`n"
    $output += "**From**: $fromText"
    
    if ($msg.timestamp) {
        $output += " | **Time**: $($msg.timestamp)"
    }
    
    $typeText = "text"
    if ($msg.hasCode) { $typeText += "+code" }
    if ($msg.hasImage) { $typeText += "+image" }
    $output += " | **Type**: $typeText"
    
    if ($msg.thoughtTime) {
        $output += " | **Thinking**: $($msg.thoughtTime)s"
    }
    
    if ($msg.codeLang) {
        $output += " | **Lang**: $($msg.codeLang)"
    }
    
    $output += " | **Size**: $($msg.charCount) chars`n`n"
    
    # Long message collapsible
    if ($msg.lineCount -gt 100) {
        $output += "<details>`n"
        $output += "<summary>Long message - Click to expand ($($msg.lineCount) lines)</summary>`n`n"
        $output += "$($msg.content)`n`n"
        $output += "</details>`n`n"
    } else {
        $output += "$($msg.content)`n`n"
    }
    
    $output += "---`n`n"
}

# Search Index
Write-Host "[5/6] Building index..." -ForegroundColor Yellow

$output += "`n## Search Index`n`n"

if ($filesMentioned.Count -gt 0) {
    $output += "### Files Mentioned`n`n"
    $sortedFiles = $filesMentioned.GetEnumerator() | Sort-Object Name
    foreach ($file in $sortedFiles) {
        $msgNums = ($file.Value | Sort-Object -Unique) -join ', '
        $output += "- **$($file.Key)**: Messages $msgNums`n"
    }
    $output += "`n"
}

if ($keywords.Count -gt 0) {
    $output += "### Top Keywords`n`n"
    $topKeywords = $keywords.GetEnumerator() | Sort-Object { $_.Value.Count } -Descending | Select-Object -First 15
    foreach ($kw in $topKeywords) {
        if ($kw.Value.Count -gt 1) {
            $msgNums = ($kw.Value | Sort-Object -Unique | Select-Object -First 5) -join ', '
            $more = if ($kw.Value.Count -gt 5) { " (+$($kw.Value.Count - 5))" } else { "" }
            $output += "- **$($kw.Key)**: $msgNums$more`n"
        }
    }
}

# Analytics
$output += "`n## Analytics Dashboard`n`n"
$output += "| Metric | Value |`n"
$output += "|--------|-------|`n"
$output += "| Total Messages | $($messages.Count) |`n"
$output += "| User Messages | $userCount |`n"
$output += "| Agent Messages | $agentCount |`n"
$output += "| Code Snippets | $codeCount |`n"
$output += "| Images | $imageCount |`n"
$output += "| Total Lines | $totalLines |`n"
$output += "| Total Chars | $([Math]::Round($totalChars / 1000, 1))K |`n"
$output += "| Avg Length | $([Math]::Round($totalChars / $messages.Count, 0)) chars/msg |`n"
$output += "| Files Mentioned | $($filesMentioned.Count) |`n"

$output += "`n---`n`n"
$output += "_Exported with Chat Exporter V3 - Refined_`n"

# Write
Set-Content -Path $OutputFile -Value $output -Encoding UTF8

Write-Host "[6/6] Complete!" -ForegroundColor Yellow
Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host " SUCCESS!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "File: $OutputFile" -ForegroundColor Cyan
Write-Host "Size: $([Math]::Round((Get-Item $OutputFile).Length / 1KB, 2)) KB" -ForegroundColor White
Write-Host ""

$OutputFile

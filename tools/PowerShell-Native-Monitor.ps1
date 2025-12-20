# Native PowerShell Chat Monitor
# SIN dependencias de Python - 100% PowerShell nativo
# Monitorea clipboard y UI de Antigravity

param(
    [int]$IntervalSeconds = 10,
    [string]$OutputFile = "C:\chat_captures\powershell_monitor.json"
)

# Funciones
function Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    $logMsg = "[$timestamp] $Message"
    Write-Host $logMsg
    Add-Content -Path "C:\chat_captures\powershell_monitor_log.txt" -Value $logMsg
}

function Get-ClipboardContent {
    try {
        return Get-Clipboard -ErrorAction SilentlyContinue
    } catch {
        return $null
    }
}

function Find-AntigravityWindow {
    $windows = @()
    
    Add-Type @"
        using System;
        using System.Runtime.InteropServices;
        using System.Text;
        
        public class WindowHelper {
            [DllImport("user32.dll")]
            public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);
            
            [DllImport("user32.dll")]
            public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
            
            [DllImport("user32.dll")]
            public static extern bool IsWindowVisible(IntPtr hWnd);
            
            public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
        }
"@
    
    try {
        $sb = New-Object System.Text.StringBuilder 256
        $callback = {
            param($hwnd, $lparam)
            if ([WindowHelper]::IsWindowVisible($hwnd)) {
                [WindowHelper]::GetWindowText($hwnd, $sb, 256) | Out-Null
                $title = $sb.ToString()
                if ($title -match "Antigravity") {
                    $script:windows += @{
                        Handle = $hwnd
                        Title = $title
                    }
                }
            }
            return $true
        }
        
        [WindowHelper]::EnumWindows($callback, [IntPtr]::Zero)
    } catch {
        Log "Error enumerando ventanas: $_"
    }
    
    return $windows
}

function Parse-ChatMessages {
    param([string]$Content)
    
    if (-not $Content) { return @() }
    
    $messages = @()
    $lines = $Content -split "`n"
    $currentMsg = @{
        role = "unknown"
        text = ""
    }
    
    foreach ($line in $lines) {
        $line = $line.Trim()
        if (-not $line) { continue }
        
        # Detectar rol
        if ($line -match "^(USER|You|👤|Usuario)" -or $line -match "^Pregunta:") {
            if ($currentMsg.text) {
                $messages += $currentMsg
            }
            $currentMsg = @{
                role = "user"
                text = $line
                timestamp = (Get-Date).ToString("o")
            }
        }
        elseif ($line -match "^(AGENT|AI|Assistant|🤖|Antigravity)" -or $line -match "^Respuesta:") {
            if ($currentMsg.text) {
                $messages += $currentMsg
            }
            $currentMsg = @{
                role = "assistant"
                text = $line
                timestamp = (Get-Date).ToString("o")
            }
        }
        else {
            # Continuar mensaje actual
            if ($currentMsg.text) {
                $currentMsg.text += "`n$line"
            } elseif ($line.Length -gt 10) {
                $currentMsg.text = $line
                $currentMsg.timestamp = (Get-Date).ToString("o")
            }
        }
    }
    
    if ($currentMsg.text) {
        $messages += $currentMsg
    }
    
    return $messages
}

function Save-Data {
    param([array]$Messages)
    
    $data = @{
        timestamp = (Get-Date).ToString("o")
        total_messages = $Messages.Count
        source = "PowerShell Native Monitor"
        messages = $Messages | Select-Object -Last 100
    }
    
    $data | ConvertTo-Json -Depth 10 | Set-Content -Path $OutputFile -Encoding UTF8
    Log "💾 Guardados $($Messages.Count) mensajes en $OutputFile"
}

# Main
Log "="*80
Log "🚀 PowerShell Native Chat Monitor - INICIADO"
Log "="*80
Log "📁 Output: $OutputFile"
Log "⏱️  Intervalo: ${IntervalSeconds}s"
Log "🎯 Modo: NATIVO (sin Python/deps)"
Log ""

# Crear directorio
$outputDir = Split-Path $OutputFile
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$allMessages = @()
$lastClipboardHash = ""
$iteration = 0

try {
    while ($true) {
        $iteration++
        Log "`n📡 Captura #$iteration"
        
        # Método 1: Leer clipboard
        $clipContent = Get-ClipboardContent
        
        if ($clipContent) {
            $currentHash = ($clipContent | Get-FileHash -Algorithm MD5 -InputStream ([System.IO.MemoryStream]::new([System.Text.Encoding]::UTF8.GetBytes($clipContent)))).Hash
            
            if ($currentHash -ne $lastClipboardHash) {
                Log "  ✨ Nuevo contenido en clipboard"
                
                # Parsear mensajes
                $newMessages = Parse-ChatMessages -Content $clipContent
                
                if ($newMessages.Count -gt 0) {
                    Log "  📝 $($newMessages.Count) mensajes parseados"
                    $allMessages += $newMessages
                    Save-Data -Messages $allMessages
                    $lastClipboardHash = $currentHash
                } else {
                    Log "  ℹ️ Clipboard sin mensajes detectables"
                }
            } else {
                Log "  ℹ️ Clipboard sin cambios"
            }
        } else {
            Log "  ⚠️ Clipboard vacío"
        }
        
        # Método 2: Detectar ventana Antigravity
        $windows = Find-AntigravityWindow
        if ($windows.Count -gt 0) {
            Log "  🎯 Ventana Antigravity detectada: $($windows[0].Title)"
        }
        
        # Esperar
        Log "⏳ Esperando ${IntervalSeconds}s..."
        Start-Sleep -Seconds $IntervalSeconds
    }
}
catch {
    Log "`n⏹️ Detenido: $_"
}
finally {
    if ($allMessages.Count -gt 0) {
        Save-Data -Messages $allMessages
    }
    Log "`n✅ PowerShell Monitor finalizado"
}

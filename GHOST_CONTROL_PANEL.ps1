# Ghost Agent Control Panel - Enhanced Modern UI v4.1
# Interfaz mejorada SIN emojis - solo texto ASCII seguro

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# =============================================================================
#  CONFIGURACIÓN GLOBAL Y COLORES
# =============================================================================

# IMPORTANTE: Usar rutas RELATIVAS para portabilidad
$global:ScriptDir = $PSScriptRoot
if ([string]::IsNullOrEmpty($global:ScriptDir)) {
    $global:ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}

$global:ConfigFile = Join-Path $global:ScriptDir "ghost_config.json"
$global:ExtensionPath = "$env:USERPROFILE\AppData\Local\Programs\AntiGravity\resources\app\extensions\antigravity-internal-hook"
$global:AllowlistPath = "$env:USERPROFILE\.gemini\antigravity\browserAllowlist.txt"
$global:LogBox = $null
$global:StatusBar = $null

# Color scheme moderno
$Colors = @{
    Primary = [System.Drawing.Color]::FromArgb(41, 128, 185)      # Azul
    Success = [System.Drawing.Color]::FromArgb(39, 174, 96)       # Verde
    Warning = [System.Drawing.Color]::FromArgb(243, 156, 18)      # Naranja
    Danger  = [System.Drawing.Color]::FromArgb(231, 76, 60)        # Rojo
    Info    = [System.Drawing.Color]::FromArgb(142, 68, 173)         # Morado
    Dark    = [System.Drawing.Color]::FromArgb(44, 62, 80)           # Oscuro
    Light   = [System.Drawing.Color]::FromArgb(236, 240, 241)       # Claro
    Purple  = [System.Drawing.Color]::FromArgb(155, 89, 182)       # Morado claro
}

# =============================================================================
#  FUNCIONES DE UTILIDAD
# =============================================================================

function Load-Config {
    if (Test-Path $global:ConfigFile) {
        return Get-Content $global:ConfigFile | ConvertFrom-Json
    }
    
    return @{
        AutoAcceptButtons = $true
        BrowserAllowlist  = $true
        PythonCore        = $false
        AutoUpdate        = $true
        ShowNotifications = $true
        AcceptTypes       = @{
            Allow       = $true
            Accept      = $true
            AcceptAll   = $true
            BlueButtons = $true
        }
        ExtensionEnabled  = $true
        Theme             = "Dark"
    } | ConvertTo-Json | ConvertFrom-Json
}

function Save-Config {
    param($Config)
    $Config | ConvertTo-Json -Depth 10 | Out-File $global:ConfigFile
}

function Write-Log {
    param(
        [string]$Message,
        [string]$Type = "INFO"
    )
    
    if ($global:LogBox) {
        $timestamp = Get-Date -Format "HH:mm:ss"
        $icon = switch ($Type) {
            "SUCCESS" { "[OK]" }
            "WARNING" { "[!]" }
            "ERROR" { "[X]" }
            "INFO" { "[i]" }
            default { "[-]" }
        }
        $global:LogBox.AppendText("[$timestamp] $icon $Message`r`n")
        $global:LogBox.SelectionStart = $global:LogBox.Text.Length
        $global:LogBox.ScrollToCaret()
    }
}

function Update-StatusBar {
    param([string]$Message)
    if ($global:StatusBar) {
        $global:StatusBar.Text = "  $Message"
    }
}

function Show-Confirmation {
    param(
        [string]$Title,
        [string]$Message
    )
    
    $result = [System.Windows.Forms.MessageBox]::Show(
        $Message,
        $Title,
        [System.Windows.Forms.MessageBoxButtons]::YesNo,
        [System.Windows.Forms.MessageBoxIcon]::Question
    )
    
    return $result -eq [System.Windows.Forms.DialogResult]::Yes
}

function Show-Notification {
    param(
        [string]$Title,
        [string]$Message,
        [string]$Type = "Info"
    )
    
    $icon = switch ($Type) {
        "Success" { [System.Windows.Forms.MessageBoxIcon]::Information }
        "Warning" { [System.Windows.Forms.MessageBoxIcon]::Warning }
        "Error" { [System.Windows.Forms.MessageBoxIcon]::Error }
        default { [System.Windows.Forms.MessageBoxIcon]::Information }
    }
    
    [System.Windows.Forms.MessageBox]::Show($Message, $Title, [System.Windows.Forms.MessageBoxButtons]::OK, $icon)
}

# =============================================================================
#  FUNCIONES DE CONTROL
# =============================================================================

function Get-ExtensionStatus {
    $installed = Test-Path "$global:ExtensionPath\extension.js"
    $paused = Test-Path "$global:ExtensionPath\extension.js.disabled"
    $allowlist = Test-Path $global:AllowlistPath
    $antigravityRunning = Get-Process -Name "Antigravity" -ErrorAction SilentlyContinue
    $pythonAvailable = $false
    
    try {
        python --version 2>&1 | Out-Null
        $pythonAvailable = ($LASTEXITCODE -eq 0)
    }
    catch {}
    
    return @{
        Installed          = $installed
        Paused             = $paused
        Allowlist          = $allowlist
        AntigravityRunning = ($null -ne $antigravityRunning)
        PythonAvailable    = $pythonAvailable
    }
}

function Install-GhostAgent {
    param($Config)
    
    Write-Log "Iniciando instalacion..." "INFO"
    Update-StatusBar "Instalando extension..."
    
    if (-not (Test-Path $global:ExtensionPath)) {
        New-Item -Path $global:ExtensionPath -ItemType Directory -Force | Out-Null
        New-Item -Path "$global:ExtensionPath\src" -ItemType Directory -Force | Out-Null
    }
    
    # Usar ruta relativa al script para encontrar archivos de extension
    $sourceExt = Join-Path $global:ScriptDir "extension"
    if (Test-Path "$sourceExt\extension.js") {
        Copy-Item "$sourceExt\extension.js" "$global:ExtensionPath\" -Force
        Copy-Item "$sourceExt\package.json" "$global:ExtensionPath\" -Force
        Copy-Item "$sourceExt\src\*.js" "$global:ExtensionPath\src\" -Force -ErrorAction SilentlyContinue
        Write-Log "Extension instalada correctamente" "SUCCESS"
    }
    else {
        Write-Log "Archivos de extension no encontrados en: $sourceExt" "ERROR"
        Update-StatusBar "Error: Archivos no encontrados"
        return $false
    }
    
    if ($Config.BrowserAllowlist) {
        Create-BrowserAllowlist
    }
    
    Write-Log "Instalacion completada exitosamente" "SUCCESS"
    Update-StatusBar "Instalacion completada"
    return $true
}

function Create-BrowserAllowlist {
    $allowlistDir = Split-Path $global:AllowlistPath -Parent
    if (-not (Test-Path $allowlistDir)) {
        New-Item -Path $allowlistDir -ItemType Directory -Force | Out-Null
    }
    
    @"
# MEGA BrowserAllowlist - Auto-generated by Ghost Agent Control Panel v4.1
# $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
*
*.*
*://*
http://*
https://*
localhost
localhost:*
*.localhost
127.0.0.1:*
192.168.*.*
*.com
*.net
*.org
*.io
*.dev
*.app
*.ai
*.cloud
*.github.io
*.vercel.app
*.netlify.app
"@ | Out-File $global:AllowlistPath -Encoding UTF8
    
    Write-Log "BrowserAllowlist creado con wildcards universales" "SUCCESS"
}

function Restart-AntigravityIDE {
    Write-Log "Iniciando reinicio de Antigravity IDE..." "INFO"
    Update-StatusBar "Reiniciando Antigravity..."
    
    try {
        $processes = Get-Process -Name "Antigravity" -ErrorAction SilentlyContinue
        
        if ($processes) {
            Write-Log "Antigravity detectado - cerrando proceso..." "INFO"
            $processes | ForEach-Object { 
                Write-Log "Cerrando PID: $($_.Id)" "INFO"
                $_.CloseMainWindow() | Out-Null 
            }
            Start-Sleep -Seconds 2
            
            $stillRunning = Get-Process -Name "Antigravity" -ErrorAction SilentlyContinue
            if ($stillRunning) {
                Write-Log "Proceso no cerro - forzando..." "WARNING"
                $stillRunning | Stop-Process -Force
                Write-Log "Proceso forzado a cerrar" "WARNING"
            }
            else {
                Write-Log "Proceso cerrado correctamente" "SUCCESS"
            }
            
            Start-Sleep -Seconds 1
        }
        else {
            Write-Log "Antigravity no estaba corriendo" "WARNING"
        }
        
        $antigravityPath = "$env:USERPROFILE\AppData\Local\Programs\AntiGravity\AntiGravity.exe"
        Write-Log "Buscando ejecutable en: $antigravityPath" "INFO"
        
        if (Test-Path $antigravityPath) {
            Write-Log "Ejecutable encontrado - iniciando..." "INFO"
            Start-Process $antigravityPath
            Start-Sleep -Seconds 2
            Write-Log "Antigravity reiniciado exitosamente" "SUCCESS"
            Update-StatusBar "IDE reiniciado correctamente"
        }
        else {
            Write-Log "ERROR: No se encontro Antigravity.exe" "ERROR"
            Write-Log "Ruta buscada: $antigravityPath" "ERROR"
            Update-StatusBar "Error: Antigravity.exe no encontrado"
            Show-Notification "Error" "No se encontro AntiGravity.exe en:`n$antigravityPath" "Error"
        }
    }
    catch {
        Write-Log "ERROR durante reinicio: $($_.Exception.Message)" "ERROR"
        Update-StatusBar "Error durante reinicio"
        Show-Notification "Error" "Error al reiniciar IDE: $($_.Exception.Message)" "Error"
    }
}

function Edit-Extension {
    $extFile = "$global:ExtensionPath\extension.js"
    if (Test-Path $extFile) {
        Start-Process "notepad.exe" $extFile
        Write-Log "Editor abierto: extension.js" "INFO"
        Update-StatusBar "Editor abierto"
    }
    else {
        Write-Log "Extension no instalada" "ERROR"
        Show-Notification "Error" "La extension no esta instalada. Instalala primero." "Error"
    }
}

function Toggle-Extension {
    param([bool]$Enable)
    
    $extFile = "$global:ExtensionPath\extension.js"
    $disabledPath = "$global:ExtensionPath\extension.js.disabled"
    
    if (-not (Test-Path $extFile) -and -not (Test-Path $disabledPath)) {
        Write-Log "Extension no instalada" "ERROR"
        return $false
    }
    
    if ($Enable) {
        if (Test-Path $disabledPath) {
            Move-Item $disabledPath $extFile -Force
            Write-Log "Extension activada (reinicia IDE para aplicar)" "SUCCESS"
            Update-StatusBar "Extension activada"
        }
        else {
            Write-Log "Extension ya esta activa" "INFO"
        }
    }
    else {
        if (Test-Path $extFile) {
            Move-Item $extFile $disabledPath -Force
            Write-Log "Extension pausada (reinicia IDE para aplicar)" "SUCCESS"
            Update-StatusBar "Extension pausada"
        }
        else {
            Write-Log "Extension ya esta pausada" "INFO"
        }
    }
    
    return $true
}

# =============================================================================
#  CREACIÓN DE LA INTERFAZ
# =============================================================================

$form = New-Object System.Windows.Forms.Form
$form.Text = "Ghost Agent Control Panel v4.1 - Enhanced"
$form.Size = New-Object System.Drawing.Size(850, 720)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.BackColor = $Colors.Light

# =============================================================================
#  HEADER
# =============================================================================

$headerPanel = New-Object System.Windows.Forms.Panel
$headerPanel.Size = New-Object System.Drawing.Size(830, 90)
$headerPanel.Location = New-Object System.Drawing.Point(10, 10)
$headerPanel.BackColor = $Colors.Dark
$form.Controls.Add($headerPanel)

$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Text = "GHOST AGENT CONTROL PANEL"
$titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
$titleLabel.ForeColor = [System.Drawing.Color]::White
$titleLabel.Location = New-Object System.Drawing.Point(20, 15)
$titleLabel.Size = New-Object System.Drawing.Size(600, 35)
$headerPanel.Controls.Add($titleLabel)

$subtitleLabel = New-Object System.Windows.Forms.Label
$subtitleLabel.Text = "Control total y personalizacion de la extension Auto-Accept"
$subtitleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$subtitleLabel.ForeColor = [System.Drawing.Color]::LightGray
$subtitleLabel.Location = New-Object System.Drawing.Point(20, 50)
$subtitleLabel.Size = New-Object System.Drawing.Size(500, 20)
$headerPanel.Controls.Add($subtitleLabel)

$versionLabel = New-Object System.Windows.Forms.Label
$versionLabel.Text = "v4.1"
$versionLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$versionLabel.ForeColor = $Colors.Primary
$versionLabel.Location = New-Object System.Drawing.Point(760, 15)
$versionLabel.Size = New-Object System.Drawing.Size(50, 25)
$headerPanel.Controls.Add($versionLabel)

# =============================================================================
#  TAB CONTROL
# =============================================================================

$tabControl = New-Object System.Windows.Forms.TabControl
$tabControl.Location = New-Object System.Drawing.Point(10, 110)
$tabControl.Size = New-Object System.Drawing.Size(830, 520)
$tabControl.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$form.Controls.Add($tabControl)

# =============================================================================
#  TAB 1: DASHBOARD
# =============================================================================

$tabDashboard = New-Object System.Windows.Forms.TabPage
$tabDashboard.Text = "  Dashboard  "
$tabDashboard.BackColor = $Colors.Light
$tabControl.Controls.Add($tabDashboard)

# Status Panel
$statusGroup = New-Object System.Windows.Forms.GroupBox
$statusGroup.Text = "Estado del Sistema"
$statusGroup.Location = New-Object System.Drawing.Point(15, 15)
$statusGroup.Size = New-Object System.Drawing.Size(380, 200)
$statusGroup.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$statusGroup.ForeColor = $Colors.Dark
$tabDashboard.Controls.Add($statusGroup)

$statusExtLabel = New-Object System.Windows.Forms.Label
$statusExtLabel.Text = "[?] Extension: Verificando..."
$statusExtLabel.Location = New-Object System.Drawing.Point(20, 35)
$statusExtLabel.Size = New-Object System.Drawing.Size(340, 30)
$statusExtLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$statusGroup.Controls.Add($statusExtLabel)

$statusAllowLabel = New-Object System.Windows.Forms.Label
$statusAllowLabel.Text = "[?] BrowserAllowlist: Verificando..."
$statusAllowLabel.Location = New-Object System.Drawing.Point(20, 70)
$statusAllowLabel.Size = New-Object System.Drawing.Size(340, 30)
$statusAllowLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$statusGroup.Controls.Add($statusAllowLabel)

$statusIDELabel = New-Object System.Windows.Forms.Label
$statusIDELabel.Text = "[?] Antigravity IDE: Verificando..."
$statusIDELabel.Location = New-Object System.Drawing.Point(20, 105)
$statusIDELabel.Size = New-Object System.Drawing.Size(340, 30)
$statusIDELabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$statusGroup.Controls.Add($statusIDELabel)

$statusPythonLabel = New-Object System.Windows.Forms.Label
$statusPythonLabel.Text = "[?] Python Runtime: Verificando..."
$statusPythonLabel.Location = New-Object System.Drawing.Point(20, 140)
$statusPythonLabel.Size = New-Object System.Drawing.Size(340, 30)
$statusPythonLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$statusGroup.Controls.Add($statusPythonLabel)

# Quick Actions Panel
$actionsGroup = New-Object System.Windows.Forms.GroupBox
$actionsGroup.Text = "Acciones Rapidas"
$actionsGroup.Location = New-Object System.Drawing.Point(410, 15)
$actionsGroup.Size = New-Object System.Drawing.Size(390, 290) # Aumentado altura
$actionsGroup.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$actionsGroup.ForeColor = $Colors.Dark
$tabDashboard.Controls.Add($actionsGroup)

function New-StyledButton {
    param(
        [string]$Text,
        [int]$X,
        [int]$Y,
        [int]$Width = 110,
        [int]$Height = 45,
        [System.Drawing.Color]$BackColor,
        [string]$Tooltip = ""
    )
    
    $btn = New-Object System.Windows.Forms.Button
    $btn.Text = $Text
    $btn.Location = New-Object System.Drawing.Point($X, $Y)
    $btn.Size = New-Object System.Drawing.Size($Width, $Height)
    $btn.BackColor = $BackColor
    $btn.ForeColor = [System.Drawing.Color]::White
    $btn.FlatStyle = "Flat"
    $btn.FlatAppearance.BorderSize = 0
    $btn.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $btn.Cursor = [System.Windows.Forms.Cursors]::Hand
    
    if ($Tooltip) {
        $tooltipObj = New-Object System.Windows.Forms.ToolTip
        $tooltipObj.SetToolTip($btn, $Tooltip)
    }
    
    return $btn
}

$btnPlay = New-StyledButton "ACTIVAR" 20 30 110 45 $Colors.Success "Habilita la extension Ghost Agent"
$actionsGroup.Controls.Add($btnPlay)

$btnPause = New-StyledButton "PAUSAR" 140 30 110 45 $Colors.Warning "Pausa temporalmente la extension"
$actionsGroup.Controls.Add($btnPause)

$btnEdit = New-StyledButton "EDITAR" 260 30 110 45 $Colors.Primary "Abre extension.js en editor"
$actionsGroup.Controls.Add($btnEdit)

$btnRestart = New-StyledButton "REINICIAR IDE" 20 85 165 45 $Colors.Purple "Cierra y reabre Antigravity"
$actionsGroup.Controls.Add($btnRestart)

$btnUpdate = New-StyledButton "ACTUALIZAR" 195 85 175 45 $Colors.Info "Actualiza la extension"
$actionsGroup.Controls.Add($btnUpdate)

# --- NUEVAS FUNCIONES REQUESTED ---

$btnEmergency = New-StyledButton "PARADA EMERGENCIA" 20 140 350 45 $Colors.Danger "KILL SWITCH: Detiene el agente inmediatamente"
$actionsGroup.Controls.Add($btnEmergency)

# Tools Quick Launch
$lblTools = New-Object System.Windows.Forms.Label
$lblTools.Text = "Tools Arsenal:"
$lblTools.Location = New-Object System.Drawing.Point(20, 200)
$lblTools.AutoSize = $true
$lblTools.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$actionsGroup.Controls.Add($lblTools)

$cmbTools = New-Object System.Windows.Forms.ComboBox
$cmbTools.Location = New-Object System.Drawing.Point(20, 220)
$cmbTools.Size = New-Object System.Drawing.Size(240, 30)
$cmbTools.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$cmbTools.DropDownStyle = "DropDownList"
$actionsGroup.Controls.Add($cmbTools)

# Popular Tools
$toolsPath = Join-Path $ScriptDir "tools"
if (Test-Path $toolsPath) {
    Get-ChildItem -Path $toolsPath -Directory | ForEach-Object { $cmbTools.Items.Add($_.Name) }
    Get-ChildItem -Path $toolsPath -Filter "*.bat" | ForEach-Object { $cmbTools.Items.Add($_.Name) }
    if ($cmbTools.Items.Count -gt 0) { $cmbTools.SelectedIndex = 0 }
}

$btnRunTool = New-StyledButton "EJECUTAR" 270 215 100 35 $Colors.Dark "Ejecuta la herramienta seleccionada"
$actionsGroup.Controls.Add($btnRunTool)

$btnUninstallSafe = New-StyledButton "Desinstalar Seguro" 20 255 350 30 [System.Drawing.Color]::Gray "Mueve a _DISABLED sin borrar datos"
$actionsGroup.Controls.Add($btnUninstallSafe)


# Log Panel
$logGroup = New-Object System.Windows.Forms.GroupBox
$logGroup.Text = "Log de Actividad en Tiempo Real"
$logGroup.Location = New-Object System.Drawing.Point(15, 315) # Bajado de 225 a 315
$logGroup.Size = New-Object System.Drawing.Size(790, 160) # Ajustada altura
$logGroup.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$logGroup.ForeColor = $Colors.Dark
$tabDashboard.Controls.Add($logGroup)

$logBox = New-Object System.Windows.Forms.TextBox
$logBox.Location = New-Object System.Drawing.Point(15, 30)
$logBox.Size = New-Object System.Drawing.Size(760, 115) # Ajustada altura interna
$logBox.Multiline = $true
$logBox.ScrollBars = "Vertical"
$logBox.ReadOnly = $true
$logBox.Font = New-Object System.Drawing.Font("Consolas", 9)
$logBox.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$logBox.ForeColor = [System.Drawing.Color]::LimeGreen
$logBox.BorderStyle = "FixedSingle"
$logGroup.Controls.Add($logBox)

$global:LogBox = $logBox

# =============================================================================
#  TAB 2: CONFIGURACIÓN
# =============================================================================

$tabConfig = New-Object System.Windows.Forms.TabPage
$tabConfig.Text = "  Configuracion  "
$tabConfig.BackColor = $Colors.Light
$tabControl.Controls.Add($tabConfig)

$configGroup = New-Object System.Windows.Forms.GroupBox
$configGroup.Text = "Features de la Extension"
$configGroup.Location = New-Object System.Drawing.Point(15, 15)
$configGroup.Size = New-Object System.Drawing.Size(790, 250)
$configGroup.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$configGroup.ForeColor = $Colors.Dark
$tabConfig.Controls.Add($configGroup)

$config = Load-Config

function New-StyledCheckbox {
    param(
        [string]$Text,
        [int]$Y,
        [bool]$Checked = $false,
        [string]$Tooltip = ""
    )
    
    $cb = New-Object System.Windows.Forms.CheckBox
    $cb.Text = $Text
    $cb.Location = New-Object System.Drawing.Point(30, $Y)
    $cb.Size = New-Object System.Drawing.Size(700, 30)
    $cb.Checked = $Checked
    $cb.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $cb.ForeColor = $Colors.Dark
    
    if ($Tooltip) {
        $tooltipObj = New-Object System.Windows.Forms.ToolTip
        $tooltipObj.SetToolTip($cb, $Tooltip)
    }
    
    return $cb
}

$cbAutoAccept = New-StyledCheckbox "[OK] Auto-Accept Buttons (Allow, Accept, Accept All, Blue Buttons)" 40 $config.AutoAcceptButtons "Acepta automaticamente botones de permisos"
$configGroup.Controls.Add($cbAutoAccept)

$cbBrowserList = New-StyledCheckbox "[WEB] MEGA BrowserAllowlist (permite TODOS los sitios web)" 80 $config.BrowserAllowlist "Crea allowlist universal con wildcards"
$configGroup.Controls.Add($cbBrowserList)

$cbPythonCore = New-StyledCheckbox "[PY] Python Core (automation avanzada con PyAutoGUI)" 120 $config.PythonCore "Instala ghost_agent.py para macros personalizados"
$configGroup.Controls.Add($cbPythonCore)

$cbAutoUpdate = New-StyledCheckbox "[AUTO] Auto-actualizar al inicio" 160 $config.AutoUpdate "Busca actualizaciones automaticamente"
$configGroup.Controls.Add($cbAutoUpdate)

$cbShowNotifications = New-StyledCheckbox "[BELL] Mostrar notificaciones" 200 $config.ShowNotifications "Muestra popups de confirmacion"
$configGroup.Controls.Add($cbShowNotifications)

# Botones de configuración
$btnSaveConfig = New-StyledButton "GUARDAR CONFIG" 30 280 180 50 $Colors.Dark "Guarda la configuracion para futuro"
$tabConfig.Controls.Add($btnSaveConfig)

$btnApplyConfig = New-StyledButton "GUARDAR Y APLICAR" 220 280 200 50 $Colors.Success "Guarda y aplica inmediatamente"
$tabConfig.Controls.Add($btnApplyConfig)

$btnResetConfig = New-StyledButton "RESTAURAR DEFAULT" 430 280 180 50 $Colors.Danger "Restaura configuracion de fabrica"
$tabConfig.Controls.Add($btnResetConfig)

# Preview
$previewGroup = New-Object System.Windows.Forms.GroupBox
$previewGroup.Text = "Vista Previa de Configuracion"
$previewGroup.Location = New-Object System.Drawing.Point(15, 345)
$previewGroup.Size = New-Object System.Drawing.Size(790, 130)
$previewGroup.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$previewGroup.ForeColor = $Colors.Dark
$tabConfig.Controls.Add($previewGroup)

$previewBox = New-Object System.Windows.Forms.TextBox
$previewBox.Location = New-Object System.Drawing.Point(15, 30)
$previewBox.Size = New-Object System.Drawing.Size(760, 85)
$previewBox.Multiline = $true
$previewBox.ScrollBars = "Vertical"
$previewBox.ReadOnly = $true
$previewBox.Font = New-Object System.Drawing.Font("Consolas", 8)
$previewBox.BackColor = [System.Drawing.Color]::White
$previewBox.BorderStyle = "FixedSingle"
$previewGroup.Controls.Add($previewBox)

# =============================================================================
#  TAB 3: AYUDA
# =============================================================================

$tabHelp = New-Object System.Windows.Forms.TabPage
$tabHelp.Text = "  Ayuda  "
$tabHelp.BackColor = $Colors.Light
$tabControl.Controls.Add($tabHelp)

$helpText = @"
GHOST AGENT CONTROL PANEL v4.1 - GUIA RAPIDA

===============================================================

DASHBOARD
- Ver estado del sistema en tiempo real
- Acciones rapidas: Activar/Pausar/Editar/Reiniciar/Actualizar
- Log de actividad con timestamps

CONFIGURACION
- Personaliza que features instalar
- Guarda configuracion para reutilizar
- Vista previa antes de aplicar

AYUDA
- Esta pagina con informacion de uso

===============================================================

CASOS DE USO COMUNES:

1. PRIMERA INSTALACION:
   - Ir a Configuracion
   - Marcar: Auto-Accept + BrowserAllowlist
   - Click "GUARDAR Y APLICAR"
   - Click "REINICIAR IDE" en Dashboard

2. PAUSAR TEMPORALMENTE:
   - Dashboard -> Click "PAUSAR"
   - Click "REINICIAR IDE"
   - Cuando quieras reactivar: "ACTIVAR" + "REINICIAR IDE"

3. EDITAR COMPORTAMIENTO:
   - Dashboard -> Click "EDITAR"
   - Modificar extension.js
   - Guardar archivo
   - Dashboard -> Click "ACTUALIZAR" (opcional)
   - Click "REINICIAR IDE"

===============================================================

TIPS:

- Los cambios requieren reiniciar Antigravity IDE
- Usa "PAUSAR" en sitios sensibles (banking, etc.)
- El log muestra todo lo que pasa
- Guarda config antes de cerrar

===============================================================

ARCHIVOS IMPORTANTES:

Extension:
  %USERPROFILE%\AppData\Local\Programs\AntiGravity\resources\app\
  extensions\antigravity-internal-hook\extension.js

BrowserAllowlist:
  %USERPROFILE%\.gemini\antigravity\browserAllowlist.txt

Configuracion:
  C:\AntiGravityExt\AntiGravity_Ghost_Agent\ghost_config.json

===============================================================

NECESITAS MAS AYUDA?

Ver documentacion completa:
  C:\AntiGravityExt\GHOST_PANEL_GUIDE.md

===============================================================
"@

$helpBox = New-Object System.Windows.Forms.TextBox
$helpBox.Location = New-Object System.Drawing.Point(15, 15)
$helpBox.Size = New-Object System.Drawing.Size(790, 460)
$helpBox.Multiline = $true
$helpBox.ScrollBars = "Vertical"
$helpBox.ReadOnly = $true
$helpBox.Font = New-Object System.Drawing.Font("Consolas", 9)
$helpBox.Text = $helpText
$helpBox.BackColor = [System.Drawing.Color]::White
$helpBox.BorderStyle = "FixedSingle"
$tabHelp.Controls.Add($helpBox)

# =============================================================================
#  STATUS BAR INFERIOR
# =============================================================================

$statusBar = New-Object System.Windows.Forms.StatusStrip
$statusBar.BackColor = $Colors.Dark
$statusBar.Font = New-Object System.Drawing.Font("Segoe UI", 9)

# IMPORTANTE: Agregar StatusBar al form PRIMERO
[void]$form.Controls.Add($statusBar)

$statusLabel = New-Object System.Windows.Forms.ToolStripStatusLabel
$statusLabel.Text = "  Listo"
$statusLabel.ForeColor = [System.Drawing.Color]::LightGray
$statusLabel.Spring = $true
$statusLabel.TextAlign = [System.Drawing.ContentAlignment]::MiddleLeft
[void]$statusBar.Items.Add($statusLabel)

$global:StatusBar = $statusLabel

# =============================================================================
#  EVENT HANDLERS
# =============================================================================

function Update-Status {
    $status = Get-ExtensionStatus
    
    if ($status.Installed) {
        $statusExtLabel.Text = "[OK] Extension: Instalada y ACTIVA"
        $statusExtLabel.ForeColor = $Colors.Success
    }
    elseif ($status.Paused) {
        $statusExtLabel.Text = "[PAUSED] Extension: Instalada pero PAUSADA"
        $statusExtLabel.ForeColor = $Colors.Warning
    }
    else {
        $statusExtLabel.Text = "[X] Extension: NO instalada"
        $statusExtLabel.ForeColor = $Colors.Danger
    }
    
    if ($status.Allowlist) {
        $statusAllowLabel.Text = "[OK] BrowserAllowlist: Configurado"
        $statusAllowLabel.ForeColor = $Colors.Success
    }
    else {
        $statusAllowLabel.Text = "[!] BrowserAllowlist: No configurado"
        $statusAllowLabel.ForeColor = $Colors.Warning
    }
    
    if ($status.AntigravityRunning) {
        $statusIDELabel.Text = "[OK] Antigravity IDE: Corriendo"
        $statusIDELabel.ForeColor = $Colors.Success
    }
    else {
        $statusIDELabel.Text = "[ ] Antigravity IDE: Detenido"
        $statusIDELabel.ForeColor = $Colors.Warning
    }

    if ($status.PythonAvailable) {
        $statusPythonLabel.Text = "[OK] Python Runtime: Disponible"
        $statusPythonLabel.ForeColor = $Colors.Success
    }
    else {
        $statusPythonLabel.Text = "[!] Python Runtime: No disponible (opcional)"
        $statusPythonLabel.ForeColor = $Colors.Warning
    }
    
    Update-StatusBar "Estado actualizado"
}

function Update-ConfigPreview {
    $cfg = @{
        AutoAcceptButtons = $cbAutoAccept.Checked
        BrowserAllowlist  = $cbBrowserList.Checked
        PythonCore        = $cbPythonCore.Checked
        AutoUpdate        = $cbAutoUpdate.Checked
        ShowNotifications = $cbShowNotifications.Checked
    } | ConvertTo-Json -Depth 10
    
    $previewBox.Text = $cfg
}

$btnPlay.Add_Click({
        if (Show-Confirmation "Activar Extension" "Activar la extension Ghost Agent?`n`nRequiere reiniciar Antigravity IDE para aplicar.") {
            $cfg = Load-Config
            $cfg.ExtensionEnabled = $true
            Save-Config $cfg
            Toggle-Extension -Enable $true
            Update-Status
        }
    })

$btnPause.Add_Click({
        if (Show-Confirmation "Pausar Extension" "Pausar la extension Ghost Agent?`n`nRequiere reiniciar Antigravity IDE para aplicar.") {
            $cfg = Load-Config
            $cfg.ExtensionEnabled = $false
            Save-Config $cfg
            Toggle-Extension -Enable $false
            Update-Status
        }
    })

$btnEdit.Add_Click({
        Edit-Extension
    })

$btnRestart.Add_Click({
        if (Show-Confirmation "Reiniciar IDE" "Cerrar y reiniciar Antigravity IDE?`n`nGuarda tu trabajo antes de continuar.") {
            Restart-AntigravityIDE
            Start-Sleep -Seconds 3
            Update-Status
        }
    })

$btnUpdate.Add_Click({
        if (Show-Confirmation "Actualizar Extension" "Actualizar la extension a la ultima version del codigo?") {
            Write-Log "Actualizando extension..." "INFO"
            $cfg = Load-Config
            Install-GhostAgent -Config $cfg
            Update-Status
            Show-Notification "Actualizacion Completada" "Extension actualizada. Reinicia IDE para aplicar." "Success"
        }
    })

$btnEmergency.Add_Click({
        if (Show-Confirmation "PARADA DE EMERGENCIA" "ESTO DETENDRA AL AGENTE INMEDIATAMENTE.\n\n¿Continuar?") {
            Write-Log "EJECUTANDO PARADA DE EMERGENCIA..." "WARNING"
            if (Test-Path "$ScriptDir\EMERGENCY_STOP.bat") {
                Start-Process -FilePath "$ScriptDir\EMERGENCY_STOP.bat" -Wait
                Write-Log "AGENTE NEUTRALIZADO." "SUCCESS"
                Show-Notification "Emergency Stop" "Agente detenido correctamente." "Warning"
                Update-Status
            }
            else {
                Write-Log "Error: No se encuentra EMERGENCY_STOP.bat" "ERROR"
            }
        }
    })

$btnRunTool.Add_Click({
        $selected = $cmbTools.SelectedItem
        if ($selected) {
            $targetPath = Join-Path $toolsPath $selected
            Write-Log "Ejecutando herramienta: $selected" "INFO"
        
            if (Test-Path $targetPath -PathType Container) {
                Invoke-Item $targetPath
            }
            else {
                Start-Process $targetPath
            }
        }
    })

$btnUninstallSafe.Add_Click({
        if (Show-Confirmation "Desinstalacion Segura" "¿Mover extension a cuarentena (_DISABLED)?\nNo se borraran tus archivos.") {
            Write-Log "Iniciando desinstalacion segura..." "INFO"
            if (Test-Path "$ScriptDir\UNINSTALL.bat") {
                Start-Process -FilePath "$ScriptDir\UNINSTALL.bat" -Wait
                Write-Log "Extension movida a _DISABLED" "SUCCESS"
                Update-Status
            }
            else {
                Write-Log "Error: No se encuentra UNINSTALL.bat" "ERROR"
            }
        }
    })

$btnSaveConfig.Add_Click({
        $cfg = @{
            AutoAcceptButtons = $cbAutoAccept.Checked
            BrowserAllowlist  = $cbBrowserList.Checked
            PythonCore        = $cbPythonCore.Checked
            AutoUpdate        = $cbAutoUpdate.Checked
            ShowNotifications = $cbShowNotifications.Checked
            AcceptTypes       = @{
                Allow       = $true
                Accept      = $true
                AcceptAll   = $true
                BlueButtons = $true
            }
            ExtensionEnabled  = (Load-Config).ExtensionEnabled
            Theme             = "Dark"
        } | ConvertTo-Json | ConvertFrom-Json
    
        Save-Config $cfg
        Write-Log "Configuracion guardada correctamente" "SUCCESS"
        Show-Notification "Guardado" "Configuracion guardada exitosamente." "Success"
    })

$btnApplyConfig.Add_Click({
        if (Show-Confirmation "Aplicar Configuracion" "Guardar y aplicar la configuracion ahora?`n`nEsto reinstalara la extension.") {
            $btnSaveConfig.PerformClick()
            $cfg = Load-Config
            Install-GhostAgent -Config $cfg
            Update-Status
            Show-Notification "Aplicado" "Configuracion aplicada. Reinicia IDE para ver cambios." "Success"
        }
    })

$btnResetConfig.Add_Click({
        if (Show-Confirmation "Restaurar Default" "Restaurar configuracion de fabrica?`n`nEsto sobrescribira tu configuracion actual.") {
            $defaultConfig = @{
                AutoAcceptButtons = $true
                BrowserAllowlist  = $true
                PythonCore        = $false
                AutoUpdate        = $true
                ShowNotifications = $true
                AcceptTypes       = @{
                    Allow       = $true
                    Accept      = $true
                    AcceptAll   = $true
                    BlueButtons = $true
                }
                ExtensionEnabled  = $true
                Theme             = "Dark"
            } | ConvertTo-Json | ConvertFrom-Json
        
            Save-Config $defaultConfig
        
            $cbAutoAccept.Checked = $true
            $cbBrowserList.Checked = $true
            $cbPythonCore.Checked = $false
            $cbAutoUpdate.Checked = $true
            $cbShowNotifications.Checked = $true
        
            Write-Log "Configuracion restaurada a valores por defecto" "SUCCESS"
            Show-Notification "Restaurado" "Configuracion restaurada a valores default." "Success"
        }
    })

$cbAutoAccept.Add_CheckedChanged({ Update-ConfigPreview })
$cbBrowserList.Add_CheckedChanged({ Update-ConfigPreview })
$cbPythonCore.Add_CheckedChanged({ Update-ConfigPreview })
$cbAutoUpdate.Add_CheckedChanged({ Update-ConfigPreview })
$cbShowNotifications.Add_CheckedChanged({ Update-ConfigPreview })

# =============================================================================
#  INITIALIZATION
# =============================================================================

Write-Log "Ghost Agent Control Panel v4.1 Enhanced iniciado" "INFO"
Write-Log "Sistema de control mejorado con interfaz moderna" "INFO"
Update-Status
Update-ConfigPreview
Write-Log "Listo para usar" "SUCCESS"
Update-StatusBar "Sistema listo"

[void]$form.ShowDialog()

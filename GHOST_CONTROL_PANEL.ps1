# GHOST CONTROL PANEL v7.2 - RESTORED & STABLE
# ASCII UI - No Tabs (Revert to Classic Layout) - Robust Logic

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# --- CONFIGURACION ---
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$UserHome = $env:USERPROFILE
$ExtPath = "$UserHome\AppData\Local\Programs\AntiGravity\resources\app\extensions\antigravity-internal-hook"

# --- FUNCIONES ---
function Update-Status {
    $isInstalled = Test-Path "$ExtPath\extension.js"
    $isPaused = Test-Path "$ExtPath\extension.js.disabled" # Legacy Pause
    $isKilled = Test-Path "$ExtPath\extension.js.KILLED" # New Emergency Kill
    $isAllowlist = Test-Path "$UserHome\.gemini\antigravity\browserAllowlist.txt"

    if ($isInstalled) {
        $lblStatusExt.Text = "[OK] Extension: ACTIVA"
        $lblStatusExt.ForeColor = [System.Drawing.Color]::DarkGreen
    } elseif ($isPaused) {
        $lblStatusExt.Text = "[PAUSED] Extension: Pausada"
        $lblStatusExt.ForeColor = [System.Drawing.Color]::Orange
    } elseif ($isKilled) {
        $lblStatusExt.Text = "[KILLED] Extension: DETENIDA (Emergencia)"
        $lblStatusExt.ForeColor = [System.Drawing.Color]::Red
    } else {
        $lblStatusExt.Text = "[X] Extension: NO INSTALADA"
        $lblStatusExt.ForeColor = [System.Drawing.Color]::Gray
    }

    if ($isAllowlist) {
        $lblStatusAllow.Text = "[OK] Allowlist: Configurada"
        $lblStatusAllow.ForeColor = [System.Drawing.Color]::DarkGreen
    } else {
        $lblStatusAllow.Text = "[!] Allowlist: Faltante"
        $lblStatusAllow.ForeColor = [System.Drawing.Color]::Red
    }
}

# --- GUI ---
$form = New-Object System.Windows.Forms.Form
$form.Text = "GHOST AGENT v7.2 - CONTROL PANEL"
$form.Size = New-Object System.Drawing.Size(550, 500)
$form.StartPosition = "CenterScreen"
$form.BackColor = [System.Drawing.Color]::WhiteSmoke

# Header
$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "GHOST AGENT OPERATOR"
$lblTitle.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$lblTitle.Location = New-Object System.Drawing.Point(20, 20)
$lblTitle.AutoSize = $true
$form.Controls.Add($lblTitle)

# Status Section (Panel Superior)
$pnlStatus = New-Object System.Windows.Forms.Panel
$pnlStatus.Location = New-Object System.Drawing.Point(20, 60)
$pnlStatus.Size = New-Object System.Drawing.Size(500, 80)
$pnlStatus.BackColor = [System.Drawing.Color]::White
$pnlStatus.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
$form.Controls.Add($pnlStatus)

$lblStatusExt = New-Object System.Windows.Forms.Label
$lblStatusExt.Location = New-Object System.Drawing.Point(10, 15)
$lblStatusExt.AutoSize = $true
$lblStatusExt.Font = New-Object System.Drawing.Font("Consolas", 11, [System.Drawing.FontStyle]::Bold)
$pnlStatus.Controls.Add($lblStatusExt)

$lblStatusAllow = New-Object System.Windows.Forms.Label
$lblStatusAllow.Location = New-Object System.Drawing.Point(10, 45)
$lblStatusAllow.AutoSize = $true
$lblStatusAllow.Font = New-Object System.Drawing.Font("Consolas", 11)
$pnlStatus.Controls.Add($lblStatusAllow)

# Main Actions (Botones Grandes)
$grpActions = New-Object System.Windows.Forms.GroupBox
$grpActions.Text = "CONTROLES PRINCIPALES"
$grpActions.Location = New-Object System.Drawing.Point(20, 150)
$grpActions.Size = New-Object System.Drawing.Size(500, 100)
$form.Controls.Add($grpActions)

$btnEmergency = New-Object System.Windows.Forms.Button
$btnEmergency.Text = "PARADA DE EMERGENCIA"
$btnEmergency.Location = New-Object System.Drawing.Point(260, 30)
$btnEmergency.Size = New-Object System.Drawing.Size(220, 50)
$btnEmergency.BackColor = [System.Drawing.Color]::Red
$btnEmergency.ForeColor = [System.Drawing.Color]::White
$btnEmergency.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$grpActions.Controls.Add($btnEmergency)

$btnRestore = New-Object System.Windows.Forms.Button
$btnRestore.Text = "RESTAURAR / INSTALAR"
$btnRestore.Location = New-Object System.Drawing.Point(20, 30)
$btnRestore.Size = New-Object System.Drawing.Size(220, 50)
$btnRestore.BackColor = [System.Drawing.Color]::LightGreen
$grpActions.Controls.Add($btnRestore)

# Tools Section (Lista Simple Abajo)
$grpTools = New-Object System.Windows.Forms.GroupBox
$grpTools.Text = "HERRAMIENTAS"
$grpTools.Location = New-Object System.Drawing.Point(20, 260)
$grpTools.Size = New-Object System.Drawing.Size(500, 150)
$form.Controls.Add($grpTools)

$lstTools = New-Object System.Windows.Forms.ComboBox # Dropdown es mas limpio
$lstTools.Location = New-Object System.Drawing.Point(20, 30)
$lstTools.Size = New-Object System.Drawing.Size(300, 30)
$grpTools.Controls.Add($lstTools)

$btnRunTool = New-Object System.Windows.Forms.Button
$btnRunTool.Text = "EJECUTAR"
$btnRunTool.Location = New-Object System.Drawing.Point(340, 28)
$btnRunTool.Size = New-Object System.Drawing.Size(140, 30)
$grpTools.Controls.Add($btnRunTool)

$btnAllow = New-Object System.Windows.Forms.Button
$btnAllow.Text = "Forzar Allowlist"
$btnAllow.Location = New-Object System.Drawing.Point(20, 80)
$btnAllow.Size = New-Object System.Drawing.Size(150, 30)
$grpTools.Controls.Add($btnAllow)

$btnUninstall = New-Object System.Windows.Forms.Button
$btnUninstall.Text = "Desinstalar (Seguro)"
$btnUninstall.Location = New-Object System.Drawing.Point(180, 80)
$btnUninstall.Size = New-Object System.Drawing.Size(150, 30)
$grpTools.Controls.Add($btnUninstall)

# --- TOOLS LOGIC ---
$toolsPath = Join-Path $ScriptDir "tools"
if (Test-Path $toolsPath) {
    Get-ChildItem -Path $toolsPath -Directory | ForEach-Object { $lstTools.Items.Add($_.Name) }
    Get-ChildItem -Path $toolsPath -Filter "*.bat" | ForEach-Object { $lstTools.Items.Add($_.Name) }
    if ($lstTools.Items.Count -gt 0) { $lstTools.SelectedIndex = 0 }
}

# --- EVENT HANDLERS ---
$btnEmergency.Add_Click({
    if (Test-Path "$ScriptDir\EMERGENCY_STOP.bat") {
        Start-Process -FilePath "$ScriptDir\EMERGENCY_STOP.bat" -Wait
        [System.Windows.Forms.MessageBox]::Show("AGENTE DETENIDO.")
        Update-Status
    }
})

$btnRestore.Add_Click({
    if (Test-Path "$ScriptDir\INSTALL.bat") {
        Start-Process -FilePath "$ScriptDir\INSTALL.bat" -Wait
        [System.Windows.Forms.MessageBox]::Show("Sistema Restaurado.")
        Update-Status
    }
})

$btnRunTool.Add_Click({
    $selected = $lstTools.SelectedItem
    if ($selected) {
        $targetPath = Join-Path $toolsPath $selected
        Invoke-Item $targetPath
    }
})

$btnAllow.Add_Click({
         # Regenerar Allowlist
         $allowDir = "$UserHome\.gemini\antigravity"
         mkdir $allowDir 2>NUL
         "*`r`n*.*`r`n*://*`r`nhttp://*`r`nhttps://*" | Out-File "$allowDir\browserAllowlist.txt" -Encoding ascii
         [System.Windows.Forms.MessageBox]::Show("Allowlist regenerada.")
         Update-Status
})

$btnUninstall.Add_Click({
    if (Test-Path "$ScriptDir\UNINSTALL.bat") {
        Start-Process -FilePath "$ScriptDir\UNINSTALL.bat" -Wait
        Update-Status
    }
})

Update-Status
$form.ShowDialog()

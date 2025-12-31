# GHOST CONTROL PANEL v7.0 - Production Ready
# ASCII UI - Relative Paths - No Emojis

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# --- CONFIGURACION ---
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$UserHome = $env:USERPROFILE
$ExtPath = "$UserHome\AppData\Local\Programs\AntiGravity\resources\app\extensions\antigravity-internal-hook"

# --- FUNCIONES ---
function Update-Status {
    $isInstalled = Test-Path "$ExtPath\extension.js"
    $isPaused = Test-Path "$ExtPath\extension.js.disabled"
    $isAllowlist = Test-Path "$UserHome\.gemini\antigravity\browserAllowlist.txt"

    if ($isInstalled) {
        if ($isPaused) {
            $lblStatusExt.Text = "[PAUSED] Extension: Instalada (Pausada)"
            $lblStatusExt.ForeColor = [System.Drawing.Color]::Orange
        }
        else {
            $lblStatusExt.Text = "[OK] Extension: ACTIVA"
            $lblStatusExt.ForeColor = [System.Drawing.Color]::DarkGreen
        }
    }
    else {
        $lblStatusExt.Text = "[X] Extension: NO INSTALADA"
        $lblStatusExt.ForeColor = [System.Drawing.Color]::Red
    }

    if ($isAllowlist) {
        $lblStatusAllow.Text = "[OK] Allowlist: Configurada"
        $lblStatusAllow.ForeColor = [System.Drawing.Color]::DarkGreen
    }
    else {
        $lblStatusAllow.Text = "[!] Allowlist: Faltante"
        $lblStatusAllow.ForeColor = [System.Drawing.Color]::Red
    }
}

# --- GUI ---
$form = New-Object System.Windows.Forms.Form
$form.Text = "GHOST AGENT v7.0 - CONTROL PANEL"
$form.Size = New-Object System.Drawing.Size(500, 450)
$form.StartPosition = "CenterScreen"
$form.BackColor = [System.Drawing.Color]::WhiteSmoke

# Header
$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "GHOST AGENT v7.0"
$lblTitle.Font = New-Object System.Drawing.Font("Consolas", 16, [System.Drawing.FontStyle]::Bold)
$lblTitle.Location = New-Object System.Drawing.Point(20, 20)
$lblTitle.AutoSize = $true
$form.Controls.Add($lblTitle)

# Status Section
$grpStatus = New-Object System.Windows.Forms.GroupBox
$grpStatus.Text = "ESTADO DEL SISTEMA"
$grpStatus.Location = New-Object System.Drawing.Point(20, 60)
$grpStatus.Size = New-Object System.Drawing.Size(440, 100)
$form.Controls.Add($grpStatus)

$lblStatusExt = New-Object System.Windows.Forms.Label
$lblStatusExt.Location = New-Object System.Drawing.Point(20, 30)
$lblStatusExt.AutoSize = $true
$lblStatusExt.Font = New-Object System.Drawing.Font("Consolas", 10)
$grpStatus.Controls.Add($lblStatusExt)

$lblStatusAllow = New-Object System.Windows.Forms.Label
$lblStatusAllow.Location = New-Object System.Drawing.Point(20, 60)
$lblStatusAllow.AutoSize = $true
$lblStatusAllow.Font = New-Object System.Drawing.Font("Consolas", 10)
$grpStatus.Controls.Add($lblStatusAllow)

# Actions Section
$grpActions = New-Object System.Windows.Forms.GroupBox
$grpActions.Text = "ACCIONES"
$grpActions.Location = New-Object System.Drawing.Point(20, 180)
$grpActions.Size = New-Object System.Drawing.Size(440, 150)
$form.Controls.Add($grpActions)

$btnInstall = New-Object System.Windows.Forms.Button
$btnInstall.Text = "REINSTALAR TODO"
$btnInstall.Location = New-Object System.Drawing.Point(20, 30)
$btnInstall.Size = New-Object System.Drawing.Size(190, 40)
$btnInstall.BackColor = [System.Drawing.Color]::LightGreen
$grpActions.Controls.Add($btnInstall)

$btnToggle = New-Object System.Windows.Forms.Button
$btnToggle.Text = "PAUSAR / REANUDAR"
$btnToggle.Location = New-Object System.Drawing.Point(230, 30)
$btnToggle.Size = New-Object System.Drawing.Size(190, 40)
$btnToggle.BackColor = [System.Drawing.Color]::LightYellow
$grpActions.Controls.Add($btnToggle)

$btnAllow = New-Object System.Windows.Forms.Button
$btnAllow.Text = "APLICAR ALLOWLIST"
$btnAllow.Location = New-Object System.Drawing.Point(20, 90)
$btnAllow.Size = New-Object System.Drawing.Size(190, 40)
$btnAllow.BackColor = [System.Drawing.Color]::LightBlue
$grpActions.Controls.Add($btnAllow)

$btnUninstall = New-Object System.Windows.Forms.Button
$btnUninstall.Text = "DESINSTALAR"
$btnUninstall.Location = New-Object System.Drawing.Point(230, 90)
$btnUninstall.Size = New-Object System.Drawing.Size(190, 40)
$btnUninstall.BackColor = [System.Drawing.Color]::Salmon
$grpActions.Controls.Add($btnUninstall)

# Footer
$lblFooter = New-Object System.Windows.Forms.Label
$lblFooter.Text = "Requiere reiniciar Antigravity para aplicar cambios."
$lblFooter.Location = New-Object System.Drawing.Point(20, 350)
$lblFooter.AutoSize = $true
$lblFooter.ForeColor = [System.Drawing.Color]::Gray
$form.Controls.Add($lblFooter)

# --- EVENT HANDLERS ---
$btnInstall.Add_Click({
        if ([System.Windows.Forms.MessageBox]::Show("¿Reinstalar extension y allowlist?", "Confirmar", "YesNo") -eq "Yes") {
            if (Test-Path "$ScriptDir\INSTALL.bat") {
                Start-Process -FilePath "$ScriptDir\INSTALL.bat" -Wait
                [System.Windows.Forms.MessageBox]::Show("Instalacion completada. Reinicia el IDE.")
                Update-Status
            }
            else {
                [System.Windows.Forms.MessageBox]::Show("Error: No se encuentra INSTALL.bat")
            }
        }
    })

$btnToggle.Add_Click({
        if (Test-Path "$ExtPath\extension.js") {
            Move-Item "$ExtPath\extension.js" "$ExtPath\extension.js.disabled" -Force
            [System.Windows.Forms.MessageBox]::Show("Extension PAUSADA. Reinicia el IDE.")
        }
        elseif (Test-Path "$ExtPath\extension.js.disabled") {
            Move-Item "$ExtPath\extension.js.disabled" "$ExtPath\extension.js" -Force
            [System.Windows.Forms.MessageBox]::Show("Extension ACTIVADA. Reinicia el IDE.")
        }
        Update-Status
    })

$btnAllow.Add_Click({
        # Regenerar Allowlist manual
        $allowDir = "$UserHome\.gemini\antigravity"
        mkdir $allowDir 2>NUL
        "*`r`n*.*`r`n*://*`r`nhttp://*`r`nhttps://*" | Out-File "$allowDir\browserAllowlist.txt" -Encoding ascii
        [System.Windows.Forms.MessageBox]::Show("Allowlist regenerada.")
        Update-Status
    })

$btnUninstall.Add_Click({
        if ([System.Windows.Forms.MessageBox]::Show("¿Desactivar extension de forma segura?", "Confirmar", "YesNo") -eq "Yes") {
            if (Test-Path "$ScriptDir\UNINSTALL.bat") {
                Start-Process -FilePath "$ScriptDir\UNINSTALL.bat" -Wait
                [System.Windows.Forms.MessageBox]::Show("Extension desactivada. Reinicia el IDE.")
                Update-Status
            }
            else {
                [System.Windows.Forms.MessageBox]::Show("Error: No se encuentra UNINSTALL.bat")
            }
        }
    })

# Initial Update
Update-Status
$form.ShowDialog()

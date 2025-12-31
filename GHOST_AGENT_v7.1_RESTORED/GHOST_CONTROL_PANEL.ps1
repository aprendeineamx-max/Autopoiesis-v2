# GHOST AGENT CONTROL PANEL v7.1
# Auto-Restored

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# --- CONFIGURACION GLOBAL ---
$global:ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# Asumimos que correremos desde C:\AntiGravityExt eventualmente
$global:ExtensionPath = "$env:USERPROFILE\AppData\Local\Programs\AntiGravity\resources\app\extensions\antigravity-internal-hook"

# --- INTERFAZ ---
$form = New-Object System.Windows.Forms.Form
$form.Text = "Ghost Agent Control Panel v7.1 - RESTORED"
$form.Size = New-Object System.Drawing.Size(600, 400)
$form.BackColor = [System.Drawing.Color]::White

$lbl = New-Object System.Windows.Forms.Label
$lbl.Text = "SISTEMA RESTAURADO"
$lbl.Font = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$lbl.Location = New-Object System.Drawing.Point(20, 20)
$lbl.AutoSize = $true
$form.Controls.Add($lbl)

# Botones
$btnInstall = New-Object System.Windows.Forms.Button
$btnInstall.Text = "REINSTALAR EXTENSION"
$btnInstall.Location = New-Object System.Drawing.Point(20, 80)
$btnInstall.Size = New-Object System.Drawing.Size(250, 60)
$btnInstall.BackColor = [System.Drawing.Color]::LightGreen
$form.Controls.Add($btnInstall)

$btnApply = New-Object System.Windows.Forms.Button
$btnApply.Text = "APPLY ALLOWLIST"
$btnApply.Location = New-Object System.Drawing.Point(300, 80)
$btnApply.Size = New-Object System.Drawing.Size(250, 60)
$btnApply.BackColor = [System.Drawing.Color]::LightBlue
$form.Controls.Add($btnApply)

$btnUninstall = New-Object System.Windows.Forms.Button
$btnUninstall.Text = "DESINSTALAR"
$btnUninstall.Location = New-Object System.Drawing.Point(20, 160)
$btnUninstall.Size = New-Object System.Drawing.Size(250, 60)
$btnUninstall.BackColor = [System.Drawing.Color]::Salmon
$form.Controls.Add($btnUninstall)

# Eventos
$btnInstall.Add_Click({
        mkdir "C:\AntiGravityExt" 2>NUL
        mkdir "$global:ExtensionPath" 2>NUL
        copy /Y "$global:ScriptDir\extension\extension.js" "$global:ExtensionPath\"
        copy /Y "$global:ScriptDir\extension\package.json" "$global:ExtensionPath\"
        [System.Windows.Forms.MessageBox]::Show("Extension Reinstalada. Reinicia Antigravity.")
    })

$btnUninstall.Add_Click({
        Start-Process -FilePath (Join-Path $global:ScriptDir "UNINSTALL.bat")
    })

$btnApply.Add_Click({
        Start-Process -FilePath (Join-Path $global:ScriptDir "APPLY_ALLOWLIST.bat")
    })

$form.ShowDialog()

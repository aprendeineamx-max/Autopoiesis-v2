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
# --- GUI TABS ---
$tabControl = New-Object System.Windows.Forms.TabControl
$tabControl.Location = New-Object System.Drawing.Point(20, 60)
$tabControl.Size = New-Object System.Drawing.Size(440, 280)
$form.Controls.Add($tabControl)

# TAB 1: GHOST AGENT (Controles Originales)
$tabAgent = New-Object System.Windows.Forms.TabPage
$tabAgent.Text = "Ghost Agent"
$tabAgent.BackColor = [System.Drawing.Color]::WhiteSmoke
$tabControl.Controls.Add($tabAgent)

# Mover controles originales a Tab 1
$grpStatus.Location = New-Object System.Drawing.Point(10, 10)
$tabAgent.Controls.Add($grpStatus)

$grpActions.Location = New-Object System.Drawing.Point(10, 130)
$tabAgent.Controls.Add($grpActions)

# TAB 2: TOOLS ARSENAL (Nueva Integración)
$tabTools = New-Object System.Windows.Forms.TabPage
$tabTools.Text = "Tools Arsenal"
$tabTools.BackColor = [System.Drawing.Color]::WhiteSmoke
$tabControl.Controls.Add($tabTools)

$lblToolsInfo = New-Object System.Windows.Forms.Label
$lblToolsInfo.Text = "Herramientas detectadas en /tools:"
$lblToolsInfo.Location = New-Object System.Drawing.Point(10, 10)
$lblToolsInfo.AutoSize = $true
$tabTools.Controls.Add($lblToolsInfo)

$lstTools = New-Object System.Windows.Forms.ListBox
$lstTools.Location = New-Object System.Drawing.Point(10, 30)
$lstTools.Size = New-Object System.Drawing.Size(410, 180)
$tabTools.Controls.Add($lstTools)

$btnRunTool = New-Object System.Windows.Forms.Button
$btnRunTool.Text = "EJECUTAR HERRAMIENTA"
$btnRunTool.Location = New-Object System.Drawing.Point(10, 220)
$btnRunTool.Size = New-Object System.Drawing.Size(410, 30)
$btnRunTool.BackColor = [System.Drawing.Color]::LightBlue
$tabTools.Controls.Add($btnRunTool)

# --- TOOLS LOGIC ---
$toolsPath = Join-Path $ScriptDir "tools"
if (Test-Path $toolsPath) {
    # Listar carpetas como "Categorías" o scripts .bat/.py principales
    Get-ChildItem -Path $toolsPath -Directory | ForEach-Object {
        $lstTools.Items.Add($_.Name)
    }
    # Tambien scripts sueltos útiles
    Get-ChildItem -Path $toolsPath -Filter "*.bat" | ForEach-Object {
        $lstTools.Items.Add($_.Name)
    }
}

$btnRunTool.Add_Click({
        $selected = $lstTools.SelectedItem
        if ($selected) {
            $targetPath = Join-Path $toolsPath $selected
            if (Test-Path $targetPath -PathType Container) {
                # Si es carpeta, abrirla
                Invoke-Item $targetPath
            }
            else {
                # Si es archivo, ejecutarlo
                Start-Process $targetPath
            }
        }
    })

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

# --- OMNICONTROL V3.2: UNIVERSAL SOLDIER (REPAIRED) ---
# Autor: Gemini | Fecha: 09/12/2025
# Fixes: Syntax errors, cleaner Header

$ErrorActionPreference = "SilentlyContinue"

# 1. CARGA DE LIBRERÍAS
try {
    Add-Type -AssemblyName UIAutomationClient
    Add-Type -AssemblyName UIAutomationTypes
    Add-Type -AssemblyName PresentationFramework
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
}
catch {
    $WPFPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\WPF"
    try {
        Add-Type -Path "$WPFPath\UIAutomationClient.dll"
        Add-Type -Path "$WPFPath\UIAutomationTypes.dll"
    }
    catch {}
}

# 2. MOTOR BACKEND
$Source = @"
using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Windows.Automation;
using System.Windows;
using System.IO;
using System.Windows.Forms; 
using System.Drawing; 

namespace OmniControl {
    public class Backend {
        [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
        [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
        [DllImport("user32.dll")] public static extern short GetAsyncKeyState(int vKey);
        [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
        [DllImport("gdi32.dll")] static extern int GetDeviceCaps(IntPtr hdc, int nIndex);
        
        public static double GetScaleFactor() {
            IntPtr desktop = GetWindowDC(IntPtr.Zero);
            int logicalHeight = GetDeviceCaps(desktop, 117); // VERTRES
            int physicalHeight = GetDeviceCaps(desktop, 10); // DESKTOPVERTRES
            ReleaseDC(IntPtr.Zero, desktop);
            return (double)physicalHeight / (double)logicalHeight;
        }

        public static string GetActiveWindowTitle() {
            const int nChars = 256;
            StringBuilder Buff = new StringBuilder(nChars);
            IntPtr handle = GetForegroundWindow();
            if (GetWindowText(handle, Buff, nChars) > 0) return Buff.ToString();
            return "";
        }
        
        public static RECT GetActiveWindowRectStruct() {
            IntPtr handle = GetForegroundWindow();
            RECT r;
            GetWindowRect(handle, out r);
            return r;
        }

        [StructLayout(LayoutKind.Sequential)]
        struct LASTINPUTINFO {
            public uint cbSize;
            public uint dwTime;
        }

        // --- ZONE DATA ---
        public static int ZoneX = 0, ZoneY = 0, ZoneW = 9999, ZoneH = 9999;
        
        public static void UpdateZone(int x, int y, int w, int h) {
            ZoneX = x; ZoneY = y; ZoneW = w; ZoneH = h;
        }

        public static bool IsUserIdle(int thresholdMs) {
            var lastInput = new LASTINPUTINFO();
            lastInput.cbSize = (uint)Marshal.SizeOf(lastInput);
            if (!GetLastInputInfo(ref lastInput)) return false; // Fail safe
            
            uint idleTime = (uint)Environment.TickCount - lastInput.dwTime;
            return idleTime > thresholdMs;
        }

        public static void Log(string msg) {
            try {
                System.IO.File.AppendAllText(@"C:\AntiGravityExt\OmniControl_Debug.txt", 
                    DateTime.Now.ToString("HH:mm:ss.fff") + " " + msg + Environment.NewLine);
            } catch {}
        }

        [DllImport("user32.dll")] static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
        [DllImport("user32.dll")] static extern IntPtr GetWindowDC(IntPtr hWnd);
        [DllImport("gdi32.dll")] static extern uint GetPixel(IntPtr hdc, int nXPos, int nYPos);
        [DllImport("user32.dll")] static extern int ReleaseDC(IntPtr hWnd, IntPtr hDC);
        [DllImport("user32.dll")] static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
        [DllImport("user32.dll")] static extern bool IsIconic(IntPtr hWnd);

        private const int SW_RESTORE = 9;
        private const int SW_MINIMIZE = 6;

        [StructLayout(LayoutKind.Sequential)]
        public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }

        public static System.Drawing.Point? FindSmartBlueButton(IntPtr hWnd) {
            RECT rect;
            GetWindowRect(hWnd, out rect);
            int w = rect.Right - rect.Left;
            int h = rect.Bottom - rect.Top;
            if (w <= 0 || h <= 0) return null;

            IntPtr hdc = GetWindowDC(hWnd);
            try {
                // STRATEGY: "Chat Safe Zone"
                // 1. Chat is ALWAYS on the Right Side in Antigravity.
                // 2. We STRICTLY limit scan to the rightmost 35% of the window.
                //    This ignores the Code Editor, File Explorer, etc.
                
                int safeZoneX = (int)(w * 0.65); // Only scan last 35%
                int step = 5; 

                // Scan Y (Top to Bottom)
                for (int y = 100; y < h - 20; y += step) {
                    for (int x = safeZoneX; x < w - 20; x += step) {
                        uint pixel = GetPixel(hdc, x, y);
                        // Convert ABGR to RGB
                        int r = (int)(pixel & 0xFF);
                        int g = (int)((pixel >> 8) & 0xFF);
                        int b = (int)((pixel >> 16) & 0xFF);

                        // RELAXED TARGET: Support Standard and Dark Blue
                        // VSCode Default Blue: #0E639C (R:14, G:99, B:156)
                        if (r < 90 && g > 80 && g < 180 && b > 130) {
                            
                            // INTELLIGENT BLOB VALIDATION
                            // Check 'Width' (> 60px) and 'Height' (> 15px)
                            int btnWidth = 0;
                            while (btnWidth < 300) { 
                                uint p2 = GetPixel(hdc, x + btnWidth, y);
                                int b2 = (int)((p2 >> 16) & 0xFF);
                                if (b2 < 130) break; // Use same relaxed threshold
                                btnWidth += 5;
                            }

                            int btnHeight = 0;
                            while (btnHeight < 80) {
                                uint p3 = GetPixel(hdc, x, y + btnHeight);
                                int b3 = (int)((p3 >> 16) & 0xFF);
                                if (b3 < 130) break;
                                btnHeight += 5;
                            }

                            // Validation: Must be a BUTTON shape (Wide Rectangle)
                            if (btnWidth >= 60 && btnHeight >= 15) {
                                Log("SMART TARGET LOCATED: " + (rect.Left + x) + "," + (rect.Top + y) + " (Size: " + btnWidth + "x" + btnHeight + ")");
                                return new System.Drawing.Point(rect.Left + x + (btnWidth/2), rect.Top + y + (btnHeight/2));
                            }
                        }
                    }
                }
            } finally {
                ReleaseDC(hWnd, hdc);
            }
            return null;
        }

        public static string ScanAndDestroy(string titlePart) {
            try {
                bool isUserActive = !IsUserIdle(1500); 
                string status = "Scanning...";
                bool nativeClickSuccess = false;

                var root = AutomationElement.RootElement;
                var winCond = new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.Window);
                var windows = root.FindAll(TreeScope.Children, winCond);
                
                foreach (AutomationElement win in windows) {
                    string winName = win.Current.Name;
                    if (winName.Contains(titlePart)) {
                         // Native Scan First (Fastest/Safest)
                         var btnCond = new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.Button);
                         var buttons = win.FindAll(TreeScope.Descendants, btnCond);
                         bool btnFound = false;

                         foreach (AutomationElement btn in buttons) {
                             string name = btn.Current.Name;
                             if (string.IsNullOrEmpty(name)) continue;
                             bool isMatch = false;
                             if (name.IndexOf("Accept", StringComparison.OrdinalIgnoreCase) >= 0) isMatch = true;
                             else if (name.IndexOf("Run command", StringComparison.OrdinalIgnoreCase) >= 0) isMatch = true;
                             else if (name.Contains("Yes")) isMatch = true; 
                             
                             if (isMatch) {
                                 btnFound = true;
                                 if (ZoneW > 0 && ZoneH > 0) { // Zone Filter
                                     Rect btnRect = btn.Current.BoundingRectangle;
                                     double cx = btnRect.X + btnRect.Width/2;
                                     double cy = btnRect.Y + btnRect.Height/2;
                                     if (cx < ZoneX || cx > ZoneX+ZoneW || cy < ZoneY || cy > ZoneY+ZoneH) continue;
                                 }

                                 // Priority Check
                                 bool isPriority = (name.IndexOf("Run", StringComparison.OrdinalIgnoreCase) >= 0 || name.IndexOf("Accept", StringComparison.OrdinalIgnoreCase) >= 0);
                                 if (isUserActive && !isPriority) { status = "PAUSED: TYPING..."; continue; }

                                 var invoke = btn.GetCurrentPattern(InvokePattern.Pattern) as InvokePattern;
                                 if (invoke != null) {
                                     invoke.Invoke();
                                     if (isPriority) { try { System.Windows.Forms.SendKeys.SendWait("%{ENTER}"); } catch {} }
                                     return "CLICKED (Native): " + name;
                                 }
                             }
                         }

                         // --- SMART VISUAL ENGINE (Background/Minimized Support) ---
                         if (!btnFound) {
                             IntPtr hWnd = (IntPtr)win.Current.NativeWindowHandle;
                             
                             // 1. Check Minimized State
                             bool wasMinimized = IsIconic(hWnd);
                             if (wasMinimized) {
                                 ShowWindow(hWnd, SW_RESTORE);
                                 System.Threading.Thread.Sleep(200); // Wait for render
                             }

                             // 2. Perform Intelligent Scan
                             Point? smartBlob = FindSmartBlueButton(hWnd);
                             
                             if (smartBlob.HasValue) {
                                 Log("SMART CLICK at " + smartBlob.Value.X + "," + smartBlob.Value.Y);
                                 ClickAt(smartBlob.Value.X, smartBlob.Value.Y);
                                 try { System.Windows.Forms.SendKeys.SendWait("%{ENTER}"); } catch {}
                                 if (wasMinimized) ShowWindow(hWnd, SW_MINIMIZE);
                                 return "CLICKED (Smart Visual)";
                             }

                             // Clean up if we restored but found nothing
                             if (wasMinimized) ShowWindow(hWnd, SW_MINIMIZE);
                         }
                    }
                }
                
                // Legacy OmniGod Fallback (Keep as last resort)
                if (!nativeClickSuccess && ZoneW > 0 && ZoneH > 0) { 
                    if (!isUserActive) {
                        int cx = ZoneX + (ZoneW / 2); int cy = ZoneY + (ZoneH / 2);
                        Log("VISUAL FALLBACK: OmniGod Lock at " + cx + "," + cy); 
                        ClickAt(cx, cy);
                        try { System.Windows.Forms.SendKeys.SendWait("%{ENTER}"); } catch {}
                        ZoneW = 0; ZoneH = 0; 
                        return "CLICKED (Legacy Visual)";
                    }
                }

                return status;
            } catch (Exception ex) {
                Log("ERROR: " + ex.Message);
            }
            return "Scanning...";
        }
        
        [DllImport("user32.dll", CharSet = CharSet.Auto, CallingConvention = CallingConvention.StdCall)]
        public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint cButtons, uint dwExtraInfo);
        private const int MOUSEEVENTF_LEFTDOWN = 0x02;
        private const int MOUSEEVENTF_LEFTUP = 0x04;
        private const int MOUSEEVENTF_ABSOLUTE = 0x8000;

        public static void ClickAt(int x, int y) {
             System.Windows.Forms.Cursor.Position = new System.Drawing.Point(x, y);
             mouse_event(MOUSEEVENTF_LEFTDOWN | MOUSEEVENTF_LEFTUP, (uint)x, (uint)y, 0, 0);
        }
    }
}
"@

try {
    if (-not ([System.Management.Automation.PSTypeName]'OmniControl.Backend').Type) {
        $NetPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319"
        $WPFPath = "$NetPath\WPF"
        
        $RefAssemblies = @(
            "$WPFPath\UIAutomationClient.dll", 
            "$WPFPath\UIAutomationTypes.dll", 
            "$NetPath\System.Drawing.dll",
            "WindowsBase", 
            "PresentationCore", 
            "PresentationFramework", 
            "System.Windows.Forms"
        )
        Add-Type -TypeDefinition $Source -Language CSharp -ReferencedAssemblies $RefAssemblies
    }
}
catch { 
    $err = "C# COMPILATION ERROR:`n" + $_.Exception.Message + "`nDetails:`n"
    if ($_.Exception.LoaderExceptions) {
        $_.Exception.LoaderExceptions | ForEach-Object { $err += $_.Message + "`n" }
    }
    Set-Content -Path "C:\AntiGravityExt\AntiGravity_Ghost_Agent\compile_error.log" -Value $err -Force
    Write-Host $err -ForegroundColor Red
}

# 3. INTERFAZ XAML (MODERN GLASS UI)
[xml]$XAML = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="OmniControl HUD" Height="220" Width="340"
        WindowStyle="None" AllowsTransparency="True" Background="Transparent" Topmost="True" ResizeMode="NoResize">
    
    <Window.Resources>
        <Style x:Key="ModernBtn" TargetType="Button">
            <Setter Property="Background" Value="#33FFFFFF"/>
            <Setter Property="Foreground" Value="White"/>
            <Setter Property="BorderThickness" Value="0"/>
            <Setter Property="FontSize" Value="11"/>
            <Setter Property="Padding" Value="10,5"/>
            <Setter Property="Cursor" Value="Hand"/>
            <Setter Property="Template">
                <Setter.Value>
                    <ControlTemplate TargetType="Button">
                        <Border x:Name="border" Background="{TemplateBinding Background}" CornerRadius="6" SnapsToDevicePixels="True">
                            <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center"/>
                        </Border>
                        <ControlTemplate.Triggers>
                            <Trigger Property="IsMouseOver" Value="True">
                                <Setter TargetName="border" Property="Background" Value="#44FFFFFF"/>
                            </Trigger>
                            <Trigger Property="IsPressed" Value="True">
                                <Setter TargetName="border" Property="Background" Value="#22FFFFFF"/>
                            </Trigger>
                        </ControlTemplate.Triggers>
                    </ControlTemplate>
                </Setter.Value>
            </Setter>
        </Style>
    </Window.Resources>

    <Border CornerRadius="12" Background="#F2121212" BorderBrush="#33FFFFFF" BorderThickness="1" Margin="10">
        <Border.Effect>
            <DropShadowEffect BlurRadius="20" ShadowDepth="5" Opacity="0.6" Color="Black"/>
        </Border.Effect>
        
        <Grid Margin="15">
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto"/> <!-- Header -->
                <RowDefinition Height="Auto"/> <!-- Status Block -->
                <RowDefinition Height="*"/>    <!-- Zone Info -->
                <RowDefinition Height="Auto"/> <!-- Footer -->
            </Grid.RowDefinitions>

            <!-- Header -->
            <StackPanel Grid.Row="0" Orientation="Horizontal" HorizontalAlignment="Center" Margin="0,0,0,10">
                <TextBlock Text="[+]" Foreground="#00E5FF" FontSize="14" Margin="0,0,6,0" VerticalAlignment="Center"/>
                <TextBlock Text="OMNICONTROL" Foreground="White" FontWeight="Bold" FontSize="13" VerticalAlignment="Center" FontFamily="Segoe UI"/>
                <TextBlock Text="HUD" Foreground="#888" FontWeight="Regular" FontSize="13" Margin="5,0,0,0" VerticalAlignment="Center"/>
            </StackPanel>

            <!-- Status Block -->
            <Border Grid.Row="1" Background="#1AFFFFFF" CornerRadius="8" Padding="12,8" Margin="0,5">
                <Grid>
                    <Grid.ColumnDefinitions>
                        <ColumnDefinition Width="Auto"/>
                        <ColumnDefinition Width="*"/>
                    </Grid.ColumnDefinitions>
                    
                    <Ellipse Name="statusDot" Grid.Column="0" Width="10" Height="10" Fill="#555" VerticalAlignment="Center" Margin="0,0,10,0"/>
                    <TextBlock Name="lblStatus" Grid.Column="1" Text="Initializing..." Foreground="#DDD" FontSize="11" 
                               TextTrimming="CharacterEllipsis" VerticalAlignment="Center" ToolTip="{Binding Text, RelativeSource={RelativeSource Self}}"/>
                </Grid>
            </Border>

            <!-- Zone Info -->
            <StackPanel Grid.Row="2" VerticalAlignment="Center" Margin="0,10">
                <TextBlock Text="ACTIVE ZONE LOCK" Foreground="#666" FontSize="9" FontWeight="Bold" HorizontalAlignment="Center"/>
                <TextBlock Name="lblZone" Text="Wait..." Foreground="#00E5FF" FontSize="11" FontWeight="SemiBold" 
                           HorizontalAlignment="Center" TextAlignment="Center" TextWrapping="Wrap" Margin="0,2,0,0"/>
            </StackPanel>

            <!-- Footer -->
            <Button Name="btnExit" Grid.Row="3" Content="DISCONNECT" Style="{StaticResource ModernBtn}" Margin="0,5,0,0"/>
        </Grid>
    </Border>
</Window>
"@

# --- OVERLAY XAML (Purple Zone Indicator) ---
[xml]$OverlayXAML = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        Title="OmniControl Overlay" WindowStyle="None" AllowsTransparency="True" Background="Transparent" 
        Topmost="True" ShowInTaskbar="False" ResizeMode="NoResize" Focusable="False" IsHitTestVisible="False">
    <Border x:Name="OverlayBorder" BorderBrush="Purple" BorderThickness="10" CornerRadius="5" Opacity="1.0">
        <Border.Effect>
             <DropShadowEffect BlurRadius="10" Color="Magenta" Opacity="1"/>
        </Border.Effect>
    </Border>
</Window>
"@

$reader2 = (New-Object System.Xml.XmlNodeReader $OverlayXAML)
$overlayWindow = [Windows.Markup.XamlReader]::Load($reader2)
$overlayBorder = $overlayWindow.FindName("OverlayBorder")
$overlayWindow.Hide() # Start Hidden

# 4. FUNCIONALIDAD
$reader = (New-Object System.Xml.XmlNodeReader $XAML)
$Window = [Windows.Markup.XamlReader]::Load($reader)
$Window.Left = [System.Windows.SystemParameters]::PrimaryScreenWidth - 360
$Window.Top = 20

# CONTROLS
$lblStatus = $Window.FindName("lblStatus")
$lblZone = $Window.FindName("lblZone")
$statusDot = $Window.FindName("statusDot")
$btnExit = $Window.FindName("btnExit")

$btnExit.Add_Click({ 
    $overlayWindow.Close()
    $Window.Close() 
})
$Window.Add_MouseLeftButtonDown({ $Window.DragMove() })

# MAIN LOOP
$Timer = New-Object System.Windows.Threading.DispatcherTimer
$Timer.Interval = [TimeSpan]::FromMilliseconds(500)
$Timer.Add_Tick({
    try {
        # --- MAIN LOOP ---
        # 1. Update Zone from INI
        $iniContent = Get-Content "C:\AntiGravityExt\AntiGravity_Ghost_Agent\OmniGod_Live.ini" -ErrorAction SilentlyContinue
        if ($iniContent) {
            foreach ($line in $iniContent) {
                if ($line -match "Zone=(\d+),(\d+),(\d+),(\d+)") {
                    [OmniControl.Backend]::UpdateZone([int]$matches[1], [int]$matches[2], [int]$matches[3], [int]$matches[4])
                   # If Zone is active, it overrides Auto logging below
                   break
                }
            }
        }

        # 2. Execute Backend Scan
        $Result = [OmniControl.Backend]::ScanAndDestroy("AntiGravity")
        
        # 3. HUD Updates
        if ($Result -match "CLICKED") {
            $lblStatus.Text = $Result
            $statusDot.Fill = "#00FF00" # Lime
        }
        elseif ($Result -match "PAUSED") {
            $lblStatus.Text = $Result
            $statusDot.Fill = "#FF8C00" # Dark Orange
        }
        else {
            $lblStatus.Text = $Result
            if ($Result -match "Scanning") {
                $statusDot.Fill = "#FFC107" # Amber
            } else {
                $statusDot.Fill = "#555" # Gray
            }
        }

        # --- 4. OVERLAY LOGIC (Purple Box) ---
        $activeTitle = [OmniControl.Backend]::GetActiveWindowTitle()
        $scale = [OmniControl.Backend]::GetScaleFactor()
        if ($scale -lt 1.0) { $scale = 1.0 }

        # --- 4. OVERLAY LOGIC (Purple Box) ---
        $activeTitle = [OmniControl.Backend]::GetActiveWindowTitle()
        $scale = [OmniControl.Backend]::GetScaleFactor()
        if ($scale -lt 1.0) { $scale = 1.0 }

        # RELAXED MATCHING: Accept variations
        if ($activeTitle -match "AntiGravity" -or $activeTitle -match "Ghost_Agent" -or $activeTitle -match "Code") {
             # Only show if AntiGravity is focused
             $rect = [OmniControl.Backend]::GetActiveWindowRectStruct()
             $winX = $rect.Left / $scale
             $winY = $rect.Top / $scale
             $winW = ($rect.Right - $rect.Left) / $scale
             $winH = ($rect.Bottom - $rect.Top) / $scale

             # Determine what to highlight
             if ([OmniControl.Backend]::ZoneW -gt 0) {
                 # ZONE MODE: Match the INI Zone
                 $overlayWindow.Left = [OmniControl.Backend]::ZoneX / $scale
                 $overlayWindow.Top = [OmniControl.Backend]::ZoneY / $scale
                 $overlayWindow.Width = [OmniControl.Backend]::ZoneW / $scale
                 $overlayWindow.Height = [OmniControl.Backend]::ZoneH / $scale
                 $lblZone.Text = "ZONE: " + [math]::Round($overlayWindow.Left) + "," + [math]::Round($overlayWindow.Top)
                 $lblZone.Foreground = "#00FFFF" # Cyan
             } else {
                 # AUTONOMOUS MODE: Highlight Safe Scan Zone (Right 35% of Window)
                 $safeX = $winX + ($winW * 0.65)
                 $overlayWindow.Left = $safeX
                 $overlayWindow.Top = $winY + (100 / $scale) 
                 $overlayWindow.Width = ($winW * 0.35) - (20 / $scale)
                 $overlayWindow.Height = ($winH - (120 / $scale))
                 $lblZone.Text = "AUTO: " + [math]::Round($overlayWindow.Left) + "," + [math]::Round($overlayWindow.Top) + " (S:" + [math]::Round($scale, 2) + ")"
                 $lblZone.Foreground = "#AA00FF" # Purple (Visible)
             }
             
             if ($overlayWindow.Visibility -ne "Visible") { $overlayWindow.Show() }
        } else {
             $overlayWindow.Hide()
             # Show what window IS active (First 15 chars) to debug title mismatch
             if ($activeTitle.Length -gt 15) { $activeTitle = $activeTitle.Substring(0,15) + "..." }
             $lblZone.Text = "Focus: " + $activeTitle
             $lblZone.Foreground = "#888888"
        }
    } catch {
        $lblStatus.Text = "ERR: " + $_.Exception.Message
        $statusDot.Fill = "Red"
    }
})

$Timer.Start()
$Window.ShowDialog() | Out-Null

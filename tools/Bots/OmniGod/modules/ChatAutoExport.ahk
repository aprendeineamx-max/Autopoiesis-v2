; ========================================
; CHAT AUTO-EXPORT MODULE
; Automatically copies chat every time new message arrives
; ========================================

global ChatAutoExportEnabled := true
global LastChatHash := ""
global ChatCheckInterval := 1000  ; Check every 1 second

; Start monitoring
SetTimer, MonitorChatForChanges, %ChatCheckInterval%

MonitorChatForChanges:
    if (!ChatAutoExportEnabled) {
        return
    }
    
    ; Only proceed if AntiGravity is active
    WinGetTitle, ActiveTitle, A
    if (!InStr(ActiveTitle, "Antigravity")) {
        return
    }
    
    ; Get chat area from OmniGod_Live.ini
    IniRead, ChatX, %LiveIniPath%, Active, ChatX, 0
    IniRead, ChatY, %LiveIniPath%, Active, ChatY, 0
    IniRead, ChatW, %LiveIniPath%, Active, ChatW, 100
    IniRead, ChatH, %LiveIniPath%, Active, ChatH, 100
    
    if (ChatX = 0 or ChatY = 0) {
        ; No valid chat zone, skip
        return
    }
    
    ; Check if user is typing (input box has focus)
    ControlGetFocus, FocusedControl, A
    if (InStr(FocusedControl, "Edit") or InStr(FocusedControl, "Input") or InStr(FocusedControl, "Text")) {
        ; User is typing, don't interrupt
        return
    }
    
    ; Take a quick hash of chat area to detect changes
    ; We'll use pixel checksum as a fast proxy
    PixelGetColor, Color1, ChatX+10, ChatY+10
    PixelGetColor, Color2, ChatX+ChatW-10, ChatY+ChatH-10
    PixelGetColor, Color3, ChatX+(ChatW//2), ChatY+(ChatH//2)
    
    CurrentHash := Color1 . Color2 . Color3
    
    ; If hash changed, new messages arrived
    if (CurrentHash != LastChatHash and LastChatHash != "") {
        FileAppend, [%A_YYYY%-%A_MM%-%A_DD% %A_Hour%:%A_Min%:%A_Sec%] Chat changed detected. Auto-exporting...`n, %LogPath%
        
        ; Execute auto-export sequence
        Gosub, AutoExportChat
    }
    
    LastChatHash := CurrentHash
return

AutoExportChat:
    ; Wait a moment for message to fully render
    Sleep, 500
    
    ; Save current clipboard
    ClipboardBackup := ClipboardAll
    
    ; Click in chat area (to ensure focus)
    ClickX := ChatX + (ChatW // 2)
    ClickY := ChatY + (ChatH // 2)
    Click, %ClickX%, %ClickY%
    Sleep, 100
    
    ; Select all chat content
    Send, ^a
    Sleep, 200
    
    ; Copy to clipboard
    Send, ^c
    Sleep, 300
    
    ; Trigger extension import via command palette
    ; We'll write a signal file instead for the extension to watch
    SignalFile := "C:\AntiGravityExt\AntiGravity_Ghost_Agent\.auto_export_signal"
    FileDelete, %SignalFile%
    FileAppend, %A_NowUTC%`n, %SignalFile%
    
    ; Restore clipboard
    Clipboard := ClipboardBackup
    
    FileAppend, [%A_YYYY%-%A_MM%-%A_DD% %A_Hour%:%A_Min%:%A_Sec%] Auto-export completed. Signal sent.`n, %LogPath%
return

; Hotkey to toggle auto-export
^F12::
    ChatAutoExportEnabled := !ChatAutoExportEnabled
    status := ChatAutoExportEnabled ? "ENABLED" : "DISABLED"
    FileAppend, [%A_YYYY%-%A_MM%-%A_DD% %A_Hour%:%A_Min%:%A_Sec%] Chat Auto-Export %status%`n, %LogPath%
    TrayTip, Chat Auto-Export, Auto-export is now %status%, 2
return

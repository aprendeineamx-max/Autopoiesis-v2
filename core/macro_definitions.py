"""
MACRO DEFINITIONS
----------------
This file defines complex sequences of commands (macros) that the Ghost Agent can execute.
Each macro has a unique key, a display name, a description, and a list of step-by-step Command IDs.

Command IDs must match the 'command_id' found in the harvested database (commands.db).
"""

MACROS = {
    "clean_slate": {
        "name": "Tabula Rasa (Clean Slate)",
        "description": "Closes all editors, sidebars, and panels to reset the workspace to a clean state.",
        "icon": "🧹",
        "steps": [
            "workbench.action.closeAllEditors",
            "workbench.action.closeSidebar",
            "workbench.action.closePanel",
            # "workbench.action.terminal.clear" # Optional, might be aggressive
        ]
    },
    
    "debug_prep": {
        "name": "Debug Session Prep",
        "description": "Prepares the layout for debugging: splits editor and focuses terminal.",
        "icon": "🐞",
        "steps": [
            "workbench.action.splitEditorRight",
            "workbench.action.terminal.focus",
            "workbench.debug.action.toggleRepl"
        ]
    },
    
    "smart_save": {
        "name": "Smart Save & Format",
        "description": "Formats the document and then saves it.",
        "icon": "💾",
        "steps": [
            "editor.action.formatDocument",
            "workbench.action.files.save"
        ]
    },
    
    "zen_mode": {
        "name": "Zen Coding Mode",
        "description": "Toggles Zen Mode and closes sidebar for maximum focus.",
        "icon": "🧘",
        "steps": [
            "workbench.action.toggleZenMode",
            "workbench.action.closeSidebar"
        ]
    },

    "archive_chat": {
        "name": "Archive Chat Response",
        "description": "Copies selected text and appends it to the chat log with metadata.",
        "icon": "📜",
        "steps": [
            "editor.action.clipboardCopyAction", 
            "__AGENT_INTERNAL_ARCHIVE_CLIPBOARD__"
        ]
    }
}

const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

class ConfigManager {
    constructor(rootDir) {
        this.rootDir = rootDir;
        this.configPath = path.join(rootDir, 'ghost_config.json');
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
            }
        } catch (e) {
            console.error('Error loading config:', e);
        }
        // Fallback default config
        return {
            system: { statusFile: "GHOST_STATUS.txt", commandFile: "GHOST_CMD.txt", aliveFile: "HOOK_ALIVE.txt" },
            timeouts: { allow: 500, accept: 1000, acceptAll: 2000, typingPause: 1000 },
            ui: { statusBar: { activeColor: "#af00db", pausedColor: "#ff0000", textColor: "#ffffff", textActive: "[GHOST] Auto-Accept: ACTIVE", textPaused: "[GHOST] PAUSED" } }
        };
    }

    get() {
        return this.config;
    }
}

module.exports = ConfigManager;

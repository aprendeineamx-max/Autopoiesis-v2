const vscode = require('vscode');

class UIManager {
    constructor(context, config) {
        this.config = config;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.command = 'ghostAgent.toggle';
        context.subscriptions.push(this.statusBarItem);
        this.applyTheme();
    }

    applyTheme() {
        const theme = this.config.ui.statusBar;
        const workbenchConfig = vscode.workspace.getConfiguration();
        try {
            workbenchConfig.update('workbench.colorCustomizations', {
                "statusBar.background": theme.activeColor,
                "statusBar.noFolderBackground": theme.activeColor,
                "statusBar.debuggingBackground": theme.activeColor,
                "statusBar.foreground": theme.textColor
            }, vscode.ConfigurationTarget.Global);
        } catch (e) { }
    }

    update(isPaused) {
        const theme = this.config.ui.statusBar;
        if (isPaused) {
            this.statusBarItem.text = theme.textPaused;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        } else {
            this.statusBarItem.text = theme.textActive;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
        this.statusBarItem.show();
    }

    dispose() {
        this.statusBarItem.hide();
        this.statusBarItem.dispose();
    }
}

module.exports = UIManager;

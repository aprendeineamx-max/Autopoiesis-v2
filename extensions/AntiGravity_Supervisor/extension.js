const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

// Import components
const APIClient = require('./src/apiClient');
const MessageReader = require('./src/messageReader');
const RepoAnalyzer = require('./src/repoAnalyzer');
const StateManager = require('./src/stateManager');
const PromptGenerator = require('./src/promptGenerator');

let autonomousLoopInterval = null;
let isRunning = false;
let stateManager = null;
let apiClient = null;
let repoAnalyzer = null;
let messageReader = null;
let promptGenerator = null;

/**
 * Extension activation
 */
function activate(context) {
    console.log('🤖 AntiGravity Supervisor Extension Activated');

    // VISIBLE ACTIVATION MESSAGE (like Internal Hook)
    vscode.window.showInformationMessage('🤖 SUPERVISOR AI: AUTONOMOUS MODE READY', { modal: false });

    // Optional: Customize status bar color for Supervisor
    try {
        const config = vscode.workspace.getConfiguration();
        config.update('workbench.colorCustomizations', {
            "statusBar.background": "#00af87",  // Green for Supervisor
            "statusBar.foreground": "#ffffff"
        }, vscode.ConfigurationTarget.Global);
    } catch (e) {
        console.error('Could not customize status bar:', e);
    }

    // Create proof of life file
    try {
        const proofPath = path.join('C:\\', 'AntiGravityExt', 'SUPERVISOR_ALIVE.txt');
        fs.writeFileSync(proofPath, `Active at ${new Date().toISOString()}`);
    } catch (e) {
        console.error('Could not write SUPERVISOR_ALIVE.txt:', e);
    }

    // Get workspace root
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

    if (!workspaceRoot) {
        vscode.window.showErrorMessage('No workspace folder open. Supervisor requires a workspace.');
        return;
    }

    // Initialize components
    try {
        const config = loadConfiguration();

        stateManager = new StateManager(workspaceRoot);
        apiClient = new APIClient(config);
        repoAnalyzer = new RepoAnalyzer(workspaceRoot);
        messageReader = new MessageReader();
        promptGenerator = new PromptGenerator();

        console.log('✅ Supervisor components initialized');
    } catch (error) {
        vscode.window.showErrorMessage(`Supervisor initialization failed: ${error.message}`);
        return;
    }

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.supervisor.start', startAutonomousLoop)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.supervisor.stop', stopAutonomousLoop)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.supervisor.status', showStatus)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.supervisor.emergencyStop', emergencyStop)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity.supervisor.singleCycle', runSingleCycle)
    );

    // Auto-start if configured
    const autoStart = vscode.workspace.getConfiguration('antigravity.supervisor').get('autoStart');
    if (autoStart) {
        setTimeout(() => startAutonomousLoop(), 5000); // Wait 5s after activation
    }

    vscode.window.showInformationMessage('🤖 AntiGravity Supervisor ready');
}

/**
 * Load configuration including API keys
 */
function loadConfiguration() {
    const configPath = path.join(__dirname, 'config', 'api-keys.json');

    if (!fs.existsSync(configPath)) {
        // Create default config
        const defaultConfig = {
            groq: {
                api_key: process.env.GROQ_API_KEY || "",
                model: "llama-3.3-70b-versatile"
            },
            openrouter: {
                api_key: process.env.OPENROUTER_API_KEY || ""
            },
            google: {
                api_keys: [
                    process.env.GOOGLE_API_KEY || ""
                ]
            }
        };

        fs.mkdirSync(path.dirname(configPath), { recursive: true });
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    }

    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * Start autonomous loop
 */
async function startAutonomousLoop() {
    if (isRunning) {
        vscode.window.showWarningMessage('Supervisor already running');
        return;
    }

    vscode.window.showInformationMessage('🚀 Starting Autonomous Supervisor Loop');

    isRunning = true;
    const vscodeConfig = vscode.workspace.getConfiguration('antigravity.supervisor');
    const cycleDelay = vscodeConfig.get('cycleDelay', 30000);

    // Run first cycle immediately
    await runCycle();

    // Setup interval for subsequent cycles
    autonomousLoopInterval = setInterval(async () => {
        if (isRunning) {
            await runCycle();
        }
    }, cycleDelay);
}

/**
 * Stop autonomous loop
 */
function stopAutonomousLoop() {
    if (!isRunning) {
        vscode.window.showWarningMessage('Supervisor not running');
        return;
    }

    isRunning = false;
    if (autonomousLoopInterval) {
        clearInterval(autonomousLoopInterval);
        autonomousLoopInterval = null;
    }

    vscode.window.showInformationMessage('⏸️ Supervisor stopped');
}

/**
 * Emergency stop - Halt everything
 */
function emergencyStop() {
    stopAutonomousLoop();

    // Create emergency stop flag
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    fs.writeFileSync(path.join(workspaceRoot, 'EMERGENCY_STOP.flag'), new Date().toISOString());

    vscode.window.showErrorMessage('🚨 EMERGENCY STOP ACTIVATED - All autonomous operations halted');
}

/**
 * Run a single autonomous cycle
 */
async function runSingleCycle() {
    vscode.window.showInformationMessage('▶️ Running single cycle...');
    await runCycle();
}

/**
 * Core cycle logic
 */
async function runCycle() {
    try {
        const cycleStart = Date.now();
        console.log(`🔄 Cycle ${stateManager.state.autonomous_cycles + 1} starting...`);

        // 1. Check emergency stop
        const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
        if (fs.existsSync(path.join(workspaceRoot, 'EMERGENCY_STOP.flag'))) {
            stopAutonomousLoop();
            return;
        }

        // 2. Check max cycles
        const maxCycles = vscode.workspace.getConfiguration('antigravity.supervisor').get('maxCycles', 1000);
        if (stateManager.state.autonomous_cycles >= maxCycles) {
            vscode.window.showWarningMessage(`Max cycles (${maxCycles}) reached. Stopping.`);
            stopAutonomousLoop();
            return;
        }

        // 3. Read last Gemini message (fallback to file if webview unavailable)
        let lastMessage;
        try {
            lastMessage = await messageReader.getLastMessage();
        } catch (error) {
            console.warn('Webview read failed, using GHOST_OUTPUT.txt fallback');
            lastMessage = readGhostOutput(workspaceRoot);
        }

        if (!lastMessage || !lastMessage.content) {
            console.log('No new message, skipping cycle');
            return;
        }

        // 4. Analyze repository state
        const repoAnalysis = repoAnalyzer.analyzeChanges();
        const testResults = await repoAnalyzer.analyzeTestResults();
        const projectContext = repoAnalyzer.getProjectContext();

        // 5. Build context
        const context = {
            lastMessage,
            repoAnalysis,
            testResults,
            projectContext,
            conversationState: stateManager.state
        };

        // 6. Generate next prompt via Supervisor AI
        const nextPrompt = await apiClient.generatePrompt(context);

        if (!nextPrompt) {
            throw new Error('Supervisor AI returned empty prompt');
        }

        // 7. Write to GHOST_INPUT.txt
        writeGhostInput(workspaceRoot, nextPrompt);

        // 8. Update state
        stateManager.addMessage('supervisor', nextPrompt);
        stateManager.addMessage('executor', lastMessage.content);
        stateManager.incrementCycle();

        // 9. Check completion criteria
        if (isProjectComplete(context)) {
            await handleProjectCompletion(context);
            stopAutonomousLoop();
            return;
        }

        const cycleTime = ((Date.now() - cycleStart) / 1000).toFixed(2);
        console.log(`✅ Cycle ${stateManager.state.autonomous_cycles} complete (${cycleTime}s)`);

        // Show status in status bar
        vscode.window.setStatusBarMessage(
            `🤖 Supervisor: Cycle ${stateManager.state.autonomous_cycles} | Pass Rate: ${(testResults.passRate * 100).toFixed(1)}%`,
            5000
        );

    } catch (error) {
        console.error('❌ Error in cycle:', error);
        vscode.window.showErrorMessage(`Supervisor cycle error: ${error.message}`);

        // Don't stop on single error, log and continue
        stateManager.state.errors_detected++;
        stateManager.save();
    }
}

/**
 * Read GHOST_OUTPUT.txt (fallback)
 */
function readGhostOutput(workspaceRoot) {
    const ghostPath = path.join(workspaceRoot, 'GHOST_OUTPUT.txt');

    if (!fs.existsSync(ghostPath)) {
        return null;
    }

    const content = fs.readFileSync(ghostPath, 'utf-8');
    return {
        content,
        timestamp: fs.statSync(ghostPath).mtime.toISOString(),
        source: 'file'
    };
}

/**
 * Write to GHOST_INPUT.txt
 */
function writeGhostInput(workspaceRoot, prompt) {
    const ghostPath = path.join(workspaceRoot, 'GHOST_INPUT.txt');
    fs.writeFileSync(ghostPath, prompt, 'utf-8');
    console.log(`✅ Prompt written to GHOST_INPUT.txt (${prompt.length} chars)`);
}

/**
 * Check if project is complete
 */
function isProjectComplete(context) {
    const testPassThreshold = 0.95; // 95%

    return context.testResults.passRate >= testPassThreshold &&
        context.conversationState.tasks_pending === 0 &&
        context.repoAnalysis.errors?.length === 0;
}

/**
 * Handle project completion
 */
async function handleProjectCompletion(context) {
    console.log('🎉 PROJECT COMPLETION DETECTED');

    const report = `
# Project Completion Report

**Completion Time**: ${new Date().toISOString()}
**Autonomous Cycles**: ${stateManager.state.autonomous_cycles}
**Test Pass Rate**: ${(context.testResults.passRate * 100).toFixed(1)}%
**Tasks Completed**: ${stateManager.state.tasks_completed}
**Messages Exchanged**: ${stateManager.state.messages.length}

## Summary
All completion criteria met. Project ready for human review.
    `.trim();

    // Write completion report
    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    fs.writeFileSync(path.join(workspaceRoot, 'PROJECT_COMPLETE.md'), report);

    vscode.window.showInformationMessage('🎉 PROJECT COMPLETE! Check PROJECT_COMPLETE.md');
}

/**
 * Show supervisor status
 */
function showStatus() {
    const status = `
Supervisor Status:
- Running: ${isRunning ? 'YES' : 'NO'}
- Cycles: ${stateManager.state.autonomous_cycles}
- Tasks Completed: ${stateManager.state.tasks_completed}
- Test Pass Rate: ${(stateManager.state.test_pass_rate * 100).toFixed(1)}%
- Provider: ${vscode.workspace.getConfiguration('antigravity.supervisor').get('provider')}
    `.trim();

    vscode.window.showInformationMessage(status);
}

/**
 * Extension deactivation
 */
function deactivate() {
    stopAutonomousLoop();
    console.log('🤖 AntiGravity Supervisor Extension Deactivated');
}

module.exports = {
    activate,
    deactivate
};

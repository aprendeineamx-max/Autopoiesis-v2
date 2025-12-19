const vscode = require('vscode');

let outputChannel;

function activate(context) {
    outputChannel = vscode.window.createOutputChannel('Deep API Tester - Simple');
    outputChannel.show();
    outputChannel.appendLine('✅ Deep API Tester ACTIVATED SUCCESSFULLY');
    outputChannel.appendLine('');

    // Test simple command
    context.subscriptions.push(
        vscode.commands.registerCommand('deepApiTester.runAllDeepTests', async () => {
            outputChannel.appendLine('🚀 Running ALL Deep Tests...\n');

            // Test 1: Cascade
            if (vscode.Cascade) {
                outputChannel.appendLine('=== Cascade API Test ===');
                try {
                    const state = await vscode.Cascade.getFocusState();
                    outputChannel.appendLine(`✅ Panel visible: ${state.isVisible}`);
                    outputChannel.appendLine(`✅ Panel focused: ${state.isFocused}`);
                } catch (e) {
                    outputChannel.appendLine(`❌ Error: ${e.message}`);
                }
                outputChannel.appendLine('');
            }

            // Test 2: transferActiveChat
            if (vscode.interactive?.transferActiveChat) {
                outputChannel.appendLine('=== transferActiveChat Test ===');
                const fn = vscode.interactive.transferActiveChat;
                outputChannel.appendLine(`✅ Function found`);
                outputChannel.appendLine(`   Name: ${fn.name}`);
                outputChannel.appendLine(`   Params: ${fn.length}`);
                outputChannel.appendLine('');
            }

            outputChannel.appendLine('✅ ALL TESTS COMPLETE');
        })
    );

    outputChannel.appendLine('Commands registered. Use Ctrl+Shift+P and search: "Tester: Run ALL"');
}

function deactivate() { }

module.exports = { activate, deactivate };

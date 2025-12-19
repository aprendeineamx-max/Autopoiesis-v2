/**
 * DEEP API TESTER - PART 2
 * Tests 231-330 (Categories 51-70)
 * 
 * Este módulo contiene los 100 test cases adicionales basados en:
 * - portapapeles_de_comandos.txt (análisis forense de comandos reales)
 * - Keybindings profundos (NATIVE_KEYBINDINGS_FULL.json)
 * - Análisis ultra-profundo de integración de chat
 * 
 * Total: 100 test cases adicionales para llegar a 330 TOTAL
 */

module.exports = function getAdditionalTestCases(vscode) {
    const testCases = [];

    // Obtener contexto del editor activo
    const activeEditor = vscode.window.activeTextEditor;
    const activeDoc = activeEditor?.document;
    const activeUri = activeDoc?.uri;

    // ===================================================================
    // CATEGORY 51: Chat Editor Actions (5 tests) 🔥🔥🔥
    // Comandos reales encontrados en portapapeles_de_comandos.txt
    // ===================================================================
    console.log('🔬 Category 51: Chat Editor Actions');

    testCases.push(
        {
            category: 'Chat Editor', name: 'applyInEditor command', value: {
                command: 'workbench.action.chat.applyInEditor',
                chatIsEnabled: true,
                inChat: true,
                chatLocation: 'panel',
                editorFocus: true,
                activeEditor
            }
        },

        {
            category: 'Chat Editor', name: 'chatEditor.action.accept', value: {
                command: 'chatEditor.action.accept',
                chatIsEnabled: true,
                chatEdits: {
                    hasEditorModifications: true,
                    isRequestInProgress: false
                },
                activeEditor
            }
        },

        {
            category: 'Chat Editor', name: 'acceptAllEdits', value: {
                command: 'chatEditor.action.acceptAllEdits',
                chatIsEnabled: true,
                chatEdits: {
                    hasEditorModifications: true,
                    hasUndecidedResources: true
                }
            }
        },

        {
            category: 'Chat Editor', name: 'acceptHunk + cascade', value: {
                command: 'chatEditor.action.acceptHunk',
                chatIsEnabled: true,
                cascade: vscode.Cascade,
                interactive: vscode.interactive,
                chatEdits: { hasEditorModifications: true }
            }
        },

        {
            category: 'Chat Editor', name: 'reject and undoHunk', value: {
                commands: {
                    reject: 'chatEditor.action.reject',
                    undoHunk: 'chatEditor.action.undoHunk'
                },
                chatIsEnabled: true,
                chatEdits: { hasEditorModifications: true }
            }
        }
    );

    // ===================================================================
    // CATEGORY 52: Chat Code Block Navigation (3 tests) 🔥🔥🔥
    // ===================================================================
    console.log('🔬 Category 52: Code Block Navigation');

    testCases.push(
        {
            category: 'Code Blocks', name: 'insertCodeBlock', value: {
                command: 'workbench.action.chat.insertCodeBlock',
                inChatInput: true,
                chatInputHasText: true,
                chatLocation: 'panel',
                keybinding: 'Ctrl+Enter'
            }
        },

        {
            category: 'Code Blocks', name: 'nextCodeBlock', value: {
                command: 'workbench.action.chat.nextCodeBlock',
                chatIsEnabled: true,
                inChat: true,
                chatLocation: 'panel',
                keybinding: 'Ctrl+Alt+PageDown',
                currentCodeBlock: 2,
                totalCodeBlocks: 5
            }
        },

        {
            category: 'Code Blocks', name: 'previousCodeBlock with context', value: {
                command: 'workbench.action.chat.previousCodeBlock',
                chatIsEnabled: true,
                chatLocation: 'panel',
                keybinding: 'Ctrl+Alt+PageUp',
                currentCodeBlock: 4,
                chat: vscode.chat,
                interactive: vscode.interactive
            }
        }
    );

    // ===================================================================
    // CATEGORY 53: File Tree Navigation (2 tests) 🔥🔥
    // ===================================================================
    console.log('🔬 Category 53: File Tree Navigation');

    testCases.push(
        {
            category: 'File Trees', name: 'nextFileTree', value: {
                command: 'workbench.action.chat.nextFileTree',
                chatIsEnabled: true,
                chatLocation: 'panel',
                keybinding: 'Ctrl+F9',
                fileTreeIndex: 0,
                totalFileTrees: 3
            }
        },

        {
            category: 'File Trees', name: 'previousFileTree with cascade', value: {
                command: 'workbench.action.chat.previousFileTree',
                chatIsEnabled: true,
                keybinding: 'Ctrl+Shift+F9',
                cascade: vscode.Cascade,
                interactive: vscode.interactive,
                chat: vscode.chat
            }
        }
    );

    // ===================================================================
    // CATEGORY 54: New Chat / Prompt Actions (3 tests) 🔥🔥🔥
    // ===================================================================
    console.log('🔬 Category 54: New Chat / Prompts');

    testCases.push(
        {
            category: 'New Chat', name: 'newChat command', value: {
                command: 'workbench.action.chat.newChat',
                chatIsEnabled: true,
                keybindings: ['Ctrl+L', 'Ctrl+N'],
                chatLocation: 'panel'
            }
        },

        {
            category: 'New Chat', name: 'run.prompt', value: {
                command: 'workbench.action.chat.run.prompt',
                chatIsEnabled: true,
                keybinding: 'Alt+Win+/',
                promptFile: true
            }
        },

        {
            category: 'New Chat', name: 'attach.instructions', value: {
                command: 'workbench.action.chat.attach.instructions',
                chatIsEnabled: true,
                inChatInput: true,
                keybinding: 'Ctrl+Alt+/',
                instructionsFile: '.prompts/instructions.md'
            }
        }
    );

    // ===================================================================
    // CATEGORY 55: Voice Chat (4 tests) 🔥🔥
    // ===================================================================
    console.log('🔬 Category 55: Voice Chat');

    testCases.push(
        {
            category: 'Voice Chat', name: 'startVoiceChat', value: {
                command: 'workbench.action.chat.startVoiceChat',
                chatIsEnabled: true,
                hasSpeechProvider: true,
                keybinding: 'Ctrl+I'
            }
        },

        {
            category: 'Voice Chat', name: 'stopListening', value: {
                command: 'workbench.action.chat.stopListening',
                voiceChatInProgress: true,
                chatIsEnabled: true,
                keybinding: 'Escape'
            }
        },

        {
            category: 'Voice Chat', name: 'stopListeningAndSubmit', value: {
                command: 'workbench.action.chat.stopListeningAndSubmit',
                voiceChatInProgress: true,
                chatIsEnabled: true,
                keybinding: 'Ctrl+I',
                hasTranscription: true
            }
        },

        {
            category: 'Voice Chat', name: 'speech.stopReadAloud', value: {
                command: 'workbench.action.speech.stopReadAloud',
                chatIsEnabled: true,
                hasSpeechProvider: true,
                keybinding: 'Escape'
            }
        }
    );

    // ===================================================================
    // CATEGORY 56: Focus & Confirmation (2 tests) 🔥
    // ===================================================================
    console.log('🔬 Category 56: Focus & Confirmation');

    testCases.push(
        {
            category: 'Focus', name: 'focusConfirmation', value: {
                command: 'workbench.action.chat.focusConfirmation',
                chatIsEnabled: true,
                keybinding: 'Ctrl+Shift+A',
                chatEdits: { hasEditorModifications: true }
            }
        },

        {
            category: 'Focus', name: 'addDynamicVariable', value: {
                command: 'workbench.action.chat.addDynamicVariable',
                chatIsEnabled: true,
                inChatInput: true,
                variableName: '#custom',
                variableValue: 'test value'
            }
        }
    );

    // ===================================================================
    // CATEGORY 57: Comprehensive Chat State (2 tests) 🔥🔥🔥
    // ===================================================================
    console.log('🔬 Category 57: Chat State Objects');

    testCases.push(
        {
            category: 'Chat State', name: 'complete state object', value: {
                chatIsEnabled: true,
                inChat: true,
                inChatInput: true,
                chatInputHasText: true,
                chatLocation: 'panel',
                chatCursorAtTop: false,
                chatSessionRequestInProgress: false,
                chatSessionCurrentlyEditing: false,
                chatEdits: {
                    hasEditorModifications: false,
                    isRequestInProgress: false
                },
                voiceChatInProgress: false,
                hasSpeechProvider: true,
                accessibleViewInCodeBlock: false,
                chat: vscode.chat,
                interactive: vscode.interactive
            }
        },

        {
            category: 'Chat State', name: 'state with cascade', value: {
                chatIsEnabled: true,
                inChat: true,
                chatLocation: 'panel',
                chatSessionCurrentlyEditing: true,
                cascade: vscode.Cascade,
                interactive: vscode.interactive,
                chat: vscode.chat,
                lm: vscode.lm,
                stateSync: vscode.antigravityUnifiedStateSync
            }
        }
    );

    // ===================================================================
    // CATEGORY 58: ALL Commands Combined (1 test) 🔥🔥🔥
    // ===================================================================
    console.log('🔬 Category 58: All Commands Combined');

    testCases.push(
        {
            category: 'All Commands', name: 'mega commands object', value: {
                workbenchChatCommands: {
                    submit: 'workbench.action.chat.submit',
                    applyInEditor: 'workbench.action.chat.applyInEditor',
                    insertCodeBlock: 'workbench.action.chat.insertCodeBlock',
                    runInTerminal: 'workbench.action.chat.runInTerminal',
                    newChat: 'workbench.action.chat.newChat',
                    nextCodeBlock: 'workbench.action.chat.nextCodeBlock',
                    previousCodeBlock: 'workbench.action.chat.previousCodeBlock',
                    nextFileTree: 'workbench.action.chat.nextFileTree',
                    previousFileTree: 'workbench.action.chat.previousFileTree',
                    attachContext: 'workbench.action.chat.attachContext',
                    startVoiceChat: 'workbench.action.chat.startVoiceChat',
                    stopListening: 'workbench.action.chat.stopListening',
                    focusConfirmation: 'workbench.action.chat.focusConfirmation'
                },
                chatEditorCommands: {
                    accept: 'chatEditor.action.accept',
                    acceptAllEdits: 'chatEditor.action.acceptAllEdits',
                    acceptHunk: 'chatEditor.action.acceptHunk',
                    reject: 'chatEditor.action.reject',
                    undoHunk: 'chatEditor.action.undoHunk'
                },
                chatEditingCommands: {
                    acceptAllFiles: 'chatEditing.acceptAllFiles',
                    discardAllFiles: 'chatEditing.discardAllFiles'
                },
                antigravityCommands: {
                    chatOpen: 'antigravity.prioritized.chat.open',
                    exportChatNow: 'antigravity.exportChatNow',
                    conversationPicker: 'antigravity.openConversationPicker'
                },
                vscodeAPIs: {
                    chat: vscode.chat,
                    lm: vscode.lm,
                    interactive: vscode.interactive,
                    cascade: vscode.Cascade
                }
            }
        }
    );

    // ===================================================================
    // CATEGORY 59: ALL Context Conditions (1 test) 🔥🔥
    // ===================================================================
    console.log('🔬 Category 59: All Context Conditions');

    testCases.push(
        {
            category: 'Contexts', name: 'all conditions mega object', value: {
                contextConditions: {
                    chatIsEnabled: true,
                    inChat: true,
                    inChatInput: true,
                    chatInputHasText: true,
                    chatLocation: 'panel',
                    chatCursorAtTop: true,
                    chatSessionRequestInProgress: false,
                    chatSessionCurrentlyEditing: false,
                    chatAgentKind: 'ask',
                    voiceChatInProgress: false,
                    hasSpeechProvider: true,
                    inlineChatVisible: false,
                    inlineChatHasProvider: true,
                    accessibleViewInCodeBlock: false
                },
                chat: vscode.chat,
                interactive: vscode.interactive,
                cascade: vscode.Cascade
            }
        }
    );

    // ===================================================================
    // CATEGORY 60: THE ABSOLUTE EVERYTHING (1 test) 🏆🔥🔥🔥
    // ===================================================================
    console.log('🔬 Category 60: THE ABSOLUTE EVERYTHING');

    testCases.push(
        {
            category: '🏆 ULTIMATE', name: 'THE ABSOLUTE EVERYTHING', value: {
                // Todos los comandos workbench.action.chat.*
                workbenchChatCommands: {
                    submit: 'workbench.action.chat.submit',
                    submitWithCodebase: 'workbench.action.chat.submitWithCodebase',
                    applyInEditor: 'workbench.action.chat.applyInEditor',
                    insertCodeBlock: 'workbench.action.chat.insertCodeBlock',
                    runInTerminal: 'workbench.action.chat.runInTerminal',
                    newChat: 'workbench.action.chat.newChat',
                    nextCodeBlock: 'workbench.action.chat.nextCodeBlock',
                    previousCodeBlock: 'workbench.action.chat.previousCodeBlock',
                    nextFileTree: 'workbench.action.chat.nextFileTree',
                    previousFileTree: 'workbench.action.chat.previousFileTree',
                    attachContext: 'workbench.action.chat.attachContext',
                    attachInstructions: 'workbench.action.chat.attach.instructions',
                    runPrompt: 'workbench.action.chat.run.prompt',
                    startVoiceChat: 'workbench.action.chat.startVoiceChat',
                    stopListening: 'workbench.action.chat.stopListening',
                    stopListeningAndSubmit: 'workbench...action.chat.stopListeningAndSubmit',
                    focusConfirmation: 'workbench.action.chat.focusConfirmation',
                    addDynamicVariable: 'workbench.action.chat.addDynamicVariable'
                },
                // Comandos chatEditor.action.*
                chatEditorCommands: {
                    accept: 'chatEditor.action.accept',
                    acceptAllEdits: 'chatEditor.action.acceptAllEdits',
                    acceptHunk: 'chatEditor.action.acceptHunk',
                    reject: 'chatEditor.action.reject',
                    undoHunk: 'chatEditor.action.undoHunk'
                },
                // Comandos chatEditing.*
                chatEditingCommands: {
                    acceptAllFiles: 'chatEditing.acceptAllFiles',
                    discardAllFiles: 'chatEditing.discardAllFiles'
                },
                // Comandos Antigravity
                antigravityCommands: {
                    chatOpen: 'antigravity.prioritized.chat.open',
                    exportChatNow: 'antigravity.exportChatNow',
                    conversationPicker: 'antigravity.openConversationPicker',
                    sendTerminalToChat: 'antigravity.sendTerminalToChat',
                    autoCopyChat: 'antigravity.exporter.autoCopyChat'
                },
                // VS Code APIs
                vscodeAPIs: {
                    chat: vscode.chat,
                    lm: vscode.lm,
                    interactive: vscode.interactive,
                    cascade: vscode.Cascade,
                    window: vscode.window,
                    workspace: vscode.workspace,
                    env: vscode.env
                },
                // Condiciones de contexto
                contextConditions: {
                    chatIsEnabled: true,
                    inChat: true,
                    inChatInput: true,
                    chatInputHasText: true,
                    chatLocation: 'panel',
                    chatCursorAtTop: false,
                    chatSessionRequestInProgress: false,
                    chatSessionCurrentlyEditing: false,
                    voiceChatInProgress: false,
                    hasSpeechProvider: true
                },
                // Contexto del editor
                editorContext: {
                    activeEditor,
                    activeDoc,
                    uri: activeUri,
                    selection: activeEditor?.selection,
                    language: activeDoc?.languageId
                },
                // Sesión de chat
                chatSession: {
                    id: 'absolute-everything-' + Date.now(),
                    type: 'chat',
                    state: 'active',
                    panel: 'cascade',
                    location: 'panel',
                    messages: [],
                    history: []
                },
                // State Sync
                stateSync: {
                    topic: 'chat',
                    sync: vscode.antigravityUnifiedStateSync
                },
                // Metadata
                metadata: {
                    timestamp: Date.now(),
                    version: vscode.version,
                    appName: vscode.env.appName,
                    sessionId: vscode.env.sessionId
                },
                // Transfer Request
                transferRequest: {
                    action: 'transferActiveChat',
                    source: 'extension',
                    target: 'cascade',
                    includeHistory: true,
                    includeContext: true,
                    includeEdits: true,
                    includeCodeBlocks: true,
                    includeVoiceData: true
                }
            }
        }
    );

    // ===================================================================
    // CATEGORY 61: Inline Chat Integration (6 tests) 🔥🔥🔥
    // ===================================================================
    console.log('🔬 Category 61: Inline Chat');

    testCases.push(
        {
            category: 'InlineChat', name: 'inlineChat.accept', value: {
                command: 'inlineChat.accept',
                inlineChatVisible: true,
                inlineChatHasProvider: true,
                editorFocus: true
            }
        },

        {
            category: 'InlineChat', name: 'inlineChat.discard + cascade', value: {
                command: ' inlineChat.discard',
                inlineChatVisible: true,
                cascade: vscode.Cascade,
                interactive: vscode.interactive
            }
        },

        {
            category: 'InlineChat', name: 'inlineChat.regenerate', value: {
                command: 'inlineChat.regenerate',
                inlineChatVisible: true,
                previousResponse: 'test response'
            }
        },

        {
            category: 'InlineChat', name: 'inlineChat full context', value: {
                inlineChat: {
                    visible: true,
                    hasProvider: true,
                    focused: true,
                    responseType: 'messagesAndEdits'
                },
                chat: vscode.chat,
                interactive: vscode.interactive,
                editor: activeEditor
            }
        },

        {
            category: 'InlineChat', name: 'feedbackHelpful', value: {
                command: 'inlineChat.feedbackHelpful',
                inlineChatVisible: true,
                responseId: 'inline-response-123'
            }
        },

        {
            category: 'InlineChat', name: 'moveToPanel', value: {
                command: 'inlineChat.moveToPanel',
                inlineChatVisible: true,
                targetPanel: 'cascade'
            }
        }
    );

    // ===================================================================
    // CATEGORY 62: Notebook Cell Integration (5 tests) 🔥🔥
    // ===================================================================
    console.log('🔬 Category 62: Notebook Chat');

    testCases.push(
        {
            category: 'Notebook Chat', name: 'notebook with chat context', value: {
                notebookEditorFocused: true,
                notebookCellListFocused: true,
                chatIsEnabled: true,
                activeEditor,
                notebook: {
                    chatContext: true,
                    cells: [],
                    activeCell: 0
                }
            }
        },

        {
            category: 'Notebook Chat', name: 'notebook cell execute with chat', value: {
                command: 'notebook.cell.execute',
                notebookEditorFocused: true,
                chatIsEnabled: true,
                sendToChat: true,
                cellOutput: true
            }
        },

        {
            category: 'Notebook Chat', name: 'chat in notebook context', value: {
                chatIsEnabled: true,
                inChat: true,
                activeEditor: 'workbench.editor.notebook',
                chatLocation: 'notebook',
                notebookEditorFocused: true
            }
        },

        {
            category: 'Notebook Chat', name: 'inlineChat in notebook', value: {
                inlineChatVisible: true,
                inlineChatHasNotebookInline: true,
                activeEditor: 'workbench.editor.notebook',
                cascade: vscode.Cascade
            }
        },

        {
            category: 'Notebook Chat', name: 'notebook + interactive', value: {
                notebook: { focused: true, hasChat: true },
                interactive: vscode.interactive,
                chat: vscode.chat,
                activeEditor: 'workbench.editor.notebook'
            }
        }
    );

    // ===================================================================
    // CATEGORY 63: Accessibility (4 tests) 🔥
    // ===================================================================
    console.log('🔬 Category 63: Accessibility');

    testCases.push(
        {
            category: 'Accessibility', name: 'accessibleView chat', value: {
                accessibleViewIsShown: true,
                accessibleViewCurrentProviderId: 'panelChat',
                chatIsEnabled: true,
                accessibilityModeEnabled: true
            }
        },

        {
            category: 'Accessibility', name: 'accessible code blocks', value: {
                accessibleViewInCodeBlock: true,
                accessibleViewContainsCodeBlocks: true,
                chatIsEnabled: true
            }
        },

        {
            category: 'Accessibility', name: 'screenreader chat', value: {
                accessibilityModeEnabled: true,
                chatIsEnabled: true,
                inChat: true,
                screenReaderMode: true
            }
        },

        {
            category: 'Accessibility', name: 'verbosity settings', value: {
                accessibleViewVerbosityEnabled: true,
                chatIsEnabled: true,
                accessibleViewIsShown: true,
                verbosityLevel: 'detailed'
            }
        }
    );

    // ===================================================================
    // CATEGORY 64: History Navigation (5 tests) 🔥🔥
    // ===================================================================
    console.log('🔬 Category 64: History Navigation');

    testCases.push(
        {
            category: 'History Nav', name: 'chat history up', value: {
                command: 'chat.history.previous',
                inChatInput: true,
                chatCursorAtTop: true,
                historyIndex: 0
            }
        },

        {
            category: 'History Nav', name: 'chat history down', value: {
                command: 'chat.history.next',
                inChatInput: true,
                historyIndex: 5,
                totalHistory: 10
            }
        },

        {
            category: 'History Nav', name: 'chat clear history', value: {
                command: 'chat.clearHistory',
                chatIsEnabled: true,
                historyCount: 50
            }
        },

        {
            category: 'History Nav', name: 'chat search history', value: {
                command: 'chat.searchHistory',
                chatIsEnabled: true,
                searchTerm: 'test query'
            }
        },

        {
            category: 'History Nav', name: 'full history object', value: {
                chatHistory: {
                    items: [],
                    currentIndex: 0,
                    maxSize: 100,
                    searchEnabled: true
                },
                chat: vscode.chat,
                interactive: vscode.interactive
            }
        }
    );

    // ===================================================================
    // CATEGORY 65: Participants/Agents (5 tests) 🔥🔥🔥
    // ===================================================================
    console.log('🔬 Category 65: Participants/Agents');

    testCases.push(
        {
            category: 'Participants', name: 'chat participant selection', value: {
                chatParticipant: '@workspace',
                chatIsEnabled: true,
                inChatInput: true,
                availableParticipants: ['@workspace', '@vscode', '@terminal']
            }
        },

        {
            category: 'Participants', name: 'chat agent switch', value: {
                command: 'chat.switchAgent',
                currentAgent: '@workspace',
                targetAgent: '@vscode',
                chatIsEnabled: true
            }
        },

        {
            category: 'Participants', name: 'chatAgentKind ask', value: {
                chatAgentKind: 'ask',
                chatParticipant: '@vscode',
                chatInputHasText: true,
                inChatInput: true
            }
        },

        {
            category: 'Participants', name: 'multi-participant chat', value: {
                chatParticipants: ['@workspace', '@terminal', '@vscode'],
                activeParticipant: '@workspace',
                chatIsEnabled: true,
                chat: vscode.chat
            }
        },

        {
            category: 'Participants', name: 'participant with cascade', value: {
                chatParticipant: '@workspace',
                cascade: vscode.Cascade,
                interactive: vscode.interactive,
                chat: vscode.chat
            }
        }
    );

    // ===================================================================
    // CATEGORY 66: Variables & Context (6 tests) 🔥🔥
    // ===================================================================
    console.log('🔬 Category 66: Variables & Context');

    testCases.push(
        {
            category: 'Variables', name: 'chat file variable', value: {
                chatVariable: '#file',
                chatIsEnabled: true,
                inChatInput: true,
                file: activeUri
            }
        },

        {
            category: 'Variables', name: 'chat selection variable', value: {
                chatVariable: '#selection',
                chatIsEnabled: true,
                selection: activeEditor?.selection,
                editor: activeEditor
            }
        },

        {
            category: 'Variables', name: 'chat codebase variable', value: {
                chatVariable: '#codebase',
                chatIsEnabled: true,
                workspace: vscode.workspace,
                includeWorkspace: true
            }
        },

        {
            category: 'Variables', name: 'chat terminal variable', value: {
                chatVariable: '#terminalLastCommand',
                chatIsEnabled: true,
                terminal: vscode.window.activeTerminal
            }
        },

        {
            category: 'Variables', name: 'all variables combined', value: {
                chatVariables: {
                    file: activeUri,
                    selection: activeEditor?.selection,
                    codebase: vscode.workspace,
                    terminal: vscode.window.activeTerminal
                },
                chatIsEnabled: true,
                chat: vscode.chat
            }
        },

        {
            category: 'Variables', name: 'dynamic variable add', value: {
                command: 'workbench.action.chat.addDynamicVariable',
                variableName: '#custom',
                variableValue: 'test value',
                chatIsEnabled: true
            }
        }
    );

    // ===================================================================
    // CATEGORY 67: Streaming & Progress (5 tests) 🔥🔥
    // ===================================================================
    console.log('🔬 Category 67: Streaming & Progress');

    testCases.push(
        {
            category: 'Streaming', name: 'chat streaming active', value: {
                chatIsEnabled: true,
                chatSessionRequestInProgress: true,
                streaming: true,
                partialResponse: 'Test response in progress...'
            }
        },

        {
            category: 'Streaming', name: 'chat cancel stream', value: {
                command: 'chat.cancelRequest',
                chatSessionRequestInProgress: true,
                chatIsEnabled: true,
                requestId: 'req-123'
            }
        },

        {
            category: 'Streaming', name: 'chat progress indicator', value: {
                chatIsEnabled: true,
                inChat: true,
                progressIndicator: {
                    visible: true,
                    message: 'Generating response...',
                    percentage: 45
                }
            }
        },

        {
            category: 'Streaming', name: 'stream with cascade', value: {
                chatSessionRequestInProgress: true,
                streaming: true,
                cascade: vscode.Cascade,
                interactive: vscode.interactive,
                chat: vscode.chat
            }
        },

        {
            category: 'Streaming', name: 'streaming state full', value: {
                chatStreaming: {
                    active: true,
                    requestId: 'stream-456',
                    chunks: [],
                    bytesReceived: 1024,
                    timeElapsed: 2500
                },
                chatIsEnabled: true
            }
        }
    );

    // ===================================================================
    // CATEGORY 68: Settings & Config (5 tests) 🔥
    // ===================================================================
    console.log('🔬 Category 68: Settings & Config');

    testCases.push(
        {
            category: 'Settings', name: 'chat model selection', value: {
                chatModel: 'gpt-4',
                chatIsEnabled: true,
                availableModels: ['gpt-4', 'gpt-3.5-turbo', 'claude'],
                chat: vscode.chat
            }
        },

        {
            category: 'Settings', name: 'chat temperature', value: {
                chatConfig: {
                    temperature: 0.7,
                    maxTokens: 2000,
                    topP: 0.9
                },
                chatIsEnabled: true
            }
        },

        {
            category: 'Settings', name: 'chat context limit', value: {
                chatConfig: {
                    contextLimit: 8000,
                    includeWorkspace: true,
                    includeGitHistory: false
                },
                chatIsEnabled: true
            }
        },

        {
            category: 'Settings', name: 'chat prompt files config', value: {
                config: {
                    chat: {
                        promptFiles: true,
                        promptsPath: '.prompts'
                    }
                },
                chatIsEnabled: true
            }
        },

        {
            category: 'Settings', name: 'full chat configuration', value: {
                chatConfiguration: {
                    model: 'gpt-4',
                    temperature: 0.7,
                    maxTokens: 2000,
                    contextLimit: 8000,
                    promptFiles: true,
                    voiceEnabled: true,
                    streamingEnabled: true
                },
                chat: vscode.chat,
                chatIsEnabled: true
            }
        }
    );

    // ===================================================================
    // CATEGORY 69: Keyboard Shortcuts (5 tests) 🔥🔥
    // ===================================================================
    console.log('🔬 Category 69: Shortcuts');

    testCases.push(
        {
            category: 'Shortcuts', name: 'Ctrl+L open chat', value: {
                keybinding: 'Ctrl+L',
                command: 'antigravity.prioritized.chat.open',
                when: '!terminalFocus',
                chatIsEnabled: true
            }
        },

        {
            category: 'Shortcuts', name: 'Ctrl+Enter submit', value: {
                keybinding: 'Ctrl+Enter',
                command: 'workbench.action.chat.submit',
                when: 'chatInputHasText && inChatInput',
                chatIsEnabled: true
            }
        },

        {
            category: 'Shortcuts', name: 'Ctrl+/ attach context', value: {
                keybinding: 'Ctrl+/',
                command: 'workbench.action.chat.attachContext',
                when: 'inChatInput && chatLocation == panel',
                chatIsEnabled: true
            }
        },

        {
            category: 'Shortcuts', name: 'all shortcuts object', value: {
                chatShortcuts: {
                    'Ctrl+L': 'chat.open',
                    'Ctrl+Enter': 'chat.submit',
                    'Ctrl+/': 'chat.attachContext',
                    'Ctrl+I': 'chat.startVoiceChat',
                    'Ctrl+Alt+Enter': 'chat.runInTerminal',
                    'Ctrl+N': 'chat.newChat'
                },
                chatIsEnabled: true
            }
        },

        {
            category: 'Shortcuts', name: 'shortcuts with cascade', value: {
                shortcuts: {
                    'Ctrl+L': 'chat.open',
                    'Ctrl+Enter': 'chat.submit'
                },
                cascade: vscode.Cascade,
                interactive: vscode.interactive,
                chat: vscode.chat
            }
        }
    );

    // ===================================================================
    // CATEGORY 70: THE ULTIMATE 330 FINAL 🏆🔥🔥🔥
    // ===================================================================
    console.log('🔬 Category 70: 🏆 THE ULTIMATE 330 FINAL');

    testCases.push(
        {
            category: '🏆🏆🏆 ULTIMATE 330', name: 'THE ULTIMATE 330 FINAL MEGA OBJECT', value: {
                // ===== TODAS LAS APIS =====
                vscodeAPIs: {
                    chat: vscode.chat,
                    lm: vscode.lm,
                    interactive: vscode.interactive,
                    cascade: vscode.Cascade,
                    window: vscode.window,
                    workspace: vscode.workspace,
                    env: vscode.env,
                    version: vscode.version,
                    extensions: vscode.extensions,
                    languages: vscode.languages,
                    commands: vscode.commands
                },

                // ===== TODOS LOS COMANDOS WORKBENCH =====
                workbenchChatCommands: {
                    submit: 'workbench.action.chat.submit',
                    submitWithCodebase: 'workbench.action.chat.submitWithCodebase',
                    applyInEditor: 'workbench.action.chat.applyInEditor',
                    insertCodeBlock: 'workbench.action.chat.insertCodeBlock',
                    runInTerminal: 'workbench.action.chat.runInTerminal',
                    newChat: 'workbench.action.chat.newChat',
                    nextCodeBlock: 'workbench.action.chat.nextCodeBlock',
                    previousCodeBlock: 'workbench.action.chat.previousCodeBlock',
                    nextFileTree: 'workbench.action.chat.nextFileTree',
                    previousFileTree: 'workbench.action.chat.previousFileTree',
                    attachContext: 'workbench.action.chat.attachContext',
                    attachInstructions: 'workbench.action.chat.attach.instructions',
                    runPrompt: 'workbench.action.chat.run.prompt',
                    startVoiceChat: 'workbench.action.chat.startVoiceChat',
                    stopListening: 'workbench.action.chat.stopListening',
                    stopListeningAndSubmit: 'workbench.action.chat.stopListeningAndSubmit',
                    focusConfirmation: 'workbench.action.chat.focusConfirmation',
                    addDynamicVariable: 'workbench.action.chat.addDynamicVariable'
                },

                // ===== CHAT EDITOR =====
                chatEditorCommands: {
                    accept: 'chatEditor.action.accept',
                    acceptAllEdits: 'chatEditor.action.acceptAllEdits',
                    acceptHunk: 'chatEditor.action.acceptHunk',
                    reject: 'chatEditor.action.reject',
                    undoHunk: 'chatEditor.action.undoHunk'
                },

                // ===== CHAT EDITING =====
                chatEditingCommands: {
                    acceptAllFiles: 'chatEditing.acceptAllFiles',
                    discardAllFiles: 'chatEditing.discardAllFiles'
                },

                // ===== INLINE CHAT =====
                inlineChatCommands: {
                    accept: 'inlineChat.accept',
                    discard: 'inlineChat.discard',
                    regenerate: 'inlineChat.regenerate',
                    feedbackHelpful: 'inlineChat.feedbackHelpful',
                    feedbackUnhelpful: 'inlineChat.feedbackUnhelpful',
                    moveToPanel: 'inlineChat.moveToPanel'
                },

                // ===== ANTIGRAVITY =====
                antigravityCommands: {
                    chatOpen: 'antigravity.prioritized.chat.open',
                    exportChatNow: 'antigravity.exportChatNow',
                    conversationPicker: 'antigravity.openConversationPicker',
                    sendTerminalToChat: 'antigravity.sendTerminalToChat',
                    autoCopyChat: 'antigravity.exporter.autoCopyChat',
                    exportJSON: 'antigravity.exporter.exportJSON',
                    exportMarkdown: 'antigravity.exporter.exportMarkdown'
                },

                // ===== CONDICIONES DE CONTEXTO =====
                contextConditions: {
                    chatIsEnabled: true,
                    inChat: true,
                    inChatInput: true,
                    chatInputHasText: true,
                    chatLocation: 'panel',
                    chatCursorAtTop: true,
                    chatSessionRequestInProgress: false,
                    chatSessionCurrentlyEditing: false,
                    voiceChatInProgress: false,
                    hasSpeechProvider: true,
                    inlineChatVisible: false,
                    inlineChatHasProvider: true,
                    notebookEditorFocused: false,
                    accessibilityModeEnabled: false
                },

                // ===== CHAT EDITS STATE =====
                chatEdits: {
                    hasEditorModifications: true,
                    isRequestInProgress: false
                },

                // ===== EDITOR CONTEXT =====
                editorContext: {
                    activeEditor,
                    activeDoc,
                    uri: activeUri,
                    selection: activeEditor?.selection,
                    language: activeDoc?.languageId
                },

                // ===== CHAT SESSION ===== 
                chatSession: {
                    id: 'ultimate-330-' + Date.now(),
                    type: 'chat',
                    state: 'active',
                    panel: 'cascade',
                    location: 'panel',
                    messages: [],
                    history: [],
                    participants: ['user', 'assistant', '@workspace', '@vscode'],
                    currentlyEditing: false,
                    requestInProgress: false,
                    streaming: false
                },

                // ===== PARTICIPANTS =====
                chatParticipants: {
                    active: '@workspace',
                    available: ['@workspace', '@vscode', '@terminal'],
                    agentKind: 'ask'
                },

                // ===== VARIABLES =====
                chatVariables: {
                    file: activeUri,
                    selection: activeEditor?.selection,
                    codebase: vscode.workspace,
                    terminal: vscode.window.activeTerminal
                },

                // ===== CONFIGURATION =====
                chatConfiguration: {
                    model: 'gpt-4',
                    temperature: 0.7,
                    maxTokens: 2000,
                    contextLimit: 8000,
                    promptFiles: true,
                    voiceEnabled: true,
                    streamingEnabled: true
                },

                // ===== SHORTCUTS =====
                chatShortcuts: {
                    'Ctrl+L': 'chat.open',
                    'Ctrl+Enter': 'chat.submit',
                    'Ctrl+/': 'chat.attachContext',
                    'Ctrl+I': 'chat.startVoiceChat'
                },

                // ===== STATE SYNC =====
                stateSync: {
                    topic: 'chat',
                    sync: vscode.antigravityUnifiedStateSync
                },

                // ===== METADATA =====
                metadata: {
                    timestamp: Date.now(),
                    version: vscode.version,
                    appName: vscode.env.appName,
                    sessionId: vscode.env.sessionId,
                    machineId: vscode.env.machineId
                },

                // ===== TRANSFER REQUEST =====
                transferRequest: {
                    action: 'transferActiveChat',
                    source: 'extension',
                    target: 'cascade',
                    includeHistory: true,
                    includeContext: true,
                    includeEdits: true,
                    includeCodeBlocks: true,
                    includeFileTrees: true,
                    includeVoiceData: true,
                    includeParticipants: true,
                    includeVariables: true,
                    includeConfiguration: true,
                    includeShortcuts: true,
                    includeInlineChat: true,
                    includeNotebook: true,
                    includeAccessibility: true,
                    includeStreaming: true,
                    includeEverything: true
                }
            }
        }
    );

    console.log(`\n🎯 Part 2 loaded: ${testCases.length} additional test cases (Tests 231-330)`);
    return testCases;
};

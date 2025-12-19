# Antigravity API Exploration Report

**Generated:** 2025-12-19T03:03:46.052Z

---

## VS Code Standard APIs

### vscode.commands

**Status:** ✅ Available

**Methods:** registerCommand, registerTextEditorCommand, registerDiffInformationCommand, executeCommand, getCommands

### vscode.window
**Status:** ❌ Not Available

### vscode.workspace
**Status:** ❌ Not Available

### vscode.extensions
**Status:** ❌ Not Available

### vscode.languages
**Status:** ❌ Not Available

### vscode.debug

**Status:** ✅ Available

**Methods:** registerDebugVisualizationProvider, registerDebugVisualizationTreeProvider, onDidStartDebugSession, onDidTerminateDebugSession, onDidChangeActiveDebugSession, onDidReceiveDebugSessionCustomEvent, onDidChangeBreakpoints, onDidChangeActiveStackItem, registerDebugConfigurationProvider, registerDebugAdapterDescriptorFactory, registerDebugAdapterTrackerFactory, startDebugging, stopDebugging, addBreakpoints, removeBreakpoints, asDebugSourceUri

**Properties:** activeDebugSession, activeDebugConsole, breakpoints, activeStackItem

### vscode.tasks

**Status:** ✅ Available

**Methods:** registerTaskProvider, fetchTasks, executeTask, onDidStartTask, onDidEndTask, onDidStartTaskProcess, onDidEndTaskProcess, onDidStartTaskProblemMatchers, onDidEndTaskProblemMatchers

**Properties:** taskExecutions

### vscode.env
**Status:** ❌ Not Available

### vscode.authentication

**Status:** ✅ Available

**Methods:** getSession, getAccounts, hasSession, onDidChangeSessions, registerAuthenticationProvider

### vscode.chat

**Status:** ✅ Available

**Methods:** registerMappedEditsProvider, registerMappedEditsProvider2, createChatParticipant, createDynamicChatParticipant, registerChatParticipantDetectionProvider, registerRelatedFilesProvider, onDidDisposeChatSession, registerChatSessionItemProvider, registerChatSessionContentProvider, registerChatOutputRenderer

### vscode.lm
**Status:** ❌ Not Available

### vscode.ai

**Status:** ✅ Available

**Methods:** getRelatedInformation, registerRelatedInformationProvider, registerEmbeddingVectorProvider, registerSettingsSearchProvider

## Custom Antigravity APIs

### version
**Type:** string

### ai
**Type:** object
**Keys:** getRelatedInformation, registerRelatedInformationProvider, registerEmbeddingVectorProvider, registerSettingsSearchProvider

### comments
**Type:** object
**Keys:** createCommentController

### chat
**Type:** object
**Keys:** registerMappedEditsProvider, registerMappedEditsProvider2, createChatParticipant, createDynamicChatParticipant, registerChatParticipantDetectionProvider, registerRelatedFilesProvider, onDidDisposeChatSession, registerChatSessionItemProvider, registerChatSessionContentProvider, registerChatOutputRenderer

### terminalSuggest
**Type:** object
**Keys:** createTerminalSuggestion

### interactiveCascade
**Type:** object
**Keys:** setSuggestedActionsState, setBackgroundCascadeState

### interactive
**Type:** object
**Keys:** transferActiveChat

### l10n
**Type:** object
**Keys:** t, bundle, uri

### lm
**Type:** object
**Keys:** selectChatModels, onDidChangeChatModels, registerLanguageModelChatProvider, embeddingModels, onDidChangeEmbeddingModels, registerEmbeddingsProvider, computeEmbeddings, registerTool, invokeTool, tools, fileIsIgnored, registerIgnoredFileProvider, registerMcpServerDefinitionProvider, onDidChangeChatRequestTools

### notebooks
**Type:** object
**Keys:** createNotebookController, registerNotebookCellStatusBarItemProvider, createRendererMessaging, createNotebookControllerDetectionTask, registerKernelSourceActionProvider

### scm
**Type:** object
**Keys:** inputBox, createSourceControl

### speech
**Type:** object
**Keys:** registerSpeechProvider

### tests
**Type:** object
**Keys:** createTestController, createTestObserver, runTests, registerTestFollowupProvider, onDidChangeTestResults, testResults

### antigravityAuth
**Type:** object
**Keys:** setAuthStatus, setProfileUrl, setOAuthTokenInfo, clearUserStatus, getOAuthTokenInfo, getProfileData

### antigravitySettings
**Type:** object
**Keys:** onDidChangeSettings, resolveUnspecifiedSettings, setAntigravitySettings, readAntigravitySettings

### antigravityUnifiedStateSync
**Type:** object
**Keys:** subscribe, initIPCSubscription, onDidUpdateTopicIPC, pushSerializedUpdateIPC, pushUpdate

### antigravityMcp
**Type:** object
**Keys:** updateMcpServers, openPluginConfigModal

### Cascade
**Type:** object
**Keys:** setCascadeBarState, onDidRequestNextHunk, onDidRequestPreviousHunk, onDidRequestAcceptAllInFile, onDidRequestRejectAllInFile, openPanel, closePanel, togglePanel, getFocusState, getCascadeStarterPrompts

### cider
**Type:** object
**Keys:** registerQuickAccessProvider

### Breakpoint
**Type:** function

### TerminalOutputAnchor
**Type:** object
**Keys:** 0, 1, Top, Bottom

### ChatResultFeedbackKind
**Type:** object
**Keys:** 0, 1, Unhelpful, Helpful

### ChatVariableLevel
**Type:** object
**Keys:** 1, 2, 3, Short, Medium, Full

### ChatCompletionItem
**Type:** function

### ChatReferenceDiagnostic
**Type:** function

### CallHierarchyIncomingCall
**Type:** function

### CallHierarchyItem
**Type:** function

### CallHierarchyOutgoingCall
**Type:** function

### CancellationError
**Type:** function

### CandidatePortSource
**Type:** object
**Keys:** 0, 1, 2, 3, None, Process, Output, Hybrid

### CodeActionTriggerKind
**Type:** object
**Keys:** 1, 2, Invoke, Automatic

### Color
**Type:** function

### ColorInformation
**Type:** function

### ColorPresentation
**Type:** function

### ColorThemeKind
**Type:** object
**Keys:** 1, 2, 3, 4, Light, Dark, HighContrast, HighContrastLight

### CommentMode
**Type:** object
**Keys:** 0, 1, Editing, Preview

### CommentState
**Type:** object
**Keys:** 0, 1, Published, Draft

### CommentThreadCollapsibleState
**Type:** object
**Keys:** 0, 1, Collapsed, Expanded

### CommentThreadState
**Type:** object
**Keys:** 0, 1, Unresolved, Resolved

### CommentThreadApplicability
**Type:** object
**Keys:** 0, 1, Current, Outdated

### CommentThreadFocus
**Type:** object
**Keys:** 1, 2, Reply, Comment

### CompletionItemKind
**Type:** object
**Keys:** 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, Text, Method, Function, Constructor, Field, Variable, Class, Interface, Module, Property, Unit, Value, Enum, Keyword, Snippet, Color, File, Reference, Folder, EnumMember, Constant, Struct, Event, Operator, TypeParameter, User, Issue

### CompletionItemTag
**Type:** object
**Keys:** 1, Deprecated

### CompletionList
**Type:** function

### CompletionTriggerKind
**Type:** object
**Keys:** 0, 1, 2, Invoke, TriggerCharacter, TriggerForIncompleteCompletions

### CustomExecution
**Type:** function

### DebugAdapterExecutable
**Type:** function

### DebugAdapterInlineImplementation
**Type:** function

### DebugAdapterNamedPipeServer
**Type:** function

### DebugAdapterServer
**Type:** function

### DebugConfigurationProviderTriggerKind
**Type:** object
**Keys:** 1, 2, Initial, Dynamic

### DebugConsoleMode
**Type:** object
**Keys:** 0, 1, Separate, MergeWithParent

### DebugVisualization
**Type:** function

### DiagnosticRelatedInformation
**Type:** function

### DiagnosticSeverity
**Type:** object
**Keys:** 0, 1, 2, 3, Hint, Information, Warning, Error

### DiagnosticTag
**Type:** object
**Keys:** 1, 2, Unnecessary, Deprecated

### DocumentHighlightKind
**Type:** object
**Keys:** 0, 1, 2, Text, Read, Write

### MultiDocumentHighlight
**Type:** function

### DocumentLink
**Type:** function

### DocumentSymbol
**Type:** function

### EnvironmentVariableMutatorType
**Type:** object
**Keys:** 1, 2, 3, Replace, Append, Prepend

### EvaluatableExpression
**Type:** function

### InlineValueText
**Type:** function

### InlineValueVariableLookup
**Type:** function

### InlineValueEvaluatableExpression
**Type:** function

### InlineCompletionTriggerKind
**Type:** object
**Keys:** 0, 1, 2, Invoke, Automatic, WithCursorInSuggestedActionRange

### InlineCompletionsDisposeReasonKind
**Type:** object
**Keys:** 0, 1, 2, 3, 4, Other, Empty, TokenCancellation, LostRace, NotTaken

### ExtensionKind
**Type:** object
**Keys:** 1, 2, UI, Workspace

### ExtensionMode
**Type:** object
**Keys:** 1, 2, 3, Production, Development, Test

### ExternalUriOpenerPriority
**Type:** object
**Keys:** 0, 1, 2, 3, None, Option, Default, Preferred

### FileChangeType
**Type:** object
**Keys:** 1, 2, 3, Changed, Created, Deleted

### FileDecoration
**Type:** function

### FileDecoration2
**Type:** function

### FoldingRangeKind
**Type:** object
**Keys:** 1, 2, 3, Comment, Imports, Region

### FunctionBreakpoint
**Type:** function

### InlineCompletionItem
**Type:** function

### InlineCompletionList
**Type:** function

### VerboseHover
**Type:** function

### HoverVerbosityAction
**Type:** object
**Keys:** 0, 1, Increase, Decrease

### IndentAction
**Type:** object
**Keys:** 0, 1, 2, 3, None, Indent, IndentOutdent, Outdent

### MarkdownString
**Type:** function

### ParameterInformation
**Type:** function

### PortAutoForwardAction
**Type:** object
**Keys:** 1, 2, 3, 4, 5, 6, Notify, OpenBrowser, OpenPreview, Silent, Ignore, OpenBrowserOnce

### ProcessExecution
**Type:** function

### QuickInputButtonLocation
**Type:** object
**Keys:** 1, 2, Title, Inline

### RelativePattern
**Type:** function

### SelectionRange
**Type:** function

### SemanticTokens
**Type:** function

### SemanticTokensBuilder
**Type:** function

### SemanticTokensEdit
**Type:** function

### SemanticTokensEdits
**Type:** function

### SemanticTokensLegend
**Type:** function

### ShellExecution
**Type:** function

### ShellQuoting
**Type:** object
**Keys:** 1, 2, 3, Escape, Strong, Weak

### SignatureHelp
**Type:** function

### SignatureHelpTriggerKind
**Type:** object
**Keys:** 1, 2, 3, Invoke, TriggerCharacter, ContentChange

### SignatureInformation
**Type:** function

### SourceBreakpoint
**Type:** function

### StandardTokenType
**Type:** object
**Keys:** 0, 1, 2, 3, Other, Comment, String, RegEx

### SymbolKind
**Type:** object
**Keys:** 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, File, Module, Namespace, Package, Class, Method, Property, Field, Constructor, Enum, Interface, Function, Variable, Constant, String, Number, Boolean, Array, Object, Key, Null, EnumMember, Struct, Event, Operator, TypeParameter

### SymbolTag
**Type:** object
**Keys:** 1, Deprecated

### Task
**Type:** function

### TaskEventKind
**Type:** object
**Keys:** Changed, ProcessStarted, ProcessEnded, Terminated, Start, AcquiredInput, DependsOnStarted, Active, Inactive, End, ProblemMatcherStarted, ProblemMatcherEnded, ProblemMatcherFoundErrors

### TaskGroup
**Type:** function

### TaskPanelKind
**Type:** object
**Keys:** 1, 2, 3, Shared, Dedicated, New

### TaskRevealKind
**Type:** object
**Keys:** 1, 2, 3, Always, Silent, Never

### TaskScope
**Type:** object
**Keys:** 1, 2, Global, Workspace

### TerminalLink
**Type:** function

### TerminalQuickFixTerminalCommand
**Type:** function

### TerminalQuickFixOpener
**Type:** function

### TerminalLocation
**Type:** object
**Keys:** 1, 2, Panel, Editor

### TerminalProfile
**Type:** function

### TerminalExitReason
**Type:** object
**Keys:** 0, 1, 2, 3, 4, Unknown, Shutdown, Process, User, Extension

### TerminalShellExecutionCommandLineConfidence
**Type:** object
**Keys:** 0, 1, 2, Low, Medium, High

### TerminalCompletionItem
**Type:** function

### TerminalCompletionItemKind
**Type:** object
**Keys:** 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, File, Folder, Method, Alias, Argument, Option, OptionValue, Flag, SymbolicLinkFile, SymbolicLinkFolder, Commit, Branch, Tag, Stash, Remote, PullRequest, PullRequestDone

### TerminalCompletionList
**Type:** function

### TerminalShellType
**Type:** object
**Keys:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, Sh, Bash, Fish, Csh, Ksh, Zsh, CommandPrompt, GitBash, PowerShell, Python, Julia, NuShell, Node

### TextDocumentSaveReason
**Type:** object
**Keys:** 1, 2, 3, Manual, AfterDelay, FocusOut

### SnippetTextEdit
**Type:** function

### TextEditorCursorStyle
**Type:** object
**Keys:** 1, 2, 3, 4, 5, 6, Line, Block, Underline, LineThin, BlockOutline, UnderlineThin

### TextEditorChangeKind
**Type:** object
**Keys:** 1, 2, 3, Addition, Deletion, Modification

### TextEditorLineNumbersStyle
**Type:** object
**Keys:** 0, 1, 2, 3, Off, On, Relative, Interval

### TextEditorSelectionChangeKind
**Type:** object
**Keys:** 1, 2, 3, Keyboard, Mouse, Command, fromValue

### SyntaxTokenType
**Type:** object
**Keys:** 0, 1, 2, 3, Other, Comment, String, RegEx, toString

### TextDocumentChangeReason
**Type:** object
**Keys:** 1, 2, Undo, Redo

### ThemeColor
**Type:** function

### TreeItemCheckboxState
**Type:** object
**Keys:** 0, 1, Unchecked, Checked

### TypeHierarchyItem
**Type:** function

### UIKind
**Type:** object
**Keys:** 1, 2, Desktop, Web

### ViewColumn
**Type:** object
**Keys:** 1, 2, 3, 4, 5, 6, 7, 8, 9, Active, -1, Beside, -2, One, Two, Three, Four, Five, Six, Seven, Eight, Nine

### DocumentPasteTriggerKind
**Type:** object
**Keys:** 0, 1, Automatic, PasteAs

### DocumentDropEdit
**Type:** function

### DocumentDropOrPasteEditKind
**Type:** function

### DocumentPasteEdit
**Type:** function

### InlayHint
**Type:** function

### InlayHintLabelPart
**Type:** function

### InlayHintKind
**Type:** object
**Keys:** 1, 2, Type, Parameter

### RemoteAuthorityResolverError
**Type:** function

### ResolvedAuthority
**Type:** function

### ManagedResolvedAuthority
**Type:** function

### SourceControlInputBoxValidationType
**Type:** object
**Keys:** 0, 1, 2, Error, Warning, Information

### ExtensionRuntime
**Type:** object
**Keys:** 1, 2, Node, Webworker

### TimelineItem
**Type:** function

### NotebookRange
**Type:** function

### NotebookCellKind
**Type:** object
**Keys:** 1, 2, Markup, Code

### NotebookCellExecutionState
**Type:** object
**Keys:** 1, 2, 3, Idle, Pending, Executing

### NotebookCellData
**Type:** function

### NotebookData
**Type:** function

### NotebookRendererScript
**Type:** function

### NotebookCellStatusBarAlignment
**Type:** object
**Keys:** 1, 2, Left, Right

### NotebookEditorRevealType
**Type:** object
**Keys:** 0, 1, 2, 3, Default, InCenter, InCenterIfOutsideViewport, AtTop

### NotebookCellOutput
**Type:** function

### NotebookCellOutputItem
**Type:** function

### CellErrorStackFrame
**Type:** function

### NotebookCellStatusBarItem
**Type:** function

### NotebookControllerAffinity
**Type:** object
**Keys:** 1, 2, Default, Preferred

### NotebookControllerAffinity2
**Type:** object
**Keys:** 1, 2, Default, Preferred, Hidden, -1

### NotebookEdit
**Type:** function

### NotebookKernelSourceAction
**Type:** function

### NotebookVariablesRequestKind
**Type:** object
**Keys:** 1, 2, Named, Indexed

### PortAttributes
**Type:** function

### LinkedEditingRanges
**Type:** function

### TestResultState
**Type:** object
**Keys:** 1, 2, 3, 4, 5, 6, Queued, Running, Passed, Failed, Skipped, Errored

### TestRunRequest
**Type:** function

### TestMessage
**Type:** function

### TestMessageStackFrame
**Type:** function

### TestTag
**Type:** function

### TestRunProfileKind
**Type:** object
**Keys:** 1, 2, 3, Run, Debug, Coverage

### TextSearchCompleteMessageType
**Type:** object
**Keys:** 1, 2, Information, Warning

### DataTransfer
**Type:** function

### DataTransferItem
**Type:** function

### TestCoverageCount
**Type:** function

### FileCoverage
**Type:** function

### StatementCoverage
**Type:** function

### BranchCoverage
**Type:** function

### DeclarationCoverage
**Type:** function

### WorkspaceTrustState
**Type:** object
**Keys:** 0, 1, 2, Untrusted, Trusted, Unspecified

### LanguageStatusSeverity
**Type:** object
**Keys:** 0, 1, 2, Information, Warning, Error

### QuickPickItemKind
**Type:** object
**Keys:** 0, Separator, -1, Default

### InputBoxValidationSeverity
**Type:** object
**Keys:** 1, 2, 3, Info, Warning, Error

### TabInputText
**Type:** function

### TabInputTextDiff
**Type:** function

### TabInputTextMerge
**Type:** function

### TabInputCustom
**Type:** function

### TabInputNotebook
**Type:** function

### TabInputNotebookDiff
**Type:** function

### TabInputWebview
**Type:** function

### TabInputTerminal
**Type:** function

### TabInputInteractiveWindow
**Type:** function

### TabInputChat
**Type:** function

### TabInputTextMultiDiff
**Type:** function

### TabInputJetskiArtifacts
**Type:** function

### TelemetryTrustedValue
**Type:** function

### LogLevel
**Type:** object
**Keys:** 0, 1, 2, 3, 4, 5, Off, Trace, Debug, Info, Warning, Error

### EditSessionIdentityMatch
**Type:** object
**Keys:** 0, 50, 100, Complete, Partial, None

### InteractiveSessionVoteDirection
**Type:** object
**Keys:** 0, 1, Down, Up

### ChatCopyKind
**Type:** object
**Keys:** 1, 2, Action, Toolbar

### ChatEditingSessionActionOutcome
**Type:** object
**Keys:** 1, 2, 3, Accepted, Rejected, Saved

### InteractiveEditorResponseFeedbackKind
**Type:** object
**Keys:** 0, 1, 2, 3, 4, Unhelpful, Helpful, Undone, Accepted, Bug

### DebugStackFrame
**Type:** function

### DebugThread
**Type:** function

### RelatedInformationType
**Type:** object
**Keys:** 1, 2, 3, 4, SymbolInformation, CommandInformation, SearchInformation, SettingInformation

### SpeechToTextStatus
**Type:** object
**Keys:** 1, 2, 3, 4, 5, Started, Recognizing, Recognized, Stopped, Error

### TextToSpeechStatus
**Type:** object
**Keys:** 1, 2, 3, Started, Stopped, Error

### PartialAcceptTriggerKind
**Type:** object
**Keys:** 0, 1, 2, 3, Unknown, Word, Line, Suggest

### InlineCompletionEndOfLifeReasonKind
**Type:** object
**Keys:** 0, 1, 2, Accepted, Rejected, Ignored

### InlineCompletionDisplayLocationKind
**Type:** object
**Keys:** 1, 2, Code, Label

### KeywordRecognitionStatus
**Type:** object
**Keys:** 1, 2, Recognized, Stopped

### ChatImageMimeType
**Type:** object
**Keys:** PNG, JPEG, GIF, WEBP, BMP

### ChatResponseMarkdownPart
**Type:** function

### ChatResponseFileTreePart
**Type:** function

### ChatResponseAnchorPart
**Type:** function

### ChatResponseProgressPart
**Type:** function

### ChatResponseProgressPart2
**Type:** function

### ChatResponseThinkingProgressPart
**Type:** function

### ChatResponseReferencePart
**Type:** function

### ChatResponseReferencePart2
**Type:** function

### ChatResponseCodeCitationPart
**Type:** function

### ChatResponseCodeblockUriPart
**Type:** function

### ChatResponseWarningPart
**Type:** function

### ChatResponseTextEditPart
**Type:** function

### ChatResponseNotebookEditPart
**Type:** function

### ChatResponseMarkdownWithVulnerabilitiesPart
**Type:** function

### ChatResponseCommandButtonPart
**Type:** function

### ChatResponseConfirmationPart
**Type:** function

### ChatResponseMovePart
**Type:** function

### ChatResponseExtensionsPart
**Type:** function

### ChatResponsePullRequestPart
**Type:** function

### ChatPrepareToolInvocationPart
**Type:** function

### ChatResponseMultiDiffPart
**Type:** function

### ChatResponseReferencePartStatusKind
**Type:** object
**Keys:** 1, 2, 3, Complete, Partial, Omitted

### ChatResponseClearToPreviousToolInvocationReason
**Type:** object
**Keys:** 0, 1, 2, NoReason, FilteredContentRetry, CopyrightContentRetry

### ChatRequestTurn
**Type:** function

### ChatRequestTurn2
**Type:** function

### ChatResponseTurn
**Type:** function

### ChatResponseTurn2
**Type:** function

### ChatToolInvocationPart
**Type:** function

### ChatLocation
**Type:** object
**Keys:** 1, 2, 3, 4, Panel, Terminal, Notebook, Editor

### ChatSessionStatus
**Type:** object
**Keys:** 0, 1, 2, Failed, Completed, InProgress

### ChatRequestEditorData
**Type:** function

### ChatRequestNotebookData
**Type:** function

### ChatReferenceBinaryData
**Type:** function

### ChatRequestEditedFileEventKind
**Type:** object
**Keys:** 1, 2, 3, Keep, Undo, UserModification

### LanguageModelChatMessageRole
**Type:** object
**Keys:** 1, 2, 3, User, Assistant, System

### LanguageModelChatMessage
**Type:** function

### LanguageModelChatMessage2
**Type:** function

### LanguageModelToolResultPart
**Type:** function

### LanguageModelToolResultPart2
**Type:** function

### LanguageModelTextPart
**Type:** function

### LanguageModelTextPart2
**Type:** function

### LanguageModelPartAudience
**Type:** object
**Keys:** 0, 1, 2, Assistant, User, Extension

### ToolResultAudience
**Type:** object
**Keys:** 0, 1, 2, Assistant, User, Extension

### LanguageModelToolCallPart
**Type:** function

### LanguageModelThinkingPart
**Type:** function

### LanguageModelError
**Type:** function

### LanguageModelToolResult
**Type:** function

### LanguageModelToolResult2
**Type:** function

### LanguageModelDataPart
**Type:** function

### LanguageModelDataPart2
**Type:** function

### LanguageModelToolExtensionSource
**Type:** function

### LanguageModelToolMCPSource
**Type:** function

### ExtendedLanguageModelToolResult
**Type:** function

### LanguageModelChatToolMode
**Type:** object
**Keys:** 1, 2, Auto, Required

### LanguageModelPromptTsxPart
**Type:** function

### NewSymbolName
**Type:** function

### NewSymbolNameTag
**Type:** object
**Keys:** 1, AIGenerated

### NewSymbolNameTriggerKind
**Type:** object
**Keys:** 0, 1, Invoke, Automatic

### ExcludeSettingOptions
**Type:** object
**Keys:** 1, 2, 3, None, FilesExclude, SearchAndFilesExclude

### TextSearchContext2
**Type:** function

### TextSearchMatch2
**Type:** function

### AISearchKeyword
**Type:** function

### TextSearchCompleteMessageTypeNew
**Type:** object
**Keys:** 1, 2, Information, Warning

### ChatErrorLevel
**Type:** object
**Keys:** 0, 1, 2, Info, Warning, Error

### McpHttpServerDefinition
**Type:** function

### McpStdioServerDefinition
**Type:** function

### SettingsSearchResultKind
**Type:** object
**Keys:** 1, 2, 3, EMBEDDED, LLM_RANKED, CANCELED

### TextEditorNudgePosition
**Type:** object
**Keys:** 1, 2, SelectionTopCenter, SelectionNearbyActive

### AntigravityNudgeButtonType
**Type:** object
**Keys:** 1, 2, Primary, Dropdown

### getAntigravityExtensionMetadata
**Type:** function

### getIdeVersion
**Type:** function

### onboardedInCurrentAppSession
**Type:** function

### antigravityAudio
**Type:** object
**Keys:** startAudioRecording, stopAudioRecording, getAverageVolume

### AntigravityEditStack
**Type:** object
**Keys:** pushToEditStack

### CommandPopupNotificationType
**Type:** object
**Keys:** 1, 2, 3, INFO, WARNING, ERROR

### AntigravityExtensionManager
**Type:** object
**Keys:** startAddedExtensionsOnDisk, getAllExtensionIdsFromDisk

### AntigravityFiles
**Type:** object
**Keys:** forceResolveFromFile, onDidDragToCascade

### AntigravitySettingsCategory
**Type:** object
**Keys:** ANTIGRAVITY_SETTINGS, EDITOR, CASCADE, GENERAL, ACCOUNT, ADVANCED, SHORTCUTS, USER_INTERFACE, ANTIGRAVITY_TAB, CASCADE_CONFIGURATION, CUSTOMIZATIONS, PLUGINS, BROWSER

### AntigravityStatusBarSettingTabType
**Type:** object
**Keys:** Settings, Keybindings

### AntigravityDevContainers
**Type:** object
**Keys:** registerAntigravityDevContainerContext

### DebugPanel
**Type:** object
**Keys:** setText

### playAudio
**Type:** function

### playNote
**Type:** function

### AntigravityAnnotations
**Type:** object
**Keys:** setAnnotation, removeAnnotation, getAnnotations, showAnnotation

### antigravityLanguageServer
**Type:** object
**Keys:** setPort, setCsrfToken

### JetskiTrace
**Type:** object
**Keys:** Thread, enabled, log, task, asyncTaskStart, asyncTaskEnd, getTraceJson

### UpdateThrottler
**Type:** function

### getCloudCodeUrl
**Type:** function

## Chat & AI APIs

### vscode.chat
**Status:** ✅ Available
**Methods:** registerMappedEditsProvider, registerMappedEditsProvider2, createChatParticipant, createDynamicChatParticipant, registerChatParticipantDetectionProvider, registerRelatedFilesProvider, onDidDisposeChatSession, registerChatSessionItemProvider, registerChatSessionContentProvider, registerChatOutputRenderer

### vscode.lm (Language Model)
**Status:** ✅ Available
**Methods:** selectChatModels, onDidChangeChatModels, registerLanguageModelChatProvider, embeddingModels, onDidChangeEmbeddingModels, registerEmbeddingsProvider, computeEmbeddings, registerTool, invokeTool, tools, fileIsIgnored, registerIgnoredFileProvider, registerMcpServerDefinitionProvider, onDidChangeChatRequestTools

## Global Objects

No relevant global objects found.

---

## Next Steps

1. Test each Chat API method
2. Explore network traffic for API calls
3. Inspect Antigravity source code (if available)
4. Document use cases for each API

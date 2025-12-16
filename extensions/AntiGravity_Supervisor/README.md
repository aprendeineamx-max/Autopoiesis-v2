# AntiGravity Supervisor Extension

> **The AI Supervisor that works alongside Gemini for autonomous development**

Part of the AntiGravity Ghost Agent project - Phase 7: Dual-Core Supervisor

---

## What is This?

The Supervisor Extension is an **AI agent** that runs inside AntiGravity IDE and **works together** with the Gemini executor agent to achieve **fully autonomous development**.

### The Concept:

```
┌────────────────────────────────────────┐
│      AntiGravity IDE                    │
│  ┌──────────┐        ┌───────────────┐ │
│  │ Gemini   │◄──────┤  Supervisor   │ │
│  │(Executor)│        │  (This)       │ │
│  └──────────┘        └───────────────┘ │
│       ▲                      │          │
│       └──────────────────────┘          │
│         GHOST_INPUT.txt                 │
└────────────────────────────────────────┘
```

- **Gemini (Executor)**: Implements code, runs tests, executes tasks
- **Supervisor (This Extension)**: Analyzes results, decides what's next, generates prompts

**Result**: Two AI agents conversing autonomously, no human needed! 🚀

---

## Features

✅ **Autonomous Conversation Loop**:
- Reads Gemini's last message
- Analyzes repo state (files, tests, errors)
- Calls external AI (Groq/OpenRouter/Google)
- Generates next prompt
- Repeats infinitely

✅ **Intelligent Context Awareness**:
- Git changes analysis
- Test results monitoring
- Task tracking from task.md
- Roadmap phase awareness

✅ **Multiple AI Providers**:
- Groq (Llama 3.3-70B) - Primary
- OpenRouter (Claude 3.5 Sonnet)
- Google Gemini - Backup
- Automatic fallback

✅ **Safety Mechanisms**:
- Emergency stop button
- Max cycles limit (default 1000)
- Human override capability

✅ **State Management**:
- Tracks all messages
- Monitors progress
- Persists conversation state

---

## Installation

### Prerequisites

1. Node.js installed
2. AntiGravity IDE installed
3. API keys for Groq/OpenRouter (already configured in `config/api-keys.json`)

### Steps

1. **Install dependencies**:
   ```bash
   cd AntiGravity_Supervisor
   npm install
   ```

2. **Link to AntiGravity**:
   - Copy this folder to AntiGravity's extensions directory
   - OR use VSCode's "Install from VSIX" (after packaging)

3. **Reload IDE**:
   - Restart AntiGravity
   - Extension will auto-activate

---

## Usage

### Commands (Ctrl+Shift+P)

1. **Start Autonomous Supervisor**:
   - Begins the autonomous loop
   - Supervisor will continuously generate prompts
   - Gemini will execute them

2. **Stop Autonomous Supervisor**:
   - Pauses the loop
   - State is preserved

3. **Supervisor Status**:
   - Shows current cycle count, test pass rate, etc.

4. **🚨 EMERGENCY STOP**:
   - Immediately halts all operations
   - Creates `EMERGENCY_STOP.flag`

5. **Run Single Cycle (Test)**:
   - Tests one cycle without starting full loop
   - Good for debugging

### Configuration

Edit in VSCode settings:

```json
{
  "antigravity.supervisor.provider": "groq",
  "antigravity.supervisor.cycleDelay": 30000,
  "antigravity.supervisor.maxCycles": 1000,
  "antigravity.supervisor.autoStart": false
}
```

---

## How It Works

### Autonomous Cycle

```
1. Read Gemini's last message
2. Analyze repo (git diff, test results)
3. Call Supervisor AI with context
4. Generate next prompt
5. Write to GHOST_INPUT.txt
6. Internal Hook auto-pastes to chat
7. Gemini responds
8. REPEAT (30s delay between cycles)
```

### Communication Protocol

**Files Used**:
- `GHOST_INPUT.txt` - Supervisor writes prompts here
- `GHOST_OUTPUT.txt` - Gemini responses (fallback)
- `CONVERSATION_STATE.json` - State persistence

---

## API Keys

Located in `config/api-keys.json`:

- **Groq**: Fast, powerful Llama model
- **OpenRouter**: Multi-model access (Claude, GPT-4, etc.)
- **Google**: Gemini API (3 keys with rotation)

**Already configured and ready to use!** ✅

---

## Project Structure

```
AntiGravity_Supervisor/
├── extension.js           # Main entry, autonomous loop
├── package.json           # Extension manifest
├── src/
│   ├── apiClient.js       # Groq/OpenRouter/Google calls
│   ├── stateManager.js    # Conversation state tracking
│   ├── repoAnalyzer.js    # Git & test analysis
│   ├── messageReader.js   # Read Gemini messages
│   └── promptGenerator.js # Future enhancements
├── config/
│   └── api-keys.json      # API credentials
└── README.md              # This file
```

---

## Testing

### Test Single Cycle

1. Open a workspace/project
2. Run command: "Run Single Cycle"
3. Check:
   - Console output
   - `GHOST_INPUT.txt` created
   - `CONVERSATION_STATE.json` updated

### Test Full Autonomous Loop

1. Start Internal Hook extension (for auto-paste)
2. Run command: "Start Autonomous Supervisor"
3. Watch the magic happen! 🎩✨
4. Stop when ready: "Stop Autonomous Supervisor"

---

## Troubleshooting

**Extension doesn't activate**:
- Check console for errors (`Help > Toggle Developer Tools`)
- Verify `package.json` is valid
- Ensure dependencies installed (`npm install`)

**API calls failing**:
- Check API keys in `config/api-keys.json`
- Verify internet connection
- Check Groq/OpenRouter service status

**No prompts being generated**:
- Check `CONVERSATION_STATE.json` exists
- Verify repo analyzer finding files
- Test with single cycle first

---

## Roadmap

### MVP (Current)
- [x] Extension boilerplate
- [x] API client (Groq/OpenRouter)
- [x] State manager
- [x] Repo analyzer
- [x] Autonomous loop
- [ ] First successful cycle

### Phase 2
- [ ] Webview message reading (when API available)
- [ ] Enhanced context analysis
- [ ] 10+ autonomous cycles
- [ ] Completion criteria detection

### Phase 3
- [ ] 100+ autonomous cycles
- [ ] Project completion automation
- [ ] Telegram notifications (Phase 8)
- [ ] Vision integration (Phase 6)

---

## The Vision

**From the ROADMAP**:

> "Two AIs Working Together, No Human Needed"  
> "First truly autonomous IDE agent" 🌍

This extension is **Phase 7** of building **THE SINGULARITY** - a completely autonomous development system within AntiGravity IDE.

---

## Contributing

Part of the AntiGravity Ghost Agent monorepo.

See main `ROADMAP.md` for the full vision.

---

## License

UNLICENSED - Internal use

---

**Ready to achieve autonomy!** 🚀🤖

*"Los problemas NO SE OCULTAN, SE RESUELVEN"*  
*"Primero la perfección, luego el compartir"*  
*"Dos IAs son mejores que una"*

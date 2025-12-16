# AntiGravity Supervisor Extension - Installation & Usage Guide

## Quick Start

### 1. Install Extension

**Method A: Automatic (Recommended)**
```powershell
# Run as Administrator
cd C:\AntiGravityExt\AntiGravity_Ghost_Agent\AntiGravity_Supervisor
.\INSTALL.ps1
```

**Method B: Manual**
1. Copy entire `AntiGravity_Supervisor` folder to:
   ```
   %LOCALAPPDATA%\Programs\AntiGravity\resources\app\extensions\
   ```
2. Rename to `antigravity-supervisor`
3. Run `npm install` inside the folder

### 2. Reload AntiGravity

1. Close AntiGravity IDE completely
2. Reopen AntiGravity IDE
3. Check console for: `🤖 AntiGravity Supervisor Extension Activated`

### 3. Start Autonomous Operation

**Option A: Full Autonomous Loop**
```
Ctrl+Shift+P → "Start Autonomous Supervisor"
```

**Option B: Test Single Cycle**
```
Ctrl+Shift+P → "Run Single Cycle (Test)"
```

---

## Commands

All commands available via `Ctrl+Shift+P`:

### Start Autonomous Supervisor
- Begins infinite autonomous loop
- Runs cycle every 30 seconds
- Continues until max cycles (1000) or emergency stop

### Stop Autonomous Supervisor  
- Pauses the autonomous loop
- State is preserved
- Can be resumed later

### Supervisor Status
- Shows current cycle count
- Displays test pass rate
- Shows active provider/model

### 🚨 Emergency Stop
- Immediately halts all operations
- Creates `EMERGENCY_STOP.flag` file
- Human override for safety

### Run Single Cycle (Test)
- Executes one complete cycle
- Good for debugging
- Verifies system working

---

## Configuration

Edit `config/api-keys.json`:

```json
{
  "sambanova": {
    "api_key": "your-key-here"
  },
  "openrouter": {
    "api_key": "your-key-here"
  },
  "groq": {
    "api_key": "your-key-here"
  },
  "google": {
    "api_keys": ["key1", "key2", "key3"]
  },
  "settings": {
    "default_provider": "auto",
    "cycle_delay_ms": 30000,
    "max_cycles": 1000
  }
}
```

**VSCode Settings** (File → Preferences → Settings):
```json
{
  "antigravity.supervisor.provider": "auto",
  "antigravity.supervisor.cycleDelay": 30000,
  "antigravity.supervisor.maxCycles": 1000,
  "antigravity.supervisor.autoStart": false
}
```

---

## Testing

### Before First Use

1. **Test API Keys**:
   ```bash
   cd AntiGravity_Supervisor
   node apiKeyTester.js
   ```
   
   Expected: At least 1 provider with working models

2. **Check Credits**:
   ```bash
   node creditChecker.js
   ```
   
   Expected: OpenRouter shows credits, SambaNova shows limits

3. **Test Single Cycle**:
   ```bash
   node testFirstCycle.js
   ```
   
   Expected: Prompt generated and written to GHOST_INPUT.txt

### Verify Installation

1. Open AntiGravity IDE
2. Press `F12` (Developer Tools)
3. Check Console for:
   ```
   🤖 AntiGravity Supervisor Extension Activated
   Loaded configuration from: ...
   ```

### Test Commands

1. **Ctrl+Shift+P** → Type "supervisor"
2. Should see all 5 commands listed
3. Try "Supervisor Status"
4. Should show: "Not running" (initial state)

---

## Monitoring

### During Autonomous Operation

**Console Output** (F12 → Console):
```
🔄 Cycle 1 starting...
Reading last Gemini message...
Analyzing repository...
🎯 Selected best API: sambanova - Meta-Llama-3.1-8B-Instruct
✅ Success with sambanova - Meta-Llama-3.1-8B-Instruct
✅ Prompt written to GHOST_INPUT.txt (324 chars)
✅ Cycle 1 complete (1.2s)
```

**File Monitoring**:
- `GHOST_INPUT.txt` - Updated each cycle with new prompt
- `CONVERSATION_STATE.json` - Tracks conversation history
- `config/apiStats.json` - Performance statistics
- `config/gray-list.json` - Failed models/reasons

**Status Command**:
```
Ctrl+Shift+P → "Supervisor Status"

Shows:
- Cycle count: 47
- Test pass rate: 94.5%
- Provider: sambanova
- Model: Meta-Llama-3.1-8B-Instruct
```

---

## Troubleshooting

### Extension Not Showing

**Problem**: Commands not appearing in Ctrl+Shift+P

**Solutions**:
1. Verify extension folder exists:
   ```
   %LOCALAPPDATA%\Programs\AntiGravity\resources\app\extensions\antigravity-supervisor
   ```

2. Check `package.json` is valid JSON

3. Reload window: `Ctrl+Shift+P` → "Reload Window"

4. Check console for errors (F12)

---

### API Calls Failing

**Problem**: "All API providers failed"

**Solutions**:
1. Run API key tester:
   ```bash
   node apiKeyTester.js
   ```

2. Check `api-test-results.json` for errors

3. Verify at least 1 provider has working models in `apiStats.json`

4. Check internet connection

5. Regenerate API keys if leaked/expired

---

### No GHOST_INPUT.txt Created

**Problem**: File not being written

**Solutions**:
1. Check workspace folder is open

2. Verify write permissions

3. Check path in code is correct

4. Look for errors in console (F12)

5. Try manual test:
   ```bash
   node testFirstCycle.js
   ```

---

### Internal Hook Not Auto-Pasting

**Problem**: Prompts not reaching Gemini

**Solutions**:
1. Verify Internal Hook extension is active

2. Check `HOOK_ALIVE.txt` exists

3. Increase cycle delay (give more time):
   ```json
   "cycle_delay_ms": 60000
   ```

4. Check Internal Hook console for errors

---

## Performance

### Expected Metrics

**Single Cycle**:
- Duration: <5 seconds
- API call: 1-3 seconds
- File operations: <1 second
- Repo analysis: <1 second

**10 Cycles**:
- Duration: ~5 minutes (30s delay per cycle)
- Memory: <100 MB
- No memory leaks

**100+ Cycles**:
- Stable performance
- Automatic fallback on failures
- Learning improves selection

### Optimization Tips

1. **Use Fastest Models**:
   - SambaNova: Meta-Llama-3.1-8B-Instruct (181ms)
   - OpenRouter: meta-llama/llama-3.2-3b-instruct:free (652ms)

2. **Adjust Cycle Delay**:
   - Fast: 15000ms (15s) - for rapid testing
   - Normal: 30000ms (30s) - balanced
   - Conservative: 60000ms (60s) - safe for rate limits

3. **Limit Max Cycles**:
   - Testing: 10-50 cycles
   - Development: 100-500 cycles
   - Production: 1000+ cycles

---

## Safety

### Emergency Stop

Multiple ways to stop:

1. **Command**: `Ctrl+Shift+P` → "Emergency Stop"

2. **File**: Create `EMERGENCY_STOP.flag` in workspace root

3. **Close IDE**: Completely close AntiGravity

### Guardrails

Built-in safety mechanisms:

- ✅ Max cycles limit (prevents infinite loops)
- ✅ Timeout per cycle (2 min max)
- ✅ Rate limit respect (auto-throttling)
- ✅ Error recovery (doesn't crash on failures)
- ✅ Human override (emergency stop always works)

### Monitoring

Watch for:
- ⚠️ High failure rate (check gray list)
- ⚠️ Quota warnings (check credits)
- ⚠️ Slow response times (check stats)
- ⚠️ Repeated errors (check logs)

---

## Advanced Usage

### Custom Prompts

Edit `src/apiClient.js` → `buildSystemPrompt()`:

```javascript
buildSystemPrompt() {
    return `Your custom system prompt here...`;
}
```

### Quality Feedback

After task completion:

```javascript
const apiManager = new APIManager();
apiManager.updateQualityScore('sambanova', 'Meta-Llama-3.1-8B-Instruct', 1, 0.95);
```

Score: 0.0 (poor) to 1.0 (perfect)

### Provider Priority

Force specific provider:

```json
{
  "settings": {
    "default_provider": "sambanova"
  }
}
```

Options: `"auto"`, `"sambanova"`, `"openrouter"`, `"groq"`, `"google"`

---

## Uninstallation

```powershell
# Run as Administrator
cd C:\AntiGravityExt\AntiGravity_Ghost_Agent\AntiGravity_Supervisor
.\INSTALL.ps1 -Unlink
```

Or manually delete:
```
%LOCALAPPDATA%\Programs\AntiGravity\resources\app\extensions\antigravity-supervisor
```

---

## Support

**Documentation**:
- [README.md](./README.md) - Complete overview
- [API_MANAGEMENT.md](./API_MANAGEMENT.md) - API system details
- [TESTING.md](./TESTING.md) - Testing guide

**Tools**:
- `apiKeyTester.js` - Test all API keys
- `creditChecker.js` - Check credits/limits  
- `grayListManager.js` - View failed models
- `testFirstCycle.js` - Test single cycle

**Logs**:
- Browser console (F12)
- `api-test-results.json`
- `credit-check-results.json`
- `CONVERSATION_STATE.json`

---

**Ready to achieve autonomous singularity!** 🚀🤖

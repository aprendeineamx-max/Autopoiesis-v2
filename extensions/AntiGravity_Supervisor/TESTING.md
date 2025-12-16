# Supervisor Extension - Testing Guide

## Quick Start Testing

### 1. Install Dependencies

```bash
cd C:\AntiGravityExt\AntiGravity_Ghost_Agent\AntiGravity_Supervisor
npm install
```

### 2. Run Component Tests

```bash
node test.js
```

**Expected Output**:
- ✅ State Manager initialized
- ✅ Repo Analyzer working
- ✅ Groq API working
- ✅ GHOST_INPUT.txt written

### 3. Link to AntiGravity

**Option A: Symlink** (Recommended):
```powershell
# Run as Administrator
cd C:\Users\<YourUser>\AppData\Local\Programs\AntiGravity\resources\app\extensions

# Create symlink
New-Item -ItemType SymbolicLink -Path "antigravity-supervisor" -Target "C:\AntiGravityExt\AntiGravity_Ghost_Agent\AntiGravity_Supervisor"
```

**Option B: Copy**:
```powershell
Copy-Item -Path "C:\AntiGravityExt\AntiGravity_Ghost_Agent\AntiGravity_Supervisor" -Destination "C:\Users\<YourUser>\AppData\Local\Programs\AntiGravity\resources\app\extensions\antigravity-supervisor" -Recurse
```

### 4. Reload AntiGravity

1. Close AntiGravity completely
2. Reopen AntiGravity
3. Check console for: `🤖 AntiGravity Supervisor Extension Activated`

### 5. Test Single Cycle

1. Open workspace: `C:\AntiGravityExt\AntiGravity_Ghost_Agent`
2. Press `Ctrl+Shift+P`
3. Type: "Run Single Cycle"
4. Execute command
5. Check console output
6. Verify `GHOST_INPUT.txt` created in workspace root

---

## Detailed Testing Scenarios

### Test 1: Component Initialization

**Command**: `node test.js`

**What to Check**:
- [ ] State Manager creates `CONVERSATION_STATE.json`
- [ ] Repo Analyzer reads git status
- [ ] API Client connects to Groq
- [ ] GHOST files can be written

**Expected**: All ✅

---

### Test 2: Single Cycle (Standalone)

**Steps**:
1. Run command: "Run Single Cycle (Test)"
2. Watch console output
3. Check `GHOST_INPUT.txt` file

**Expected Behavior**:
```
🔄 Cycle 1 starting...
Reading last Gemini message...
Analyzing repository...
Calling Supervisor AI...
✅ Prompt written to GHOST_INPUT.txt (324 chars)
✅ Cycle 1 complete (2.5s)
```

**What to Verify**:
- [ ] Extension doesn't crash
- [ ] GHOST_INPUT.txt created
- [ ] Prompt looks reasonable
- [ ] CONVERSATION_STATE.json updated

---

### Test 3: Integration with Internal Hook

**Prerequisites**:
- Internal Hook extension active
- Auto-paste working

**Steps**:
1. Have a conversation with Gemini
2. Gemini responds with something
3. Run "Run Single Cycle"
4. Watch for auto-paste

**Expected**:
1. Supervisor reads Gemini's message
2. Generates next prompt
3. Writes to GHOST_INPUT.txt
4. Internal Hook detects file
5. Auto-pastes to Gemini chat
6. Gemini responds

**Verify**:
- [ ] Auto-paste triggered
- [ ] Gemini received the prompt
- [ ] Conversation continued

---

### Test 4: Full Autonomous Loop (5 Cycles)

**Steps**:
1. Start Internal Hook
2. Have initial conversation with Gemini
3. Run: "Start Autonomous Supervisor"
4. Wait and observe
5. After 5 cycles, run: "Stop Autonomous Supervisor"

**Monitor**:
- Console output (cycle count)
- GHOST_INPUT.txt (prompts being generated)
- CONVERSATION_STATE.json (cycles incrementing)
- AntiGravity chat (Gemini responding)

**Expected**:
- 5 prompts generated
- 5 Gemini responses
- State file shows `autonomous_cycles: 5`
- No errors

---

## Debugging

### Issue: Extension doesn't activate

**Check**:
1. Developer Tools console for errors
2. Verify `package.json` is valid JSON
3. Check extension path is correct
4. Ensure `npm install` ran successfully

**Solution**:
```bash
cd AntiGravity_Supervisor
npm install --verbose
```

---

### Issue: API calls fail

**Check**:
1. `config/api-keys.json` exists
2. API keys are correct
3. Internet connection working
4. Groq service status

**Test API manually**:
```bash
node test.js
```

Look for Groq API test results.

---

### Issue: GHOST files not created

**Check**:
1. Workspace folder open
2. Write permissions on directory
3. Path in code is correct

**Manual Test**:
```powershell
cd C:\AntiGravityExt\AntiGravity_Ghost_Agent
echo "test" > GHOST_INPUT.txt
cat GHOST_INPUT.txt
```

---

### Issue: Internal Hook doesn't auto-paste

**Check**:
1. Internal Hook extension is active
2. File watching is working
3. Delay timing (try increasing)

**Verify Internal Hook**:
- Check `C:\AntiGravityExt\HOOK_ALIVE.txt` exists
- Look for loop activity in console

---

## Success Criteria

### ✅ Minimum Viable Test

- [ ] `node test.js` all passing
- [ ] Extension activates in AntiGravity
- [ ] Single cycle runs without errors
- [ ] GHOST_INPUT.txt created
- [ ] Prompt looks reasonable

### ✅ Integration Test

- [ ] Internal Hook detects file
- [ ] Auto-paste works
- [ ] Gemini responds to generated prompt
- [ ] State file updates correctly

### ✅ Autonomous Loop Test

- [ ] 5+ cycles complete
- [ ] No crashes or errors
- [ ] Prompts are contextually relevant
- [ ] Conversation makes sense

---

## Performance Benchmarks

**Single Cycle**:
- Target: <5 seconds
- Groq API call: ~2-3 seconds
- Repo analysis: <1 second
- File operations: <1 second

**Full Loop (10 cycles)**:
- Target: ~5 minutes (30s delay per cycle)
- No memory leaks
- Stable performance

---

## Next Steps After Successful Testing

1. **Document Results**:
   - Update task.md
   - Mark tests as complete
   - Note any issues

2. **Iterate**:
   - Fix any bugs found
   - Improve prompts
   - Optimize performance

3. **Scale**:
   - Test with 10 cycles
   - Test with 50 cycles
   - Aim for 100+ cycles

4. **Enhance**:
   - Better context analysis
   - Smarter completion detection
   - More robust error handling

---

## Troubleshooting Command Reference

```powershell
# Check extension is loaded
Get-Process AntiGravity
Get-ChildItem "C:\Users\<User>\AppData\Local\Programs\AntiGravity\resources\app\extensions"

# Check GHOST files
Get-Content C:\AntiGravityExt\AntiGravity_Ghost_Agent\GHOST_INPUT.txt
Get-Content C:\AntiGravityExt\AntiGravity_Ghost_Agent\CONVERSATION_STATE.json

# Check logs
Get-Content C:\AntiGravityExt\AntiGravity_Ghost_Agent\AntiGravity_Supervisor\supervisor.log

# Restart AntiGravity
Get-Process AntiGravity | Stop-Process
Start-Process "C:\Users\<User>\AppData\Local\Programs\AntiGravity\AntiGravity.exe"
```

---

**Ready to test!** 🧪🚀

# Intelligent API Key Management System

## Overview

Sistema inteligente de gestión de API keys con aprendizaje automático que:
- ✅ Prueba todas las keys con todos los modelos disponibles
- ✅ Fallback en cascada (si una falla, prueba la siguiente)
- ✅ Sistema de aprendizaje (aprende cuál funciona mejor)
- ✅ Tracking de uso (tokens, requests, costos)
- ✅ Scoring de calidad (basado en éxito de tareas)
- ✅ Auto-selección del mejor modelo+key

---

## Components

### 1. `apiKeyTester.js`

**Propósito**: Probar comprehensivamente todas las API keys y modelos

**Features**:
- Prueba **simultáneamente** todas las keys
- Prueba **todos los modelos** de cada provider:
  - **Groq**: 6 modelos (Llama 3.3, Mixtral, Gemma)
  - **OpenRouter**: 7+ modelos (Claude, GPT-4, Gemini, Llama)
  - **Google**: 5 modelos (Gemini 2.0, 1.5 Pro/Flash) x 3 keys = 15 tests
- Genera `api-test-results.json` con resultados completos
- Actualiza `apiStats.json` para uso del APIManager

**Uso**:
```bash
node apiKeyTester.js
```

**Output**:
```
🔍 API Key Tester - Comprehensive Test Suite
============================================================

📊 Testing Groq API...
  ✅ groq - llama-3.3-70b-versatile
     Response time: 1234ms
  ✅ groq - llama-3.1-8b-instant
     Response time: 876ms

📊 Testing OpenRouter API...
  ✅ openrouter - anthropic/claude-3.5-sonnet
     Response time: 2100ms

📊 Testing Google Gemini API...
  ✅ google - Key1 - gemini-2.0-flash-exp
     Response time: 1500ms

... (30+ tests total)

📊 TEST SUMMARY
Total Tests: 32
Passed: 28 ✅
Failed: 4 ❌
Pass Rate: 87.5%

⚡ Fastest: groq - llama-3.1-8b-instant (876ms)
```

---

### 2. `apiManager.js`

**Propósito**: Gestión inteligente de APIs con fallback y aprendizaje

**Features**:

#### a) Intelligent Selection
- Calcula **score** para cada provider+model basado en:
  - **Reliability** (success rate): 40%
  - **Speed** (avg response time): 30%
  - **Quality** (task quality): 20%
  - **Recency** (recent success): 10%
- Selecciona automáticamente el mejor

#### b) Cascading Fallback
```javascript
const result = await apiManager.callWithFallback(context);
```

**Flow**:
1. Ordena providers por score (mejor primero)
2. Intenta llamar al mejor
3. Si falla → intenta el siguiente
4. Si falla → intenta el siguiente
5. ...hasta 5 intentos máximo
6. Si todos fallan → error con detalles

#### c) Usage Tracking
- Cuenta requests por provider
- Registra tokens usados (estimado)
- Calcula success rate
- Guarda en `apiStats.json`

#### d) Quality Scoring
```javascript
apiManager.updateQualityScore('groq', 'llama-3.3-70b-versatile', 1, 0.95);
```
- Feedback de calidad de tareas
- Running average de scores
- Influye en selección futura

#### e) Learning Over Time
- Aprende cuáles APIs funcionan mejor
- Ajusta scores basado en datos históricos
- Mejora selección con cada uso

---

### 3. `apiStats.json`

**Propósito**: Base de datos de performance de todas las APIs

**Structure**:
```json
{
  "lastUpdated": "2025-12-12T22:30:00Z",
  "providers": {
    "groq_key1": {
      "provider": "groq",
      "keyIndex": 1,
      "models": {
        "llama-3.3-70b-versatile": {
          "status": "working",
          "avgResponseTime": 1234,
          "successCount": 47,
          "failCount": 2,
          "totalTokensUsed": 125000,
          "qualityScore": 0.92,
          "lastSuccess": "2025-12-12T22:25:00Z",
          "lastError": null
        }
      }
    },
    "google_key1": {
      "provider": "google",
      "keyIndex": 1,
      "models": {
        "gemini-2.0-flash-exp": {
          "status": "working",
          "avgResponseTime": 1500,
          "successCount": 32,
          "failCount": 0,
          "qualityScore": 0.88,
          "lastSuccess": "2025-12-12T22:28:00Z"
        }
      }
    }
  }
}
```

---

## Workflow

### Initial Setup

1. **Run API Key Tester**:
   ```bash
   node apiKeyTester.js
   ```
   - Tests all keys and models
   - Creates `apiStats.json`
   - Identifies working providers

2. **Review Results**:
   - Check `api-test-results.json`
   - See which keys work
   - Note fastest models

### Production Use

1. **APIManager Auto-Selects Best**:
   ```javascript
   const apiManager = new APIManager();
   const result = await apiManager.callWithFallback(context);
   ```

2. **Fallback Happens Automatically**:
   - If best API fails → tries next best
   - Logs each attempt
   - Records success/failure

3. **Learning Happens In Background**:
   - Every call updates stats
   - Scores adjust based on performance
   - Selection improves over time

### Monitoring

**Get Session Summary**:
```javascript
const summary = apiManager.getSessionSummary();
console.log(summary);
// {
//   requests: 47,
//   successes: 45,
//   failures: 2,
//   totalTokens: 125000,
//   successRate: 0.957
// }
```

**Update Quality Score** (after task completion):
```javascript
// Task was successful and high quality
apiManager.updateQualityScore('groq', 'llama-3.3-70b-versatile', 1, 0.95);

// Task was mediocre
apiManager.updateQualityScore('openrouter', 'claude-3-haiku', 1, 0.60);
```

---

## Integration with Supervisor

**Before** (single provider, manual fallback):
```javascript
const apiClient = new APIClient(config);
const prompt = await apiClient.generatePrompt(context);
```

**After** (intelligent selection, auto-fallback):
```javascript
const apiClient = new APIClient(config); // Same interface
const prompt = await apiClient.generatePrompt(context);
// ↑ Now uses APIManager internally
```

**No code changes needed in extension.js!** ✅

---

## Example Scenario

### Day 1: Initial Tests
```bash
$ node apiKeyTester.js
Testing 32 models...
Results:
  Groq: 6/6 ✅
  OpenRouter: 5/7 ✅ (2 models rate limited)
  Google: 12/15 ✅ (3 models failed)
```

### Day 1: First Production Use
```
Cycle 1:
  Selected: groq - llama-3.3-70b-versatile (score: 0.85)
  ✅ Success in 1200ms
```

### Day 2: Groq Hits Rate Limit
```
Cycle 47:
  [1/5] Trying: groq - llama-3.3-70b-versatile
  ❌ Failed: 429 Too Many Requests
  
  [2/5] Trying: google - gemini-2.0-flash-exp
  ✅ Success in 1500ms

apiStats updated:
  groq score decreased (reliability down)
  google score increased (proved reliable)
```

### Day 3: System Learned
```
Cycle 1:
  Selected: google - gemini-2.0-flash-exp (score: 0.89)
  ✅ Success in 1450ms

Why? Because yesterday google proved more reliable.
System automatically switched preference.
```

---

## Performance Metrics

### Scoring Formula

```javascript
score = (
  reliability * 0.4 +  // success rate
  speed * 0.3 +        // response time
  quality * 0.2 +      // task quality
  recency * 0.1        // recent success
)
```

**Example Scores**:
- **groq/llama-3.3**: 0.85
  - 95% reliability, 1200ms avg, 0.92 quality
  
- **google/gemini-2.0**: 0.89
  - 100% reliability, 1500ms avg, 0.88 quality
  
- **openrouter/claude-3.5**: 0.78
  - 85% reliability, 2100ms avg, 0.95 quality

**Winner**: google/gemini-2.0 (best reliability + good speed)

---

## Maintenance

### Re-test Keys (Weekly)
```bash
node apiKeyTester.js
```
- Updates status of all keys
- Identifies new working models
- Refreshes statistics

### Add New API Key
1. Add to `config/api-keys.json`
2. Run `node apiKeyTester.js`
3. System automatically incorporates it

### Monitor Usage
```javascript
// Check apiStats.json
const stats = JSON.parse(fs.readFileSync('config/apiStats.json'));
console.log(stats.providers);
// See token usage, success rates, etc.
```

---

## Advantages

✅ **Zero Downtime**: If one API fails, automatically uses another  
✅ **Self-Optimizing**: Gets better over time based on actual usage  
✅ **Cost Efficient**: Uses fastest/cheapest option that works  
✅ **Quality Aware**: Prefers APIs that produce better results  
✅ **Scalable**: Easy to add new keys/providers  
✅ **Transparent**: Logs every decision and attempt  

---

## Future Enhancements

**Phase 2** (Optional):
- [ ] Cost tracking (estimate $/request)
- [ ] Budget limits per provider
- [ ] Time-of-day optimization (different providers for peak hours)
- [ ] A/B testing of prompts across providers
- [ ] Automatic key rotation when hitting limits
- [ ] Telegram alerts when all keys fail

---

**Ready for production!** 🚀

The system is fully autonomous and will continuously learn and improve.

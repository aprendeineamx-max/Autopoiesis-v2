/**
 * API Key Tester - Comprehensive Testing of All API Keys and Models
 * Tests all available API keys with all their supported models simultaneously
 * Generates performance database for intelligent selection
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class APIKeyTester {
    constructor(configPath = '../../core/config/api-keys.json') {
        const keyPath = path.resolve(__dirname, configPath);
        this.config = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
        this.results = {
            timestamp: new Date().toISOString(),
            tests: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0
            }
        };
    }

    /**
     * Test all API keys and models
     */
    async testAll() {
        console.log('🔍 API Key Tester - Comprehensive Test Suite\n');
        console.log('='.repeat(60));

        // Test Groq
        await this.testGroqKeys();

        // Test OpenRouter
        await this.testOpenRouterKeys();

        // Test SambaNova
        await this.testSambanovaKeys();

        // Test Google Gemini
        await this.testGoogleKeys();

        // Generate summary
        this.generateSummary();

        // Save results
        this.saveResults();

        // Generate professional reports
        await this.generateHTMLReport();
        await this.generateMarkdownReport();

        return this.results;
    }

    /**
     * Test Groq API with all available models
     */
    async testGroqKeys() {
        console.log('\n📊 Testing Groq API...\n');

        const models = [
            'llama-3.3-70b-versatile',
            'llama-3.3-70b-specdec',
            'llama-3.1-70b-versatile',
            'llama-3.1-8b-instant',
            'mixtral-8x7b-32768',
            'gemma-7b-it'
        ];

        const apiKey = this.config.providers.groq.api_key;

        for (const model of models) {
            await this.testSingleAPI({
                provider: 'groq',
                apiKey: apiKey,
                model: model,
                endpoint: 'https://api.groq.com/openai/v1/chat/completions',
                testPrompt: 'Say "OK" if you can read this.'
            });
        }
    }

    /**
     * Test OpenRouter API with available models
     * Includes comprehensive free tier models
     */
    async testOpenRouterKeys() {
        console.log('\n📊 Testing OpenRouter API...\n');

        const models = [
            // Free models (priority)
            'google/gemma-3-12b:free',
            'google/gemma-3-27b:free',
            'google/gemini-2.0-flash-exp:free',
            'meta-llama/llama-3.3-70b-instruct:free',
            'meta-llama/llama-3.2-3b-instruct:free',
            'nousresearch/hermes-3-llama-3.1-405b:free',
            'mistralai/mistral-7b-instruct:free',

            // Premium models (for comparison if user has credits)
            'anthropic/claude-3.5-sonnet',
            'anthropic/claude-3-haiku',
            'google/gemini-pro-1.5',
            'google/gemini-flash-1.5',
            'meta-llama/llama-3.1-70b-instruct',
            'openai/gpt-4-turbo',
            'openai/gpt-3.5-turbo'
        ];

        const apiKey = this.config.providers.openrouter.api_key;

        for (const model of models) {
            await this.testSingleAPI({
                provider: 'openrouter',
                apiKey: apiKey,
                model: model,
                endpoint: 'https://openrouter.ai/api/v1/chat/completions',
                testPrompt: 'Say "OK" if you can read this.',
                headers: {
                    'HTTP-Referer': 'https://github.com/antigravity',
                    'X-Title': 'AntiGravity API Test'
                }
            });
        }
    }

    /**
     * Fetch available models from Google API dynamically
     */
    async fetchGoogleModels(apiKey) {
        try {
            const response = await axios.get(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
                { timeout: 10000 }
            );

            if (response.data && response.data.models) {
                // Filter models that support generateContent
                return response.data.models
                    .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                    .map(m => m.name.replace('models/', ''));
            }
            return [];
        } catch (error) {
            console.log(`    ⚠️ Failed to fetch models list: ${error.message}`);
            return [];
        }
    }

    /**
     * Test Google Gemini API with all keys and models
     * Uses dynamic model discovery
     */
    async testGoogleKeys() {
        console.log('\n📊 Testing Google Gemini API...\n');

        const apiKeys = this.config.providers.google.api_keys;
        const fallbackModels = ['gemini-1.5-flash', 'gemini-1.5-pro'];

        for (let i = 0; i < apiKeys.length; i++) {
            const apiKey = apiKeys[i];

            console.log(`  🔑 Key #${i + 1}: Discovering models...`);
            let models = await this.fetchGoogleModels(apiKey);

            if (models.length === 0) {
                console.log(`    ⚠️ Using fallback models due to discovery failure.`);
                models = fallbackModels;
            } else {
                console.log(`    ✅ Discovered ${models.length} compatible models.`);
            }

            for (const model of models) {
                await this.testSingleAPI({
                    provider: 'google',
                    apiKey: apiKey,
                    keyIndex: i + 1,
                    displayKey: apiKey, // Pass full key for report
                    model: model,
                    endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
                    testPrompt: 'Say "OK" if you can read this.',
                    isGoogle: true
                });
            }
        }
    }

    /**
     * Test single API endpoint
     */
    async testSingleAPI(config) {
        const {
            provider,
            apiKey,
            keyIndex,
            displayKey,
            model,
            endpoint,
            testPrompt,
            headers = {},
            isGoogle = false,
            isSambanova = false,
            isProduction = false
        } = config;

        const testName = keyIndex
            ? `${provider} - Key${keyIndex} - ${model}`
            : `${provider} - ${model}`;

        this.results.summary.total++;

        const startTime = Date.now();

        try {
            let response;

            if (isGoogle) {
                // Google Gemini format
                response = await axios.post(
                    `${endpoint}?key=${apiKey}`,
                    {
                        contents: [{
                            parts: [{ text: testPrompt }]
                        }]
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            ...headers
                        },
                        timeout: 15000
                    }
                );
            } else {
                // OpenAI-compatible format (Groq, OpenRouter, SambaNova)
                response = await axios.post(
                    endpoint,
                    {
                        model: model,
                        messages: [
                            { role: 'user', content: testPrompt }
                        ],
                        max_tokens: 50
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                            ...headers
                        },
                        timeout: 15000
                    }
                );
            }

            const responseTime = Date.now() - startTime;

            // Extract rate limit info if available
            const rateLimitInfo = this.extractRateLimits(response.headers);

            // Extract response text
            let responseText = '';
            if (isGoogle) {
                responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            } else {
                responseText = response.data.choices?.[0]?.message?.content || '';
            }

            console.log(`  ✅ ${testName}`);
            console.log(`     Response time: ${responseTime}ms`);
            console.log(`     Response: "${responseText.substring(0, 50)}..."`);

            if (rateLimitInfo) {
                console.log(`     Rate Limits: ${rateLimitInfo.remainingRequests}/${rateLimitInfo.limitRequests} RPM, ${rateLimitInfo.remainingRequestsDay}/${rateLimitInfo.limitRequestsDay} RPD`);
            }

            this.results.tests.push({
                provider,
                keyIndex: keyIndex || 1,
                displayKey: displayKey || apiKey.substring(0, 10) + '...',
                model,
                status: 'success',
                responseTime,
                responseText,
                rateLimitInfo,
                timestamp: new Date().toISOString()
            });

            this.results.summary.passed++;

        } catch (error) {
            const responseTime = Date.now() - startTime;
            const errorMsg = error.response?.data?.error?.message || error.message;
            const statusCode = error.response?.status;

            console.log(`  ❌ ${testName}`);
            console.log(`     Error: ${statusCode} - ${errorMsg}`);

            this.results.tests.push({
                provider,
                keyIndex: keyIndex || 1,
                displayKey: displayKey || apiKey.substring(0, 10) + '...',
                model,
                status: 'failed',
                error: errorMsg,
                statusCode,
                responseTime,
                timestamp: new Date().toISOString()
            });

            this.results.summary.failed++;
        }

        // Small delay between tests to avoid rate limiting
        await this.sleep(500);
    }

    /**
     * Generate summary report
     */
    generateSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('\n📊 TEST SUMMARY\n');

        console.log(`Total Tests: ${this.results.summary.total}`);
        console.log(`Passed: ${this.results.summary.passed} ✅`);
        console.log(`Failed: ${this.results.summary.failed} ❌`);

        const passRate = ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1);
        console.log(`Pass Rate: ${passRate}%\n`);

        // Group by provider
        const byProvider = {};
        this.results.tests.forEach(test => {
            if (!byProvider[test.provider]) {
                byProvider[test.provider] = { passed: 0, failed: 0, models: [] };
            }
            if (test.status === 'success') {
                byProvider[test.provider].passed++;
                byProvider[test.provider].models.push(test.model);
            } else {
                byProvider[test.provider].failed++;
            }
        });

        console.log('By Provider:');
        Object.keys(byProvider).forEach(provider => {
            const data = byProvider[provider];
            console.log(`  ${provider}: ${data.passed}✅ / ${data.failed}❌`);
            if (data.models.length > 0) {
                console.log(`    Working models: ${data.models.join(', ')}`);
            }
        });

        // Find fastest model
        const successfulTests = this.results.tests.filter(t => t.status === 'success');
        if (successfulTests.length > 0) {
            const fastest = successfulTests.reduce((prev, current) =>
                (prev.responseTime < current.responseTime) ? prev : current
            );

            console.log(`\n⚡ Fastest: ${fastest.provider} - ${fastest.model} (${fastest.responseTime}ms)`);
        }
    }

    /**
     * Save results to file
     */
    saveResults() {
        const outputPath = path.join(__dirname, 'api-test-results.json');
        fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));

        console.log(`\n💾 Results saved to: ${outputPath}`);

        // Also update apiStats.json for the manager
        this.updateAPIStats();
    }

    /**
     * Update apiStats.json with test results
     */
    updateAPIStats() {
        // Save stats to core config for centralization
        const statsPath = path.resolve(__dirname, '../../core/config/api-performance.json');

        let stats = {
            lastUpdated: new Date().toISOString(),
            providers: {}
        };

        // Load existing stats if available
        if (fs.existsSync(statsPath)) {
            try {
                stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
            } catch (error) {
                console.log('Creating new apiStats.json');
            }
        }

        // Update with test results
        this.results.tests.forEach(test => {
            const providerKey = `${test.provider}_key${test.keyIndex}`;

            if (!stats.providers[providerKey]) {
                stats.providers[providerKey] = {
                    provider: test.provider,
                    keyIndex: test.keyIndex,
                    models: {},
                    lastTested: test.timestamp
                };
            }

            if (!stats.providers[providerKey].models[test.model]) {
                stats.providers[providerKey].models[test.model] = {
                    status: 'unknown',
                    avgResponseTime: 0,
                    successCount: 0,
                    failCount: 0,
                    lastSuccess: null,
                    lastError: null
                };
            }

            const modelStats = stats.providers[providerKey].models[test.model];

            if (test.status === 'success') {
                modelStats.status = 'working';
                modelStats.successCount++;
                modelStats.lastSuccess = test.timestamp;

                // Update average response time
                modelStats.avgResponseTime = (
                    (modelStats.avgResponseTime * (modelStats.successCount - 1)) + test.responseTime
                ) / modelStats.successCount;
            } else {
                modelStats.failCount++;
                modelStats.lastError = {
                    timestamp: test.timestamp,
                    error: test.error,
                    statusCode: test.statusCode
                };
                if (modelStats.successCount === 0) {
                    modelStats.status = 'failing';
                }
            }
        });

        stats.lastUpdated = new Date().toISOString();

        fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
        console.log(`✅ apiStats.json updated`);
    }

    /**
     * Test SambaNova API with all available models
     * Includes production and preview models
     */
    async testSambanovaKeys() {
        console.log('\n📊 Testing SambaNova API...\n');

        const productionModels = this.config.providers.sambanova.production_models;
        const previewModels = this.config.providers.sambanova.preview_models;
        const allModels = [...productionModels, ...previewModels];

        const apiKey = this.config.providers.sambanova.api_key;

        for (const model of allModels) {
            const isProduction = productionModels.includes(model);

            await this.testSingleAPI({
                provider: 'sambanova',
                apiKey: apiKey,
                model: model,
                endpoint: this.config.providers.sambanova.endpoint,
                testPrompt: 'Say "OK" if you can read this.',
                isSambanova: true,
                isProduction: isProduction
            });
        }
    }

    /**
     * Extract rate limit information from response headers
     * Compatible with SambaNova rate limit headers
     */
    extractRateLimits(headers) {
        if (!headers) return null;

        const rateLimits = {};

        // SambaNova-style headers
        if (headers['x-ratelimit-limit-requests']) {
            rateLimits.limitRequests = parseInt(headers['x-ratelimit-limit-requests']);
            rateLimits.remainingRequests = parseInt(headers['x-ratelimit-remaining-requests'] || 0);
            rateLimits.resetRequests = headers['x-ratelimit-reset-requests'];
        }

        if (headers['x-ratelimit-limit-requests-day']) {
            rateLimits.limitRequestsDay = parseInt(headers['x-ratelimit-limit-requests-day']);
            rateLimits.remainingRequestsDay = parseInt(headers['x-ratelimit-remaining-requests-day'] || 0);
            rateLimits.resetRequestsDay = headers['x-ratelimit-reset-requests-day'];
        }

        return Object.keys(rateLimits).length > 0 ? rateLimits : null;
    }

    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generate beautiful HTML report with advanced grouping and interactivity
     */
    async generateHTMLReport() {
        console.log('\n📄 Generating Detailed Dashboard v3...');

        const html = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <title>API Intelligence Dashboard</title>
    <style>
        :root {
            --bg-app: #f3f4f6;
            --bg-panel: #ffffff;
            --text-main: #1f2937;
            --text-muted: #6b7280;
            --border: #e5e7eb;
            --primary: #2563eb;
            --success: #059669;
            --danger: #dc2626;
            --warning: #d97706;
            --key-bg: #f3f4f6;
            --hover: #f9fafb;
            --shadow: rgba(0,0,0,0.05);
        }

        [data-theme="dark"] {
            --bg-app: #111827;
            --bg-panel: #1f2937;
            --text-main: #f9fafb;
            --text-muted: #9ca3af;
            --border: #374151;
            --primary: #60a5fa;
            --success: #34d399;
            --danger: #f87171;
            --warning: #fbbf24;
            --key-bg: #374151;
            --hover: #374151;
            --shadow: rgba(0,0,0,0.3);
        }

        [data-theme="midnight"] {
            --bg-app: #0f172a;
            --bg-panel: #1e293b;
            --text-main: #e2e8f0;
            --text-muted: #94a3b8;
            --border: #334155;
            --primary: #818cf8;
            --success: #4ade80;
            --danger: #f87171;
            --warning: #facc15;
            --key-bg: #334155;
            --hover: #334155;
            --shadow: rgba(0,0,0,0.5);
        }
        
         [data-theme="cyberpunk"] {
            --bg-app: #000000;
            --bg-panel: #121212;
            --text-main: #00ff00;
            --text-muted: #008f11;
            --border: #333333;
            --primary: #d600ff;
            --success: #00ff00;
            --danger: #ff0055;
            --warning: #ffff00;
            --key-bg: #1a1a1a;
            --hover: #222222;
            --shadow: rgba(0,255,0,0.1);
        }

        body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg-app); margin: 0; padding: 40px; color: var(--text-main); transition: background 0.3s, color 0.3s; }
        .container { max-width: 1400px; margin: 0 auto; background: var(--bg-panel); border-radius: 16px; box-shadow: 0 10px 30px var(--shadow); overflow: hidden; border: 1px solid var(--border); }
        .header { background: var(--bg-panel); padding: 40px; text-align: center; border-bottom: 1px solid var(--border); position: relative; }
        .header h1 { margin: 0; font-size: 2rem; color: var(--text-main); letter-spacing: -0.5px; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); background: var(--bg-app); border-bottom: 1px solid var(--border); }
        .stat-item { padding: 30px; text-align: center; border-right: 1px solid var(--border); }
        .stat-val { font-size: 2.5rem; font-weight: 800; line-height: 1; margin-bottom: 5px; color: var(--text-main); }
        .stat-label { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; color: var(--text-muted); font-weight: 600; }
        .content { padding: 40px; background: var(--bg-panel); }
        .provider-title { font-size: 1.25rem; font-weight: 700; color: var(--text-muted); margin-bottom: 20px; text-transform: uppercase; border-left: 5px solid var(--primary); padding-left: 15px; }
        .key-group { border: 1px solid var(--border); border-radius: 12px; margin-bottom: 15px; overflow: hidden; background: var(--bg-panel); transition: box-shadow 0.2s; }
        .key-group:hover { box-shadow: 0 4px 12px var(--shadow); }
        .key-header { padding: 20px 25px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: var(--bg-panel); }
        .key-header:hover { background: var(--hover); }
        .key-status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 10px; }
        .key-value { font-family: 'Consolas', monospace; font-size: 0.95rem; font-weight: 600; color: var(--text-muted); background: var(--key-bg); padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border); }
        .mini-progress { width: 100px; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-left: 20px; }
        .mini-bar { height: 100%; border-radius: 3px; }
        .results-body { display: none; border-top: 1px solid var(--border); background: var(--bg-app); }
        .key-group.expanded .results-body { display: block; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 12px 25px; border-bottom: 1px solid var(--border); color: var(--text-main); }
        .status-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .badge-success { background: rgba(5, 150, 105, 0.2); color: var(--success); border: 1px solid var(--success); }
        .error-group-row { background: rgba(220, 38, 38, 0.1); cursor: pointer; border-left: 4px solid var(--danger); }
        .error-list { display: none; padding: 10px 20px; font-size: 0.9em; line-height: 1.6; color: var(--text-muted); }
        .error-group-row.active .error-list { display: block; }
        .toggle-icon { transition: transform 0.3s; color: var(--text-muted); }
        .key-group.expanded .toggle-icon { transform: rotate(180deg); }
        
        /* Theme Switcher */
        .theme-switch { position: absolute; top: 30px; right: 30px; }
        .theme-select { padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-app); color: var(--text-main); font-family: inherit; cursor: pointer; }
    </style>
    <script>
        function toggleGroup(id) { document.getElementById(id).classList.toggle('expanded'); }
        function toggleError(btn) { btn.closest('tr').classList.toggle('active'); }
        function toggleAll(expand) {
            document.querySelectorAll('.key-group').forEach(el => {
                if(expand) el.classList.add('expanded');
                else el.classList.remove('expanded');
            });
        }
        function setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('api-tester-theme', theme);
        }
        
        // Load theme on start
        (function() {
            const saved = localStorage.getItem('api-tester-theme') || 'light';
            document.documentElement.setAttribute('data-theme', saved);
        })();
    </script>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="theme-switch">
                <select class="theme-select" onchange="setTheme(this.value)">
                    <option value="light">☀️ Light</option>
                    <option value="dark">🌑 Dark</option>
                    <option value="midnight">🌃 Midnight</option>
                    <option value="cyberpunk">🤖 Cyberpunk</option>
                </select>
            </div>
            <h1>🚀 API Intelligence Dashboard v3</h1>
            <p style="color:var(--text-muted)">Generated: ${new Date().toLocaleString()}</p>
        </div>
        <div class="stats-grid">
            <div class="stat-item"><div class="stat-val">${this.results.summary.total}</div><div class="stat-label">Total Tests</div></div>
            <div class="stat-item"><div class="stat-val" style="color:var(--success)">${this.results.summary.passed}</div><div class="stat-label">Passed</div></div>
            <div class="stat-item"><div class="stat-val" style="color:var(--danger)">${this.results.summary.failed}</div><div class="stat-label">Failed</div></div>
        </div>
        <div class="content">
            <div style="text-align:right; margin-bottom:15px;">
                <button onclick="toggleAll(true)" style="cursor:pointer; border:none; background:none; color:var(--primary); font-weight:600;">Expand All</button> | 
                <button onclick="toggleAll(false)" style="cursor:pointer; border:none; background:none; color:var(--primary); font-weight:600;">Collapse All</button>
            </div>
            ${this.renderProviders()}
        </div>
    </div>
    <script>
        // Set dropdown value to match current theme
        const currentTheme = localStorage.getItem('api-tester-theme') || 'light';
        document.querySelector('.theme-select').value = currentTheme;
    </script>
</body>
</html>`;

        const reportPath = path.join(__dirname, 'reports', 'API-TEST-REPORT.html');
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        fs.writeFileSync(reportPath, html);
        console.log(`  ✅ Dashboard generated: ${reportPath}`);
    }

    renderProviders() {
        const testsByProvider = {};
        this.results.tests.forEach(test => {
            if (!testsByProvider[test.provider]) testsByProvider[test.provider] = {};
            const keyId = `${test.keyIndex || '1'}-${test.displayKey}`;
            if (!testsByProvider[test.provider][keyId]) testsByProvider[test.provider][keyId] = [];
            testsByProvider[test.provider][keyId].push(test);
        });

        return Object.keys(testsByProvider).map(provider => `
                <div class="provider-section">
                    <div class="provider-title">${provider}</div>
                ${Object.keys(testsByProvider[provider]).map(keyId =>
            this.renderKeyGroup(keyId, testsByProvider[provider][keyId])
        ).join('')
            }
            </div>
                `).join('');
    }

    renderKeyGroup(keyId, tests) {
        const passedData = tests.filter(t => t.status === 'success');
        const failedData = tests.filter(t => t.status !== 'success');

        passedData.sort((a, b) => a.responseTime - b.responseTime);

        const failuresByError = {};
        failedData.forEach(f => {
            const msg = f.error || 'Unknown Error';
            if (!failuresByError[msg]) failuresByError[msg] = [];
            failuresByError[msg].push(f);
        });

        const successRate = ((passedData.length / tests.length) * 100).toFixed(1);
        const color = passedData.length === tests.length ? '#059669' : (passedData.length > 0 ? '#d97706' : '#dc2626');
        const displayKey = tests[0].displayKey || 'Unknown Key';
        const keyIdx = tests[0].keyIndex || '?';
        const groupId = `group-${Math.random().toString(36).substr(2, 9)}`;

        return `
                <div class="key-group ${passedData.length > 0 ? 'expanded' : ''}" id="${groupId}">
            <div class="key-header" onclick="toggleGroup('${groupId}')">
                <div style="display:flex; align-items:center;">
                    <span class="key-status-dot" style="background:${color}"></span>
                    <span class="key-value">${displayKey}</span>
                </div>
                <div style="display:flex; align-items:center; gap:20px;">
                    <div style="text-align:right">
                        <div style="font-weight:700; color:${color}">${passedData.length}/${tests.length} Operational</div>
                        <div style="font-size:0.8rem; color:#9ca3af">Index #${keyIdx}</div>
                    </div>
                    <div class="mini-progress">
                        <div class="mini-bar" style="width:${successRate}%; background:${color}"></div>
                    </div>
                    <svg class="toggle-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </div>
            
            <div class="results-body">
                <table>
                    ${passedData.map(test => `
                    <tr>
                        <td width="5%"><span class="status-badge badge-success">ACTIVE</span></td>
                        <td width="40%"><b>${test.model}</b></td>
                        <td width="15%"><span style="font-family:monospace; color:#6b7280">${test.responseTime}ms</span></td>
                        <td><span style="color:#059669">✅ Operational</span></td>
                    </tr>
                    `).join('')}

                    ${Object.entries(failuresByError).map(([error, files]) => `
                    <tr class="error-group-row" onclick="toggleError(this)">
                        <td colspan="4">
                            <div style="display:flex; align-items:center; gap:10px; font-weight:600; color:#991b1b;">
                                <span>❌ ${files.length} Models Failed</span>
                                <span style="font-weight:400; color:#333;">${error.substring(0, 100)}...</span>
                                <span style="margin-left:auto; font-size:0.8rem;">▼ Details</span>
                            </div>
                            <div class="error-list">
                                <div style="margin-bottom:5px; font-weight:bold;">Affected Models:</div>
                                ${files.map(f => `<span style="display:inline-block; background:white; border:1px solid #fecaca; padding:2px 6px; margin:2px; border-radius:4px;">${f.model}</span>`).join('')}
                            </div>
                        </td>
                    </tr>
                    `).join('')}
                </table>
            </div>
        </div >
                `;
    }

    /**
     * Generate beautiful Markdown report
     */
    async generateMarkdownReport() {
        console.log('📄 Generating Markdown report...');

        // Calculate provider stats
        const providerStats = {};
        this.results.tests.forEach(test => {
            if (!providerStats[test.provider]) {
                providerStats[test.provider] = {
                    total: 0,
                    passed: 0,
                    failed: 0,
                    avgResponseTime: 0,
                    totalResponseTime: 0,
                    models: {}
                };
            }

            providerStats[test.provider].total++;
            if (test.status === 'success') {
                providerStats[test.provider].passed++;
                providerStats[test.provider].totalResponseTime += test.responseTime || 0;
            } else {
                providerStats[test.provider].failed++;
            }
            providerStats[test.provider].models[test.model] = test.status;
        });

        // Calculate averages
        Object.values(providerStats).forEach(stats => {
            if (stats.passed > 0) {
                stats.avgResponseTime = Math.round(stats.totalResponseTime / stats.passed);
            }
        });

        let md = `# 🎯 API Key Test Report\n\n`;
        md += `** Generated **: ${new Date(this.results.timestamp).toLocaleString()} \n`;
        md += `** Total Tests **: ${this.results.summary.total} \n\n`;

        md += `## 📊 Summary\n\n`;
        md += `| Status | Count | Percentage |\n`;
        md += `| --------| -------| ------------|\n`;
        md += `| ✅ Passed | ${this.results.summary.passed} | ${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}% |\n`;
        md += `| ❌ Failed | ${this.results.summary.failed} | ${((this.results.summary.failed / this.results.summary.total) * 100).toFixed(1)}% |\n\n`;

        md += `## 🏢 Provider Breakdown\n\n`;

        for (const [provider, stats] of Object.entries(providerStats)) {
            const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
            const status = stats.passed === stats.total ? '✅' : stats.passed > 0 ? '⚠️' : '❌';

            md += `### ${status} ${provider.toUpperCase()} \n\n`;
            md += `| Metric | Value |\n`;
            md += `| --------| -------|\n`;
            md += `| Total Tests | ${stats.total} |\n`;
            md += `| Passed | ${stats.passed} |\n`;
            md += `| Failed | ${stats.failed} |\n`;
            md += `| Success Rate | ${successRate}% |\n`;
            md += `| Avg Response Time | ${stats.avgResponseTime} ms |\n\n`;

            md += `** Models **: \n\n`;
            for (const [model, status] of Object.entries(stats.models)) {
                const icon = status === 'success' ? '✅' : '❌';
                md += `- ${icon} \`${model}\`\n`;
            }
            md += `\n`;
        }

        const reportPath = path.join(__dirname, 'reports', 'API-TEST-REPORT.md');
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        fs.writeFileSync(reportPath, md);
        console.log(`  ✅ Markdown report saved: ${reportPath}`);
    }
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new APIKeyTester();
    tester.testAll()
        .then(() => {
            console.log('\n✅ All tests complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Test suite failed:', error);
            process.exit(1);
        });
}

module.exports = APIKeyTester;

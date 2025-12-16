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
     * Test Google Gemini API with all keys and models
     * Note: Model names without :free suffix for direct Google API
     */
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
     * Generate beautiful HTML report
     */
    /**
     * Generate beautiful HTML report with detailed key metrics
     */
    async generateHTMLReport() {
        console.log('\n📄 Generating HTML report...');

        // Group tests by provider
        const testsByProvider = {};
        const summary = { total: 0, passed: 0, failed: 0 };

        this.results.tests.forEach(test => {
            if (!testsByProvider[test.provider]) {
                testsByProvider[test.provider] = [];
            }
            testsByProvider[test.provider].push(test);

            summary.total++;
            if (test.status === 'success') summary.passed++;
            else summary.failed++;
        });

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Key Test Report - ${new Date(this.results.timestamp).toLocaleDateString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', 'Segoe UI', sans-serif;
            background: #f4f7f6;
            color: #333;
            padding: 30px;
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .header h1 { color: #2d3748; margin-bottom: 10px; font-weight: 800; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        }
        .stat-value { font-size: 2.5em; font-weight: 800; margin: 10px 0; }
        .stat-label { color: #718096; text-transform: uppercase; font-size: 0.85em; letter-spacing: 1px; }
        .passed { color: #38a169; }
        .failed { color: #e53e3e; }
        
        .provider-section {
            background: white;
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .provider-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #edf2f7;
        }
        .provider-title { font-size: 1.4em; font-weight: 700; color: #2d3436; text-transform: uppercase; }
        
        table { width: 100%; border-collapse: separate; border-spacing: 0; }
        th { text-align: left; color: #718096; padding: 15px; font-weight: 600; border-bottom: 2px solid #edf2f7; }
        td { padding: 15px; border-bottom: 1px solid #edf2f7; vertical-align: top; }
        tr:last-child td { border-bottom: none; }
        
        .status-badge {
            display: inline-flex;
            align-items: center;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.9em;
            font-weight: 600;
        }
        .status-success { background: #c6f6d5; color: #22543d; }
        .status-failed { background: #fed7d7; color: #822727; }
        
        .key-badge {
            background: #ebf8ff;
            color: #2c5282;
            padding: 4px 8px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.9em;
            font-weight: 600;
        }
        .key-display {
            font-family: 'Consolas', monospace;
            background: #edf2f7;
            padding: 4px 8px;
            border-radius: 4px;
            color: #4a5568;
            font-size: 0.85em;
            word-break: break-all;
        }
        
        .model-name { font-weight: 600; color: #4a5568; }
        .error-message { color: #e53e3e; font-size: 0.9em; margin-top: 5px; }
        .response-time { color: #718096; font-family: monospace; }
        
        /* Tooltip container */
        .tooltip { position: relative; display: inline-block; cursor: pointer; }
        .tooltip .tooltiptext {
            visibility: hidden;
            width: 300px;
            background-color: #2d3748;
            color: #fff;
            text-align: left;
            border-radius: 6px;
            padding: 10px;
            position: absolute;
            z-index: 1;
            bottom: 125%;
            left: 50%;
            margin-left: -150px;
            opacity: 0;
            transition: opacity 0.3s;
            font-size: 0.85em;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        }
        .tooltip:hover .tooltiptext { visibility: visible; opacity: 1; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 API Key Detailed Intelligence Report</h1>
            <p>Generated: ${new Date(this.results.timestamp).toLocaleString()}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Tests</div>
                <div class="stat-value">${summary.total}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Passed</div>
                <div class="stat-value passed">${summary.passed}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Failed</div>
                <div class="stat-value failed">${summary.failed}</div>
            </div>
        </div>

        ${Object.keys(testsByProvider).map(provider => {
            const tests = testsByProvider[provider];
            const passedCount = tests.filter(t => t.status === 'success').length;
            const successRate = ((passedCount / tests.length) * 100).toFixed(1);

            return `
            <div class="provider-section">
                <div class="provider-header">
                    <div class="provider-title">${provider}</div>
                    <div class="status-badge ${passedCount === tests.length ? 'status-success' : (passedCount > 0 ? 'status-warning' : 'status-failed')}" 
                         style="background: ${passedCount === tests.length ? '#c6f6d5' : (passedCount > 0 ? '#feebc8' : '#fed7d7')}; 
                                color: ${passedCount === tests.length ? '#22543d' : (passedCount > 0 ? '#744210' : '#822727')}">
                        ${passedCount}/${tests.length} Operational (${successRate}%)
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th width="10%">Status</th>
                            <th width="15%">Key Index</th>
                            <th width="25%">Model</th>
                            <th width="15%">Latency</th>
                            <th>Diagnostics / Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tests.map(test => `
                        <tr>
                            <td>
                                <span class="status-badge ${test.status === 'success' ? 'status-success' : 'status-failed'}">
                                    ${test.status === 'success' ? 'ACTIVE' : 'FAIL'}
                                </span>
                            </td>
                            <td>
                                <div class="key-display">${test.displayKey}</div>
                                <div style="font-size:0.8em; color:#a0aec0">Idx: ${test.keyIndex}</div>
                            </td>
                            <td><div class="model-name">${test.model}</div></td>
                            <td><span class="response-time">${test.responseTime}ms</span></td>
                            <td>
                                ${test.status === 'success'
                    ? `<div style="color:#38a169">✅ Operational</div>`
                    : `<div class="error-message">❌ ${test.statusCode || 'Err'} - ${test.error}</div>`
                }
                                ${test.rateLimitInfo ? `<div style="font-size:0.8em; color:#718096; margin-top:4px;">Calc: ${test.rateLimitInfo.remainingRequests} RPM remaining</div>` : ''}
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            `;
        }).join('')}
        
        <div style="text-align: center; color: #a0aec0; margin-top: 50px; font-size: 0.9em;">
            Generated by Autopoiesis System | AntiGravity Ghost Agent
        </div>
    </div>
</body>
</html>`;

        const reportPath = path.join(__dirname, 'reports', 'API-TEST-REPORT.html');
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        fs.writeFileSync(reportPath, html);
        console.log(`  ✅ Detailed HTML report saved: ${reportPath}`);
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
        md += `**Generated**: ${new Date(this.results.timestamp).toLocaleString()}  \n`;
        md += `**Total Tests**: ${this.results.summary.total}  \n\n`;

        md += `## 📊 Summary\n\n`;
        md += `| Status | Count | Percentage |\n`;
        md += `|--------|-------|------------|\n`;
        md += `| ✅ Passed | ${this.results.summary.passed} | ${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}% |\n`;
        md += `| ❌ Failed | ${this.results.summary.failed} | ${((this.results.summary.failed / this.results.summary.total) * 100).toFixed(1)}% |\n\n`;

        md += `## 🏢 Provider Breakdown\n\n`;

        for (const [provider, stats] of Object.entries(providerStats)) {
            const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
            const status = stats.passed === stats.total ? '✅' : stats.passed > 0 ? '⚠️' : '❌';

            md += `### ${status} ${provider.toUpperCase()}\n\n`;
            md += `| Metric | Value |\n`;
            md += `|--------|-------|\n`;
            md += `| Total Tests | ${stats.total} |\n`;
            md += `| Passed | ${stats.passed} |\n`;
            md += `| Failed | ${stats.failed} |\n`;
            md += `| Success Rate | ${successRate}% |\n`;
            md += `| Avg Response Time | ${stats.avgResponseTime}ms |\n\n`;

            md += `**Models**:\n\n`;
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

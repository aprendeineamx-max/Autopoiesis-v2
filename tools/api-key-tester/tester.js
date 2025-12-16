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
        this.config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
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

        const apiKey = this.config.groq.api_key;

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

        const apiKey = this.config.openrouter.api_key;

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
    async testGoogleKeys() {
        console.log('\n📊 Testing Google Gemini API...\n');

        const models = [
            'gemini-2.0-flash-exp',
            'gemini-exp-1206',
            'gemini-1.5-pro-latest',
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash-8b-latest'
        ];

        const apiKeys = this.config.google.api_keys;

        for (let i = 0; i < apiKeys.length; i++) {
            const apiKey = apiKeys[i];

            for (const model of models) {
                await this.testSingleAPI({
                    provider: 'google',
                    apiKey: apiKey,
                    keyIndex: i + 1,
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
        const statsPath = path.join(__dirname, 'config', 'apiStats.json');

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

        const productionModels = this.config.sambanova.models.production;
        const previewModels = this.config.sambanova.models.preview;
        const allModels = [...productionModels, ...previewModels];

        const apiKey = this.config.sambanova.api_key;

        for (const model of allModels) {
            const isProduction = productionModels.includes(model);

            await this.testSingleAPI({
                provider: 'sambanova',
                apiKey: apiKey,
                model: model,
                endpoint: this.config.sambanova.endpoint,
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
    async generateHTMLReport() {
        console.log('\n📄 Generating HTML report...');

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

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Key Test Report - ${new Date(this.results.timestamp).toLocaleDateString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 1.1em; }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }
        .stat-card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-5px); }
        .stat-number { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .stat-label { color: #6c757d; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .total { color: #667eea; }
        .providers { padding: 40px; }
        .provider-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .provider-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 2px solid #e9ecef;
        }
        .provider-name { font-size: 1.5em; font-weight: bold; text-transform: uppercase; }
        .success-badge { background: #28a745; color: white; padding: 6px 16px; border-radius: 20px; font-size: 0.9em; }
        .warning-badge { background: #ffc107; color: #000; padding: 6px 16px; border-radius: 20px; font-size: 0.9em; }
        .danger-badge { background: #dc3545; color: white; padding: 6px 16px; border-radius: 20px; font-size: 0.9em; }
        .models-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 12px;
            margin-top: 16px;
        }
        .model-item {
            padding: 12px 16px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.9em;
        }
        .model-success { background: #d4edda; border-left: 4px solid #28a745; }
        .model-failed { background: #f8d7da; border-left: 4px solid #dc3545; }
        .model-name { font-family: 'Courier New', monospace; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
        th { background: #f8f9fa; font-weight: 600; text-transform: uppercase; font-size: 0.85em; color: #495057; }
        .metric-value { font-weight: 600; color: #667eea; }
        .footer { background: #343a40; color: white; padding: 20px; text-align: center; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 API Key Test Report</h1>
            <p>Generated: ${new Date(this.results.timestamp).toLocaleString()}</p>
            <p>Duration: ${((Date.now() - new Date(this.results.timestamp).getTime()) / 1000).toFixed(2)}s</p>
        </div>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-label">Total Tests</div>
                <div class="stat-number total">${this.results.summary.total}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Passed</div>
                <div class="stat-number passed">${this.results.summary.passed}</div>
                <div>${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Failed</div>
                <div class="stat-number failed">${this.results.summary.failed}</div>
                <div>${((this.results.summary.failed / this.results.summary.total) * 100).toFixed(1)}%</div>
            </div>
        </div>
        
        <div class="providers">
            ${Object.entries(providerStats).map(([provider, stats]) => {
            const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
            let badgeClass = stats.passed === stats.total ? 'success-badge' : stats.passed > 0 ? 'warning-badge' : 'danger-badge';
            let badgeText = stats.passed === stats.total ? `✅ ${successRate}% Success` : stats.passed > 0 ? `⚠️ ${successRate}% Success` : '❌ All Failed';

            return `
                <div class="provider-card">
                    <div class="provider-header">
                        <div class="provider-name">${provider}</div>
                        <div class="${badgeClass}">${badgeText}</div>
                    </div>
                    
                    <table>
                        <tr>
                            <th>Total Tests</th>
                            <th>Passed</th>
                            <th>Failed</th>
                            <th>Avg Response Time</th>
                        </tr>
                        <tr>
                            <td class="metric-value">${stats.total}</td>
                            <td class="metric-value passed">${stats.passed}</td>
                            <td class="metric-value failed">${stats.failed}</td>
                            <td class="metric-value">${stats.avgResponseTime}ms</td>
                        </tr>
                    </table>
                    
                    <div class="models-grid">
                        ${Object.entries(stats.models).map(([model, status]) => `
                            <div class="model-item ${status === 'success' ? 'model-success' : 'model-failed'}">
                                <span class="model-name">${model}</span>
                                <span>${status === 'success' ? '✅' : '❌'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                `;
        }).join('')}
        </div>
        
        <div class="footer">
            <p>Professional API Key Tester | Generated by Autopoiesis Phase 7</p>
        </div>
    </div>
</body>
</html>`;

        const reportPath = path.join(__dirname, 'reports', 'api-test-report.html');
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        fs.writeFileSync(reportPath, html);
        console.log(`  ✅ HTML report saved: ${reportPath}`);
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

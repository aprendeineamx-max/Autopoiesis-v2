/**
 * Intelligent API Manager
 * - Cascading fallback (if one key fails, tries next)
 * - Learning system (tracks which APIs work best)
 * - Usage tracking (tokens, requests, costs)
 * - Quality scoring (based on task success)
 * - Auto-selection of best model+key combination
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class APIManager {
    constructor(configPath = './config/api-keys.json', statsPath = './config/apiStats.json') {
        this.config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        this.statsPath = statsPath;
        this.stats = this.loadStats();
        this.currentSession = {
            requests: 0,
            successes: 0,
            failures: 0,
            totalTokens: 0
        };
    }

    /**
     * Load API statistics
     */
    loadStats() {
        if (fs.existsSync(this.statsPath)) {
            try {
                return JSON.parse(fs.readFileSync(this.statsPath, 'utf-8'));
            } catch (error) {
                console.warn('Failed to load apiStats.json, creating new');
            }
        }

        return {
            lastUpdated: new Date().toISOString(),
            providers: {},
            rankings: {
                bySpeed: [],
                byReliability: [],
                byQuality: []
            }
        };
    }

    /**
     * Save API statistics
     */
    saveStats() {
        this.stats.lastUpdated = new Date().toISOString();
        fs.writeFileSync(this.statsPath, JSON.stringify(this.stats, null, 2));
    }

    /**
     * Get best available API (intelligent selection)
     */
    getBestAPI() {
        const workingProviders = this.getWorkingProviders();

        if (workingProviders.length === 0) {
            throw new Error('No working API providers available');
        }

        // Score each provider
        const scored = workingProviders.map(p => ({
            ...p,
            score: this.calculateScore(p)
        }));

        // Sort by score (highest first)
        scored.sort((a, b) => b.score - a.score);

        console.log('🎯 Selected best API:', scored[0].provider, '-', scored[0].model);
        console.log('   Score:', scored[0].score.toFixed(2));

        return scored[0];
    }

    /**
     * Calculate score for a provider+model combination
     */
    calculateScore(providerData) {
        const { provider, keyIndex, model, stats } = providerData;

        if (!stats) return 0;

        // Factors:
        // 1. Reliability (success rate): 40%
        // 2. Speed (avg response time): 30%
        // 3. Quality (task success): 20%
        // 4. Recency (recent success): 10%

        const totalAttempts = stats.successCount + stats.failCount;
        const reliability = totalAttempts > 0 ? (stats.successCount / totalAttempts) : 0;

        // Speed score (inverse of response time, normalized)
        const speed = stats.avgResponseTime > 0
            ? Math.max(0, 1 - (stats.avgResponseTime / 10000)) // 10s = score 0
            : 0;

        // Quality score (from task feedback)
        const quality = stats.qualityScore || 0.5; // Default 0.5 if no data

        // Recency score (recent success is better)
        const recency = stats.lastSuccess
            ? Math.max(0, 1 - ((Date.now() - new Date(stats.lastSuccess).getTime()) / (7 * 24 * 60 * 60 * 1000))) // 7 days = score 0
            : 0;

        const score = (
            reliability * 0.4 +
            speed * 0.3 +
            quality * 0.2 +
            recency * 0.1
        );

        return score;
    }

    /**
     * Get list of working providers
     */
    getWorkingProviders() {
        const working = [];

        Object.keys(this.stats.providers || {}).forEach(providerKey => {
            const providerData = this.stats.providers[providerKey];

            Object.keys(providerData.models || {}).forEach(model => {
                const modelStats = providerData.models[model];

                if (modelStats.status === 'working') {
                    working.push({
                        provider: providerData.provider,
                        keyIndex: providerData.keyIndex,
                        model: model,
                        stats: modelStats
                    });
                }
            });
        });

        return working;
    }

    /**
     * Smart API call with cascading fallback
     */
    async callWithFallback(context, maxAttempts = 5) {
        const workingProviders = this.getWorkingProviders();

        if (workingProviders.length === 0) {
            throw new Error('No working API providers available. Run apiKeyTester.js first.');
        }

        // Sort by score
        const sorted = workingProviders
            .map(p => ({ ...p, score: this.calculateScore(p) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, maxAttempts);

        console.log(`🔄 Attempting API calls with ${sorted.length} providers in fallback chain...`);

        let lastError = null;

        for (let i = 0; i < sorted.length; i++) {
            const provider = sorted[i];

            try {
                console.log(`  [${i + 1}/${sorted.length}] Trying: ${provider.provider} - ${provider.model}...`);

                const result = await this.callAPI(provider, context);

                // Success! Record it
                await this.recordSuccess(provider, result);

                console.log(`  ✅ Success with ${provider.provider} - ${provider.model}`);

                return result;

            } catch (error) {
                console.log(`  ❌ Failed: ${error.message}`);

                lastError = error;

                // Record failure
                await this.recordFailure(provider, error);

                // Continue to next provider
                continue;
            }
        }

        // All attempts failed
        throw new Error(`All ${sorted.length} API providers failed. Last error: ${lastError?.message}`);
    }

    /**
     * Call specific API
     */
    async callAPI(provider, context) {
        const { provider: providerName, keyIndex, model } = provider;

        const apiKey = this.getAPIKey(providerName, keyIndex);

        if (!apiKey) {
            throw new Error(`No API key found for ${providerName} key${keyIndex}`);
        }

        const startTime = Date.now();

        try {
            let response;

            if (providerName === 'google') {
                response = await this.callGoogleAPI(apiKey, model, context);
            } else if (providerName === 'groq') {
                response = await this.callGroqAPI(apiKey, model, context);
            } else if (providerName === 'openrouter') {
                response = await this.callOpenRouterAPI(apiKey, model, context);
            } else if (providerName === 'sambanova') {
                response = await this.callSambanovaAPI(apiKey, model, context);
            } else {
                throw new Error(`Unknown provider: ${providerName}`);
            }

            const responseTime = Date.now() - startTime;

            return {
                content: response,
                provider: providerName,
                model,
                keyIndex,
                responseTime,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            throw error;
        }
    }

    /**
     * Get API key for provider
     */
    getAPIKey(provider, keyIndex) {
        if (provider === 'groq') {
            return this.config.groq.api_key;
        } else if (provider === 'openrouter') {
            return this.config.openrouter.api_key;
        } else if (provider === 'sambanova') {
            return this.config.sambanova.api_key;
        } else if (provider === 'google') {
            return this.config.google.api_keys[keyIndex - 1];
        }
        return null;
    }

    /**
     * Call SambaNova API
     */
    async callSambanovaAPI(apiKey, model, context) {
        const systemPrompt = this.buildSystemPrompt();
        const userPrompt = this.buildContextPrompt(context);

        const response = await axios.post(
            this.config.sambanova.endpoint,
            {
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        return response.data.choices[0].message.content;
    }

    /**
     * Call Google Gemini API
     */
    async callGoogleAPI(apiKey, model, context) {
        const systemPrompt = this.buildSystemPrompt();
        const userPrompt = this.buildContextPrompt(context);

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{
                        text: systemPrompt + '\n\n' + userPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000
                }
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );

        return response.data.candidates[0].content.parts[0].text;
    }

    /**
     * Call Groq API
     */
    async callGroqAPI(apiKey, model, context) {
        const systemPrompt = this.buildSystemPrompt();
        const userPrompt = this.buildContextPrompt(context);

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        return response.data.choices[0].message.content;
    }

    /**
     * Call OpenRouter API
     */
    async callOpenRouterAPI(apiKey, model, context) {
        const systemPrompt = this.buildSystemPrompt();
        const userPrompt = this.buildContextPrompt(context);

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://github.com/antigravity',
                    'X-Title': 'AntiGravity Supervisor'
                },
                timeout: 30000
            }
        );

        return response.data.choices[0].message.content;
    }

    /**
     * Build system prompt (same as APIClient)
     */
    buildSystemPrompt() {
        return `You are the SUPERVISOR AI for the AntiGravity Ghost Agent project.

ROLE:
- You work alongside another AI agent (Gemini Executor) within the AntiGravity IDE
- Gemini implements code and executes tasks
- You analyze results and decide what should be done next
- This is an AUTONOMOUS system - no human is involved in the conversation

YOUR RESPONSIBILITIES:
1. Analyze the executor's last message
2. Review repository state (files changed, test results, errors)
3. Check project context (roadmap, tasks, current phase)
4. Decide if current task is complete or needs more work
5. Generate the NEXT prompt for the executor agent

OUTPUT FORMAT:
- Write ONLY the prompt that will be sent to the executor
- Be specific, actionable, and reference file paths when needed
- No meta-commentary, no explanations outside the prompt
- Keep it concise but comprehensive

Remember: Your output goes directly to GHOST_INPUT.txt and will be auto-pasted to Gemini's chat.`;
    }

    /**
     * Build context prompt (simplified version from APIClient)
     */
    buildContextPrompt(context) {
        const { lastMessage, testResults, conversationState } = context;

        return `CURRENT CONTEXT:

Executor's Last Message:
${lastMessage?.content || 'No message yet'}

Test Results: ${testResults?.passRate ? (testResults.passRate * 100).toFixed(1) : 0}% passing
Tasks Completed: ${conversationState?.tasks_completed || 0}
Tasks Pending: ${conversationState?.tasks_pending || 0}

Based on this, generate the next prompt for the executor:`;
    }

    /**
     * Record successful API call
     */
    async recordSuccess(provider, result) {
        const providerKey = `${provider.provider}_key${provider.keyIndex}`;

        if (!this.stats.providers[providerKey]) {
            this.stats.providers[providerKey] = {
                provider: provider.provider,
                keyIndex: provider.keyIndex,
                models: {}
            };
        }

        if (!this.stats.providers[providerKey].models[provider.model]) {
            this.stats.providers[providerKey].models[provider.model] = {
                status: 'working',
                avgResponseTime: 0,
                successCount: 0,
                failCount: 0,
                totalTokensUsed: 0,
                qualityScore: 0.5,
                lastSuccess: null
            };
        }

        const modelStats = this.stats.providers[providerKey].models[provider.model];

        modelStats.successCount++;
        modelStats.lastSuccess = result.timestamp;
        modelStats.status = 'working';

        // Update average response time
        modelStats.avgResponseTime = (
            (modelStats.avgResponseTime * (modelStats.successCount - 1)) + result.responseTime
        ) / modelStats.successCount;

        // Estimate tokens (rough approximation)
        const estimatedTokens = Math.ceil((result.content?.length || 0) / 4);
        modelStats.totalTokensUsed += estimatedTokens;

        this.saveStats();

        // Update session stats
        this.currentSession.requests++;
        this.currentSession.successes++;
        this.currentSession.totalTokens += estimatedTokens;
    }

    /**
     * Record failed API call
     */
    async recordFailure(provider, error) {
        const providerKey = `${provider.provider}_key${provider.keyIndex}`;

        if (!this.stats.providers[providerKey]) {
            this.stats.providers[providerKey] = {
                provider: provider.provider,
                keyIndex: provider.keyIndex,
                models: {}
            };
        }

        if (!this.stats.providers[providerKey].models[provider.model]) {
            this.stats.providers[providerKey].models[provider.model] = {
                status: 'unknown',
                avgResponseTime: 0,
                successCount: 0,
                failCount: 0,
                lastError: null
            };
        }

        const modelStats = this.stats.providers[providerKey].models[provider.model];

        modelStats.failCount++;
        modelStats.lastError = {
            timestamp: new Date().toISOString(),
            error: error.message,
            statusCode: error.response?.status
        };

        // Update status based on success/fail ratio
        const total = modelStats.successCount + modelStats.failCount;
        if (total > 5 && modelStats.successCount / total < 0.5) {
            modelStats.status = 'unreliable';
        }

        this.saveStats();

        // Update session stats
        this.currentSession.requests++;
        this.currentSession.failures++;
    }

    /**
     * Update quality score based on task feedback
     */
    updateQualityScore(provider, model, keyIndex, score) {
        const providerKey = `${provider}_key${keyIndex}`;

        if (this.stats.providers[providerKey]?.models[model]) {
            const modelStats = this.stats.providers[providerKey].models[model];

            // Running average of quality scores
            const count = modelStats.qualityScoreCount || 0;
            modelStats.qualityScore = (
                (modelStats.qualityScore * count + score) / (count + 1)
            );
            modelStats.qualityScoreCount = count + 1;

            this.saveStats();
        }
    }

    /**
     * Get session summary
     */
    getSessionSummary() {
        return {
            ...this.currentSession,
            successRate: this.currentSession.requests > 0
                ? (this.currentSession.successes / this.currentSession.requests)
                : 0
        };
    }
}

module.exports = APIManager;

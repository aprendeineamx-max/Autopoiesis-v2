/**
 * Credit Checker - Check remaining credits and rate limits for all providers
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class CreditChecker {
    constructor(configPath = './config/api-keys.json') {
        this.config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        this.results = {
            timestamp: new Date().toISOString(),
            providers: {}
        };
    }

    /**
     * Check all providers
     */
    async checkAll() {
        console.log('💳 Credit Checker - Checking All Providers\n');
        console.log('='.repeat(60));

        await this.checkOpenRouter();
        await this.checkGroq();
        await this.checkGoogle();

        this.displaySummary();
        this.saveResults();

        return this.results;
    }

    /**
     * Check OpenRouter credits and limits
     */
    async checkOpenRouter() {
        console.log('\n📊 OpenRouter Credits & Limits...\n');

        try {
            const response = await axios.get(
                'https://openrouter.ai/api/v1/key',
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.openrouter.api_key}`
                    },
                    timeout: 10000
                }
            );

            const data = response.data.data;

            console.log('  ✅ OpenRouter API Key Valid');
            console.log(`  Label: ${data.label || 'Unnamed'}`);
            console.log(`  Credit Limit: ${data.limit !== null ? `$${data.limit}` : 'Unlimited'}`);
            console.log(`  Remaining: ${data.limit_remaining !== null ? `$${data.limit_remaining.toFixed(4)}` : 'Unlimited'}`);
            console.log(`  Usage (All Time): $${data.usage.toFixed(4)}`);
            console.log(`  Usage (Today): $${data.usage_daily.toFixed(4)}`);
            console.log(`  Usage (This Week): $${data.usage_weekly.toFixed(4)}`);
            console.log(`  Usage (This Month): $${data.usage_monthly.toFixed(4)}`);
            console.log(`  Free Tier: ${data.is_free_tier ? 'Yes' : 'No (Paid)'}`);
            console.log(`  BYOK Usage: $${data.byok_usage.toFixed(4)}`);

            // Calculate percentage used
            if (data.limit !== null && data.limit > 0) {
                const percentUsed = ((data.limit - data.limit_remaining) / data.limit * 100).toFixed(1);
                console.log(`  Usage: ${percentUsed}% of limit`);
            }

            this.results.providers.openrouter = {
                status: 'active',
                label: data.label,
                limit: data.limit,
                remaining: data.limit_remaining,
                usage: {
                    allTime: data.usage,
                    daily: data.usage_daily,
                    weekly: data.usage_weekly,
                    monthly: data.usage_monthly
                },
                byokUsage: {
                    allTime: data.byok_usage,
                    daily: data.byok_usage_daily,
                    weekly: data.byok_usage_weekly,
                    monthly: data.byok_usage_monthly
                },
                isFreeTier: data.is_free_tier,
                limitReset: data.limit_reset
            };

        } catch (error) {
            console.log('  ❌ OpenRouter Check Failed');
            console.log(`  Error: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);

            this.results.providers.openrouter = {
                status: 'error',
                error: error.message,
                statusCode: error.response?.status
            };
        }
    }

    /**
     * Check Groq (no official credits API, but can verify key)
     */
    async checkGroq() {
        console.log('\n📊 Groq API Status...\n');

        try {
            // Make a minimal test request
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'llama-3.1-8b-instant',
                    messages: [{ role: 'user', content: 'hi' }],
                    max_tokens: 1
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.groq.api_key}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            console.log('  ✅ Groq API Key Valid');
            console.log('  Note: Groq does not provide credit/limit API');
            console.log('  Free tier: 14,400 requests/day');

            this.results.providers.groq = {
                status: 'active',
                note: 'No credits API available',
                freeTier: '14,400 requests/day'
            };

        } catch (error) {
            if (error.response?.status === 403) {
                console.log('  ❌ Groq API Key Invalid or Blocked');
            } else if (error.response?.status === 429) {
                console.log('  ⚠️ Groq Rate Limit Exceeded');
                console.log('  Status: Key is valid but rate limited');
            } else {
                console.log('  ❌ Groq Check Failed');
            }
            console.log(`  Error: ${error.response?.status} - ${error.message}`);

            this.results.providers.groq = {
                status: 'error',
                error: error.message,
                statusCode: error.response?.status
            };
        }
    }

    /**
     * Check Google Gemini (limited info available)
     */
    async checkGoogle() {
        console.log('\n📊 Google Gemini API Status...\n');

        const keys = this.config.google.api_keys;
        this.results.providers.google = { keys: [] };

        for (let i = 0; i < keys.length; i++) {
            const apiKey = keys[i];
            console.log(`  Testing Key ${i + 1}/${keys.length}...`);

            try {
                // Make minimal test request
                const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
                    {
                        contents: [{ parts: [{ text: 'hi' }] }]
                    },
                    {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 10000
                    }
                );

                console.log(`  ✅ Key ${i + 1}: Valid`);
                console.log('  Note: Google does not provide credit/limit API');
                console.log('  Free tier: 15 RPM, 1M tokens/day');

                this.results.providers.google.keys.push({
                    index: i + 1,
                    status: 'active',
                    note: 'No credits API available',
                    freeTier: '15 RPM, 1M tokens/day'
                });

            } catch (error) {
                if (error.response?.status === 429) {
                    console.log(`  ⚠️ Key ${i + 1}: Rate Limit Exceeded`);
                    console.log('  Status: Valid but quota exhausted');
                } else if (error.response?.status === 403) {
                    console.log(`  ❌ Key ${i + 1}: Invalid or Leaked`);
                } else {
                    console.log(`  ❌ Key ${i + 1}: Check Failed`);
                }
                console.log(`  Error: ${error.response?.data?.error?.message || error.message}`);

                this.results.providers.google.keys.push({
                    index: i + 1,
                    status: 'error',
                    error: error.message,
                    statusCode: error.response?.status
                });
            }

            // Small delay between keys
            await this.sleep(500);
        }
    }

    /**
     * Display summary
     */
    displaySummary() {
        console.log('\n' + '='.repeat(60));
        console.log('\n💳 CREDITS SUMMARY\n');

        // OpenRouter
        if (this.results.providers.openrouter?.status === 'active') {
            const or = this.results.providers.openrouter;
            console.log('OpenRouter:');
            console.log(`  Status: ✅ Active`);
            console.log(`  Remaining: ${or.remaining !== null ? `$${or.remaining.toFixed(4)}` : 'Unlimited'}`);
            console.log(`  Today's Usage: $${or.usage.daily.toFixed(4)}`);
        } else {
            console.log('OpenRouter: ❌ Error');
        }

        // Groq
        if (this.results.providers.groq?.status === 'active') {
            console.log('\nGroq:');
            console.log('  Status: ✅ Active (14.4K req/day free)');
        } else {
            console.log('\nGroq: ❌ Error');
        }

        // Google
        const googleActive = this.results.providers.google?.keys.filter(k => k.status === 'active').length || 0;
        const googleTotal = this.results.providers.google?.keys.length || 0;
        console.log(`\nGoogle Gemini:`);
        console.log(`  Active Keys: ${googleActive}/${googleTotal}`);
    }

    /**
     * Save results
     */
    saveResults() {
        const outputPath = path.join(__dirname, 'credit-check-results.json');
        fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Results saved to: ${outputPath}`);
    }

    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run if executed directly
if (require.main === module) {
    const checker = new CreditChecker();
    checker.checkAll()
        .then(() => {
            console.log('\n✅ Credit check complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Credit check failed:', error);
            process.exit(1);
        });
}

module.exports = CreditChecker;

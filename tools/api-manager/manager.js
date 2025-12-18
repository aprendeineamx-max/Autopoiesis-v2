/**
 * API Manager v1.0 - Unified API Key Management Tool
 * Combines CreditChecker + APIKeyTester functionality
 * 
 * Features:
 *   - Check credits and rate limits
 *   - Test all API keys
 *   - Generate reports (HTML, Markdown, JSON)
 *   - Manage gray-list
 */

const path = require('path');
const fs = require('fs');

// Import existing modules
const CreditChecker = require('../credit-checker/creditChecker');
const APIKeyTester = require('../api-key-tester/tester');

class APIManager {
    constructor(configPath = '../../core/config/api-keys.json') {
        const keyPath = path.resolve(__dirname, configPath);
        this.configPath = keyPath;
        this.config = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));

        this.creditChecker = new CreditChecker(keyPath);
        this.tester = new APIKeyTester(configPath);

        this.lastResults = {
            credits: null,
            tests: null,
            timestamp: null
        };
    }

    /**
     * Quick status check - returns summary of all APIs
     */
    async quickStatus() {
        console.log('\n🔍 API MANAGER - Quick Status\n');
        console.log('═'.repeat(50));

        const status = {
            timestamp: new Date().toISOString(),
            providers: {}
        };

        // Count keys per provider
        for (const provider of ['groq', 'openrouter', 'google_gemini', 'sambanova']) {
            const keys = this.config[provider]?.api_keys ||
                [this.config[provider]?.api_key].filter(Boolean);
            status.providers[provider] = {
                keyCount: keys.length,
                configured: keys.length > 0
            };

            const emoji = keys.length > 0 ? '✅' : '❌';
            console.log(`${emoji} ${provider.padEnd(15)}: ${keys.length} key(s)`);
        }

        console.log('═'.repeat(50));
        return status;
    }

    /**
     * Full check - credits + test all keys
     */
    async fullCheck() {
        console.log('\n🚀 API MANAGER - Full Check\n');
        console.log('═'.repeat(60));

        // Step 1: Check credits
        console.log('\n📊 STEP 1: Checking Credits...\n');
        await this.creditChecker.checkAll();
        this.lastResults.credits = this.creditChecker.results;

        // Step 2: Test all keys
        console.log('\n🧪 STEP 2: Testing All Keys...\n');
        await this.tester.testAll();
        this.lastResults.tests = this.tester.results;

        // Step 3: Generate combined report
        console.log('\n📝 STEP 3: Generating Reports...\n');
        this.lastResults.timestamp = new Date().toISOString();

        // Save combined results
        const reportPath = path.join(__dirname, 'reports', `api-status-${Date.now()}.json`);
        if (!fs.existsSync(path.join(__dirname, 'reports'))) {
            fs.mkdirSync(path.join(__dirname, 'reports'), { recursive: true });
        }
        fs.writeFileSync(reportPath, JSON.stringify(this.lastResults, null, 2));

        console.log(`\n✅ Full check complete!`);
        console.log(`📄 Report saved: ${reportPath}`);

        return this.lastResults;
    }

    /**
     * Credits only - quick credit check
     */
    async checkCredits() {
        console.log('\n💳 Checking API Credits...\n');
        await this.creditChecker.checkAll();
        this.lastResults.credits = this.creditChecker.results;
        return this.creditChecker.results;
    }

    /**
     * Test only - just run tests
     */
    async testKeys() {
        console.log('\n🧪 Testing API Keys...\n');
        await this.tester.testAll();
        this.lastResults.tests = this.tester.results;
        return this.tester.results;
    }

    /**
     * List all configured keys (masked)
     */
    listKeys() {
        console.log('\n🔑 Configured API Keys:\n');
        console.log('═'.repeat(60));

        for (const [provider, data] of Object.entries(this.config)) {
            if (typeof data !== 'object') continue;

            console.log(`\n📦 ${provider.toUpperCase()}`);

            const keys = data.api_keys || [data.api_key].filter(Boolean);
            keys.forEach((key, i) => {
                if (!key) return;
                const masked = key.slice(0, 8) + '...' + key.slice(-4);
                console.log(`   ${i + 1}. ${masked}`);
            });
        }

        console.log('\n' + '═'.repeat(60));
    }

    /**
     * Get best available key for a provider
     */
    getBestKey(provider) {
        const grayListPath = path.join(__dirname, '..', 'gray-list-manager', 'gray-list.json');
        let grayList = {};

        try {
            grayList = JSON.parse(fs.readFileSync(grayListPath, 'utf-8'));
        } catch (e) { }

        const providerData = this.config[provider];
        if (!providerData) return null;

        const keys = providerData.api_keys || [providerData.api_key].filter(Boolean);

        // Filter out gray-listed keys
        const activeKeys = keys.filter(key => {
            const entry = grayList[key];
            if (!entry) return true;

            // Check if cooldown expired
            const expiresAt = new Date(entry.expiresAt);
            return new Date() > expiresAt;
        });

        return activeKeys[0] || null;
    }

    /**
     * Show help
     */
    showHelp() {
        console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                    API MANAGER v1.0 - Help                        ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Commands:                                                        ║
║    node manager.js status     Quick status of all providers       ║
║    node manager.js credits    Check credits only                  ║
║    node manager.js test       Test all keys                       ║
║    node manager.js full       Full check (credits + test)         ║
║    node manager.js list       List all configured keys            ║
║    node manager.js help       Show this help                      ║
║                                                                   ║
║  Examples:                                                        ║
║    node manager.js status                                         ║
║    node manager.js credits                                        ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
        `);
    }
}

// CLI Runner
if (require.main === module) {
    const manager = new APIManager();
    const command = process.argv[2] || 'help';

    const commands = {
        'status': () => manager.quickStatus(),
        'credits': () => manager.checkCredits(),
        'test': () => manager.testKeys(),
        'full': () => manager.fullCheck(),
        'list': () => { manager.listKeys(); return Promise.resolve(); },
        'help': () => { manager.showHelp(); return Promise.resolve(); }
    };

    const action = commands[command];
    if (!action) {
        console.log(`Unknown command: ${command}`);
        manager.showHelp();
        process.exit(1);
    }

    action()
        .then(() => {
            console.log('\n✅ Done!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Error:', error.message);
            process.exit(1);
        });
}

module.exports = APIManager;

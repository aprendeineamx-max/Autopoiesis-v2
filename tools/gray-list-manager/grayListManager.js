/**
 * Gray List Manager - Tracks Failed Models and Keys with Detailed Failure Reasons
 * Maintains a database of what doesn't work and why
 */

const fs = require('fs');
const path = require('path');

class GrayListManager {
    constructor(grayListPath = './config/gray-list.json') {
        this.grayListPath = grayListPath;
        this.grayList = this.load();
    }

    /**
     * Load gray list from file
     */
    load() {
        if (fs.existsSync(this.grayListPath)) {
            try {
                return JSON.parse(fs.readFileSync(this.grayListPath, 'utf-8'));
            } catch (error) {
                console.warn('Failed to load gray list, creating new');
            }
        }

        return {
            lastUpdated: new Date().toISOString(),
            failedModels: {},
            failedKeys: {},
            failureCategories: {
                '401_unauthorized': [],
                '403_forbidden': [],
                '404_not_found': [],
                '429_rate_limit': [],
                'network_error': [],
                'timeout': [],
                'quota_exceeded': [],
                'key_leaked': []
            }
        };
    }

    /**
     * Save gray list to file
     */
    save() {
        this.grayList.lastUpdated = new Date().toISOString();
        fs.writeFileSync(this.grayListPath, JSON.stringify(this.grayList, null, 2));
    }

    /**
     * Add failed model to gray list
     */
    addFailedModel(provider, model, keyIndex, error, statusCode) {
        const modelKey = `${provider}/${model}`;

        if (!this.grayList.failedModels[modelKey]) {
            this.grayList.failedModels[modelKey] = {
                provider,
                model,
                failures: [],
                firstFailure: new Date().toISOString(),
                failureCount: 0
            };
        }

        this.grayList.failedModels[modelKey].failures.push({
            keyIndex,
            error,
            statusCode,
            timestamp: new Date().toISOString()
        });

        this.grayList.failedModels[modelKey].failureCount++;
        this.grayList.failedModels[modelKey].lastFailure = new Date().toISOString();

        // Categorize failure
        this.categorizeFailure(modelKey, statusCode, error);

        this.save();
    }

    /**
     * Add failed key to gray list
     */
    addFailedKey(provider, keyIndex, reason, statusCode) {
        const keyKey = `${provider}_key${keyIndex}`;

        if (!this.grayList.failedKeys[keyKey]) {
            this.grayList.failedKeys[keyKey] = {
                provider,
                keyIndex,
                failures: [],
                firstFailure: new Date().toISOString(),
                failureCount: 0,
                status: 'failing'
            };
        }

        this.grayList.failedKeys[keyKey].failures.push({
            reason,
            statusCode,
            timestamp: new Date().toISOString()
        });

        this.grayList.failedKeys[keyKey].failureCount++;
        this.grayList.failedKeys[keyKey].lastFailure = new Date().toISOString();

        this.save();
    }

    /**
     * Categorize failure type
     */
    categorizeFailure(modelKey, statusCode, error) {
        const errorLower = (error || '').toLowerCase();

        if (statusCode === 401) {
            this.grayList.failureCategories['401_unauthorized'].push(modelKey);
        } else if (statusCode === 403) {
            if (errorLower.includes('leaked')) {
                this.grayList.failureCategories.key_leaked.push(modelKey);
            } else {
                this.grayList.failureCategories['403_forbidden'].push(modelKey);
            }
        } else if (statusCode === 404) {
            this.grayList.failureCategories['404_not_found'].push(modelKey);
        } else if (statusCode === 429) {
            if (errorLower.includes('quota')) {
                this.grayList.failureCategories.quota_exceeded.push(modelKey);
            } else {
                this.grayList.failureCategories['429_rate_limit'].push(modelKey);
            }
        } else if (errorLower.includes('timeout')) {
            this.grayList.failureCategories.timeout.push(modelKey);
        } else if (errorLower.includes('network') || errorLower.includes('connection')) {
            this.grayList.failureCategories.network_error.push(modelKey);
        }

        // Remove duplicates
        Object.keys(this.grayList.failureCategories).forEach(category => {
            this.grayList.failureCategories[category] = [...new Set(this.grayList.failureCategories[category])];
        });
    }

    /**
     * Import from API test results
     */
    importFromTestResults(testResultsPath) {
        const results = JSON.parse(fs.readFileSync(testResultsPath, 'utf-8'));

        console.log('📋 Importing test results into gray list...');

        results.tests.forEach(test => {
            if (test.status === 'failed') {
                this.addFailedModel(
                    test.provider,
                    test.model,
                    test.keyIndex,
                    test.error,
                    test.statusCode
                );
            }
        });

        console.log('  ✅ Import complete');
        this.generateReport();
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📋 GRAY LIST REPORT');
        console.log('='.repeat(60) + '\n');

        // Failed Models Summary
        const failedModelCount = Object.keys(this.grayList.failedModels).length;
        console.log(`Failed Models: ${failedModelCount}\n`);

        if (failedModelCount > 0) {
            // Group by provider
            const byProvider = {};
            Object.keys(this.grayList.failedModels).forEach(key => {
                const model = this.grayList.failedModels[key];
                if (!byProvider[model.provider]) {
                    byProvider[model.provider] = [];
                }
                byProvider[model.provider].push(model);
            });

            Object.keys(byProvider).forEach(provider => {
                console.log(`${provider.toUpperCase()}:`);
                byProvider[provider].forEach(model => {
                    const lastFailure = model.failures[model.failures.length - 1];
                    console.log(`  ❌ ${model.model}`);
                    console.log(`     Failures: ${model.failureCount}`);
                    console.log(`     Last Error: ${lastFailure.statusCode} - ${lastFailure.error.substring(0, 80)}...`);
                });
                console.log('');
            });
        }

        // Failure Categories
        console.log('Failure Categories:\n');
        Object.keys(this.grayList.failureCategories).forEach(category => {
            const count = this.grayList.failureCategories[category].length;
            if (count > 0) {
                console.log(`  ${category}: ${count} models`);
            }
        });

        // Failed Keys Summary
        const failedKeyCount = Object.keys(this.grayList.failedKeys).length;
        console.log(`\nFailed Keys: ${failedKeyCount}\n`);

        if (failedKeyCount > 0) {
            Object.keys(this.grayList.failedKeys).forEach(keyKey => {
                const key = this.grayList.failedKeys[keyKey];
                const lastFailure = key.failures[key.failures.length - 1];
                console.log(`  ❌ ${key.provider} Key ${key.keyIndex}`);
                console.log(`     Status: ${key.status}`);
                console.log(`     Failures: ${key.failureCount}`);
                console.log(`     Last Error: ${lastFailure.statusCode} - ${lastFailure.reason.substring(0, 80)}...`);
            });
        }

        console.log('\n' + '='.repeat(60));
    }

    /**
     * Get recommendations for fixes
     */
    getRecommendations() {
        const recommendations = [];

        // Check for leaked keys
        if (this.grayList.failureCategories.key_leaked.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                issue: 'Leaked API Keys Detected',
                action: 'Regenerate these API keys immediately',
                affected: this.grayList.failureCategories.key_leaked
            });
        }

        // Check for quota issues
        if (this.grayList.failureCategories.quota_exceeded.length > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                issue: 'Quota Exceeded',
                action: 'Wait for quota reset or upgrade plan',
                affected: this.grayList.failureCategories.quota_exceeded
            });
        }

        // Check for 404 models
        if (this.grayList.failureCategories['404_not_found'].length > 0) {
            recommendations.push({
                priority: 'LOW',
                issue: 'Models Not Found',
                action: 'Update model names to correct versions',
                affected: this.grayList.failureCategories['404_not_found']
            });
        }

        // Check for unauthorized
        if (this.grayList.failureCategories['401_unauthorized'].length > 0) {
            recommendations.push({
                priority: 'HIGH',
                issue: 'Unauthorized Access',
                action: 'Verify API keys are valid and have correct permissions',
                affected: this.grayList.failureCategories['401_unauthorized']
            });
        }

        // Check for forbidden
        if (this.grayList.failureCategories['403_forbidden'].length > 0) {
            recommendations.push({
                priority: 'HIGH',
                issue: 'Access Forbidden',
                action: 'Check account status and permissions',
                affected: this.grayList.failureCategories['403_forbidden']
            });
        }

        return recommendations;
    }

    /**
     * Display recommendations
     */
    displayRecommendations() {
        const recs = this.getRecommendations();

        if (recs.length === 0) {
            console.log('\n✅ No immediate recommendations - all systems operational');
            return;
        }

        console.log('\n' + '='.repeat(60));
        console.log('💡 RECOMMENDATIONS');
        console.log('='.repeat(60) + '\n');

        recs.forEach((rec, index) => {
            console.log(`${index + 1}. [${rec.priority}] ${rec.issue}`);
            console.log(`   Action: ${rec.action}`);
            console.log(`   Affected: ${rec.affected.length} model(s)`);
            console.log('');
        });
    }

    /**
     * Clear gray list (for fresh start)
     */
    clear() {
        this.grayList = {
            lastUpdated: new Date().toISOString(),
            failedModels: {},
            failedKeys: {},
            failureCategories: {
                '401_unauthorized': [],
                '403_forbidden': [],
                '404_not_found': [],
                '429_rate_limit': [],
                'network_error': [],
                'timeout': [],
                'quota_exceeded': [],
                'key_leaked': []
            }
        };
        this.save();
        console.log('✅ Gray list cleared');
    }
}

// CLI interface
if (require.main === module) {
    const manager = new GrayListManager();

    const command = process.argv[2] || 'import';

    if (command === 'import') {
        manager.importFromTestResults('./api-test-results.json');
        manager.displayRecommendations();
    } else if (command === 'report') {
        manager.generateReport();
        manager.displayRecommendations();
    } else if (command === 'clear') {
        manager.clear();
    } else {
        console.log('Usage: node grayListManager.js [import|report|clear]');
    }
}

module.exports = GrayListManager;

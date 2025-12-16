/**
 * Multi-Cycle Loop Test
 * Tests multiple autonomous cycles in sequence
 * Monitors performance, stability, and error recovery
 */

const APIManager = require('./src/apiManager');
const fs = require('fs');
const path = require('path');

class LoopTester {
    constructor(numCycles = 10) {
        this.numCycles = numCycles;
        this.workspaceRoot = path.join(__dirname, '..');
        this.ghostInputPath = path.join(this.workspaceRoot, 'GHOST_INPUT.txt');
        this.ghostOutputPath = path.join(this.workspaceRoot, 'GHOST_OUTPUT.txt');
        this.stateFilePath = path.join(this.workspaceRoot, 'CONVERSATION_STATE.json');

        this.results = {
            startTime: new Date().toISOString(),
            totalCycles: numCycles,
            completed: 0,
            successful: 0,
            failed: 0,
            cycles: [],
            performance: {
                avgResponseTime: 0,
                minResponseTime: Infinity,
                maxResponseTime: 0,
                totalTokens: 0
            }
        };
    }

    /**
     * Run multiple cycles
     */
    async runMultipleCycles() {
        console.log('🔄 Multi-Cycle Loop Tester\n');
        console.log('='.repeat(60));
        console.log(`Testing ${this.numCycles} autonomous cycles`);
        console.log('='.repeat(60) + '\n');

        const apiManager = new APIManager();

        for (let i = 1; i <= this.numCycles; i++) {
            console.log(`\n${'▸'.repeat(60)}`);
            console.log(`🔄 CYCLE ${i}/${this.numCycles}`);
            console.log(`${'▸'.repeat(60)}\n`);

            const cycleStart = Date.now();

            try {
                // Create test context
                const context = this.createTestContext(i);

                // Call API
                console.log(`  [${i}] Calling AI Supervisor...`);
                const result = await apiManager.callWithFallback(context);

                // Write to GHOST_INPUT
                console.log(`  [${i}] Writing to GHOST_INPUT.txt...`);
                this.writeGhostInput(i, result);

                // Simulate executor response (for testing)
                console.log(`  [${i}] Simulating executor response...`);
                await this.simulateExecutorResponse(i);

                const cycleTime = Date.now() - cycleStart;

                // Record success
                this.recordCycleSuccess(i, result, cycleTime);

                console.log(`  ✅ Cycle ${i} complete (${cycleTime}ms)`);
                console.log(`     Provider: ${result.provider}`);
                console.log(`     Model: ${result.model}`);
                console.log(`     API Time: ${result.responseTime}ms`);

                // Small delay between cycles
                if (i < this.numCycles) {
                    console.log(`\n  ⏸️  Waiting 3 seconds before next cycle...`);
                    await this.sleep(3000);
                }

            } catch (error) {
                const cycleTime = Date.now() - cycleStart;

                this.recordCycleFailure(i, error, cycleTime);

                console.log(`  ❌ Cycle ${i} failed (${cycleTime}ms)`);
                console.log(`     Error: ${error.message}`);

                // Continue to next cycle (error recovery test)
                console.log(`  🔄 Continuing to next cycle (testing error recovery)...`);
            }
        }

        // Generate final report
        this.generateReport();
        this.saveResults();

        return this.results;
    }

    /**
     * Create realistic test context
     */
    createTestContext(cycleNum) {
        const messages = [
            "I've successfully implemented the requested feature. All tests are passing. What should I work on next?",
            "The refactoring is complete. Code is cleaner and more maintainable. Ready for the next task.",
            "Bug fixed! The issue was in the validation logic. Tests now pass 100%. What's next?",
            "Documentation updated with latest changes. All examples verified. Awaiting next assignment.",
            "Performance optimization complete. System is 30% faster. Ready for more work.",
            "New feature deployed successfully. User feedback is positive. What should I focus on now?",
            "Code review addressed. All suggestions implemented. Tests still passing. Next steps?",
            "Database schema updated. Migration successful. Ready for next database task.",
            "API endpoints implemented and tested. Documentation complete. What's the next priority?",
            "Security audit complete. All vulnerabilities patched. System is more secure. Next task?"
        ];

        return {
            lastMessage: {
                content: messages[cycleNum % messages.length],
                timestamp: new Date().toISOString()
            },
            repoAnalysis: {
                filesChanged: [`file${cycleNum}.js`, `test${cycleNum}.js`],
                diff: `+${Math.floor(Math.random() * 100)} lines`,
                stats: {
                    additions: Math.floor(Math.random() * 200),
                    deletions: Math.floor(Math.random() * 50)
                },
                errors: []
            },
            testResults: {
                status: 'passing',
                passed: 45 + cycleNum,
                failed: Math.max(0, 5 - cycleNum),
                total: 50 + cycleNum,
                passRate: (45 + cycleNum) / (50 + cycleNum)
            },
            conversationState: {
                tasks_completed: 25 + cycleNum,
                tasks_pending: Math.max(0, 8 - cycleNum),
                current_task: `Task ${cycleNum}`,
                autonomous_cycles: cycleNum
            }
        };
    }

    /**
     * Write to GHOST_INPUT.txt
     */
    writeGhostInput(cycleNum, result) {
        const content = `[AUTO-GENERATED BY SUPERVISOR]
[Cycle: ${cycleNum}]
[Provider: ${result.provider} - ${result.model}]
[Timestamp: ${result.timestamp}]

${result.content}

---
[Next action will be auto-pasted by Internal Hook]`;

        fs.writeFileSync(this.ghostInputPath, content, 'utf-8');
    }

    /**
     * Simulate executor response (for testing without actual IDE)
     */
    async simulateExecutorResponse(cycleNum) {
        // In real scenario, this would come from Gemini
        // For testing, we just create a mock response

        const mockResponse = {
            cycle: cycleNum,
            status: 'completed',
            message: `Mock executor response for cycle ${cycleNum}`,
            timestamp: new Date().toISOString()
        };

        // Update state file
        let state = { cycles: [] };
        if (fs.existsSync(this.stateFilePath)) {
            try {
                state = JSON.parse(fs.readFileSync(this.stateFilePath, 'utf-8'));
            } catch (e) {
                state = { cycles: [] };
            }
        }

        state.cycles.push(mockResponse);
        state.lastUpdate = new Date().toISOString();
        state.totalCycles = cycleNum;

        fs.writeFileSync(this.stateFilePath, JSON.stringify(state, null, 2));

        await this.sleep(500); // Simulate processing time
    }

    /**
     * Record successful cycle
     */
    recordCycleSuccess(cycleNum, result, totalTime) {
        this.results.completed++;
        this.results.successful++;

        this.results.cycles.push({
            cycle: cycleNum,
            status: 'success',
            provider: result.provider,
            model: result.model,
            apiResponseTime: result.responseTime,
            totalCycleTime: totalTime,
            tokensUsed: Math.ceil((result.content?.length || 0) / 4),
            timestamp: result.timestamp
        });

        // Update performance stats
        this.updatePerformanceStats(result.responseTime, result.content);
    }

    /**
     * Record failed cycle
     */
    recordCycleFailure(cycleNum, error, totalTime) {
        this.results.completed++;
        this.results.failed++;

        this.results.cycles.push({
            cycle: cycleNum,
            status: 'failed',
            error: error.message,
            totalCycleTime: totalTime,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Update performance statistics
     */
    updatePerformanceStats(responseTime, content) {
        const tokens = Math.ceil((content?.length || 0) / 4);

        // Update averages
        const totalSuccessful = this.results.successful;
        this.results.performance.avgResponseTime = (
            (this.results.performance.avgResponseTime * (totalSuccessful - 1) + responseTime) /
            totalSuccessful
        );

        // Update min/max
        this.results.performance.minResponseTime = Math.min(
            this.results.performance.minResponseTime,
            responseTime
        );
        this.results.performance.maxResponseTime = Math.max(
            this.results.performance.maxResponseTime,
            responseTime
        );

        // Update tokens
        this.results.performance.totalTokens += tokens;
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
        console.log('\n\n' + '='.repeat(60));
        console.log('📊 MULTI-CYCLE TEST REPORT');
        console.log('='.repeat(60) + '\n');

        // Overall Stats
        console.log('Overall Results:');
        console.log(`  Total Cycles: ${this.results.totalCycles}`);
        console.log(`  Completed: ${this.results.completed}`);
        console.log(`  Successful: ${this.results.successful} ✅`);
        console.log(`  Failed: ${this.results.failed} ❌`);

        const successRate = (this.results.successful / this.results.completed * 100).toFixed(1);
        console.log(`  Success Rate: ${successRate}%`);
        console.log('');

        // Performance Stats
        if (this.results.successful > 0) {
            console.log('Performance:');
            console.log(`  Avg Response Time: ${Math.round(this.results.performance.avgResponseTime)}ms`);
            console.log(`  Min Response Time: ${this.results.performance.minResponseTime}ms ⚡`);
            console.log(`  Max Response Time: ${this.results.performance.maxResponseTime}ms`);
            console.log(`  Total Tokens: ${this.results.performance.totalTokens}`);
            console.log(`  Avg Tokens/Cycle: ${Math.round(this.results.performance.totalTokens / this.results.successful)}`);
            console.log('');
        }

        // Provider breakdown
        const providerStats = {};
        this.results.cycles.filter(c => c.status === 'success').forEach(cycle => {
            const key = `${cycle.provider}/${cycle.model}`;
            if (!providerStats[key]) {
                providerStats[key] = { count: 0, totalTime: 0 };
            }
            providerStats[key].count++;
            providerStats[key].totalTime += cycle.apiResponseTime;
        });

        if (Object.keys(providerStats).length > 0) {
            console.log('Provider Usage:');
            Object.entries(providerStats).forEach(([key, stats]) => {
                const avgTime = Math.round(stats.totalTime / stats.count);
                console.log(`  ${key}: ${stats.count} cycles (avg ${avgTime}ms)`);
            });
            console.log('');
        }

        // Failures
        const failures = this.results.cycles.filter(c => c.status === 'failed');
        if (failures.length > 0) {
            console.log('Failures:');
            failures.forEach(cycle => {
                console.log(`  Cycle ${cycle.cycle}: ${cycle.error}`);
            });
            console.log('');
        }

        // Verdict
        console.log('='.repeat(60));
        if (successRate >= 90) {
            console.log('🎉 EXCELLENT - System is highly stable!');
        } else if (successRate >= 70) {
            console.log('✅ GOOD - System is operational with minor issues');
        } else if (successRate >= 50) {
            console.log('⚠️ FAIR - System needs optimization');
        } else {
            console.log('❌ POOR - System requires significant fixes');
        }
        console.log('='.repeat(60));
    }

    /**
     * Save results to file
     */
    saveResults() {
        this.results.endTime = new Date().toISOString();

        const outputPath = path.join(__dirname, 'loop-test-results.json');
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

// CLI interface
if (require.main === module) {
    const numCycles = parseInt(process.argv[2]) || 10;

    const tester = new LoopTester(numCycles);

    tester.runMultipleCycles()
        .then(results => {
            const successRate = (results.successful / results.completed * 100).toFixed(1);

            console.log(`\n✅ Loop test complete!`);
            console.log(`   Success rate: ${successRate}%`);

            process.exit(successRate >= 70 ? 0 : 1);
        })
        .catch(error => {
            console.error('\n❌ Loop test failed:', error);
            process.exit(1);
        });
}

module.exports = LoopTester;

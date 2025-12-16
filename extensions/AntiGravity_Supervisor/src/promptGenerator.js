/**
 * Prompt Generator - Builds context-aware prompts for executor
 */
class PromptGenerator {
    /**
     * Generate prompt based on context
     * (Currently delegated to APIClient, keep class for future enhancements)
     */
    generate(context) {
        // Future: Add prompt templates, optimization, etc.
        return null; // APIClient handles generation for now
    }

    /**
     * Build task-specific prompt
     */
    buildTaskPrompt(taskName, taskDetails) {
        return `Task: ${taskName}

Details:
${taskDetails}

Please implement this task following best practices and ensuring all tests pass.`;
    }

    /**
     * Build fix prompt for errors
     */
    buildFixPrompt(errors, files) {
        const fileList = files.map(f => `  - ${f}`).join('\n');

        return `Fix Required:

Errors detected:
${errors.join('\n')}

Files affected:
${fileList}

Please analyze and fix these errors. Run tests to verify the fix.`;
    }

    /**
     * Build testing prompt
     */
    buildTestPrompt(testResults) {
        return `Testing Required:

Current test status:
- Passed: ${testResults.passed}
- Failed: ${testResults.failed}
- Pass Rate: ${(testResults.passRate * 100).toFixed(1)}%

Please run the comprehensive test suite and fix any failing tests.`;
    }
}

module.exports = PromptGenerator;

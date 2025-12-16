const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Repository Analyzer - Analyzes repo state, changes, and test results
 */
class RepoAnalyzer {
    constructor(workspaceRoot) {
        this.root = workspaceRoot;
    }

    /**
     * Analyze git changes since last commit
     */
    analyzeChanges() {
        try {
            // Git diff
            const diff = this.execGit('git diff HEAD');

            // Git status
            const status = this.execGit('git status --short');

            // Files changed
            const filesChanged = this.parseGitStatus(status);

            // Get stats
            const stats = this.getStats();

            return {
                diff: diff.substring(0, 1000), // Truncate for prompt
                filesChanged,
                stats,
                errors: this.detectErrors()
            };
        } catch (error) {
            console.error('Error analyzing changes:', error.message);
            return {
                diff: '',
                filesChanged: [],
                stats: {},
                errors: []
            };
        }
    }

    /**
     * Analyze test results
     */
    async analyzeTestResults() {
        const testLogPath = path.join(
            this.root,
            'ChatExporter/tests/test-results.log'
        );

        // Check if tests have been run
        if (!fs.existsSync(testLogPath)) {
            return {
                status: 'no_tests_run',
                passed: 0,
                failed: 0,
                total: 0,
                passRate: 0
            };
        }

        try {
            const logContent = fs.readFileSync(testLogPath, 'utf-8');

            // Parse test results
            const passedMatch = logContent.match(/Passed:\s*(\d+)/);
            const failedMatch = logContent.match(/Failed:\s*(\d+)/);

            const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
            const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
            const total = passed + failed;

            return {
                status: failed === 0 ? 'passing' : 'failing',
                passed,
                failed,
                total,
                passRate: total > 0 ? passed / total : 0
            };
        } catch (error) {
            console.error('Error analyzing test results:', error.message);
            return {
                status: 'error',
                passed: 0,
                failed: 0,
                total: 0,
                passRate: 0
            };
        }
    }

    /**
     * Get project context (key files)
     */
    getProjectContext() {
        return {
            roadmap: this.readFile('ROADMAP.md'),
            readme: this.readFile('README.md'),
            taskMd: this.findAndReadTaskMd(),
            conversationState: this.readJSON('CONVERSATION_STATE.json')
        };
    }

    /**
     * Find and read task.md from artifacts
     */
    findAndReadTaskMd() {
        const possiblePaths = [
            '.gemini/antigravity/brain/*/task.md',
            'task.md'
        ];

        for (const pathPattern of possiblePaths) {
            try {
                // Use PowerShell to find file
                const cmd = `Get-ChildItem -Path "${this.root}" -Filter "task.md" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName`;
                const result = execSync(`powershell -Command "${cmd}"`, {
                    encoding: 'utf-8',
                    cwd: this.root
                }).trim();

                if (result && fs.existsSync(result)) {
                    return fs.readFileSync(result, 'utf-8');
                }
            } catch (error) {
                // Continue to next path
            }
        }

        return null;
    }

    /**
     * Read file from workspace
     */
    readFile(relativePath) {
        try {
            const fullPath = path.join(this.root, relativePath);
            if (fs.existsSync(fullPath)) {
                return fs.readFileSync(fullPath, 'utf-8');
            }
        } catch (error) {
            console.error(`Error reading ${relativePath}:`, error.message);
        }
        return null;
    }

    /**
     * Read and parse JSON file
     */
    readJSON(relativePath) {
        const content = this.readFile(relativePath);
        if (content) {
            try {
                return JSON.parse(content);
            } catch (error) {
                console.error(`Error parsing ${relativePath}:`, error.message);
            }
        }
        return null;
    }

    /**
     * Execute git command safely
     */
    execGit(command) {
        try {
            return execSync(command, {
                cwd: this.root,
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'ignore'] // Suppress stderr
            });
        } catch (error) {
            return '';
        }
    }

    /**
     * Parse git status output
     */
    parseGitStatus(status) {
        if (!status) return [];

        return status
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                const parts = line.trim().split(' ');
                return parts[parts.length - 1]; // filename
            });
    }

    /**
     * Get repository stats
     */
    getStats() {
        try {
            const fileCount = this.execGit('git ls-files | wc -l').trim();
            const commitCount = this.execGit('git rev-list --count HEAD').trim();

            return {
                files: parseInt(fileCount) || 0,
                commits: parseInt(commitCount) || 0
            };
        } catch (error) {
            return {
                files: 0,
                commits: 0
            };
        }
    }

    /**
     * Detect errors in recent output/logs
     */
    detectErrors() {
        // Check for common error indicators
        const errors = [];

        // Check PowerShell error logs if they exist
        const errorLogPath = path.join(this.root, 'ChatExporter/tests/test-results.log');
        if (fs.existsSync(errorLogPath)) {
            const content = fs.readFileSync(errorLogPath, 'utf-8');

            if (content.includes('FAIL') || content.includes('ERROR')) {
                errors.push('Test failures detected in test-results.log');
            }
        }

        return errors;
    }
}

module.exports = RepoAnalyzer;

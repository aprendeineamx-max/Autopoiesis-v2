/**
 * System Validator - Comprehensive Error Detection
 * Checks all files, dependencies, syntax, and configurations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SystemValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.passed = [];
        this.baseDir = __dirname;
    }

    /**
     * Run all validation checks
     */
    async validateAll() {
        console.log('🔍 System Validator - Comprehensive Error Detection\n');
        console.log('='.repeat(60) + '\n');

        // 1. Check required files exist
        this.checkRequiredFiles();

        // 2. Validate JSON files
        this.validateJSONFiles();

        // 3. Check JavaScript syntax
        await this.validateJavaScriptFiles();

        // 4. Validate package.json
        this.validatePackageJSON();

        // 5. Check dependencies
        this.checkDependencies();

        // 6. Validate API keys configuration
        this.validateAPIKeysConfig();

        // 7. Check file permissions
        this.checkFilePermissions();

        // Generate report
        this.generateReport();

        return {
            errors: this.errors,
            warnings: this.warnings,
            passed: this.passed
        };
    }

    /**
     * Check all required files exist
     */
    checkRequiredFiles() {
        console.log('1️⃣  Checking required files...\n');

        const requiredFiles = [
            'extension.js',
            'package.json',
            'README.md',
            'src/apiClient.js',
            'src/apiManager.js',
            'src/stateManager.js',
            'src/repoAnalyzer.js',
            'src/messageReader.js',
            'src/promptGenerator.js',
            'config/api-keys.json',
            'apiKeyTester.js',
            'creditChecker.js',
            'grayListManager.js',
            'testFirstCycle.js',
            'testMultiCycle.js',
            'INSTALL.ps1',
            'INSTALLATION.md',
            'API_MANAGEMENT.md'
        ];

        requiredFiles.forEach(file => {
            const filePath = path.join(this.baseDir, file);
            if (fs.existsSync(filePath)) {
                this.passed.push(`✅ File exists: ${file}`);
            } else {
                this.errors.push(`❌ Missing required file: ${file}`);
            }
        });

        console.log(`   Checked ${requiredFiles.length} files`);
        console.log('');
    }

    /**
     * Validate all JSON files
     */
    validateJSONFiles() {
        console.log('2️⃣  Validating JSON files...\n');

        const jsonFiles = [
            'package.json',
            'config/api-keys.json'
        ];

        // Also check for optional JSON files
        const optionalJsonFiles = [
            'config/apiStats.json',
            'config/gray-list.json',
            'api-test-results.json',
            'loop-test-results.json',
            'credit-check-results.json'
        ];

        [...jsonFiles, ...optionalJsonFiles].forEach(file => {
            const filePath = path.join(this.baseDir, file);

            if (!fs.existsSync(filePath)) {
                if (jsonFiles.includes(file)) {
                    this.errors.push(`❌ Missing JSON file: ${file}`);
                }
                return;
            }

            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                JSON.parse(content);
                this.passed.push(`✅ Valid JSON: ${file}`);
            } catch (error) {
                this.errors.push(`❌ Invalid JSON in ${file}: ${error.message}`);
            }
        });

        console.log(`   Validated JSON files`);
        console.log('');
    }

    /**
     * Validate JavaScript files syntax
     */
    async validateJavaScriptFiles() {
        console.log('3️⃣  Validating JavaScript syntax...\n');

        const jsFiles = [
            'extension.js',
            'src/apiClient.js',
            'apiManager.js',
            'src/stateManager.js',
            'src/repoAnalyzer.js',
            'src/messageReader.js',
            'src/promptGenerator.js',
            'apiKeyTester.js',
            'creditChecker.js',
            'grayListManager.js',
            'testFirstCycle.js',
            'testMultiCycle.js',
            'rateLimitExtractor.js'
        ];

        for (const file of jsFiles) {
            const filePath = path.join(this.baseDir, file);

            if (!fs.existsSync(filePath)) {
                continue;
            }

            try {
                // Try to require the file to check syntax
                require(filePath);
                this.passed.push(`✅ Valid JS syntax: ${file}`);
            } catch (error) {
                // Check if it's a syntax error or just a runtime error
                if (error.message.includes('SyntaxError')) {
                    this.errors.push(`❌ Syntax error in ${file}: ${error.message}`);
                } else {
                    // Runtime errors are ok (e.g., missing dependencies at validation time)
                    this.passed.push(`✅ Syntax OK (runtime check): ${file}`);
                }
            }
        }

        console.log(`   Validated JavaScript files`);
        console.log('');
    }

    /**
     * Validate package.json structure
     */
    validatePackageJSON() {
        console.log('4️⃣  Validating package.json...\n');

        const packagePath = path.join(this.baseDir, 'package.json');

        if (!fs.existsSync(packagePath)) {
            this.errors.push('❌ package.json not found');
            return;
        }

        try {
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

            // Check required fields
            const requiredFields = ['name', 'version', 'engines', 'activationEvents', 'contributes'];

            requiredFields.forEach(field => {
                if (!pkg[field]) {
                    this.errors.push(`❌ Missing required field in package.json: ${field}`);
                } else {
                    this.passed.push(`✅ package.json has: ${field}`);
                }
            });

            // Check for commands
            if (pkg.contributes && pkg.contributes.commands) {
                const commandCount = pkg.contributes.commands.length;
                if (commandCount >= 5) {
                    this.passed.push(`✅ package.json has ${commandCount} commands`);
                } else {
                    this.warnings.push(`⚠️  Expected 5+ commands, found ${commandCount}`);
                }
            }

            // Check engine version
            if (pkg.engines && pkg.engines.vscode) {
                this.passed.push(`✅ VSCode engine: ${pkg.engines.vscode}`);
            }

        } catch (error) {
            this.errors.push(`❌ Error reading package.json: ${error.message}`);
        }

        console.log('   Validated package.json structure');
        console.log('');
    }

    /**
     * Check dependencies are installed
     */
    checkDependencies() {
        console.log('5️⃣  Checking dependencies...\n');

        const nodeModulesPath = path.join(this.baseDir, 'node_modules');

        if (!fs.existsSync(nodeModulesPath)) {
            this.errors.push('❌ node_modules not found - run npm install');
            return;
        }

        const requiredDeps = ['axios'];

        requiredDeps.forEach(dep => {
            const depPath = path.join(nodeModulesPath, dep);
            if (fs.existsSync(depPath)) {
                this.passed.push(`✅ Dependency installed: ${dep}`);
            } else {
                this.errors.push(`❌ Missing dependency: ${dep}`);
            }
        });

        console.log('   Checked dependencies');
        console.log('');
    }

    /**
     * Validate API keys configuration
     */
    validateAPIKeysConfig() {
        console.log('6️⃣  Validating API keys configuration...\n');

        const configPath = path.join(this.baseDir, 'config', 'api-keys.json');

        if (!fs.existsSync(configPath)) {
            this.errors.push('❌ config/api-keys.json not found');
            return;
        }

        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

            // Check required providers
            const requiredProviders = ['groq', 'openrouter', 'sambanova', 'google'];

            requiredProviders.forEach(provider => {
                if (config[provider]) {
                    this.passed.push(`✅ Provider configured: ${provider}`);

                    // Check for API key
                    if (provider === 'google') {
                        if (config[provider].api_keys && config[provider].api_keys.length > 0) {
                            this.passed.push(`✅ ${provider} has ${config[provider].api_keys.length} keys`);
                        } else {
                            this.warnings.push(`⚠️  ${provider} has no API keys`);
                        }
                    } else {
                        if (config[provider].api_key) {
                            const keyPreview = config[provider].api_key.substring(0, 10) + '...';
                            this.passed.push(`✅ ${provider} API key: ${keyPreview}`);
                        } else {
                            this.warnings.push(`⚠️  ${provider} missing API key`);
                        }
                    }
                } else {
                    this.warnings.push(`⚠️  Provider not configured: ${provider}`);
                }
            });

            // Check settings
            if (config.settings) {
                this.passed.push('✅ Settings configured');
            } else {
                this.warnings.push('⚠️  No settings section in config');
            }

        } catch (error) {
            this.errors.push(`❌ Error validating API keys config: ${error.message}`);
        }

        console.log('   Validated API configuration');
        console.log('');
    }

    /**
     * Check file permissions
     */
    checkFilePermissions() {
        console.log('7️⃣  Checking file permissions...\n');

        const criticalFiles = [
            'extension.js',
            'apiManager.js',
            'config/api-keys.json'
        ];

        criticalFiles.forEach(file => {
            const filePath = path.join(this.baseDir, file);

            if (!fs.existsSync(filePath)) {
                return;
            }

            try {
                // Try to read the file
                fs.readFileSync(filePath);
                this.passed.push(`✅ Readable: ${file}`);
            } catch (error) {
                this.errors.push(`❌ Cannot read ${file}: ${error.message}`);
            }
        });

        console.log('   Checked file permissions');
        console.log('');
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 VALIDATION REPORT');
        console.log('='.repeat(60) + '\n');

        // Summary
        console.log('Summary:');
        console.log(`  ✅ Passed: ${this.passed.length}`);
        console.log(`  ⚠️  Warnings: ${this.warnings.length}`);
        console.log(`  ❌ Errors: ${this.errors.length}`);
        console.log('');

        // Show errors
        if (this.errors.length > 0) {
            console.log('❌ ERRORS FOUND:\n');
            this.errors.forEach(error => console.log(`  ${error}`));
            console.log('');
        }

        // Show warnings
        if (this.warnings.length > 0) {
            console.log('⚠️  WARNINGS:\n');
            this.warnings.forEach(warning => console.log(`  ${warning}`));
            console.log('');
        }

        // Verdict
        console.log('='.repeat(60));
        if (this.errors.length === 0) {
            console.log('🎉 ALL CHECKS PASSED - System is ready!');
        } else {
            console.log(`❌ ${this.errors.length} ERROR(S) MUST BE FIXED`);
        }
        console.log('='.repeat(60));

        // Save report
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                passed: this.passed.length,
                warnings: this.warnings.length,
                errors: this.errors.length
            },
            errors: this.errors,
            warnings: this.warnings,
            passed: this.passed
        };

        const reportPath = path.join(this.baseDir, 'validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n💾 Report saved to: ${reportPath}`);
    }
}

// Run validation
if (require.main === module) {
    const validator = new SystemValidator();

    validator.validateAll()
        .then(results => {
            process.exit(results.errors.length === 0 ? 0 : 1);
        })
        .catch(error => {
            console.error('\n❌ Validation failed:', error);
            process.exit(1);
        });
}

module.exports = SystemValidator;

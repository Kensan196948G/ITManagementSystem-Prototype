#!/usr/bin/env node
/**
 * Cross-platform test runner for IT Management System
 * Supports Windows, macOS, and Linux
 * Replaces run_tests.bat with unified Node.js solution
 */

const { detectOS, getPlatformCommands, executeCommand, fileExists } = require('./platform-utils.cjs');
const path = require('path');
const fs = require('fs');

class TestRunner {
    constructor() {
        this.os = detectOS();
        this.commands = getPlatformCommands(this.os);
        this.projectRoot = path.resolve(__dirname, '..');
        
        console.log('==========================================');
        console.log('IT Management System - Test Runner');
        console.log(`Platform: ${this.os.toUpperCase()}`);
        console.log('==========================================\n');
    }

    /**
     * Set up Python virtual environment for testing
     */
    async setupTestEnvironment() {
        console.log('🔧 Setting up test environment...');
        
        const venvPath = path.join(this.projectRoot, 'venv');
        
        if (!fileExists(venvPath)) {
            console.log('📦 Creating virtual environment for testing...');
            await executeCommand(`${this.commands.python} -m venv venv`, { cwd: this.projectRoot });
        }
        
        // Activate virtual environment and install test dependencies
        const activateCmd = this.os === 'windows' 
            ? 'venv\\Scripts\\activate.bat'
            : 'source venv/bin/activate';
        
        console.log('📚 Installing test dependencies...');
        const installCmd = this.os === 'windows'
            ? `${activateCmd} && pip install -q pytest pytest-cov flask flask-cors flask-sqlalchemy werkzeug`
            : `${activateCmd} && pip install -q pytest pytest-cov flask flask-cors flask-sqlalchemy werkzeug`;
            
        await executeCommand(installCmd, { cwd: this.projectRoot });
        console.log('✅ Test environment ready\n');
    }

    /**
     * Run Python backend tests
     */
    async runPythonTests() {
        console.log('🧪 Running Python backend tests...');
        
        // Set up PYTHONPATH for cross-platform compatibility
        const pythonPath = [
            path.join(this.projectRoot, 'packages'),
            path.join(this.projectRoot, 'backend'),
            path.join(this.projectRoot, 'apps', 'backend'),
            this.projectRoot
        ].join(this.os === 'windows' ? ';' : ':');
        
        // Find test files
        const testPaths = [
            path.join(this.projectRoot, 'tests', 'backend'),
            path.join(this.projectRoot, 'tests'),
            path.join(this.projectRoot, 'backend', 'tests'),
            path.join(this.projectRoot, 'packages', 'backend', 'tests')
        ];
        
        let testDir = null;
        for (const testPath of testPaths) {
            if (fileExists(testPath)) {
                testDir = testPath;
                break;
            }
        }
        
        if (!testDir) {
            console.log('⚠️  No Python test directory found, skipping Python tests');
            return;
        }
        
        console.log(`📁 Found test directory: ${path.relative(this.projectRoot, testDir)}`);
        
        // Prepare activation and test command
        const activateCmd = this.os === 'windows' 
            ? 'venv\\Scripts\\activate.bat'
            : 'source venv/bin/activate';
        
        const testCmd = this.os === 'windows'
            ? `${activateCmd} && set PYTHONPATH=${pythonPath} && pytest ${testDir} --cov=packages/backend --cov=backend --maxfail=1 --disable-warnings -q`
            : `${activateCmd} && export PYTHONPATH="${pythonPath}" && pytest ${testDir} --cov=packages/backend --cov=backend --maxfail=1 --disable-warnings -q`;
        
        try {
            await executeCommand(testCmd, { cwd: this.projectRoot });
            console.log('✅ Python tests completed successfully\n');
        } catch (error) {
            console.log('❌ Python tests failed\n');
            throw error;
        }
    }

    /**
     * Run JavaScript/TypeScript frontend tests
     */
    async runJavaScriptTests() {
        console.log('🧪 Running JavaScript/TypeScript tests...');
        
        // Check if frontend tests exist
        const testPaths = [
            path.join(this.projectRoot, 'frontend', '__tests__'),
            path.join(this.projectRoot, 'frontend', 'tests'),
            path.join(this.projectRoot, 'frontend', 'src', '__tests__'),
            path.join(this.projectRoot, 'src', '__tests__'),
            path.join(this.projectRoot, 'tests', 'frontend'),
            path.join(this.projectRoot, '__tests__')
        ];
        
        let hasTests = false;
        for (const testPath of testPaths) {
            if (fileExists(testPath)) {
                hasTests = true;
                break;
            }
        }
        
        if (!hasTests) {
            // Check for test files
            const testFiles = [
                '**/*.test.js',
                '**/*.test.ts',
                '**/*.test.tsx',
                '**/*.spec.js',
                '**/*.spec.ts',
                '**/*.spec.tsx'
            ];
            
            for (const pattern of testFiles) {
                try {
                    const { glob } = require('glob');
                    const files = await glob(pattern, { cwd: this.projectRoot });
                    if (files.length > 0) {
                        hasTests = true;
                        break;
                    }
                } catch (error) {
                    // glob might not be available, continue
                }
            }
        }
        
        if (!hasTests) {
            console.log('⚠️  No JavaScript/TypeScript tests found, skipping frontend tests');
            return;
        }
        
        // Check for package.json test script
        const packageJsonPath = path.join(this.projectRoot, 'package.json');
        let testScript = 'npm test';
        
        if (fileExists(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            if (packageJson.scripts && packageJson.scripts.test) {
                testScript = 'npm test';
            } else if (fileExists(path.join(this.projectRoot, 'jest.config.js'))) {
                testScript = 'npx jest';
            } else if (fileExists(path.join(this.projectRoot, 'vitest.config.js'))) {
                testScript = 'npx vitest run';
            }
        }
        
        try {
            await executeCommand(testScript, { cwd: this.projectRoot });
            console.log('✅ JavaScript/TypeScript tests completed successfully\n');
        } catch (error) {
            console.log('❌ JavaScript/TypeScript tests failed\n');
            throw error;
        }
    }

    /**
     * Run integration tests if available
     */
    async runIntegrationTests() {
        const integrationScript = path.join(this.projectRoot, 'integration-test.sh');
        const integrationTestDir = path.join(this.projectRoot, 'tests', 'integration');
        
        if (fileExists(integrationScript) || fileExists(integrationTestDir)) {
            console.log('🔗 Running integration tests...');
            
            try {
                if (fileExists(integrationScript)) {
                    const cmd = this.os === 'windows' ? 'bash integration-test.sh' : './integration-test.sh';
                    await executeCommand(cmd, { cwd: this.projectRoot });
                } else {
                    // Run integration tests directory
                    const activateCmd = this.os === 'windows' 
                        ? 'venv\\Scripts\\activate.bat'
                        : 'source venv/bin/activate';
                    
                    const testCmd = this.os === 'windows'
                        ? `${activateCmd} && pytest tests/integration --disable-warnings -q`
                        : `${activateCmd} && pytest tests/integration --disable-warnings -q`;
                    
                    await executeCommand(testCmd, { cwd: this.projectRoot });
                }
                console.log('✅ Integration tests completed successfully\n');
            } catch (error) {
                console.log('❌ Integration tests failed\n');
                throw error;
            }
        } else {
            console.log('⚠️  No integration tests found, skipping\n');
        }
    }

    /**
     * Generate test coverage report
     */
    async generateCoverageReport() {
        console.log('📊 Generating coverage report...');
        
        try {
            const activateCmd = this.os === 'windows' 
                ? 'venv\\Scripts\\activate.bat'
                : 'source venv/bin/activate';
            
            const coverageCmd = this.os === 'windows'
                ? `${activateCmd} && coverage report && coverage html`
                : `${activateCmd} && coverage report && coverage html`;
            
            await executeCommand(coverageCmd, { cwd: this.projectRoot });
            console.log('✅ Coverage report generated in htmlcov/ directory\n');
        } catch (error) {
            console.log('⚠️  Could not generate coverage report (coverage not installed?)\n');
        }
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        const args = process.argv.slice(2);
        const skipPython = args.includes('--skip-python');
        const skipJavaScript = args.includes('--skip-js');
        const skipIntegration = args.includes('--skip-integration');
        const noCoverage = args.includes('--no-coverage');
        
        let hasFailures = false;
        
        try {
            if (!skipPython) {
                await this.setupTestEnvironment();
                await this.runPythonTests();
            }
            
            if (!skipJavaScript) {
                await this.runJavaScriptTests();
            }
            
            if (!skipIntegration) {
                await this.runIntegrationTests();
            }
            
            if (!noCoverage && !skipPython) {
                await this.generateCoverageReport();
            }
            
        } catch (error) {
            hasFailures = true;
        }
        
        console.log('==========================================');
        if (hasFailures) {
            console.log('❌ Some tests failed');
            console.log('Check the output above for details');
        } else {
            console.log('✅ All tests passed successfully!');
        }
        console.log('==========================================');
        
        if (hasFailures) {
            process.exit(1);
        }
    }

    /**
     * Show help information
     */
    showHelp() {
        console.log('IT Management System - Cross-platform Test Runner');
        console.log('Usage: node run-tests-cross.js [options]');
        console.log('');
        console.log('Options:');
        console.log('  --skip-python      Skip Python backend tests');
        console.log('  --skip-js          Skip JavaScript/TypeScript tests');
        console.log('  --skip-integration Skip integration tests');
        console.log('  --no-coverage      Skip coverage report generation');
        console.log('  --help, -h         Show this help message');
        console.log('');
        console.log('Examples:');
        console.log('  node run-tests-cross.js                    # Run all tests');
        console.log('  node run-tests-cross.js --skip-python      # Skip Python tests');
        console.log('  node run-tests-cross.js --no-coverage      # Run without coverage');
    }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    const runner = new TestRunner();
    runner.showHelp();
    process.exit(0);
}

// Run the tests
const testRunner = new TestRunner();
testRunner.runAllTests();
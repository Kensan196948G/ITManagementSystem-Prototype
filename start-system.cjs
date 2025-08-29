#!/usr/bin/env node
/**
 * Cross-platform IT Management System startup script
 * Replaces platform-specific .sh and .bat files with unified Node.js solution
 * Supports Windows, macOS, and Linux
 */

const { detectOS, getPlatformCommands, executeCommand, launchTerminal, fileExists, sleep } = require('./scripts/platform-utils.cjs');
const path = require('path');
const fs = require('fs');

class ITMSStartup {
    constructor() {
        this.os = detectOS();
        this.commands = getPlatformCommands(this.os);
        this.projectRoot = process.cwd();
        
        console.log('==========================================');
        console.log('IT Management System - Full Startup');
        console.log(`Platform: ${this.os.toUpperCase()}`);
        console.log('==========================================\n');
    }

    /**
     * Check and create .env file if it doesn't exist
     */
    async checkEnvironmentFile() {
        const envPath = path.join(this.projectRoot, '.env');
        const envExamplePath = path.join(this.projectRoot, '.env.example');
        
        if (!fileExists(envPath)) {
            console.log('📝 Creating .env file...');
            
            if (fileExists(envExamplePath)) {
                try {
                    const envExample = fs.readFileSync(envExamplePath, 'utf8');
                    fs.writeFileSync(envPath, envExample);
                    console.log('✅ .env file created from .env.example');
                } catch (error) {
                    console.log('⚠️  Could not copy .env.example, creating basic .env');
                    fs.writeFileSync(envPath, '# IT Management System Environment Configuration\nPORT=5173\nBACKEND_PORT=8000\n');
                }
            } else {
                console.log('⚠️  .env.example not found, creating basic .env');
                fs.writeFileSync(envPath, '# IT Management System Environment Configuration\nPORT=5173\nBACKEND_PORT=8000\n');
            }
            
            console.log('⚠️  Please edit .env file if needed\n');
        }
    }

    /**
     * Install dependencies if needed
     */
    async installDependencies() {
        console.log('📦 Checking dependencies...');
        
        const packageLockPath = path.join(this.projectRoot, 'package-lock.json');
        const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
        
        if (!fileExists(nodeModulesPath) || !fileExists(packageLockPath)) {
            console.log('📚 Installing npm dependencies...');
            await executeCommand('npm install', { cwd: this.projectRoot });
            console.log('✅ Dependencies installed\n');
        } else {
            console.log('✅ Dependencies already installed\n');
        }
    }

    /**
     * Start the backend server in a separate terminal/process
     */
    async startBackend() {
        console.log('🔧 Starting backend server...');
        
        const backendScript = path.join(this.projectRoot, 'start-backend-cross.cjs');
        
        // Create the cross-platform backend starter if it doesn't exist
        if (!fileExists(backendScript)) {
            await this.createBackendStarter();
        }
        
        try {
            // Try to launch in new terminal first
            await launchTerminal('ITSM Backend', `node "${backendScript}"`, { cwd: this.projectRoot });
            console.log('✅ Backend launched in new terminal');
        } catch (error) {
            console.log('⚠️  Terminal launch failed, starting backend in background...');
            // Fallback: run in background
            executeCommand(`node "${backendScript}"`, { 
                cwd: this.projectRoot,
                stdio: 'ignore'
            }).catch(err => console.error('Backend startup error:', err.message));
        }
        
        // Wait for backend to start
        await sleep(3);
    }

    /**
     * Create the cross-platform backend starter script
     */
    async createBackendStarter() {
        const backendScript = path.join(this.projectRoot, 'start-backend-cross.cjs');
        const backendStarterContent = `#!/usr/bin/env node
/**
 * Cross-platform backend startup script for IT Management System
 */

const { detectOS, getPlatformCommands, executeCommand, fileExists } = require('./scripts/platform-utils');
const path = require('path');
const fs = require('fs');

class BackendStarter {
    constructor() {
        this.os = detectOS();
        this.commands = getPlatformCommands(this.os);
        this.projectRoot = process.cwd();
        
        console.log('==========================================');
        console.log('IT Management System - Backend Startup');
        console.log(\`Platform: \${this.os.toUpperCase()}\`);
        console.log('==========================================\\n');
    }

    async start() {
        try {
            await this.setupVirtualEnvironment();
            await this.installPythonDependencies();
            await this.startServer();
        } catch (error) {
            console.error('Backend startup failed:', error.message);
            process.exit(1);
        }
    }

    async setupVirtualEnvironment() {
        const venvPath = path.join(this.projectRoot, 'venv');
        
        if (!fileExists(venvPath)) {
            console.log('📦 Creating virtual environment...');
            await executeCommand(\`\${this.commands.python} -m venv venv\`, { cwd: this.projectRoot });
            console.log('✅ Virtual environment created\\n');
        }
    }

    async installPythonDependencies() {
        console.log('📚 Installing Python dependencies...');
        
        // Activate virtual environment and install packages
        const activateCmd = this.os === 'windows' 
            ? 'venv\\\\Scripts\\\\activate && pip install -q flask flask-cors flask-sqlalchemy werkzeug'
            : 'source venv/bin/activate && pip install -q flask flask-cors flask-sqlalchemy werkzeug';
            
        await executeCommand(activateCmd, { cwd: this.projectRoot });
        console.log('✅ Python dependencies installed\\n');
    }

    async startServer() {
        console.log('🚀 Starting backend server...');
        console.log('URL: http://localhost:8000\\n');
        console.log('Available users:');
        console.log('  admin / admin123');
        console.log('  user / user123\\n');
        console.log('Press Ctrl+C to stop');
        console.log('==========================================\\n');
        
        // Navigate to backend directory and start server
        const backendPath = path.join(this.projectRoot, 'packages', 'backend');
        
        if (fileExists(backendPath)) {
            const activateCmd = this.os === 'windows'
                ? 'venv\\\\Scripts\\\\activate && cd packages\\\\backend && python app_simple.py'
                : 'source venv/bin/activate && cd packages/backend && python app_simple.py';
                
            await executeCommand(activateCmd, { cwd: this.projectRoot });
        } else {
            // Fallback to root directory backend
            const activateCmd = this.os === 'windows'
                ? 'venv\\\\Scripts\\\\activate && cd backend && python app.py'
                : 'source venv/bin/activate && cd backend && python app.py';
                
            await executeCommand(activateCmd, { cwd: this.projectRoot });
        }
    }
}

// Start the backend
const starter = new BackendStarter();
starter.start();
`;

        fs.writeFileSync(backendScript, backendStarterContent);
        
        // Make executable on Unix systems
        if (this.os !== 'windows') {
            fs.chmodSync(backendScript, '755');
        }
    }

    /**
     * Start the frontend development server
     */
    async startFrontend() {
        console.log('🎨 Starting frontend server...');
        console.log('');
        
        try {
            await executeCommand('npm run dev', { cwd: this.projectRoot });
        } catch (error) {
            console.error('Frontend startup failed:', error.message);
            throw error;
        }
    }

    /**
     * Display completion message
     */
    showCompletionMessage() {
        console.log('');
        console.log('==========================================');
        console.log('✅ All services started successfully!');
        console.log('Frontend: http://localhost:5173');
        console.log('Backend: http://localhost:8000');
        console.log('==========================================');
    }

    /**
     * Main startup sequence
     */
    async start() {
        try {
            await this.checkEnvironmentFile();
            await this.installDependencies();
            await this.startBackend();
            await this.startFrontend();
            this.showCompletionMessage();
        } catch (error) {
            console.error('\\nStartup failed:', error.message);
            console.log('\\nTroubleshooting tips:');
            console.log('1. Ensure Node.js and Python are installed');
            console.log('2. Check if ports 5173 and 8000 are available');
            console.log('3. Verify project dependencies are installed');
            process.exit(1);
        }
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === '--backend-only') {
    console.log('Starting backend only...');
    const starter = new ITMSStartup();
    starter.checkEnvironmentFile()
        .then(() => starter.startBackend())
        .then(() => {
            console.log('Backend started. Press Ctrl+C to stop.');
            // Keep process running
            process.stdin.resume();
        })
        .catch(error => {
            console.error('Backend startup failed:', error.message);
            process.exit(1);
        });
} else if (command === '--frontend-only') {
    console.log('Starting frontend only...');
    const starter = new ITMSStartup();
    starter.checkEnvironmentFile()
        .then(() => starter.installDependencies())
        .then(() => starter.startFrontend())
        .catch(error => {
            console.error('Frontend startup failed:', error.message);
            process.exit(1);
        });
} else {
    // Start full system
    const startup = new ITMSStartup();
    startup.start();
}
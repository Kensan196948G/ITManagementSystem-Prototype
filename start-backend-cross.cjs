#!/usr/bin/env node
/**
 * Cross-platform backend startup script for IT Management System
 * Supports Windows, macOS, and Linux
 */

const { detectOS, getPlatformCommands, executeCommand, fileExists } = require('./scripts/platform-utils.cjs');
const path = require('path');
const fs = require('fs');

class BackendStarter {
    constructor() {
        this.os = detectOS();
        this.commands = getPlatformCommands(this.os);
        this.projectRoot = process.cwd();
        
        console.log('==========================================');
        console.log('IT Management System - Backend Startup');
        console.log(`Platform: ${this.os.toUpperCase()}`);
        console.log('==========================================\n');
    }

    async start() {
        try {
            await this.setupVirtualEnvironment();
            await this.installPythonDependencies();
            await this.startServer();
        } catch (error) {
            console.error('Backend startup failed:', error.message);
            console.log('\nTroubleshooting tips:');
            console.log('1. Ensure Python is installed and in PATH');
            console.log('2. Check if port 8000 is available');
            console.log('3. Verify requirements.txt exists');
            process.exit(1);
        }
    }

    async setupVirtualEnvironment() {
        const venvPath = path.join(this.projectRoot, 'venv');
        
        if (!fileExists(venvPath)) {
            console.log('📦 Creating virtual environment...');
            await executeCommand(`${this.commands.python} -m venv venv`, { cwd: this.projectRoot });
            console.log('✅ Virtual environment created\n');
        } else {
            console.log('✅ Virtual environment already exists\n');
        }
    }

    async installPythonDependencies() {
        console.log('📚 Installing Python dependencies...');
        
        // Check for requirements.txt files in different locations
        const possibleRequirements = [
            path.join(this.projectRoot, 'requirements.txt'),
            path.join(this.projectRoot, 'backend', 'requirements.txt'),
            path.join(this.projectRoot, 'packages', 'backend', 'requirements.txt'),
            path.join(this.projectRoot, 'apps', 'backend', 'requirements.txt')
        ];
        
        let requirementsFile = null;
        for (const reqFile of possibleRequirements) {
            if (fileExists(reqFile)) {
                requirementsFile = reqFile;
                break;
            }
        }
        
        // Prepare activation command based on platform
        const activateCmd = this.os === 'windows' 
            ? 'venv\\Scripts\\activate.bat'
            : 'source venv/bin/activate';
        
        if (requirementsFile) {
            console.log(`📄 Found requirements file: ${path.relative(this.projectRoot, requirementsFile)}`);
            const installCmd = this.os === 'windows'
                ? `${activateCmd} && pip install -r "${requirementsFile}"`
                : `${activateCmd} && pip install -r "${requirementsFile}"`;
                
            await executeCommand(installCmd, { cwd: this.projectRoot });
        } else {
            console.log('📄 No requirements.txt found, installing basic dependencies...');
            const installCmd = this.os === 'windows'
                ? `${activateCmd} && pip install flask flask-cors flask-sqlalchemy werkzeug`
                : `${activateCmd} && pip install flask flask-cors flask-sqlalchemy werkzeug`;
                
            await executeCommand(installCmd, { cwd: this.projectRoot });
        }
        
        console.log('✅ Python dependencies installed\n');
    }

    async startServer() {
        console.log('🚀 Starting backend server...');
        console.log('URL: http://localhost:8000\n');
        console.log('Available users:');
        console.log('  admin / admin123');
        console.log('  user / user123\n');
        console.log('Press Ctrl+C to stop');
        console.log('==========================================\n');
        
        // Find the backend app file
        const possibleApps = [
            { path: path.join(this.projectRoot, 'packages', 'backend', 'app_simple.py'), dir: 'packages/backend' },
            { path: path.join(this.projectRoot, 'packages', 'backend', 'app.py'), dir: 'packages/backend' },
            { path: path.join(this.projectRoot, 'backend', 'app.py'), dir: 'backend' },
            { path: path.join(this.projectRoot, 'apps', 'backend', 'app.py'), dir: 'apps/backend' },
            { path: path.join(this.projectRoot, 'app.py'), dir: '.' }
        ];
        
        let appInfo = null;
        for (const app of possibleApps) {
            if (fileExists(app.path)) {
                appInfo = app;
                break;
            }
        }
        
        if (!appInfo) {
            throw new Error('No Python backend app file found (app.py, app_simple.py)');
        }
        
        console.log(`📱 Found backend app: ${appInfo.path}`);
        
        // Prepare activation and run command based on platform
        const activateCmd = this.os === 'windows' 
            ? 'venv\\Scripts\\activate.bat'
            : 'source venv/bin/activate';
            
        const appFileName = path.basename(appInfo.path);
        const runCmd = this.os === 'windows'
            ? `${activateCmd} && cd "${appInfo.dir}" && python ${appFileName}`
            : `${activateCmd} && cd "${appInfo.dir}" && python ${appFileName}`;
        
        await executeCommand(runCmd, { cwd: this.projectRoot });
    }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log('IT Management System - Backend Startup');
    console.log('Usage: node start-backend-cross.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h    Show this help message');
    console.log('  --version, -v Show version information');
    console.log('');
    console.log('This script will:');
    console.log('1. Create a Python virtual environment if needed');
    console.log('2. Install required Python dependencies');
    console.log('3. Start the backend server on http://localhost:8000');
    process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    console.log(`IT Management System Backend v${packageJson.version}`);
    console.log(`Platform: ${detectOS().toUpperCase()}`);
    process.exit(0);
}

// Start the backend
const starter = new BackendStarter();
starter.start();
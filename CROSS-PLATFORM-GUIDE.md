# Cross-Platform Development Guide

## Overview

The IT Management System has been updated with comprehensive cross-platform support, allowing seamless operation on Windows, macOS, and Linux systems. This guide covers the new cross-platform architecture and usage instructions.

## ✅ Cross-Platform Features

### 1. Unified Startup Scripts
- **New**: `start-system.cjs` - Cross-platform system launcher
- **New**: `start-backend-cross.cjs` - Cross-platform backend launcher  
- **New**: `scripts/run-tests-cross.cjs` - Cross-platform test runner
- **Legacy**: Original `.sh` and `.bat` files preserved for compatibility

### 2. OS Detection & Platform Utils
- **File**: `scripts/platform-utils.cjs`
- **Features**:
  - Automatic OS detection (Windows, macOS, Linux)
  - Platform-specific command generation
  - Cross-platform terminal launching
  - File system utilities

### 3. Updated Package.json Scripts
```json
{
  "scripts": {
    "start": "node start-system.cjs",
    "start:backend": "node start-system.cjs --backend-only",
    "start:frontend": "node start-system.cjs --frontend-only", 
    "test": "node scripts/run-tests-cross.cjs",
    "platform:detect": "node scripts/platform-utils.cjs detect"
  }
}
```

## 🚀 Quick Start (Any Platform)

### Option 1: NPM Scripts (Recommended)
```bash
# Install dependencies and start full system
npm start

# Start only backend
npm run start:backend

# Start only frontend  
npm run start:frontend

# Run tests
npm test
```

### Option 2: Direct Node.js Execution
```bash
# Full system startup
node start-system.cjs

# Backend only
node start-backend-cross.cjs

# Run tests
node scripts/run-tests-cross.cjs
```

### Option 3: Legacy Platform-Specific Scripts
```bash
# Linux/macOS
./start-all.sh

# Windows  
start-all.bat
```

## 📋 System Requirements

### All Platforms
- **Node.js**: v16+ with npm
- **Python**: 3.8+ with pip
- **Git**: For version control

### Platform-Specific Requirements

#### Windows
- **Python**: Installed via Microsoft Store or python.org
- **Terminal**: Command Prompt, PowerShell, or Windows Terminal
- **Optional**: Git Bash for enhanced Unix-like experience

#### macOS  
- **Python**: Built-in or via Homebrew (`brew install python`)
- **Terminal**: Built-in Terminal.app or iTerm2
- **Xcode Command Line Tools**: `xcode-select --install`

#### Linux
- **Python**: Usually pre-installed or via package manager
- **Terminal**: GNOME Terminal, Konsole, or any X11 terminal
- **Build Tools**: `sudo apt install build-essential` (Ubuntu/Debian)

## 🛠 Configuration

### Environment Variables
Create `.env` file (automatically created on first run):
```bash
# Server Configuration
PORT=5173
BACKEND_PORT=8000

# Database
DATABASE_URL=sqlite:///itsm.db

# Optional: Platform-specific overrides
PREFERRED_TERMINAL=gnome-terminal  # Linux only
PYTHON_CMD=python3                 # Unix systems
```

### Platform Detection
Check your current platform:
```bash
npm run platform:detect
# Output: windows | macos | linux
```

Get platform-specific commands:
```bash  
npm run platform:info
```

## 🔧 Development Workflow

### 1. First-Time Setup
```bash
# Clone repository
git clone <repository-url>
cd ITManagementSystem-Prototype

# Auto-setup (works on all platforms)
npm start
```

### 2. Daily Development
```bash
# Start development environment
npm start

# Or start components separately
npm run start:backend    # Terminal 1
npm run start:frontend   # Terminal 2
```

### 3. Testing
```bash
# Run all tests
npm test

# Run specific test types
node scripts/run-tests-cross.cjs --skip-python      # JS tests only
node scripts/run-tests-cross.cjs --skip-js          # Python tests only
node scripts/run-tests-cross.cjs --no-coverage      # No coverage report
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Python Not Found
**Symptoms**: `python3: command not found` or similar
**Solutions**:
- **Windows**: Install Python from Microsoft Store
- **macOS**: Install via Homebrew: `brew install python`
- **Linux**: Install via package manager: `sudo apt install python3`

#### 2. Terminal Launch Fails
**Symptoms**: Backend starts but no new terminal opens
**Behavior**: System automatically falls back to background execution
**Note**: This is expected behavior and doesn't affect functionality

#### 3. Port Already in Use
**Symptoms**: `EADDRINUSE: address already in use`
**Solutions**:
- Kill existing processes: `npm run stop` (if available)
- Change ports in `.env` file
- Restart your terminal/system

#### 4. Permission Denied (Linux/macOS)
**Symptoms**: `Permission denied` when running scripts
**Solution**: Make scripts executable:
```bash
chmod +x start-system.cjs
chmod +x scripts/*.js
```

### Debug Mode
Enable verbose logging:
```bash
DEBUG=1 npm start
```

## 📁 File Structure

### New Cross-Platform Files
```
ITManagementSystem-Prototype/
├── start-system.cjs              # Main cross-platform launcher
├── start-backend-cross.cjs       # Backend-only launcher  
├── scripts/
│   ├── platform-utils.cjs        # OS detection & utilities
│   └── run-tests-cross.cjs       # Cross-platform test runner
├── CROSS-PLATFORM-GUIDE.md     # This guide
└── package.json                 # Updated with cross-platform scripts
```

### Legacy Files (Preserved)
```
├── start-all.sh                 # Linux/macOS startup
├── start-all.bat                # Windows startup  
├── start-backend.sh             # Linux/macOS backend
├── start-backend.bat            # Windows backend
└── run_tests.bat                # Windows test runner
```

## 🔄 Migration from Legacy Scripts

### For Linux/macOS Users
```bash
# Old way
./start-all.sh

# New way (recommended)
npm start
```

### For Windows Users  
```bash
# Old way
start-all.bat

# New way (recommended)
npm start
```

### Benefits of New Approach
1. **Consistency**: Same commands across all platforms
2. **Reliability**: Better error handling and fallback mechanisms
3. **Flexibility**: Easy to extend and customize
4. **Maintenance**: Single codebase instead of multiple platform-specific scripts

## 🚀 Advanced Usage

### Custom Terminal Preferences
Set preferred terminal in `.env`:
```bash
# Linux
PREFERRED_TERMINAL=konsole

# macOS  
PREFERRED_TERMINAL=iTerm

# Windows (always uses cmd/powershell)
```

### Running in Different Modes
```bash
# Development mode (default)
npm start

# Production mode
NODE_ENV=production npm start

# Debug mode with verbose logging
DEBUG=1 npm start

# Backend only for API development
npm run start:backend

# Frontend only for UI development  
npm run start:frontend
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Test cross-platform
  run: |
    npm install
    npm test
  env:
    CI: true
```

## 📚 API Reference

### Platform Utilities (`scripts/platform-utils.cjs`)

#### `detectOS()`
Returns current OS: `'windows'`, `'macos'`, or `'linux'`

#### `getPlatformCommands(osType?)`
Returns platform-specific command configuration object

#### `executeCommand(command, options?)`
Cross-platform command execution with proper shell handling

#### `launchTerminal(title, command, options?)`  
Launch new terminal window with fallback to background execution

#### `fileExists(filePath)`
Cross-platform file existence check

#### `sleep(seconds)`
Cross-platform sleep utility

### Example Usage
```javascript
const { detectOS, getPlatformCommands, executeCommand } = require('./scripts/platform-utils');

const os = detectOS();
const commands = getPlatformCommands(os);

console.log(`Running on: ${os}`);
console.log(`Python command: ${commands.python}`);

// Execute cross-platform command
await executeCommand(`${commands.python} --version`);
```

## 🤝 Contributing

When adding new features:

1. **Test on multiple platforms** before submitting PR
2. **Use platform utilities** instead of hardcoded commands
3. **Update this guide** if adding new cross-platform features
4. **Preserve legacy scripts** for backward compatibility

## 📞 Support

For platform-specific issues:

1. **Check system requirements** for your platform
2. **Run debug mode**: `DEBUG=1 npm start`
3. **Test platform detection**: `npm run platform:detect`
4. **Check logs** in `logs/` directory
5. **Report issues** with platform and error details

## 🗺 Roadmap

Future cross-platform enhancements:

- [ ] Docker containerization for ultimate portability
- [ ] GUI launcher for non-technical users  
- [ ] Automated dependency installation
- [ ] Cloud deployment scripts
- [ ] Performance optimization per platform
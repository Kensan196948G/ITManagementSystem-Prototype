#!/usr/bin/env node
/**
 * Cross-platform utility functions for OS detection and platform-specific operations
 * Supports Windows, macOS, and Linux
 */

const os = require('os');
const { spawn, exec } = require('child_process');
const path = require('path');

/**
 * Detect the current operating system
 * @returns {string} 'windows', 'macos', or 'linux'
 */
function detectOS() {
    const platform = os.platform();
    
    switch (platform) {
        case 'win32':
            return 'windows';
        case 'darwin':
            return 'macos';
        case 'linux':
            return 'linux';
        default:
            // Fallback to linux for other Unix-like systems
            return 'linux';
    }
}

/**
 * Get platform-specific shell/terminal commands
 * @param {string} osType - The OS type ('windows', 'macos', 'linux')
 * @returns {object} Platform-specific command configurations
 */
function getPlatformCommands(osType = null) {
    const currentOS = osType || detectOS();
    
    const commands = {
        windows: {
            shell: 'cmd.exe',
            shellArgs: ['/c'],
            terminal: 'start',
            terminalArgs: (title, command) => [title, 'cmd', '/k', command],
            python: 'python',
            pip: 'pip',
            venvActivate: path.join('venv', 'Scripts', 'activate.bat'),
            pathSeparator: '\\',
            envFileCheck: 'if not exist ".env"',
            copyCommand: 'copy',
            sleepCommand: 'timeout /t',
            backgroundOperator: '&',
            lineEnding: '\r\n'
        },
        macos: {
            shell: '/bin/bash',
            shellArgs: ['-c'],
            terminal: 'open',
            terminalArgs: (title, command) => ['-a', 'Terminal', '--args', '-c', `echo -e "\\033]0;${title}\\007"; ${command}; exec bash`],
            python: 'python3',
            pip: 'pip3',
            venvActivate: path.join('venv', 'bin', 'activate'),
            pathSeparator: '/',
            envFileCheck: 'if [ ! -f ".env" ]',
            copyCommand: 'cp',
            sleepCommand: 'sleep',
            backgroundOperator: '&',
            lineEnding: '\n'
        },
        linux: {
            shell: '/bin/bash',
            shellArgs: ['-c'],
            terminal: detectLinuxTerminal(),
            terminalArgs: (title, command) => getLinuxTerminalArgs(title, command),
            python: 'python3',
            pip: 'pip3',
            venvActivate: path.join('venv', 'bin', 'activate'),
            pathSeparator: '/',
            envFileCheck: 'if [ ! -f ".env" ]',
            copyCommand: 'cp',
            sleepCommand: 'sleep',
            backgroundOperator: '&',
            lineEnding: '\n'
        }
    };
    
    return commands[currentOS] || commands.linux;
}

/**
 * Detect available Linux terminal emulator
 * @returns {string} Terminal command
 */
function detectLinuxTerminal() {
    const terminals = [
        'gnome-terminal',
        'konsole',
        'xfce4-terminal',
        'lxterminal',
        'mate-terminal',
        'terminology',
        'tilix',
        'kitty',
        'alacritty',
        'xterm'
    ];
    
    // For now, return gnome-terminal as default
    // This could be enhanced to actually check which terminals are available
    return 'gnome-terminal';
}

/**
 * Get Linux terminal arguments for launching a new terminal window
 * @param {string} title - Window title
 * @param {string} command - Command to execute
 * @returns {array} Terminal arguments
 */
function getLinuxTerminalArgs(title, command) {
    const terminal = detectLinuxTerminal();
    
    switch (terminal) {
        case 'gnome-terminal':
            return ['--tab', `--title=${title}`, '--', 'bash', '-c', `${command}; exec bash`];
        case 'konsole':
            return ['--new-tab', '-p', `tabtitle=${title}`, '-e', 'bash', '-c', `${command}; exec bash`];
        case 'xfce4-terminal':
            return ['--tab', `--title=${title}`, '--command', `bash -c "${command}; exec bash"`];
        case 'xterm':
            return ['-title', title, '-e', 'bash', '-c', `${command}; exec bash`];
        default:
            return ['--title', title, '-e', 'bash', '-c', `${command}; exec bash`];
    }
}

/**
 * Execute a command with platform-specific handling
 * @param {string} command - Command to execute
 * @param {object} options - Execution options
 * @returns {Promise} Promise that resolves with command result
 */
function executeCommand(command, options = {}) {
    const platformCommands = getPlatformCommands();
    
    return new Promise((resolve, reject) => {
        const childProcess = spawn(platformCommands.shell, [...platformCommands.shellArgs, command], {
            stdio: options.stdio || 'inherit',
            cwd: options.cwd || process.cwd(),
            env: { ...process.env, ...options.env }
        });
        
        childProcess.on('close', (code) => {
            if (code === 0) {
                resolve({ code, success: true });
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });
        
        childProcess.on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * Launch a new terminal window with a command
 * @param {string} title - Terminal window title
 * @param {string} command - Command to execute in the new terminal
 * @param {object} options - Launch options
 * @returns {Promise} Promise that resolves when terminal is launched
 */
function launchTerminal(title, command, options = {}) {
    const platformCommands = getPlatformCommands();
    const terminalArgs = platformCommands.terminalArgs(title, command);
    
    return new Promise((resolve, reject) => {
        const childProcess = spawn(platformCommands.terminal, terminalArgs, {
            stdio: 'ignore',
            detached: true,
            cwd: options.cwd || process.cwd()
        });
        
        childProcess.unref();
        
        childProcess.on('error', (error) => {
            // Fallback: run command in background if terminal launch fails
            console.warn(`Terminal launch failed, running in background: ${error.message}`);
            executeCommand(`${command} ${platformCommands.backgroundOperator}`, options)
                .then(resolve)
                .catch(reject);
        });
        
        // Give it a moment to start, then resolve
        setTimeout(() => resolve({ success: true }), 1000);
    });
}

/**
 * Get platform-specific file paths
 * @param {string} relativePath - Relative path to convert
 * @returns {string} Platform-specific path
 */
function getPlatformPath(relativePath) {
    const platformCommands = getPlatformCommands();
    return relativePath.split('/').join(platformCommands.pathSeparator);
}

/**
 * Check if a file exists in a platform-independent way
 * @param {string} filePath - Path to check
 * @returns {boolean} Whether file exists
 */
function fileExists(filePath) {
    const fs = require('fs');
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        return false;
    }
}

/**
 * Sleep for specified number of seconds (cross-platform)
 * @param {number} seconds - Number of seconds to sleep
 * @returns {Promise} Promise that resolves after sleep
 */
function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

module.exports = {
    detectOS,
    getPlatformCommands,
    executeCommand,
    launchTerminal,
    getPlatformPath,
    fileExists,
    sleep,
    // Utility constants
    OS_WINDOWS: 'windows',
    OS_MACOS: 'macos',
    OS_LINUX: 'linux'
};

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'detect':
            console.log(detectOS());
            break;
        case 'commands':
            console.log(JSON.stringify(getPlatformCommands(), null, 2));
            break;
        case 'test-terminal':
            const title = args[1] || 'Test Terminal';
            const cmd = args[2] || 'echo "Hello from cross-platform terminal!"';
            launchTerminal(title, cmd)
                .then(() => console.log('Terminal launched successfully'))
                .catch(error => console.error('Terminal launch failed:', error.message));
            break;
        default:
            console.log('Usage: node platform-utils.js [detect|commands|test-terminal [title] [command]]');
            console.log(`Current OS: ${detectOS()}`);
    }
}
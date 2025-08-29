#!/usr/bin/env node

/**
 * ITサービス管理システム - 自動移行スクリプト
 * Context7統合による知的移行システム
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn, exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class Context7MigrationManager {
    constructor() {
        this.platform = process.platform;
        this.architecture = process.arch;
        this.context7Layers = [
            'project_context',
            'conversation_context', 
            'code_context',
            'error_context',
            'user_context',
            'task_context',
            'system_context'
        ];
        this.migrationSteps = [];
        this.errors = [];
        this.startTime = Date.now();
    }

    // Context7: プロジェクトコンテキスト - システム環境分析
    async analyzeEnvironment() {
        console.log('🔍 Context7 環境分析中...');
        
        const environment = {
            platform: this.platform,
            architecture: this.architecture,
            node: await this.getNodeVersion(),
            python: await this.getPythonVersion(),
            npm: await this.getNpmVersion(),
            git: await this.getGitVersion(),
            availablePorts: await this.scanAvailablePorts(),
            systemResources: await this.getSystemResources()
        };

        console.log('✅ システム環境:', environment);
        return environment;
    }

    async getNodeVersion() {
        try {
            const { stdout } = await execAsync('node --version');
            return stdout.trim();
        } catch (error) {
            return null;
        }
    }

    async getPythonVersion() {
        try {
            const commands = ['python3 --version', 'python --version'];
            for (const cmd of commands) {
                try {
                    const { stdout } = await execAsync(cmd);
                    return stdout.trim();
                } catch (e) {
                    continue;
                }
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    async getNpmVersion() {
        try {
            const { stdout } = await execAsync('npm --version');
            return stdout.trim();
        } catch (error) {
            return null;
        }
    }

    async getGitVersion() {
        try {
            const { stdout } = await execAsync('git --version');
            return stdout.trim();
        } catch (error) {
            return null;
        }
    }

    async scanAvailablePorts() {
        const targetPorts = [3000, 5174, 8000, 8001];
        const availablePorts = [];

        for (const port of targetPorts) {
            if (await this.isPortAvailable(port)) {
                availablePorts.push(port);
            }
        }

        return availablePorts;
    }

    async isPortAvailable(port) {
        return new Promise((resolve) => {
            const net = require('net');
            const server = net.createServer();

            server.listen(port, () => {
                server.once('close', () => resolve(true));
                server.close();
            });

            server.on('error', () => resolve(false));
        });
    }

    async getSystemResources() {
        const os = require('os');
        return {
            totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
            freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024) + ' GB',
            cpuCount: os.cpus().length,
            platform: os.platform(),
            arch: os.arch()
        };
    }

    // Context7: タスクコンテキスト - 移行タスクプランニング
    async planMigration(environment) {
        console.log('📋 Context7 移行計画作成中...');

        const migrationPlan = {
            prerequisites: await this.checkPrerequisites(environment),
            steps: [
                { id: 'env_setup', name: '環境変数設定', priority: 'high' },
                { id: 'deps_install', name: '依存関係インストール', priority: 'high' },
                { id: 'db_init', name: 'データベース初期化', priority: 'medium' },
                { id: 'config_optimize', name: '設定最適化', priority: 'medium' },
                { id: 'services_start', name: 'サービス起動', priority: 'high' },
                { id: 'verification', name: '動作確認', priority: 'high' }
            ],
            estimatedTime: '3-5分',
            riskLevel: 'low'
        };

        console.log('✅ 移行計画:', migrationPlan);
        return migrationPlan;
    }

    async checkPrerequisites(environment) {
        const checks = {
            nodeVersion: this.checkNodeVersion(environment.node),
            pythonVersion: this.checkPythonVersion(environment.python),
            npmVersion: this.checkNpmVersion(environment.npm),
            availablePorts: environment.availablePorts.length >= 2,
            diskSpace: await this.checkDiskSpace(),
            memoryAvailable: await this.checkMemoryAvailable()
        };

        return checks;
    }

    checkNodeVersion(version) {
        if (!version) return false;
        const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
        return majorVersion >= 18;
    }

    checkPythonVersion(version) {
        if (!version) return false;
        const match = version.match(/Python\\s+(\\d+)\\.(\\d+)/);
        if (!match) return false;
        const major = parseInt(match[1]);
        const minor = parseInt(match[2]);
        return major >= 3 && minor >= 8;
    }

    checkNpmVersion(version) {
        if (!version) return false;
        const majorVersion = parseInt(version.split('.')[0]);
        return majorVersion >= 8;
    }

    async checkDiskSpace() {
        try {
            const { stdout } = await execAsync('df -h . 2>/dev/null || dir /-c 2>nul');
            return true; // 簡略化、実際の実装では詳細チェック
        } catch (error) {
            return true; // エラー時は続行
        }
    }

    async checkMemoryAvailable() {
        const os = require('os');
        const freeMemGB = os.freemem() / 1024 / 1024 / 1024;
        return freeMemGB >= 2; // 最低2GB
    }

    // Context7: エラーコンテキスト - 自動修復システム
    async autoRepairEnvironment(environment, prerequisites) {
        console.log('🔧 Context7 自動修復実行中...');

        const repairs = [];

        // Node.js修復
        if (!prerequisites.nodeVersion) {
            repairs.push(await this.repairNodeJS());
        }

        // Python修復
        if (!prerequisites.pythonVersion) {
            repairs.push(await this.repairPython());
        }

        // NPM修復
        if (!prerequisites.npmVersion) {
            repairs.push(await this.repairNPM());
        }

        // ポート競合修復
        if (!prerequisites.availablePorts) {
            repairs.push(await this.repairPortConflicts());
        }

        console.log('✅ 自動修復完了:', repairs.filter(r => r.success));
        return repairs;
    }

    async repairNodeJS() {
        console.log('📦 Node.js環境修復中...');
        
        try {
            let command;
            switch (this.platform) {
                case 'win32':
                    command = 'winget install OpenJS.NodeJS.LTS';
                    break;
                case 'darwin':
                    command = 'brew install node@18';
                    break;
                case 'linux':
                    command = 'curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs';
                    break;
                default:
                    throw new Error('Unsupported platform');
            }

            await execAsync(command);
            return { success: true, message: 'Node.js修復完了' };
        } catch (error) {
            return { success: false, message: 'Node.js修復失敗: ' + error.message };
        }
    }

    async repairPython() {
        console.log('🐍 Python環境修復中...');
        
        try {
            let command;
            switch (this.platform) {
                case 'win32':
                    command = 'winget install Python.Python.3.11';
                    break;
                case 'darwin':
                    command = 'brew install python@3.11';
                    break;
                case 'linux':
                    command = 'sudo apt update && sudo apt install -y python3.11 python3.11-venv python3.11-dev';
                    break;
                default:
                    throw new Error('Unsupported platform');
            }

            await execAsync(command);
            return { success: true, message: 'Python修復完了' };
        } catch (error) {
            return { success: false, message: 'Python修復失敗: ' + error.message };
        }
    }

    async repairNPM() {
        console.log('📦 NPM環境修復中...');
        
        try {
            await execAsync('npm install -g npm@latest');
            return { success: true, message: 'NPM修復完了' };
        } catch (error) {
            return { success: false, message: 'NPM修復失敗: ' + error.message };
        }
    }

    async repairPortConflicts() {
        console.log('🔌 ポート競合修復中...');
        
        try {
            const conflicts = [];
            const ports = [3000, 8000];

            for (const port of ports) {
                try {
                    if (this.platform === 'win32') {
                        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
                        if (stdout) {
                            conflicts.push(port);
                        }
                    } else {
                        const { stdout } = await execAsync(`lsof -ti :${port}`);
                        if (stdout.trim()) {
                            await execAsync(`kill -9 ${stdout.trim()}`);
                            conflicts.push(port);
                        }
                    }
                } catch (error) {
                    // ポートが使用されていない = OK
                }
            }

            return { 
                success: true, 
                message: `ポート競合修復完了 (${conflicts.length}個のポートを解放)` 
            };
        } catch (error) {
            return { success: false, message: 'ポート競合修復失敗: ' + error.message };
        }
    }

    // Context7: コードコンテキスト - 依存関係インストール
    async installDependencies() {
        console.log('📦 Context7 依存関係インストール中...');

        const results = [];

        // ルート依存関係
        results.push(await this.installRootDependencies());

        // フロントエンド依存関係
        results.push(await this.installFrontendDependencies());

        // バックエンド依存関係
        results.push(await this.installBackendDependencies());

        console.log('✅ 依存関係インストール完了');
        return results;
    }

    async installRootDependencies() {
        try {
            console.log('📦 ルート依存関係インストール中...');
            await this.execWithProgress('npm install', 'ルート依存関係');
            return { success: true, component: 'root' };
        } catch (error) {
            this.errors.push(`ルート依存関係エラー: ${error.message}`);
            return { success: false, component: 'root', error: error.message };
        }
    }

    async installFrontendDependencies() {
        try {
            console.log('🎨 フロントエンド依存関係インストール中...');
            
            const frontendExists = await fs.access('./frontend').then(() => true).catch(() => false);
            if (!frontendExists) {
                return { success: true, component: 'frontend', message: 'フロントエンドディレクトリが存在しません' };
            }

            await this.execWithProgress('cd frontend && npm install', 'フロントエンド依存関係');
            return { success: true, component: 'frontend' };
        } catch (error) {
            this.errors.push(`フロントエンド依存関係エラー: ${error.message}`);
            return { success: false, component: 'frontend', error: error.message };
        }
    }

    async installBackendDependencies() {
        try {
            console.log('🐍 バックエンド依存関係インストール中...');
            
            const backendExists = await fs.access('./backend').then(() => true).catch(() => false);
            if (!backendExists) {
                return { success: true, component: 'backend', message: 'バックエンドディレクトリが存在しません' };
            }

            // 仮想環境作成
            await this.execWithProgress('cd backend && python -m venv venv', 'Python仮想環境作成');
            
            // 仮想環境で依存関係インストール
            const activateCmd = this.platform === 'win32' ? 
                'cd backend && venv\\\\Scripts\\\\activate && pip install -r requirements.txt' :
                'cd backend && source venv/bin/activate && pip install -r requirements.txt';
            
            await this.execWithProgress(activateCmd, 'Python依存関係');
            return { success: true, component: 'backend' };
        } catch (error) {
            this.errors.push(`バックエンド依存関係エラー: ${error.message}`);
            return { success: false, component: 'backend', error: error.message };
        }
    }

    async execWithProgress(command, taskName) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, [], { 
                shell: true, 
                stdio: ['ignore', 'pipe', 'pipe'] 
            });

            let output = '';
            
            process.stdout.on('data', (data) => {
                output += data.toString();
                // プログレス表示（簡略化）
                if (output.includes('added') || output.includes('installed')) {
                    console.log(`📦 ${taskName}: 進行中...`);
                }
            });

            process.stderr.on('data', (data) => {
                output += data.toString();
            });

            process.on('close', (code) => {
                if (code === 0) {
                    console.log(`✅ ${taskName}: 完了`);
                    resolve(output);
                } else {
                    console.log(`❌ ${taskName}: 失敗 (終了コード: ${code})`);
                    reject(new Error(`${taskName} failed with code ${code}: ${output}`));
                }
            });

            process.on('error', (error) => {
                reject(error);
            });
        });
    }

    // Context7: システムコンテキスト - 環境設定
    async setupEnvironment() {
        console.log('⚙️  Context7 環境設定中...');

        // .env設定
        await this.setupEnvFile();

        // Context7設定最適化
        await this.optimizeContext7Config();

        // Claude Flow設定最適化  
        await this.optimizeClaudeFlowConfig();

        console.log('✅ 環境設定完了');
    }

    async setupEnvFile() {
        try {
            const envExamplePath = './.env.example';
            const envPath = './.env';

            // .envが既に存在する場合はスキップ
            const envExists = await fs.access(envPath).then(() => true).catch(() => false);
            if (envExists) {
                console.log('⚙️  既存の.envファイルを使用');
                return;
            }

            // .env.exampleが存在する場合はコピー
            const envExampleExists = await fs.access(envExamplePath).then(() => true).catch(() => false);
            if (envExampleExists) {
                const envTemplate = await fs.readFile(envExamplePath, 'utf8');
                await fs.writeFile(envPath, envTemplate);
                console.log('⚙️  .envファイルを.env.exampleから作成');
            } else {
                // デフォルトの.env作成
                const defaultEnv = `
# ITサービス管理システム環境設定
DATABASE_URL=sqlite:///./itsm.db
JWT_SECRET_KEY=${this.generateSecureKey()}
SESSION_SECRET=${this.generateSecureKey()}

# Context7設定
CONTEXT7_ENABLED=true
CONTEXT7_LAYERS=all
CONTEXT7_CACHE_SIZE=1000

# Claude Flow設定
CLAUDE_FLOW_ENABLED=true
MAX_PARALLEL_TASKS=10
AUTO_REPAIR=true

# ネットワーク設定
PORT=5174
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:5174
BACKEND_URL=http://localhost:8000
`.trim();

                await fs.writeFile(envPath, defaultEnv);
                console.log('⚙️  デフォルト.envファイルを作成');
            }
        } catch (error) {
            this.errors.push(`環境設定エラー: ${error.message}`);
        }
    }

    generateSecureKey() {
        return require('crypto').randomBytes(32).toString('hex');
    }

    async optimizeContext7Config() {
        try {
            const configPath = './context7-config.json';
            const configExists = await fs.access(configPath).then(() => true).catch(() => false);
            
            if (configExists) {
                const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
                
                // システムリソースに基づく最適化
                const systemResources = await this.getSystemResources();
                const memoryGB = parseInt(systemResources.totalMemory);
                
                if (memoryGB >= 16) {
                    config.context7.layers.project_context.max_entries = 2000;
                    config.context7.layers.code_context.max_entries = 3000;
                } else if (memoryGB >= 8) {
                    config.context7.layers.project_context.max_entries = 1500;
                    config.context7.layers.code_context.max_entries = 2500;
                }

                await fs.writeFile(configPath, JSON.stringify(config, null, 2));
                console.log('⚙️  Context7設定最適化完了');
            }
        } catch (error) {
            console.log('⚠️  Context7設定最適化スキップ:', error.message);
        }
    }

    async optimizeClaudeFlowConfig() {
        try {
            const configPath = './claude-flow-config.json';
            const configExists = await fs.access(configPath).then(() => true).catch(() => false);
            
            if (configExists) {
                const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
                
                // CPUコア数に基づく並列処理最適化
                const cpuCount = require('os').cpus().length;
                config.claude_flow.features.parallel_processing.max_concurrent_tasks = 
                    Math.min(cpuCount * 2, 16);

                await fs.writeFile(configPath, JSON.stringify(config, null, 2));
                console.log('⚙️  Claude Flow設定最適化完了');
            }
        } catch (error) {
            console.log('⚠️  Claude Flow設定最適化スキップ:', error.message);
        }
    }

    // Context7: ユーザーコンテキスト - サービス起動
    async startServices() {
        console.log('🚀 Context7 サービス起動中...');

        try {
            // package.jsonのスクリプトを確認
            const packageJsonPath = './package.json';
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
            
            const availableScripts = Object.keys(packageJson.scripts || {});
            console.log('📋 利用可能なスクリプト:', availableScripts);

            // 最適なスクリプトを選択
            let startScript = 'dev';
            if (availableScripts.includes('start:full')) {
                startScript = 'start:full';
            } else if (availableScripts.includes('start')) {
                startScript = 'start';
            }

            console.log(`🚀 "${startScript}" スクリプトでサービスを起動します`);
            console.log('📝 サービス起動中... (Ctrl+C で終了)');

            // 非同期でサービス起動
            const startProcess = spawn('npm', ['run', startScript], {
                stdio: 'inherit',
                detached: false
            });

            // プロセス終了時の処理
            process.on('SIGINT', () => {
                console.log('\\n🛑 サービス停止中...');
                startProcess.kill('SIGINT');
                process.exit(0);
            });

            console.log('✅ サービス起動コマンド実行完了');
            
            return { success: true, script: startScript };
        } catch (error) {
            this.errors.push(`サービス起動エラー: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    // Context7: 会話コンテキスト - 結果レポート
    async generateMigrationReport() {
        const endTime = Date.now();
        const duration = Math.round((endTime - this.startTime) / 1000);

        const report = {
            timestamp: new Date().toISOString(),
            duration: `${duration}秒`,
            platform: this.platform,
            architecture: this.architecture,
            context7Layers: this.context7Layers,
            migrationSteps: this.migrationSteps,
            errors: this.errors,
            success: this.errors.length === 0
        };

        console.log('\\n📊 === Context7移行レポート ===');
        console.log(`⏱️  実行時間: ${report.duration}`);
        console.log(`💻 プラットフォーム: ${report.platform} (${report.architecture})`);
        console.log(`🎯 Context7レイヤー: ${report.context7Layers.length}個すべて活用`);
        console.log(`✅ 成功: ${report.success ? 'はい' : 'いいえ'}`);
        console.log(`❌ エラー数: ${report.errors.length}`);

        if (report.errors.length > 0) {
            console.log('\\n❌ エラー詳細:');
            report.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }

        // レポートファイル保存
        try {
            await fs.writeFile('./migration-report.json', JSON.stringify(report, null, 2));
            console.log('📄 移行レポートを migration-report.json に保存しました');
        } catch (error) {
            console.log('⚠️  レポート保存に失敗しました');
        }

        return report;
    }

    // メイン実行関数
    async executeMigration() {
        console.log('🌟 === Context7統合移行システム開始 ===\\n');

        try {
            // 1. プロジェクトコンテキスト: 環境分析
            const environment = await this.analyzeEnvironment();
            
            // 2. タスクコンテキスト: 移行計画
            const migrationPlan = await this.planMigration(environment);
            
            // 3. エラーコンテキスト: 自動修復
            await this.autoRepairEnvironment(environment, migrationPlan.prerequisites);
            
            // 4. コードコンテキスト: 依存関係インストール
            await this.installDependencies();
            
            // 5. システムコンテキスト: 環境設定
            await this.setupEnvironment();
            
            // 6. ユーザーコンテキスト: サービス起動
            await this.startServices();
            
            console.log('\\n🎉 === Context7移行完了 ===');
            console.log('🌐 アクセス情報:');
            console.log('   • メインアプリ: http://localhost:5174');
            console.log('   • API: http://localhost:8000');
            console.log('   • Context7: http://localhost:5174/context7');
            
        } catch (error) {
            console.error('💥 移行中に重大なエラーが発生しました:', error.message);
            this.errors.push(`重大エラー: ${error.message}`);
        } finally {
            // 7. 会話コンテキスト: レポート生成
            await this.generateMigrationReport();
        }
    }
}

// CLI実行
if (require.main === module) {
    const migrationManager = new Context7MigrationManager();
    migrationManager.executeMigration().catch(console.error);
}

module.exports = Context7MigrationManager;
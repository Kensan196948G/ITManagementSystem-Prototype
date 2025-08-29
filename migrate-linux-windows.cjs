/**
 * Linux ↔ Windows11 Cross-Platform Migration Tool
 * ================================================
 * Linux環境とWindows11環境間での完全移行対応
 * 
 * 主要機能:
 * - パス区切り文字の自動変換（/ ↔ \）
 * - 改行コードの自動変換（LF ↔ CRLF）
 * - 実行可能ファイルの拡張子対応（.sh ↔ .bat）
 * - Python仮想環境パスの変換
 * - ファイル権限の調整
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class LinuxWindowsMigrator {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.currentPlatform = os.platform();
    this.isWindows = this.currentPlatform === 'win32';
    this.isLinux = this.currentPlatform === 'linux';
    
    // プラットフォーム固有設定
    this.platformConfig = {
      windows: {
        pathSeparator: '\\',
        lineEnding: '\r\n',
        scriptExtension: '.bat',
        powershellExtension: '.ps1',
        executableSuffix: '.exe',
        venvActivate: 'Scripts\\activate.bat',
        venvPython: 'Scripts\\python.exe'
      },
      linux: {
        pathSeparator: '/',
        lineEnding: '\n',
        scriptExtension: '.sh',
        executableSuffix: '',
        venvActivate: 'bin/activate',
        venvPython: 'bin/python'
      }
    };
  }

  /**
   * 移行元・移行先プラットフォームの自動検出
   */
  detectMigrationDirection() {
    // 既存ファイルの特徴から移行元を推測
    const indicators = {
      fromLinux: [
        fs.existsSync(path.join(this.rootDir, 'venv', 'bin', 'activate')),
        fs.existsSync(path.join(this.rootDir, 'start-all.sh')),
        this.hasLinuxLineEndings()
      ],
      fromWindows: [
        fs.existsSync(path.join(this.rootDir, 'venv', 'Scripts', 'activate.bat')),
        fs.existsSync(path.join(this.rootDir, 'start-all.bat')),
        this.hasWindowsLineEndings()
      ]
    };

    const linuxScore = indicators.fromLinux.filter(Boolean).length;
    const windowsScore = indicators.fromWindows.filter(Boolean).length;

    if (this.isWindows) {
      return linuxScore > windowsScore ? 'linux-to-windows' : 'windows-refresh';
    } else if (this.isLinux) {
      return windowsScore > linuxScore ? 'windows-to-linux' : 'linux-refresh';
    }

    return 'unknown';
  }

  /**
   * ファイル内の改行コードをチェック
   */
  hasLinuxLineEndings() {
    try {
      const sampleFiles = ['package.json', 'README.md', '.env.example'];
      for (const file of sampleFiles) {
        const filePath = path.join(this.rootDir, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          return content.includes('\n') && !content.includes('\r\n');
        }
      }
    } catch (error) {
      // ファイルが読めない場合は false
    }
    return false;
  }

  /**
   * Windows改行コードの検出
   */
  hasWindowsLineEndings() {
    try {
      const sampleFiles = ['package.json', 'README.md', '.env.example'];
      for (const file of sampleFiles) {
        const filePath = path.join(this.rootDir, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          return content.includes('\r\n');
        }
      }
    } catch (error) {
      // ファイルが読めない場合は false
    }
    return false;
  }

  /**
   * パス区切り文字の変換
   */
  convertPathSeparators(filePath, targetPlatform) {
    const targetSeparator = this.platformConfig[targetPlatform].pathSeparator;
    return filePath.replace(/[\\\/]/g, targetSeparator);
  }

  /**
   * 改行コードの変換
   */
  convertLineEndings(content, targetPlatform) {
    const targetLineEnding = this.platformConfig[targetPlatform].lineEnding;
    
    // まず統一（LFに）
    let normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // ターゲットの改行コードに変換
    if (targetLineEnding === '\r\n') {
      normalized = normalized.replace(/\n/g, '\r\n');
    }
    
    return normalized;
  }

  /**
   * 設定ファイルの更新
   */
  updateConfigFiles(targetPlatform) {
    const configFiles = [
      'package.json',
      '.env.example',
      'vite.config.ts',
      'tsconfig.json'
    ];

    console.log(`📝 Updating configuration files for ${targetPlatform}...`);

    for (const configFile of configFiles) {
      const filePath = path.join(this.rootDir, configFile);
      if (fs.existsSync(filePath)) {
        try {
          let content = fs.readFileSync(filePath, 'utf8');
          
          // 改行コード変換
          content = this.convertLineEndings(content, targetPlatform);
          
          // package.json の scripts セクション更新
          if (configFile === 'package.json') {
            content = this.updatePackageJsonScripts(content, targetPlatform);
          }
          
          // .env.example のパス更新
          if (configFile === '.env.example') {
            content = this.updateEnvPaths(content, targetPlatform);
          }
          
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✓ Updated ${configFile}`);
        } catch (error) {
          console.warn(`⚠ Could not update ${configFile}: ${error.message}`);
        }
      }
    }
  }

  /**
   * package.json の scripts セクション更新
   */
  updatePackageJsonScripts(content, targetPlatform) {
    try {
      const packageJson = JSON.parse(content);
      
      if (packageJson.scripts) {
        const scripts = packageJson.scripts;
        const targetExt = this.platformConfig[targetPlatform].scriptExtension;
        
        // スクリプトパスの更新
        Object.keys(scripts).forEach(key => {
          let script = scripts[key];
          
          if (targetPlatform === 'windows') {
            // Linux → Windows
            script = script.replace(/\.\/([^.\s]+)\.sh/g, '.\\$1.bat');
            script = script.replace(/\//g, '\\');
          } else {
            // Windows → Linux  
            script = script.replace(/\.\\([^.\s]+)\.bat/g, './$1.sh');
            script = script.replace(/\\/g, '/');
          }
          
          scripts[key] = script;
        });
      }
      
      return JSON.stringify(packageJson, null, 2);
    } catch (error) {
      console.warn('Could not parse package.json:', error.message);
      return content;
    }
  }

  /**
   * .env.example のパス更新
   */
  updateEnvPaths(content, targetPlatform) {
    const lines = content.split(/\r?\n/);
    
    return lines.map(line => {
      // パスを含む環境変数の変換
      if (line.includes('_PATH=') || line.includes('_DIR=')) {
        const [key, value] = line.split('=');
        if (value) {
          const convertedPath = this.convertPathSeparators(value, targetPlatform);
          return `${key}=${convertedPath}`;
        }
      }
      return line;
    }).join(this.platformConfig[targetPlatform].lineEnding);
  }

  /**
   * スクリプトファイルの変換・生成
   */
  convertScriptFiles(targetPlatform) {
    console.log(`🔧 Converting script files for ${targetPlatform}...`);

    const scriptMappings = {
      'start-all': {
        linux: 'start-all.sh',
        windows: 'start-all.bat'
      },
      'start-backend': {
        linux: 'start-backend.sh', 
        windows: 'start-backend.bat'
      },
      'migrate-to-new-environment': {
        linux: 'migrate-to-new-environment.sh',
        windows: 'migrate-to-new-environment.bat'
      }
    };

    Object.entries(scriptMappings).forEach(([scriptName, mapping]) => {
      const sourcePlatform = targetPlatform === 'windows' ? 'linux' : 'windows';
      const sourceFile = path.join(this.rootDir, mapping[sourcePlatform]);
      const targetFile = path.join(this.rootDir, mapping[targetPlatform]);

      if (fs.existsSync(sourceFile) && !fs.existsSync(targetFile)) {
        try {
          let content = fs.readFileSync(sourceFile, 'utf8');
          
          // プラットフォーム固有の変換
          if (targetPlatform === 'windows') {
            content = this.convertToWindowsScript(content, scriptName);
          } else {
            content = this.convertToLinuxScript(content, scriptName);
          }
          
          fs.writeFileSync(targetFile, content, 'utf8');
          
          // Linux の場合は実行権限付与
          if (targetPlatform === 'linux') {
            try {
              fs.chmodSync(targetFile, '755');
            } catch (chmodError) {
              console.warn(`Could not set execute permission: ${chmodError.message}`);
            }
          }
          
          console.log(`✓ Generated ${mapping[targetPlatform]}`);
        } catch (error) {
          console.warn(`⚠ Could not convert ${scriptName}: ${error.message}`);
        }
      }
    });
  }

  /**
   * Linux スクリプトを Windows バッチファイルに変換
   */
  convertToWindowsScript(content, scriptName) {
    // 基本的なバッチファイルテンプレート
    const batchHeader = `@echo off
REM ${scriptName} - Windows Version
REM Auto-generated from Linux script

`;

    // 簡単なコマンド変換
    let converted = content
      .replace(/^#!\/bin\/bash.*$/gm, '')  // shebang削除
      .replace(/npm run /g, 'npm run ')    // npmコマンドはそのまま
      .replace(/python3 /g, 'python ')     // python3 → python
      .replace(/pip3 /g, 'pip ')           // pip3 → pip
      .replace(/\$\{([^}]+)\}/g, '%$1%')   // ${VAR} → %VAR%
      .replace(/export /g, 'set ')         // export → set
      .replace(/source /g, 'call ')        // source → call
      .replace(/&&/g, '&')                 // && → &
      ;

    return batchHeader + converted;
  }

  /**
   * Windows バッチファイルを Linux スクリプトに変換
   */
  convertToLinuxScript(content, scriptName) {
    const bashHeader = `#!/bin/bash
# ${scriptName} - Linux Version
# Auto-generated from Windows script

`;

    let converted = content
      .replace(/^@echo off.*$/gm, '')      // @echo off削除
      .replace(/^REM /gm, '# ')           // REM → #
      .replace(/^set /gm, 'export ')       // set → export
      .replace(/call /g, 'source ')        // call → source
      .replace(/%([^%]+)%/g, '${$1}')      // %VAR% → ${VAR}
      .replace(/python /g, 'python3 ')     // python → python3
      .replace(/pip /g, 'pip3 ')           // pip → pip3
      .replace(/&(?!&)/g, '&&')            // & → && (&&でない場合のみ)
      ;

    return bashHeader + converted;
  }

  /**
   * Python仮想環境の調整
   */
  adjustPythonVirtualEnv(targetPlatform) {
    const venvPath = path.join(this.rootDir, 'venv');
    
    if (!fs.existsSync(venvPath)) {
      console.log('📦 Python virtual environment not found - will be created during migration');
      return;
    }

    console.log(`🐍 Adjusting Python virtual environment for ${targetPlatform}...`);

    // 仮想環境は削除して再作成を推奨
    console.log('⚠ Virtual environment should be recreated for target platform');
    console.log('  Run: python -m venv venv (or python3 -m venv venv on Linux)');
  }

  /**
   * Git設定の調整
   */
  adjustGitConfig(targetPlatform) {
    const gitConfigPath = path.join(this.rootDir, '.gitattributes');
    
    console.log('📝 Setting up .gitattributes for cross-platform compatibility...');
    
    const gitAttributes = `# Cross-platform line ending settings
* text=auto
*.js text eol=lf
*.ts text eol=lf
*.json text eol=lf
*.md text eol=lf
*.yml text eol=lf
*.yaml text eol=lf

# Windows-specific files
*.bat text eol=crlf
*.ps1 text eol=crlf

# Linux-specific files  
*.sh text eol=lf

# Binary files
*.png binary
*.jpg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
`;

    try {
      fs.writeFileSync(gitConfigPath, gitAttributes, 'utf8');
      console.log('✓ Created .gitattributes for cross-platform support');
    } catch (error) {
      console.warn(`⚠ Could not create .gitattributes: ${error.message}`);
    }
  }

  /**
   * メイン移行処理
   */
  migrate() {
    const migrationDirection = this.detectMigrationDirection();
    
    console.log('🚀 Linux ↔ Windows11 Cross-Platform Migration');
    console.log('================================================');
    console.log(`Current platform: ${this.currentPlatform}`);
    console.log(`Migration direction: ${migrationDirection}`);
    console.log('================================================');

    let targetPlatform;
    
    switch (migrationDirection) {
      case 'linux-to-windows':
        targetPlatform = 'windows';
        console.log('📋 Converting Linux project for Windows11...');
        break;
      case 'windows-to-linux':
        targetPlatform = 'linux';
        console.log('📋 Converting Windows11 project for Linux...');
        break;
      case 'windows-refresh':
        targetPlatform = 'windows';
        console.log('📋 Refreshing Windows11 project configuration...');
        break;
      case 'linux-refresh':
        targetPlatform = 'linux';
        console.log('📋 Refreshing Linux project configuration...');
        break;
      default:
        console.log('⚠ Could not determine migration direction');
        console.log('Please run this script on the target platform');
        return false;
    }

    try {
      // 段階的移行実行
      this.updateConfigFiles(targetPlatform);
      this.convertScriptFiles(targetPlatform);
      this.adjustPythonVirtualEnv(targetPlatform);
      this.adjustGitConfig(targetPlatform);

      console.log('\n✅ Migration completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Delete the old venv directory');
      console.log('2. Run the appropriate migration script:');
      
      if (targetPlatform === 'windows') {
        console.log('   migrate-to-new-environment.bat');
      } else {
        console.log('   ./migrate-to-new-environment.sh');
      }
      
      console.log('3. Test the application startup');

      return true;
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      return false;
    }
  }

  /**
   * 移行検証
   */
  verify() {
    console.log('\n🔍 Verifying cross-platform compatibility...');
    
    const checks = [
      { name: 'package.json exists', check: () => fs.existsSync(path.join(this.rootDir, 'package.json')) },
      { name: '.env.example exists', check: () => fs.existsSync(path.join(this.rootDir, '.env.example')) },
      { name: 'Platform-specific scripts exist', check: () => this.checkPlatformScripts() },
      { name: '.gitattributes configured', check: () => fs.existsSync(path.join(this.rootDir, '.gitattributes')) }
    ];

    let allPassed = true;
    
    checks.forEach(check => {
      const passed = check.check();
      console.log(`${passed ? '✓' : '✗'} ${check.name}`);
      if (!passed) allPassed = false;
    });

    console.log(`\n${allPassed ? '✅' : '❌'} Verification ${allPassed ? 'passed' : 'failed'}`);
    return allPassed;
  }

  /**
   * プラットフォーム固有スクリプトの存在確認
   */
  checkPlatformScripts() {
    if (this.isWindows) {
      return fs.existsSync(path.join(this.rootDir, 'migrate-to-new-environment.bat'));
    } else {
      return fs.existsSync(path.join(this.rootDir, 'migrate-to-new-environment.sh'));
    }
  }
}

// CLI実行
if (require.main === module) {
  const migrator = new LinuxWindowsMigrator();
  
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'verify':
      migrator.verify();
      break;
    case 'migrate':
    default:
      const success = migrator.migrate();
      if (success) {
        migrator.verify();
      }
      process.exit(success ? 0 : 1);
  }
}

module.exports = LinuxWindowsMigrator;
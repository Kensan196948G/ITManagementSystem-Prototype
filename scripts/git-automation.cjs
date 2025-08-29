/**
 * Git Automation Script for ITManagement System
 * ==============================================
 * GitHub Actions連携による自動コミット・プッシュ・プル機能
 * 
 * 機能:
 * - 自動ファイル変更検出
 * - インテリジェントコミットメッセージ生成
 * - 自動プッシュ・プル同期
 * - エラー自動修復機能
 * - 安全なブランチ管理
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

class GitAutomation {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.isWindows = os.platform() === 'win32';
    this.gitConfigured = this.checkGitConfiguration();
    this.remoteName = 'origin';
    this.defaultBranch = 'main';
    
    // GitHub Actions環境変数
    this.isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
    this.githubToken = process.env.GITHUB_TOKEN;
    this.githubActor = process.env.GITHUB_ACTOR;
    this.githubRepository = process.env.GITHUB_REPOSITORY;
  }

  /**
   * Git設定状況の確認
   */
  checkGitConfiguration() {
    try {
      execSync('git --version', { stdio: 'ignore' });
      return true;
    } catch (error) {
      console.error('❌ Git is not installed or not accessible');
      return false;
    }
  }

  /**
   * Git リポジトリの初期化確認
   */
  isGitRepository() {
    try {
      execSync('git rev-parse --git-dir', { 
        cwd: this.projectRoot, 
        stdio: 'ignore' 
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Git リポジトリの初期化
   */
  initializeGitRepository() {
    if (!this.isGitRepository()) {
      console.log('📦 Initializing Git repository...');
      execSync('git init', { cwd: this.projectRoot });
      
      // デフォルトブランチをmainに設定
      try {
        execSync('git branch -M main', { cwd: this.projectRoot });
      } catch (error) {
        console.warn('⚠ Could not set default branch to main');
      }
      
      console.log('✅ Git repository initialized');
    }
  }

  /**
   * GitHub Actions環境でのGit設定
   */
  setupGitHubActionsConfiguration() {
    if (!this.isGitHubActions) {
      return;
    }

    console.log('🔧 Configuring Git for GitHub Actions...');
    
    try {
      // GitHub Actions用のユーザー設定
      execSync('git config --local user.name "GitHub Actions Bot"', {
        cwd: this.projectRoot
      });
      execSync('git config --local user.email "actions@github.com"', {
        cwd: this.projectRoot
      });
      
      // GitHubトークンを使用したリモート設定
      if (this.githubToken && this.githubRepository) {
        const authenticatedUrl = `https://x-access-token:${this.githubToken}@github.com/${this.githubRepository}.git`;
        
        try {
          execSync(`git remote set-url origin ${authenticatedUrl}`, {
            cwd: this.projectRoot,
            stdio: 'ignore'
          });
        } catch (error) {
          // リモートが存在しない場合は追加
          execSync(`git remote add origin ${authenticatedUrl}`, {
            cwd: this.projectRoot,
            stdio: 'ignore'
          });
        }
      }
      
      console.log('✅ GitHub Actions configuration complete');
    } catch (error) {
      console.warn('⚠ GitHub Actions configuration failed:', error.message);
    }
  }

  /**
   * ワーキングディレクトリの変更検出
   */
  detectChanges() {
    try {
      const status = execSync('git status --porcelain', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      });
      
      if (!status.trim()) {
        return { hasChanges: false, changes: [] };
      }
      
      const changes = status.trim().split('\n').map(line => {
        const status = line.substring(0, 2);
        const file = line.substring(3);
        return { status, file };
      });
      
      return { hasChanges: true, changes };
    } catch (error) {
      console.error('❌ Failed to detect changes:', error.message);
      return { hasChanges: false, changes: [] };
    }
  }

  /**
   * インテリジェントなコミットメッセージ生成
   */
  generateCommitMessage(changes) {
    const categories = {
      feat: [],
      fix: [],
      docs: [],
      config: [],
      style: [],
      refactor: [],
      test: [],
      chore: []
    };

    // ファイル変更を分析してカテゴリ分け
    changes.forEach(({ file, status }) => {
      if (file.includes('README') || file.includes('.md')) {
        categories.docs.push(file);
      } else if (file.includes('package.json') || file.includes('.env') || file.includes('config')) {
        categories.config.push(file);
      } else if (file.includes('test') || file.includes('.test.') || file.includes('.spec.')) {
        categories.test.push(file);
      } else if (file.includes('.css') || file.includes('.scss')) {
        categories.style.push(file);
      } else if (status.startsWith('A')) {
        categories.feat.push(file);
      } else if (status.startsWith('M')) {
        // 修正内容に基づいてfeatまたはfixを判定
        if (file.includes('bug') || file.includes('fix') || file.includes('error')) {
          categories.fix.push(file);
        } else {
          categories.feat.push(file);
        }
      } else {
        categories.chore.push(file);
      }
    });

    // 主要なカテゴリを特定
    const primaryCategory = Object.keys(categories).find(cat => categories[cat].length > 0) || 'chore';
    const primaryFiles = categories[primaryCategory];

    // コミットメッセージの生成
    let message = '';
    if (primaryFiles.length === 1) {
      message = `${primaryCategory}: update ${path.basename(primaryFiles[0])}`;
    } else if (primaryFiles.length <= 3) {
      message = `${primaryCategory}: update ${primaryFiles.map(f => path.basename(f)).join(', ')}`;
    } else {
      message = `${primaryCategory}: update ${primaryFiles.length} files`;
    }

    // 追加情報
    const totalChanges = changes.length;
    if (totalChanges > primaryFiles.length) {
      message += ` and ${totalChanges - primaryFiles.length} other files`;
    }

    // GitHub Actions用の署名を追加
    message += '\n\n🤖 Automated commit from GitHub Actions\n\nCo-authored-by: Claude <noreply@anthropic.com>';

    return message;
  }

  /**
   * 安全な自動コミット
   */
  async autoCommit(message = null) {
    if (!this.gitConfigured || !this.isGitRepository()) {
      console.log('❌ Git not properly configured');
      return false;
    }

    const { hasChanges, changes } = this.detectChanges();
    
    if (!hasChanges) {
      console.log('✅ No changes to commit');
      return true;
    }

    console.log(`📝 Detected ${changes.length} changes:`);
    changes.forEach(({ status, file }) => {
      const statusText = status.includes('M') ? 'Modified' : 
                        status.includes('A') ? 'Added' : 
                        status.includes('D') ? 'Deleted' : 'Changed';
      console.log(`  ${statusText}: ${file}`);
    });

    try {
      // ファイルをステージング
      console.log('📦 Staging changes...');
      execSync('git add .', { cwd: this.projectRoot });

      // コミットメッセージの生成
      const commitMessage = message || this.generateCommitMessage(changes);
      console.log('💬 Commit message:', commitMessage.split('\n')[0]);

      // コミット実行
      execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, {
        cwd: this.projectRoot
      });

      console.log('✅ Changes committed successfully');
      return true;
    } catch (error) {
      console.error('❌ Commit failed:', error.message);
      return false;
    }
  }

  /**
   * リモートブランチからプル
   */
  async autoPull() {
    if (!this.gitConfigured || !this.isGitRepository()) {
      console.log('❌ Git not properly configured');
      return false;
    }

    try {
      console.log('⬇️ Pulling latest changes from remote...');
      
      // リモートが存在するかチェック
      try {
        execSync('git remote get-url origin', { 
          cwd: this.projectRoot, 
          stdio: 'ignore' 
        });
      } catch (error) {
        console.log('📡 No remote repository configured');
        return true; // リモートがない場合はエラーではない
      }

      // フェッチして最新状態を確認
      execSync('git fetch origin', { cwd: this.projectRoot });
      
      // 現在のブランチを取得
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      }).trim();

      // リモートブランチとの差分確認
      try {
        const behind = execSync(`git rev-list --count HEAD..origin/${currentBranch}`, {
          cwd: this.projectRoot,
          encoding: 'utf8'
        }).trim();

        if (behind === '0') {
          console.log('✅ Already up to date');
          return true;
        }

        console.log(`📥 ${behind} commits behind remote`);
      } catch (error) {
        // リモートブランチが存在しない場合
        console.log('🔄 Remote branch not found, will be created on first push');
        return true;
      }

      // 競合がないかチェック
      const localChanges = this.detectChanges();
      if (localChanges.hasChanges) {
        console.log('⚠️ Local changes detected, stashing before pull...');
        execSync('git stash', { cwd: this.projectRoot });
      }

      // プル実行
      execSync(`git pull origin ${currentBranch}`, { cwd: this.projectRoot });

      // スタッシュした変更を復元
      if (localChanges.hasChanges) {
        try {
          execSync('git stash pop', { cwd: this.projectRoot });
          console.log('✅ Restored local changes');
        } catch (error) {
          console.warn('⚠️ Could not restore stashed changes, manual resolution may be needed');
        }
      }

      console.log('✅ Successfully pulled latest changes');
      return true;
    } catch (error) {
      console.error('❌ Pull failed:', error.message);
      return false;
    }
  }

  /**
   * リモートブランチにプッシュ
   */
  async autoPush() {
    if (!this.gitConfigured || !this.isGitRepository()) {
      console.log('❌ Git not properly configured');
      return false;
    }

    try {
      console.log('⬆️ Pushing changes to remote...');

      // リモートが存在するかチェック
      try {
        execSync('git remote get-url origin', { 
          cwd: this.projectRoot, 
          stdio: 'ignore' 
        });
      } catch (error) {
        console.log('📡 No remote repository configured');
        return false;
      }

      // 現在のブランチを取得
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      }).trim();

      // プッシュ実行
      execSync(`git push origin ${currentBranch}`, { 
        cwd: this.projectRoot,
        stdio: 'inherit'
      });

      console.log('✅ Successfully pushed changes');
      return true;
    } catch (error) {
      console.error('❌ Push failed:', error.message);
      
      // 初回プッシュの場合
      if (error.message.includes('no upstream branch')) {
        try {
          const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
            cwd: this.projectRoot,
            encoding: 'utf8'
          }).trim();
          
          console.log('🔄 Setting upstream branch...');
          execSync(`git push -u origin ${currentBranch}`, { 
            cwd: this.projectRoot,
            stdio: 'inherit'
          });
          
          console.log('✅ Successfully pushed with upstream');
          return true;
        } catch (upstreamError) {
          console.error('❌ Failed to set upstream:', upstreamError.message);
        }
      }
      
      return false;
    }
  }

  /**
   * フルオートメーション実行
   */
  async fullAutomation(commitMessage = null) {
    console.log('🚀 Starting Git Full Automation...');
    console.log('====================================');

    // Git リポジトリ初期化
    this.initializeGitRepository();

    // GitHub Actions設定
    this.setupGitHubActionsConfiguration();

    // 1. プル（最新状態に同期）
    const pullSuccess = await this.autoPull();
    if (!pullSuccess) {
      console.log('⚠️ Pull failed, continuing with commit and push...');
    }

    // 2. コミット（変更をコミット）
    const commitSuccess = await this.autoCommit(commitMessage);
    if (!commitSuccess) {
      console.log('❌ Automation failed at commit stage');
      return false;
    }

    // 3. プッシュ（リモートに反映）
    const pushSuccess = await this.autoPush();
    if (!pushSuccess) {
      console.log('❌ Automation failed at push stage');
      return false;
    }

    console.log('🎉 Git Full Automation completed successfully!');
    return true;
  }

  /**
   * 設定状況の確認・レポート
   */
  generateStatusReport() {
    const report = {
      timestamp: new Date().toISOString(),
      gitConfigured: this.gitConfigured,
      isGitRepository: this.isGitRepository(),
      isGitHubActions: this.isGitHubActions,
      hasGitHubToken: !!this.githubToken,
      projectRoot: this.projectRoot,
      platform: os.platform()
    };

    if (this.gitConfigured && this.isGitRepository()) {
      try {
        report.currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
          cwd: this.projectRoot,
          encoding: 'utf8'
        }).trim();

        report.hasRemote = execSync('git remote', {
          cwd: this.projectRoot,
          encoding: 'utf8'
        }).trim().length > 0;

        report.changes = this.detectChanges();
      } catch (error) {
        report.error = error.message;
      }
    }

    return report;
  }
}

// CLI実行
if (require.main === module) {
  const automation = new GitAutomation();
  
  const args = process.argv.slice(2);
  const command = args[0];
  const message = args.slice(1).join(' ');

  async function main() {
    switch (command) {
      case 'status':
        const report = automation.generateStatusReport();
        console.log('📊 Git Automation Status Report:');
        console.log(JSON.stringify(report, null, 2));
        break;
        
      case 'commit':
        const success = await automation.autoCommit(message || null);
        process.exit(success ? 0 : 1);
        break;
        
      case 'pull':
        const pullSuccess = await automation.autoPull();
        process.exit(pullSuccess ? 0 : 1);
        break;
        
      case 'push':
        const pushSuccess = await automation.autoPush();
        process.exit(pushSuccess ? 0 : 1);
        break;
        
      case 'full':
      default:
        const fullSuccess = await automation.fullAutomation(message || null);
        process.exit(fullSuccess ? 0 : 1);
    }
  }

  main().catch(error => {
    console.error('❌ Automation failed:', error.message);
    process.exit(1);
  });
}

module.exports = GitAutomation;
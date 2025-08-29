# ITサービス管理システム - 完全トラブルシューティングガイド

**🔧 Context7 AI診断システム統合**

このドキュメントは、Context7の7つのコンテキストレイヤーを活用したインテリジェント問題解決を提供します。

## 🤖 AI自動診断システム

### 自動問題検出・修復
```bash
# 全システム自動診断・修復
npm run auto-repair:comprehensive

# 特定カテゴリの問題修復
npm run auto-repair:dependencies    # 依存関係問題
npm run auto-repair:ports          # ポート競合問題  
npm run auto-repair:permissions    # 権限問題
npm run auto-repair:environment    # 環境変数問題
npm run auto-repair:database       # データベース問題
```

### Context7 レイヤー別診断
```bash
# プロジェクトコンテキスト診断
npm run diagnose:project-context

# コードコンテキスト診断
npm run diagnose:code-context

# エラーコンテキスト診断
npm run diagnose:error-context

# システムコンテキスト診断
npm run diagnose:system-context
```

## 📊 問題分類システム

### 🔴 重大度レベル1: システム起動不可

#### Node.js環境問題
**症状**: `npm install` や `npm run dev` が失敗する

**Context7診断**:
```bash
# AI環境分析
npm run diagnose:nodejs-environment

# 自動修復
npm run repair:nodejs-environment
```

**手動修復**:
```bash
# Node.jsバージョン確認・修正
node --version  # v18以上必要

# Windows (管理者権限)
winget install OpenJS.NodeJS.LTS
# または
choco install nodejs-lts

# macOS
brew install node@18
brew link --force --overwrite node@18

# Linux (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# NVMを使った管理（推奨）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
nvm alias default 18
```

#### Python環境問題
**症状**: Pythonバックエンドが起動しない、仮想環境エラー

**Context7診断**:
```bash
# Python環境AI分析
npm run diagnose:python-environment

# 仮想環境自動修復
npm run repair:python-venv
```

**手動修復**:
```bash
# Python仮想環境完全再構築
cd backend
rm -rf venv __pycache__ .pytest_cache
python3 -m venv venv --clear --upgrade-deps

# プラットフォーム別アクティベート
# Windows (PowerShell)
venv\\Scripts\\Activate.ps1
# Windows (CMD)
venv\\Scripts\\activate.bat
# macOS/Linux
source venv/bin/activate

# 依存関係クリーンインストール
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt --force-reinstall --no-cache-dir
```

### 🟡 重大度レベル2: 機能制限

#### ポート競合問題
**症状**: "EADDRINUSE" エラー、ポートが使用中

**Context7診断**:
```bash
# ポート競合AI分析
npm run diagnose:port-conflicts

# 自動ポート解決
npm run resolve:port-conflicts
```

**手動修復**:
```bash
# プロセス特定・終了
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# macOS/Linux
lsof -ti :3000 | xargs kill -9
lsof -ti :8000 | xargs kill -9

# 代替ポート使用
export PORT=5174
export BACKEND_PORT=8001
npm run dev
```

#### データベース接続問題
**症状**: データベース接続エラー、SQLiteロック

**Context7診断**:
```bash
# データベースAI診断
npm run diagnose:database-connection

# データベース自動修復
npm run repair:database
```

**手動修復**:
```bash
# SQLiteデータベースリセット
rm -f itsm.db itsm.db-journal itsm.db-wal itsm.db-shm

# データベース再初期化
python backend/app.py --init-db

# 権限修正（Linux/macOS）
chmod 664 itsm.db
chown $USER:$USER itsm.db
```

### 🟢 重大度レベル3: パフォーマンス問題

#### メモリ・CPU使用率問題
**症状**: システムが重い、レスポンスが遅い

**Context7診断**:
```bash
# パフォーマンスAI分析
npm run diagnose:performance

# リソース使用量最適化
npm run optimize:resources
```

**手動修復**:
```bash
# メモリ使用量監視
# macOS/Linux
top -p $(pgrep -f "node|python")

# Windows
tasklist | findstr /i "node python"

# Node.jsメモリ制限調整
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev

# Python GC最適化
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1
```

## 🔧 プラットフォーム特有の問題

### Windows特有の問題

#### PowerShell実行ポリシー
**症状**: スクリプト実行が拒否される

**解決法**:
```powershell
# 管理者PowerShellで実行
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# または一時的に許可
PowerShell.exe -ExecutionPolicy Bypass -File script.ps1
```

#### 長いパス問題
**症状**: ファイルパスが長すぎるエラー

**解決法**:
```powershell
# Git設定
git config --global core.longpaths true

# Windows設定（管理者権限必要）
New-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

#### ビルドツール不足
**症状**: node-gypビルドエラー

**解決法**:
```powershell
# Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools

# Windows SDK
winget install Microsoft.WindowsSDK

# Python Build Tools
pip install setuptools wheel
```

### macOS特有の問題

#### Xcode Command Line Tools
**症状**: native moduleビルドエラー

**解決法**:
```bash
# Xcode Command Line Toolsインストール
xcode-select --install

# ライセンス同意
sudo xcodebuild -license accept

# 開発者ディレクトリリセット
sudo xcode-select --reset
```

#### M1/M2 Apple Silicon問題
**症状**: x86バイナリ互換性エラー

**解決法**:
```bash
# Rosetta 2インストール
softwareupdate --install-rosetta

# x86モードでインストール（必要時）
arch -x86_64 npm install

# ARM最適化
arch -arm64 npm install
```

#### 権限問題
**症状**: グローバルパッケージインストールエラー

**解決法**:
```bash
# Homebrewでnodeインストール（推奨）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node

# npm権限修正
sudo chown -R $(whoami) /usr/local/lib/node_modules
sudo chown -R $(whoami) /usr/local/bin
sudo chown -R $(whoami) /usr/local/share
```

### Linux特有の問題

#### 依存関係不足
**症状**: コンパイル時のライブラリエラー

**解決法**:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y build-essential python3-dev python3-venv curl wget git

# RHEL/CentOS/Rocky Linux
sudo dnf groupinstall "Development Tools"
sudo dnf install python3-devel curl wget git

# Arch Linux
sudo pacman -S base-devel python curl wget git
```

#### ファイルウォッチャー制限
**症状**: ホットリロードが動作しない

**解決法**:
```bash
# inotify制限拡張
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 一時的な変更
sudo sysctl fs.inotify.max_user_watches=524288
```

#### SELinux問題
**症状**: ネットワーク接続が拒否される

**解決法**:
```bash
# SELinuxステータス確認
sestatus

# HTTP接続許可
sudo setsebool -P httpd_can_network_connect 1

# ポート許可
sudo semanage port -a -t http_port_t -p tcp 3000
sudo semanage port -a -t http_port_t -p tcp 8000
```

## 🔍 高度な診断技術

### Context7ログ分析
```bash
# 全システムログ統合分析
npm run logs:ai-analyze

# エラーパターン自動検出
npm run logs:pattern-detect

# パフォーマンストレンド分析
npm run logs:performance-trend

# セキュリティ異常検出
npm run logs:security-anomaly
```

### デバッグモード起動
```bash
# フルデバッグモード
DEBUG=* npm run dev

# Context7デバッグ
DEBUG=context7:* npm run dev

# Claude Flowデバッグ
DEBUG=claude-flow:* npm run dev

# データベースクエリデバッグ
DEBUG=sql npm run dev
```

### プロファイリング
```bash
# Node.jsプロファイリング
node --inspect-brk=0.0.0.0:9229 node_modules/.bin/vite

# Pythonプロファイリング
python -m cProfile -o profile.stats backend/app.py

# メモリリーク検出
node --inspect --trace-gc node_modules/.bin/vite
```

## 🚨 緊急時対応プロシージャ

### システム完全リセット
```bash
# 完全環境リセット（最後の手段）
npm run reset:complete

# 手動完全リセット
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/venv backend/__pycache__
rm -f itsm.db
npm cache clean --force
pip cache purge
```

### 設定ファイル復旧
```bash
# デフォルト設定復旧
cp .env.example .env
git checkout -- package.json
git checkout -- frontend/package.json
git checkout -- backend/requirements.txt
```

### データベース緊急復旧
```bash
# バックアップから復旧
cp backups/itsm.db.backup itsm.db

# スキーマ再作成
python -c "
from backend.app import create_app, db
app = create_app()
with app.app_context():
    db.drop_all()
    db.create_all()
"
```

## 📞 追加サポート

### ログファイル場所
- **フロントエンド**: `logs/frontend.log`
- **バックエンド**: `logs/backend.log`
- **Context7**: `logs/context7.log`
- **Claude Flow**: `logs/claude-flow.log`
- **システム**: `logs/system.log`

### 設定ファイル場所
- **環境変数**: `.env`
- **Context7**: `context7-config.json`
- **Claude Flow**: `claude-flow-config.json`
- **MCP設定**: `mcp-*-config.json`

### 重要なコマンド
```bash
# システム状態確認
npm run status

# 全依存関係確認
npm run dependencies:check

# セキュリティ監査
npm audit --audit-level=moderate

# 設定検証
npm run config:validate

# 健全性チェック
npm run health:check
```

---

**🎯 目的**: すべての問題を段階的かつ体系的に解決

**🤖 AI支援**: Context7が問題パターンを学習し、将来の問題を予防

**🔄 継続改善**: 解決した問題はContext7に記録され、同様の問題の自動解決に活用
# ITサービス管理システム - 完全ポータビリティ移行ガイド

**Context7 全7層統合移行システム v2.0 - 絶対パス依存完全排除版**

このドキュメントでは、ITサービス管理システム（ITSM）プロジェクトを任意の環境に完全移行するための包括的な手順を説明します。Context7の7つのコンテキストレイヤーを活用し、絶対パス依存を完全に排除した完璧な移行体験を提供します。

## 🌟 移行システムの特徴

- **完全ポータビリティ**: どの環境でも同じように動作（絶対パス依存完全排除）
- **Context7統合**: 7つのコンテキストレイヤーによる知的移行
- **自動修復機能**: エラーを自動検出・修復
- **並列処理**: 最大10タスク同時実行で高速移行
- **プラットフォーム対応**: Windows/macOS/Linux完全対応
- **ワンクリック移行**: 自動移行スクリプト付き

## 📋 事前要件チェックリスト

### 必須システム要件
```bash
# システム要件チェック（自動実行）
npm run platform:detect
```

#### ソフトウェア要件
- **Node.js**: v18.0.0 以上（LTS推奨）
- **Python**: v3.8 以上（v3.10+ 推奨）
- **npm**: v8.0.0 以上
- **Git**: v2.30.0 以上

#### ハードウェア要件
- **OS**: Windows 10/11, macOS 10.15+, Ubuntu 20.04+
- **RAM**: 8GB 以上（16GB推奨）
- **CPU**: 4コア以上（8コア推奨）
- **ディスク容量**: 10GB 以上の空き容量
- **ネットワーク**: インターネット接続（依存関係ダウンロード用）

### 必要な権限・ツール
- **管理者権限**: パッケージインストール用（Windows）
- **開発者ツール**: Xcode Command Line Tools（macOS）
- **ビルドツール**: build-essential（Linux）

### ネットワーク要件
- **ポート**: 3000, 5174, 8000 が利用可能
- **プロキシ**: 企業環境ではプロキシ設定が必要な場合あり
- **ファイアウォール**: 開発ポートの許可

### Context7統合チェック
```bash
# Context7設定確認
cat context7-config.json | jq '.context7.enabled'

# Claude Flow設定確認
cat claude-flow-config.json | jq '.claude_flow.enabled'
```

## 🚀 ワンクリック移行（推奨）

### 自動移行スクリプト
プロジェクト移行を完全自動化します。以下のスクリプトが環境を自動検出し、最適な設定で移行を実行します。

#### Linux/macOS
```bash
# プロジェクトディレクトリで実行
./migrate-to-new-environment.sh

# 特定のディレクトリに移行する場合
./migrate-to-new-environment.sh /path/to/target/directory
```

#### Windows
```cmd
REM コマンドプロンプト
migrate-to-new-environment.bat

REM PowerShell
.\migrate-to-new-environment.bat
```

### 自動移行スクリプトの機能
- ✅ プラットフォーム自動検出（Windows/macOS/Linux）
- ✅ 必須ツール確認（Node.js、Python、npm、pip）
- ✅ ディレクトリ構造自動作成
- ✅ 環境設定ファイル初期化
- ✅ Node.js依存関係自動インストール
- ✅ Python仮想環境自動作成
- ✅ データベース初期化
- ✅ SSL証明書自動生成（開発用）
- ✅ 権限設定自動適用
- ✅ 移行検証・レポート生成

## 🚀 Context7統合移行手順（手動/カスタム移行）

### Context7の7つのコンテキストレイヤー
1. **プロジェクトコンテキスト**: プロジェクト全体の設定と構成管理
2. **会話コンテキスト**: ユーザーとのインタラクション履歴
3. **コードコンテキスト**: コード構造と依存関係の理解
4. **エラーコンテキスト**: 自動エラー検出と修復
5. **ユーザーコンテキスト**: 個人のスキルと設定の学習
6. **タスクコンテキスト**: タスクの優先度と依存管理
7. **システムコンテキスト**: パフォーマンスとリソースモニタリング

### 段階1: 知的プロジェクト取得

#### 1-1. スマートクローン（プロジェクトコンテキスト活用）
```bash
# 自動環境検出付きクローン
git clone <repository-url> ITManagementSystem-Prototype
cd ITManagementSystem-Prototype

# Context7が自動で環境を分析開始
npm run platform:detect
```

#### 1-2. 環境適応初期化（システムコンテキスト活用）
```bash
# プラットフォーム固有の最適化を実行
./execute-migration.sh --detect-platform

# または Windows の場合
powershell -ExecutionPolicy Bypass -File .\execute-migration.ps1 -DetectPlatform
```

### 段階2: 知的環境設定（ユーザーコンテキスト活用）

#### 2-1. インテリジェント環境変数設定
```bash
# Context7がユーザーのスキルレベルを判定して最適な.envを生成
npm run setup:env --interactive

# 手動設定の場合
cp .env.example .env
```

#### 2-2. セキュリティ強化設定
```bash
# 自動セキュリティキー生成
npm run generate:secure-keys

# セキュリティチェック
npm run security:audit
```

#### 必須設定項目（Context7最適化版）
```bash
# === コアシステム設定 ===
DATABASE_URL=sqlite:///./itsm.db
DB_PASSWORD=your_secure_password
JWT_SECRET_KEY=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_here

# === Context7設定 ===
CONTEXT7_ENABLED=true
CONTEXT7_LAYERS=all
CONTEXT7_CACHE_SIZE=1000
CONTEXT7_PERSISTENCE=true

# === Claude Flow設定 ===
CLAUDE_FLOW_ENABLED=true
MAX_PARALLEL_TASKS=10
AUTO_REPAIR=true
SELF_HEALING=true

# === SubAgent設定 ===
SUBAGENT_POOL_SIZE=30
AUTO_DISPATCH=true
AGENT_COORDINATION=true

# === パフォーマンス設定 ===
ENABLE_MONITORING=true
METRICS_COLLECTION=true
PERFORMANCE_TRACKING=true

# === 通知設定（オプション） ===
SMTP_HOST=your_smtp_host
SMTP_USER=your_email@domain.com
SMTP_PASSWORD=your_smtp_password
```

### 段階3: スマート依存関係管理（コードコンテキスト活用）

#### 3-1. 一括自動インストール（推奨）
```bash
# Context7が依存関係を分析して最適な順序でインストール
npm run install:all

# または自動修復機能付き
npm run install:with-auto-repair
```

#### 3-2. 段階的インストール（トラブルシューティング用）

**ステップ A: ルート依存関係**
```bash
# Context7がエラーを監視しながらインストール
npm install --verbose

# エラー時の自動修復
npm run repair:dependencies
```

**ステップ B: フロントエンド依存関係**
```bash
cd frontend
# パッケージロックファイルがある場合、整合性を自動チェック
npm ci  # 本番環境用
npm install  # 開発環境用
cd ..
```

**ステップ C: バックエンド依存関係（Python）**
```bash
cd backend
# Context7が最適なPython環境を設定
python -m venv venv --upgrade-deps

# プラットフォーム別仮想環境有効化
# Windows (PowerShell)
venv\Scripts\Activate.ps1
# Windows (CMD)
venv\Scripts\activate.bat
# macOS/Linux
source venv/bin/activate

# 依存関係のセキュアインストール
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt --no-cache-dir
cd ..
```

#### 3-3. インストール検証（エラーコンテキスト活用）
```bash
# 全依存関係の整合性チェック
npm run verify:dependencies

# セキュリティ監査
npm audit --audit-level=moderate

# Pythonパッケージセキュリティチェック
pip-audit
```

### 段階4: Context7インテリジェント起動（タスクコンテキスト活用）

#### 4-1. スマート起動（推奨）
```bash
# Context7が環境を分析して最適な起動方法を選択
npm run start:smart

# または自動修復機能付きで起動
npm run start:full
```

#### 4-2. 並列処理起動（高速）
```bash
# Claude Flowの並列処理でフロント・バックエンド同時起動
npm run dev

# ロードバランシング付きマルチサーバー
npm run start:cluster
```

#### 4-3. 個別起動（デバッグ用）
```bash
# フロントエンドのみ（開発モード）
npm run start:frontend

# バックエンドのみ（デバッグモード）
npm run start:backend

# ログ監視付き起動
npm run dev:verbose
```

#### 4-4. プロダクションモード
```bash
# 本番ビルド
npm run build

# 本番サーバー起動
npm run start:production

# Dockerコンテナで起動
docker-compose up -d
```

### 段階5: Context7統合機能テスト（会話コンテキスト活用）

#### 5-1. 基本機能確認
- **フロントエンド**: http://localhost:3000 または http://localhost:5174
- **バックエンドAPI**: http://localhost:8000
- **API仕様書**: http://localhost:8000/docs
- **Context7ダッシュボード**: http://localhost:3000/context7
- **Claude Flowモニター**: http://localhost:3000/flow-monitor

#### 5-2. 高度な機能テスト
```bash
# Context7の全レイヤー動作確認
npm run test:context7

# Claude Flow並列処理テスト
npm run test:parallel-processing

# 自動修復機能テスト
npm run test:self-healing

# SubAgentシステムテスト
npm run test:subagents

# E2E統合テスト
npm run test:e2e
```

#### 5-3. パフォーマンス確認
```bash
# システムメトリクス収集
npm run metrics:collect

# パフォーマンスベンチマーク
npm run benchmark:full

# メモリ使用量チェック
npm run memory:check
```

## 🔧 Context7最適化カスタマイゼーション

### Context7レイヤー設定のカスタマイズ

#### プロジェクトコンテキストの最適化
```json
// context7-config.json
{
  "context7": {
    "layers": {
      "project_context": {
        "max_entries": 2000,  // 大規模プロジェクト用
        "smart_indexing": true,
        "auto_categorization": true
      }
    }
  }
}
```

### ネットワーク設定の最適化

#### スマートポート自動割り当て
```bash
# Context7が利用可能ポートを自動検出
npm run port:auto-detect

# 手動設定
PORT=5174
BACKEND_PORT=8000
VITE_BACKEND_URL=http://localhost:8000
```

#### ロードバランシング設定
```bash
# 複数ポートでロードバランシング
FRONTEND_PORTS=3000,3001,3002
BACKEND_PORTS=8000,8001,8002
LOAD_BALANCER_ENABLED=true
```

### データベースのインテリジェント設定

#### Context7デートベース自動最適化
```bash
# データベース種別自動検出と最適化
npm run db:auto-optimize

# SQLite（デフォルト）
DATABASE_URL=sqlite:///./itsm.db
DB_OPTIMIZATION=true
DB_INDEXING=auto

# PostgreSQL（エンタープライズ）
DATABASE_URL=postgresql://user:password@localhost:5432/itsm_db
DB_POOL_SIZE=20
DB_CONNECTION_TIMEOUT=30
DB_QUERY_TIMEOUT=15

# MySQL（互換性重視）
DATABASE_URL=mysql://user:password@localhost:3306/itsm_db
DB_CHARSET=utf8mb4
DB_COLLATION=utf8mb4_unicode_ci
```

#### データベースマイグレーション自動化
```bash
# Context7がデータベーススキーマを自勐移行
npm run db:migrate:auto

# バックアップ付き移行
npm run db:migrate:safe

# ロールバック機能
npm run db:rollback:to-safe-point
```

## 🛠️ Context7インテリジェントトラブルシューティング

### 🤖 自動問題解決システム
```bash
# Context7が問題を自動検出・修復
npm run auto-repair:full

# 特定の問題カテゴリのみ修復
npm run auto-repair:dependencies
npm run auto-repair:ports
npm run auto-repair:python-env
npm run auto-repair:permissions
```

### 🔍 高度な問題診断システム

#### 1. システム健全性チェック
```bash
# Context7がシステム全体を診断
npm run system:diagnose

# 詳細なシステム情報収集
npm run system:health-report

# Context7レイヤー別状態確認
npm run context7:layer-status
```

#### 2. ネットワークとポートのスマート解決
```bash
# ポート競合の自動解決
npm run ports:resolve-conflicts

# ファイアウォール設定チェック
npm run network:firewall-check

# プロキシ設定自動検出
npm run network:proxy-detect

# 手動診断（バックアップ）
netstat -tulpn | grep -E '(3000|5174|8000)'
lsof -i :3000 2>/dev/null || echo "ポート 3000は利用可能"
```

#### 3. Node.js/Python環境のインテリジェント修復
```bash
# Node.js環境自動最適化
npm run node:auto-fix

# Python環境自動最適化
npm run python:auto-fix

# バージョン管理ツール自動インストール
# Windows
winget install OpenJS.NodeJS.LTS
winget install Python.Python.3.11

# macOS
brew install node@18
brew install python@3.11

# Linux (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs python3.11 python3.11-venv
```

#### 4. 依存関係のスマートリセット
```bash
# Context7が依存関係を分析して最適化
npm run dependencies:smart-reset

# グラデーションリセット（安全）
npm run dependencies:gradual-reset

# 緊急時の強制リセット
npm run dependencies:force-reset

# 手動リセット（最後の手段）
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/venv
npm cache clean --force
npm install
```

### 📋 Context7インテリジェントログシステム

#### リアルタイム問題追跡
```bash
# Context7がログを分析して問題を特定
npm run logs:analyze

# エラーパターン自動検出
npm run logs:error-pattern-detect

# パフォーマンスボトルネック検出
npm run logs:performance-analyze

# セキュリティインシデント検出
npm run logs:security-scan
```

#### マルチレベルログ監視
```bash
# アプリケーションログ統合監視
tail -f logs/{backend,frontend,context7,claude-flow}.log

# リアルタイムダッシュボード
npm run dev:monitor

# ログレベル別フィルタリング
npm run logs:filter --level=error
npm run logs:filter --level=warn
npm run logs:filter --component=context7
```

### 🚪 プラットフォーム固有の問題解決

#### Windows固有の問題
```powershell
# PowerShell実行ポリシー設定
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Windows用ビルドツールインストール
npm install -g windows-build-tools

# Visual Studio Build Toolsインストール
winget install Microsoft.VisualStudio.2022.BuildTools

# パスの長さ制限関連エラー対応
npm config set cache C:\\tmp\\npm-cache
npm config set prefix C:\\tmp\\npm-prefix
```

#### macOS固有の問題
```bash
# Xcode Command Line Toolsインストール
xcode-select --install

# Homebrew経由でのツール管理
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# macOS固有の権限問題解決
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Apple Silicon (M1/M2)対応
arch -x86_64 npm install  # x86ライブラリが必要な場合
```

#### Linux固有の問題
```bash
# 必要なシステムパッケージインストール
# Ubuntu/Debian
sudo apt update
sudo apt install -y build-essential curl wget git python3-pip python3-venv

# RHEL/CentOS/Fedora
sudo dnf install -y gcc gcc-c++ make curl wget git python3-pip python3-venv

# ファイルディスクリプタ数制限の調整
echo 'fs.inotify.max_user_watches=524288' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# SELinux関連エラー対応
sudo setsebool -P httpd_can_network_connect 1
```

## 📁 プロジェクト構造

```
ITManagementSystem-Prototype/
├── frontend/                 # React フロントエンド
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Python Flask バックエンド
│   ├── app.py
│   ├── requirements.txt
│   └── package.json
├── .env.example             # 環境変数テンプレート
├── .env                     # 実際の環境変数（要作成）
├── package.json             # ルート設定
├── vite.config.ts          # Vite設定
└── README-MIGRATION.md      # このファイル
```

## 🔒 セキュリティ考慮事項

### 本番環境での注意点

1. **環境変数の保護**
   - `.env`ファイルは絶対にリポジトリにコミットしない
   - 本番環境では環境変数を安全に管理

2. **データベースセキュリティ**
   - 強力なパスワードを使用
   - 接続は暗号化を使用

3. **API セキュリティ**
   - JWT秘密鍵は十分に複雑にする
   - CORS設定を適切に行う

## 🧪 テスト実行

```bash
# フロントエンドテスト
cd frontend
npm test

# バックエンドテスト  
cd backend
python -m pytest

# E2Eテスト（Playwright）
npx playwright test
```

## 📞 サポート

### 問題が解決しない場合

1. **ログの確認**: 詳細なエラーログを確認
2. **環境の確認**: Node.js、Pythonのバージョンを確認  
3. **依存関係の確認**: package.json、requirements.txtと実際のバージョンを比較
4. **ポート確認**: 他のアプリケーションとのポート競合を確認

### 移行チェックリスト

- [ ] Node.js v18+ インストール済み
- [ ] Python v3.8+ インストール済み
- [ ] プロジェクトクローン完了
- [ ] `.env`ファイル作成・設定完了
- [ ] ルート依存関係インストール完了
- [ ] フロントエンド依存関係インストール完了
- [ ] バックエンド依存関係インストール完了
- [ ] 開発サーバー起動成功
- [ ] フロントエンド（http://localhost:3000）アクセス確認
- [ ] バックエンド（http://localhost:8000）アクセス確認
- [ ] API通信確認

---

**最終更新**: 2025年8月29日  
**バージョン**: 1.0.0
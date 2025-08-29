# Claude Code 開発ガイドライン

## プロジェクト概要
ITサービス管理システム（ITSM）- ISO 20000/27001/27002準拠の包括的なIT管理プラットフォーム

## 有効化された機能

### 1. SubAgent機能（30体以上）
- **状態**: ✅ 有効
- **利用可能なエージェント**: 
  - general-purpose（汎用）
  - fullstack-dev（1-4）
  - frontend-designer
  - test-writer
  - code-reviewer
  - debugger-agent
  - analytics-agent
  - routing-agent
  - docs-agent
  - logging-agent
  - controller-agent
  - config-agent
  - supabase-architect
  - i18n-agent
  - api-client-generator
  - cto-agent
  - forms-agent
  - state-agent
  - migration-agent
  - data-viz-agent
  - security-audit-agent
  - payments-agent
  - accessibility-agent
  - e2e-tester
  - その他多数

### 2. Claude-flow機能
- **状態**: ✅ 有効
- **設定ファイル**: `claude-flow-config.json`
- **機能**:
  - 並列処理（最大10タスク同時実行）
  - ワークフローオーケストレーション
  - 自動エラー処理とリトライ
  - メトリクス収集

### 3. Playwright MCP
- **状態**: ✅ 有効
- **設定ファイル**: `mcp-playwright-config.json`
- **機能**:
  - マルチブラウザサポート（Chromium, Firefox, WebKit）
  - E2Eテスト自動化
  - スクリーンショット/ビデオ記録
  - 並列テスト実行

### 4. Context7
- **状態**: ✅ 有効
- **設定ファイル**: `context7-config.json`
- **7つのコンテキストレイヤー**:
  1. プロジェクトコンテキスト
  2. 会話コンテキスト
  3. コードコンテキスト
  4. エラーコンテキスト
  5. ユーザーコンテキスト
  6. タスクコンテキスト
  7. システムコンテキスト

### 5. SerenaMCP
- **状態**: ✅ 有効
- **設定ファイル**: `serena-mcp-config.json`
- **機能**:
  - 変更管理
  - リリース管理
  - 構成管理
  - サービス管理
  - デプロイ自動化

### 6. GitHub Action MCP
- **状態**: ✅ 有効
- **設定ファイル**: `github-action-mcp-config.json`
- **ワークフロー**: `.github/workflows/auto-repair.yml`
- **機能**:
  - 自動コミット/プッシュ/プル
  - エラー自動修復ループ
  - CI/CD統合
  - セキュリティスキャン

## 開発ワークフロー

### 1. 新機能開発時
```bash
# 1. 機能ブランチを作成
git checkout -b feature/new-feature

# 2. 開発作業（Claude Codeが支援）
# - SubAgentを使った並列タスク実行
# - Context7による文脈理解
# - Claude-flowによるワークフロー管理

# 3. テスト実行（Playwright MCP使用）
npm test

# 4. 自動修復（必要に応じて）
python scripts/auto_repair_tests.py

# 5. コミット（GitHub Action MCPが自動化）
git add .
git commit -m "feat: new feature implementation"
git push
```

### 2. エラー修復フロー
1. GitHub Actionsがエラーを検知
2. 自動修復ループが起動
3. 修復不可能な場合はPRを自動作成
4. レビュー後マージ

### 3. リリースフロー
1. SerenaMCPが変更管理
2. 承認ワークフロー実行
3. 自動デプロイ（Blue-Green/Canary）
4. ロールバック機能

## コーディング規約

### TypeScript/React
- 関数コンポーネントを使用
- TypeScriptの型定義を必須
- Tailwind CSSでスタイリング
- React Hooksを活用

### Python
- PEP8準拠
- 型ヒント使用
- docstring必須
- pytest使用

## セキュリティガイドライン
- 機密情報をコードに含めない
- 環境変数で設定管理
- 定期的な依存関係更新
- セキュリティスキャンの実行

## テスト戦略
- 単体テスト: 全関数/コンポーネント
- 統合テスト: API/DB連携
- E2Eテスト: 主要ユーザーフロー
- カバレッジ目標: 80%以上

## パフォーマンス目標
- ページロード: 3秒以内
- API応答: 500ms以内
- 同時接続: 1000ユーザー
- 可用性: 99.9%

## 監視とログ
- アプリケーションログ
- エラー追跡
- パフォーマンスメトリクス
- ユーザー行動分析

## トラブルシューティング

### 依存関係エラー
```bash
npm install
pip install -r requirements.txt
```

### テスト失敗
```bash
python scripts/auto_repair_tests.py
```

### ビルドエラー
```bash
npm run build
```

## プロジェクト移行

### 移行手順
1. リポジトリのクローンまたはコピー
2. `.env.example`を`.env`にコピーして設定
3. `npm install`で依存関係をインストール
4. `npm run dev`で開発サーバー起動

### ポータビリティ保証
- ✅ 絶対パス依存なし
- ✅ 環境変数での設定管理
- ✅ OS非依存の設定
- ✅ バージョン固定の依存関係

### 詳細な移行ガイド
詳細は [README-MIGRATION.md](./README-MIGRATION.md) を参照してください。

## 連絡先
- プロジェクトマネージャー: [PM名]
- テクニカルリード: [TL名]
- セキュリティ担当: [セキュリティ担当名]

## 更新履歴
- 2025-08-29: Linux↔Windows11特化移行対応完了 🚀
  - Linux↔Windows11専用移行ツール実装（migrate-linux-windows.cjs）
  - パス区切り文字自動変換（/ ↔ \）
  - 改行コード自動変換（LF ↔ CRLF）
  - 実行可能ファイル拡張子対応（.sh ↔ .bat）
  - Python仮想環境パス変換（bin/ ↔ Scripts/）
  - .gitattributes自動生成でGit連携最適化
  - Linux↔Windows11専用移行ガイド作成
  - macOS対応除外でLinux/Windows特化最適化
- 2025-08-29: 完全ポータビリティ対応完了 ✅
  - 絶対パスをすべて相対パスに変換
  - 環境変数での設定管理（.env.example拡張）
  - クロスプラットフォーム対応（Windows/Linux/macOS）
  - 自動移行スクリプト実装（migrate-to-new-environment.sh/.bat）
  - Cross-Platform Configuration Manager実装
  - 移行ガイド(README-MIGRATION.md)更新
  - ポータビリティ完全保証 🎉
- 2025-08-25: 全機能有効化完了
  - SubAgent、Claude-flow、Playwright MCP、Context7、SerenaMCP、GitHub Action MCP統合
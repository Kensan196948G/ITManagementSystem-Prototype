# GitHub Actions 自動化セットアップガイド

**ITサービス管理システム - GitHub Actions 完全自動化**

このガイドでは、GitHub Actionsによる自動コミット・プッシュ・プル機能の設定手順を説明します。

## 🚀 機能概要

### 自動化される機能
- ✅ **自動コミット**: ファイル変更の自動検出・コミット
- ✅ **自動プッシュ**: リモートリポジトリへの自動同期
- ✅ **自動プル**: 最新変更の自動取得
- ✅ **エラー自動修復**: ビルド・テスト・セキュリティエラーの自動修復
- ✅ **インテリジェントメッセージ**: AI生成コミットメッセージ
- ✅ **競合解決**: 自動マージ競合解決

### 利用可能なワークフロー
1. **Auto Git Sync** (`auto-git-sync.yml`) - Git同期自動化
2. **Auto Repair** (`auto-repair.yml`) - エラー自動修復

## 📋 セットアップ手順

### Step 1: GitHubリポジトリの準備

#### 1-1. リポジトリ作成
```bash
# 新規リポジトリ作成の場合
gh repo create your-username/ITManagementSystem-Prototype --public --clone
cd ITManagementSystem-Prototype

# 既存プロジェクトをプッシュ
git remote add origin https://github.com/your-username/ITManagementSystem-Prototype.git
git branch -M main
git push -u origin main
```

#### 1-2. ブランチ保護設定（推奨）
```bash
# GitHub CLIを使用
gh api repos/your-username/ITManagementSystem-Prototype/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":[]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"required_approving_review_count":1}' \
  --field restrictions=null
```

### Step 2: GitHub Actions権限設定

#### 2-1. リポジトリ権限設定
1. GitHubリポジトリページで `Settings` → `Actions` → `General`
2. **Workflow permissions** を以下に設定:
   - ✅ `Read and write permissions`
   - ✅ `Allow GitHub Actions to create and approve pull requests`

#### 2-2. GitHub Token設定（自動設定済み）
デフォルトの`GITHUB_TOKEN`が自動で利用されます。追加設定は不要です。

### Step 3: 自動化機能の有効化

#### 3-1. ワークフロー確認
```bash
# ワークフローファイルの存在確認
ls -la .github/workflows/
# 以下のファイルがあることを確認:
# - auto-git-sync.yml
# - auto-repair.yml
```

#### 3-2. 初回実行テスト
```bash
# 手動でワークフロー実行
gh workflow run "Auto Git Sync" --field sync_type=full --field commit_message="Initial setup"
```

### Step 4: 自動化スクリプトの設定

#### 4-1. Git自動化スクリプトの実行テスト
```bash
# 自動化スクリプトをテスト実行
node scripts/git-automation.js status

# フル自動化実行テスト
node scripts/git-automation.js full "Test automated sync"
```

#### 4-2. package.jsonスクリプト追加
```json
{
  "scripts": {
    "git:sync": "node scripts/git-automation.js full",
    "git:commit": "node scripts/git-automation.js commit",
    "git:push": "node scripts/git-automation.js push",
    "git:pull": "node scripts/git-automation.js pull",
    "git:status": "node scripts/git-automation.js status"
  }
}
```

## 🔧 設定オプション

### 自動同期の設定

#### 実行トリガーのカスタマイズ
`.github/workflows/auto-git-sync.yml`を編集:

```yaml
on:
  # 定期実行の間隔変更
  schedule:
    - cron: '0 */2 * * *'  # 2時間ごと（デフォルト: 1時間ごと）
  
  # 監視対象ブランチの変更
  push:
    branches:
      - main
      - develop
      - 'feature/*'
      - 'your-custom-branch'
```

#### 除外ファイル設定
```yaml
push:
  paths-ignore:
    - '.github/**'
    - '**.md'
    - '.gitignore'
    - '.gitattributes'
    - 'docs/**'        # ドキュメントフォルダを除外
    - 'temp/**'        # 一時ファイルを除外
```

### セキュリティ設定

#### セキュアな自動コミット設定
環境変数での設定（`.env`ファイル）:

```bash
# Git自動化設定
GIT_AUTO_SYNC_ENABLED=true
GIT_AUTO_COMMIT_ENABLED=true
GIT_AUTO_PUSH_ENABLED=true
GIT_AUTO_PULL_ENABLED=true

# セキュリティ設定
GIT_REQUIRE_SIGNED_COMMITS=true
GIT_VERIFY_SIGNATURES=true
GIT_PROTECTED_BRANCHES=main,master,production

# 自動化制限
GIT_MAX_AUTO_COMMITS_PER_HOUR=10
GIT_AUTO_COMMIT_SIZE_LIMIT=100MB
```

## 📊 使用方法

### 手動実行

#### GitHub Web UI
1. リポジトリページで `Actions` タブをクリック
2. `Auto Git Sync` ワークフローを選択
3. `Run workflow` ボタンをクリック
4. パラメータを設定して実行

#### GitHub CLI
```bash
# フル同期実行
gh workflow run "Auto Git Sync" --field sync_type=full --field commit_message="Manual sync"

# コミットのみ
gh workflow run "Auto Git Sync" --field sync_type=commit

# プッシュのみ  
gh workflow run "Auto Git Sync" --field sync_type=push

# プルのみ
gh workflow run "Auto Git Sync" --field sync_type=pull
```

#### ローカルスクリプト実行
```bash
# 完全自動同期
npm run git:sync

# 個別実行
npm run git:commit
npm run git:push
npm run git:pull

# 状態確認
npm run git:status
```

### 自動実行

#### トリガー条件
- **定期実行**: 毎時0分（デフォルト）
- **プッシュ時**: main、develop、feature/*ブランチへのプッシュ
- **PR マージ時**: mainまたはdevelopブランチへのマージ
- **手動実行**: いつでもWeb UIから実行可能

#### 自動実行の流れ
1. **変更検出**: ファイル変更の自動検出
2. **プル実行**: 最新状態への同期
3. **コミット生成**: インテリジェントなコミットメッセージ生成
4. **プッシュ実行**: リモートリポジトリへの反映
5. **結果通知**: Slack/Teamsへの通知（オプション）

## 🛡️ セキュリティ考慮事項

### 権限管理
```yaml
# 最小権限の原則
permissions:
  contents: write          # リポジトリ書き込み権限
  pull-requests: write     # PR作成権限
  issues: write           # Issue作成権限
  actions: read           # Actions読み取り権限
```

### 機密情報の保護
```bash
# .gitignore に追加
echo "*.env" >> .gitignore
echo "secrets/" >> .gitignore
echo "*.key" >> .gitignore
echo "*.pem" >> .gitignore

# 機密ファイルの除外確認
git check-ignore .env secrets/ *.key
```

### 署名付きコミット（推奨）
```bash
# GPGキー設定
git config --global user.signingkey YOUR_GPG_KEY_ID
git config --global commit.gpgsign true

# GitHub Actions でのGPG設定
# secrets.GPG_PRIVATE_KEY を設定
```

## 🔍 監視とトラブルシューティング

### ログ確認
```bash
# GitHub Actions ログの確認
gh run list --workflow="Auto Git Sync"
gh run view --log

# ローカルログの確認
node scripts/git-automation.js status
```

### よくある問題と解決法

#### 1. 権限エラー
**症状**: `Permission denied` エラー
**解決法**: 
```bash
# リポジトリ権限確認
gh auth status
gh auth refresh --scopes repo

# GITHUB_TOKEN権限確認
echo $GITHUB_TOKEN | cut -c1-10
```

#### 2. マージ競合
**症状**: `merge conflict` エラー  
**解決法**: 自動解決機能を有効化
```yaml
# .github/workflows/auto-git-sync.yml に追加
- name: Auto Resolve Conflicts
  run: |
    git config --global merge.ours.driver true
    git merge origin/main --strategy=ours
```

#### 3. 大容量ファイル問題
**症状**: `file too large` エラー
**解決法**: Git LFS設定
```bash
# Git LFS セットアップ
git lfs install
git lfs track "*.zip" "*.tar.gz" "*.mp4"
git add .gitattributes
```

#### 4. レート制限
**症状**: `API rate limit exceeded`
**解決法**: 実行頻度の調整
```yaml
schedule:
  - cron: '0 */6 * * *'  # 6時間ごとに変更
```

## 📈 高度な設定

### カスタムフック
```bash
# pre-commit フック
echo '#!/bin/bash
node scripts/git-automation.js commit
' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# post-push フック
echo '#!/bin/bash
node scripts/git-automation.js status
' > .git/hooks/post-push
chmod +x .git/hooks/post-push
```

### 外部通知連携
```yaml
# Slack通知追加
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: "Git sync completed"
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### マルチブランチ対応
```bash
# ブランチ別設定
if [[ "$GITHUB_REF" == "refs/heads/main" ]]; then
  SYNC_INTERVAL="0 * * * *"      # 本番: 1時間ごと
elif [[ "$GITHUB_REF" == "refs/heads/develop" ]]; then
  SYNC_INTERVAL="0 */2 * * *"    # 開発: 2時間ごと
else
  SYNC_INTERVAL="0 */6 * * *"    # その他: 6時間ごと
fi
```

## 📚 リファレンス

### 利用可能なコマンド
```bash
# Git自動化スクリプト
node scripts/git-automation.js [command] [message]

# Commands:
#   status  - 現在の状態確認
#   commit  - 自動コミット
#   pull    - 自動プル  
#   push    - 自動プッシュ
#   full    - フル自動同期（デフォルト）
```

### NPMスクリプト
```json
{
  "scripts": {
    "git:sync": "node scripts/git-automation.js full",
    "git:commit": "node scripts/git-automation.js commit", 
    "git:push": "node scripts/git-automation.js push",
    "git:pull": "node scripts/git-automation.js pull",
    "git:status": "node scripts/git-automation.js status",
    "git:setup": "gh workflow run 'Auto Git Sync'"
  }
}
```

### 環境変数
```bash
# GitHub Actions環境変数
GITHUB_TOKEN          # GitHubアクセストークン（自動設定）
GITHUB_ACTOR          # 実行ユーザー名
GITHUB_REPOSITORY     # リポジトリ名
GITHUB_REF            # ブランチ参照
GITHUB_SHA            # コミットSHA

# カスタム環境変数
GIT_AUTO_SYNC_ENABLED=true
GIT_COMMIT_SIGNING=true
GIT_MAX_FILE_SIZE=100MB
```

---

**更新日**: 2025年8月29日  
**バージョン**: v1.0  
**対応環境**: GitHub Actions, Linux/Windows/macOS
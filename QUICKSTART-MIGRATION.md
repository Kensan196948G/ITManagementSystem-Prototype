# 🚀 緊急移行クイックスタートガイド

## 📋 現在の状況
- ❌ requirements.txtが存在しない
- ❌ Python仮想環境が絶対パス依存
- ❌ 42ファイルが絶対パス参照
- ✅ 移行用ファイルを作成済み

## 🔧 実行手順

### Step 1: 権限設定
```bash
chmod +x migrate-environment.sh
chmod +x verify-migration.sh
```

### Step 2: 緊急移行実行
```bash
# 安全な移行スクリプトを実行
./migrate-environment.sh
```

### Step 3: 検証実行
```bash
# 移行結果を検証
./verify-migration.sh
```

### Step 4: 手動調整（必要に応じて）
```bash
# 1. 現在の仮想環境から依存関係を手動抽出（必要な場合）
source venv/bin/activate
pip freeze > requirements_current_manual.txt
deactivate

# 2. 仮想環境の完全再構築
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# 3. フロントエンド依存関係（存在する場合）
npm install

# 4. 開発サーバー起動テスト
source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
# または
npm run dev
```

## 📁 作成済みファイル

### 1. `requirements.txt`（プロジェクトルート）
- ITサービス管理システムの標準的な依存関係
- FastAPI, SQLAlchemy, Redis, Celery等を含む
- ISO 20000/27001/27002対応

### 2. `.env`（プロジェクトルート）
- 環境設定テンプレート
- データベース、Redis、セキュリティ設定を含む
- 本番環境では値を適切に変更が必要

### 3. `migrate-environment.sh`（プロジェクトルート）
- 自動移行スクリプト
- バックアップ機能付き
- 段階的で安全な実行

### 4. `verify-migration.sh`（プロジェクトルート）
- 移行検証スクリプト
- 完全性チェック
- 問題点の特定

## ⚠️ 注意事項

### 移行前の準備
1. **データバックアップ**: 重要なデータは事前にバックアップ
2. **現在の依存関係確認**: `pip list > current_packages.txt`
3. **アクティブプロセス停止**: 開発サーバーやワーカープロセスを停止

### 移行中の注意
1. **段階実行**: スクリプトは対話式で安全に実行
2. **エラー時停止**: エラーが発生した場合は作業を停止
3. **バックアップ確認**: 自動作成されるバックアップを確認

### 移行後の確認
1. **アプリケーション起動**: 正常に起動するか確認
2. **API動作確認**: エンドポイントが正常に応答するか
3. **データベース接続**: DB接続が正常に行われるか

## 🛠️ トラブルシューティング

### Python仮想環境エラー
```bash
# Python バージョン確認
python --version
python3 --version

# 仮想環境モジュール確認
python -m venv --help

# 権限問題の場合
sudo chown -R $USER:$USER venv/
```

### 依存関係エラー
```bash
# pip更新
pip install --upgrade pip

# キャッシュクリア
pip cache purge

# 強制再インストール
pip install --force-reinstall -r requirements.txt
```

### ポート競合
```bash
# ポート使用状況確認
lsof -i :8000
lsof -i :3000

# プロセス終了
kill -9 <PID>
```

## 🚨 緊急時対応

### 移行失敗時の復旧
```bash
# バックアップからの復旧
BACKUP_DIR=$(ls -td backup_* | head -1)
echo "最新バックアップ: $BACKUP_DIR"

# 仮想環境復旧
rm -rf venv
cp -r "$BACKUP_DIR/venv_backup" venv

# 設定ファイル復旧
cp "$BACKUP_DIR/requirements.txt.backup" requirements.txt
```

### 完全リセット
```bash
# 全て削除して最初からやり直し
rm -rf venv node_modules
rm -f requirements.txt .env
git checkout -- .  # Gitリポジトリの場合
```

## 📞 サポート情報
- プロジェクトガイドライン: `CLAUDE.md`
- 技術仕様: ISO 20000/27001/27002準拠
- SubAgent、Claude-flow、Playwright MCP等の高度機能を活用

## ✅ 成功チェックリスト
- [ ] migrate-environment.sh実行完了
- [ ] verify-migration.sh で全テスト通過
- [ ] Python仮想環境がポータブル
- [ ] アプリケーションが正常起動
- [ ] API エンドポイントが応答
- [ ] フロントエンドが表示（該当する場合）
- [ ] データベース接続成功
- [ ] 絶対パス依存の解消

---
**実行時間目安**: 5-15分（プロジェクトサイズによる）
**最終更新**: 2025-08-29
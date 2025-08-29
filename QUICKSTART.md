# ITサービス管理システム - クイックスタートガイド

**⚡ 5分で始める Context7統合 ITSMシステム**

このガイドは、可能な限り素早くシステムを起動することに焦点を当てています。詳細な設定は [README-MIGRATION.md](./README-MIGRATION.md) を参照してください。

## 🚀 高速セットアップ（推奨）

### 前提条件チェック
```bash
# システム要件を自動確認
npm run platform:detect
```

### ワンクリック起動
```bash
# プロジェクト取得
git clone <repository-url> ITManagementSystem-Prototype
cd ITManagementSystem-Prototype

# Context7による全自動セットアップ
npm run quick-start
```

**これだけです！** Context7が以下を自動実行します：
- ✅ 環境要件チェック
- ✅ 依存関係インストール  
- ✅ 環境変数自動生成
- ✅ データベース初期化
- ✅ サーバー起動

## 🔧 手動セットアップ（3ステップ）

Context7の自動化を使わない場合：

### ステップ 1: 依存関係
```bash
npm install
cd frontend && npm install && cd ..
cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cd ..
```

### ステップ 2: 環境設定
```bash
cp .env.example .env
# .env ファイルを必要に応じて編集
```

### ステップ 3: 起動
```bash
npm run dev
```

## 🌐 アクセス情報

セットアップ完了後、以下のURLでアクセス可能：

- **メインアプリケーション**: http://localhost:3000
- **APIドキュメント**: http://localhost:8000/docs  
- **Context7ダッシュボード**: http://localhost:3000/context7
- **システム監視**: http://localhost:3000/monitoring

## 📱 動作確認

### 基本機能テスト
1. ブラウザで http://localhost:3000 を開く
2. ダッシュボードが表示されることを確認
3. インシデント管理ページに移動
4. 新しいインシデントを作成

### Context7機能テスト
```bash
# Context7統合テスト
npm run test:context7-quick

# 並列処理テスト
npm run test:parallel-quick

# 自動修復テスト
npm run test:self-healing-quick
```

## 🛠️ よくある問題の即座解決

### ポート競合エラー
```bash
# 自動的に空いているポートを検出して起動
npm run start:auto-port
```

### 権限エラー（Windows）
```powershell
# PowerShellを管理者として実行後
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
npm run quick-start
```

### Node.js/Pythonバージョンエラー
```bash
# 自動バージョン修正
npm run fix:versions
```

### 依存関係エラー
```bash
# 強制再インストール
npm run dependencies:force-reset
```

## ⚡ 超高速開発モード

開発者向けの最適化された起動：

```bash
# 並列処理+ホットリロード+自動修復
npm run dev:turbo

# メモリ最適化モード
npm run dev:optimized

# デバッグモード
npm run dev:debug
```

## 🔍 問題が発生した場合

### 自動診断
```bash
# システム健全性チェック
npm run diagnose

# 問題自動修復
npm run auto-repair
```

### 手動チェック
1. **Node.js**: `node --version` (v18+必要)
2. **Python**: `python --version` (v3.8+必要)  
3. **ポート**: `lsof -i :3000` `lsof -i :8000`
4. **権限**: 管理者権限で実行

### サポートリソース
- 詳細ガイド: [README-MIGRATION.md](./README-MIGRATION.md)
- トラブルシューティング: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- システム要件: [docs/development-setup.md](./docs/development-setup.md)

## 📈 次のステップ

システムが起動したら：

1. **機能探索**: http://localhost:3000 でメイン機能を確認
2. **Context7学習**: http://localhost:3000/context7 で7つのレイヤーを理解
3. **カスタマイズ**: [README-MIGRATION.md](./README-MIGRATION.md) でシステム最適化
4. **本番対応**: [production/](./production/) で本番環境設定

---

**🎯 目標**: このガイドで5分以内にシステムが起動します！

**❓ 問題**: `npm run auto-repair` で自動修復を試すか、詳細ガイドをご確認ください。

**✨ Context7の恩恵**: システムがあなたの環境を学習し、次回からさらに高速に起動します。
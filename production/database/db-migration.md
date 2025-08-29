# データベース移行手順

## 概要
開発環境から本番環境へのデータベース移行手順について説明します。

## 前提条件
- Azure SQL Database (Standard Tier)が本番環境にセットアップ済み
- バックアップ用ストレージアカウントの準備
- 必要な権限が付与されたデータベース管理者アカウント

## データベーススキーマ

本システムで使用する主要なテーブル：
- users: ユーザー情報
- assets: IT資産情報
- tickets: サポートチケット
- logs: システムログ

## 移行手順

### 1. 開発環境からデータエクスポート
```powershell
# 開発環境からダンプ取得
.\scripts\db-export.ps1 -Environment Dev -Output backup.sql
```

### 2. 本番環境へインポート
```powershell
# 本番環境へインポート
.\scripts\db-import.ps1 -Environment Prod -Input backup.sql
```

### 3. データ検証
```sql
-- ユーザーデータ検証
SELECT COUNT(*) FROM users;

-- 資産データ検証
SELECT COUNT(*) FROM assets;

-- リレーションシップ検証
SELECT 
    a.name, 
    u.username 
FROM assets a
JOIN users u ON a.assigned_to = u.id
LIMIT 10;
```

## バックアップ設定

### 自動バックアップ設定
```yaml
# Azure SQL Databaseの自動バックアップ設定
retention-days: 14
backup-frequency: daily
backup-window: "01:00-03:00"
```

## ロールバック手順

問題発生時のロールバック手順：

```powershell
# 特定のタイムスタンプにロールバック
.\scripts\db-rollback.ps1 -Timestamp 20250315-1200

# 検証クエリ実行
.\scripts\db-verify.ps1 -Environment Prod
```

## 移行後のチェックリスト
- [ ] インデックスの再構築が完了していることを確認
- [ ] 統計情報の更新が完了していることを確認
- [ ] 接続文字列が正しく更新されていることを確認
- [ ] データベース権限が正しく設定されていることを確認
- [ ] ポイントインタイム復元が有効になっていることを確認
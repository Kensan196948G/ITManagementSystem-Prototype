# セキュリティポリシーとガイドライン

## 概要
ITマネジメントシステムの本番環境セキュリティポリシーについて説明します。

## SSL/TLS設定

### 証明書要件
- 認証局: Let's Encrypt（推奨）または商用認証局
- 有効期間: 最低90日（Let's Encrypt）
- 鍵長: 2048ビット以上
- 証明書設定場所: Azure App Service / CDN

### 証明書更新手順
```bash
# Let's Encryptを使用した証明書の更新
cd production/security/scripts
./renew-certificates.sh

# 証明書のデプロイ
az webapp config ssl upload --certificate-file ./fullchain.pem --certificate-password $CERT_PASSWORD --name it-management-app --resource-group it-management-prod
```

## ファイアウォール設定

### 必要な通信のみ許可
- インバウンド: 80/443のみ許可（Webトラフィック）
- アウトバウンド: 必要な外部サービス（Azure AD、Azure Storage、モニタリングサービス）のみ許可

### WAFルール設定
```json
{
  "rules": [
    {
      "name": "SQLInjectionRule",
      "priority": 100,
      "action": "Block",
      "match_conditions": [
        {
          "match_variable": "RequestUri",
          "operator": "RegEx",
          "match_value": "(['|\"])(.)*(SELECT|INSERT|UPDATE|DELETE|DROP)"
        }
      ]
    },
    {
      "name": "XSSRule",
      "priority": 101,
      "action": "Block",
      "match_conditions": [
        {
          "match_variable": "RequestBody",
          "operator": "RegEx",
          "match_value": "<script>.*</script>"
        }
      ]
    }
  ]
}
```

## 認証設定

### Azure AD設定
1. Azureポータルで本番環境用のアプリ登録を作成
2. 必要なリダイレクトURIを設定:
   - `https://it-management.example.com/auth/callback`
3. APIアクセス許可:
   - Microsoft Graph > User.Read.All
   - Azure Key Vault > Secret.Read

### 権限設定
- 管理者ロール: すべての機能にアクセス可能
- ユーザーロール: 自分のリソースと共有リソースのみアクセス可能
- 閲覧者ロール: 読み取り専用アクセス

## セキュリティ監視

### ログ監視設定
```yaml
# セキュリティログ監視設定
log_sources:
  - source: azure_ad_sign_ins
    retention: 90d
  - source: app_authentication
    retention: 90d
  - source: api_access
    retention: 30d
  - source: firewall_logs
    retention: 14d
```

### セキュリティアラート
- 不審なサインイン試行（地理的に不審な場所からのアクセスなど）
- 複数回の認証失敗
- 特権アカウントのアクティビティ
- データベースへの異常なクエリパターン

## データ保護

### データ暗号化
- 保存データ: Azure Storage暗号化、TDE（Transparent Data Encryption）
- 転送中データ: TLS 1.2以上必須

### 機密情報管理
- API キー、パスワード等は Azure Key Vault に保存
- 環境変数経由でアプリケーションに提供
- ソースコード内への機密情報の埋め込み禁止

## インシデント対応手順

### セキュリティインシデント発生時の対応
1. 影響範囲の特定と隔離
2. 証拠の収集と保全
3. 原因の分析
4. 修復と復旧
5. 報告と再発防止策の実施

### 連絡先
- セキュリティ責任者: security-team@example.com
- 緊急連絡先: +81-XX-XXXX-XXXX（24時間対応）

## コンプライアンス要件

- 個人情報保護法の遵守
- 社内セキュリティポリシーの遵守
- セキュリティアセスメントの定期実施（四半期ごと）
# ITマネジメントシステム 本番環境実装ガイド

本ドキュメントは、ITマネジメントシステムの本番環境を実装するための包括的なガイドラインを提供します。各フェーズごとの具体的な手順と参照ドキュメントを記載しています。

## フェーズ1: 環境構築の準備

### インフラストラクチャの決定
- [管理者申請用ドキュメント](./admin-request-documentation.md)を参照し、必要なリソースの詳細を確認
- Azureサブスクリプションの確認と予算承認の取得
- リソースグループの命名規則の確定（例: `rg-it-management-prod`）

### リソースプロビジョニング
```powershell
# Azureリソースグループの作成
az group create --name rg-it-management-prod --location japaneast

# ネットワークリソースの作成
az network vnet create --resource-group rg-it-management-prod --name it-management-vnet --address-prefix 10.0.0.0/16 --subnet-name frontend-subnet --subnet-prefix 10.0.1.0/24

# バックエンドサブネットの追加
az network vnet subnet create --resource-group rg-it-management-prod --vnet-name it-management-vnet --name backend-subnet --address-prefix 10.0.2.0/24

# データベースサブネットの追加
az network vnet subnet create --resource-group rg-it-management-prod --vnet-name it-management-vnet --name database-subnet --address-prefix 10.0.3.0/24
```

### ネットワークセキュリティ設定
```powershell
# フロントエンドNSGの作成
az network nsg create --resource-group rg-it-management-prod --name frontend-nsg

# フロントエンドルールの追加
az network nsg rule create --resource-group rg-it-management-prod --nsg-name frontend-nsg --name allow-https --protocol tcp --direction inbound --priority 100 --source-address-prefix '*' --source-port-range '*' --destination-address-prefix '*' --destination-port-range 443 --access allow

# バックエンドNSGの作成と設定
az network nsg create --resource-group rg-it-management-prod --name backend-nsg

# バックエンドルールの追加（フロントエンドサブネットからのみ接続許可）
az network nsg rule create --resource-group rg-it-management-prod --nsg-name backend-nsg --name allow-frontend --protocol tcp --direction inbound --priority 100 --source-address-prefix '10.0.1.0/24' --source-port-range '*' --destination-address-prefix '*' --destination-port-range 5000 --access allow
```

## フェーズ2: ステージング環境の構築

### コンテナレジストリの設定
```powershell
# Azure Container Registryの作成
az acr create --resource-group rg-it-management-prod --name itmanagementacr --sku Standard
```

### ステージング環境のデプロイ
1. [docker-compose.yml](./deployment/docker-compose.yml)を使用してコンテナ環境を構築
2. [.env.staging](./config/.env.staging)の環境変数を適宜更新

```bash
# ステージング環境構築
docker-compose -f ./deployment/docker-compose.yml --env-file ./config/.env.staging up -d
```

### ドメイン設定
1. DNSレコードの作成
   - staging.it-management.example.comをステージング環境のIPアドレスに指定
2. Let's Encrypt証明書の取得
```bash
# certbotを使用した証明書取得
certbot certonly --webroot -w /var/www/html -d staging.it-management.example.com
```

## フェーズ3: データベース移行

### スキーマ作成とデータ移行
1. [schema.sql](./database/schema.sql)を使用してデータベーススキーマを作成
2. [db-migration.md](./database/db-migration.md)の手順に従ってデータを移行

```bash
# Azure SQL Databaseへのスキーマ適用
sqlcmd -S <server>.database.windows.net -d it-management-db -U <username> -P <password> -i ./database/schema.sql

# 開発環境からのデータエクスポート
./scripts/db-export.ps1 -Environment Dev -Output backup.sql

# ステージング環境へのインポート
./scripts/db-import.ps1 -Environment Staging -Input backup.sql
```

### データ整合性の検証
```sql
-- 基本的な検証クエリ
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM assets;
SELECT COUNT(*) FROM tickets;

-- リレーション検証
SELECT 
    a.name, 
    u.username 
FROM assets a
JOIN users u ON a.assigned_to = u.id
LIMIT 10;
```

## フェーズ4: Azure AD認証設定

1. [azure-ad-setup.md](./security/azure-ad-setup.md)の手順に従ってAzure ADアプリケーション登録を実施
2. 必要なAPIアクセス許可を設定
3. リダイレクトURIを設定：
   - ステージング環境: https://staging.it-management.example.com/auth/callback
   - 本番環境: https://it-management.example.com/auth/callback

### 動作検証
1. ステージング環境にアクセスし、ログインが正常に機能することを確認
2. 各種ユーザーロールでのアクセス制御の動作確認

## フェーズ5: CI/CDパイプラインの構築

1. [azure-pipelines.yml](./deployment/azure-pipelines.yml)を使用してAzure DevOpsパイプラインを設定
2. ソースコードリポジトリと連携設定

```powershell
# Azure DevOpsプロジェクトへのパイプライン追加
az pipelines create --name IT-Management-Pipeline --repository IT-Management-System --yml-path ./production/deployment/azure-pipelines.yml
```

### テストデプロイの実施
1. 開発ブランチから手動パイプライン実行
2. ステージング環境へのデプロイが成功することを確認
3. 統合テストと自動テストの結果確認

## フェーズ6: モニタリング環境の構築

### Prometheusとアラート設定
1. [monitoring-setup.md](./monitoring/monitoring-setup.md)の手順に従ってモニタリング環境をセットアップ
2. [prometheus.yml](./monitoring/prometheus.yml)と[alerts.yml](./monitoring/alerts.yml)を使用して監視設定を適用

```bash
# Prometheusコンテナの起動
docker run -d -p 9090:9090 -v ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml -v ./monitoring/alerts.yml:/etc/prometheus/alerts.yml prom/prometheus

# Grafanaコンテナの起動
docker run -d -p 3000:3000 grafana/grafana
```

### アラート通知の設定
1. Slackチャンネルの作成とWebhook URL取得
2. Alertmanagerの設定
```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/TXXXXXXXX/BXXXXXXXX/XXXXXXXX'

route:
  group_by: ['alertname', 'job']
  receiver: 'team-slack'

receivers:
- name: 'team-slack'
  slack_configs:
  - channel: '#it-management-alerts'
    send_resolved: true
```

## フェーズ7: セキュリティテスト

1. [security-test-guide.md](./security/security-test-guide.md)の手順に従って脆弱性スキャンとペネトレーションテストを実施
2. OWASP ZAPを使用した自動スキャン
```bash
docker run --rm -v $(pwd)/zap-reports:/zap/reports owasp/zap2docker-stable zap-baseline.py -t https://staging.it-management.example.com -r zap-baseline-report.html
```

### SSL/TLS設定評価
1. SSL Labsでの評価実施
   - https://www.ssllabs.com/ssltest/ にアクセス
   - ドメイン staging.it-management.example.com を入力して評価
2. 結果に基づくNginx設定の最適化
   - [nginx.conf](./config/nginx.conf)のSSL設定部分を必要に応じて更新

## フェーズ8: 本番環境への最終移行

### 最終移行チェックリスト
1. [production-checklist.md](./production-checklist.md)の全ての項目を確認
2. 関係者からの移行承認取得

### データベース最終移行
```powershell
# 最終データバックアップ
./scripts/db-export.ps1 -Environment Staging -Output final-backup.sql

# 本番環境へのインポート
./scripts/db-import.ps1 -Environment Prod -Input final-backup.sql
```

### アプリケーションデプロイ
```bash
# CI/CDパイプラインを使用した本番デプロイ
az pipelines run --name IT-Management-Pipeline --branch main
```

### DNS切り替え
```bash
# 本番DNSレコードの追加
az network dns record-set a add-record --resource-group rg-it-management-prod --zone-name example.com --record-set-name it-management --ipv4-address <本番IPアドレス>
```

## 次のステップと運用開始

### 運用体制の確立
1. 監視・アラート対応体制の確認
2. インシデント対応フローの確認
3. 定期メンテナンススケジュールの設定

### トレーニングとドキュメント整備
1. 運用チームへのシステム概要トレーニング
2. 障害対応手順の共有
3. エスカレーションフローの確認

### 定期レビュー計画
1. 毎月のセキュリティパッチ適用
2. 四半期ごとのパフォーマンスレビュー
3. 半年ごとのシステム全体のセキュリティレビュー

## 付録: 重要なコマンド集

### ヘルスチェック
```bash
# バックエンドAPIのヘルスチェック
curl -I https://api.it-management.example.com/health

# データベース接続テスト
sqlcmd -S <server>.database.windows.net -d it-management-db -U <username> -P <password> -Q "SELECT 'Connection successful'"
```

### 緊急ロールバック
```powershell
# APIのロールバック
az webapp deployment slot swap --resource-group rg-it-management-prod --name it-management-api --slot staging --target-slot production --action reset

# データベースのロールバック
./scripts/db-rollback.ps1 -Timestamp <バックアップタイムスタンプ>
```

### 監視アラートテスト
```bash
# テストアラートの送信
curl -X POST -H "Content-Type: application/json" -d '{"status":"firing","labels":{"alertname":"Test Alert"}}' http://alertmanager:9093/api/v1/alerts
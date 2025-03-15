# グローバル管理者申請用ドキュメント

## 1. プロジェクト概要

**プロジェクト名**: ITマネジメントシステム本番環境移行  
**目的**: 社内ITリソース管理システムの本番環境への移行とセキュアな運用体制の確立  
**対象ユーザー**: 社内IT部門、資産管理担当者、一般従業員  
**予定稼働日**: 2025年4月1日

## 2. 必要なリソースと権限

### Azureサブスクリプション

**必要なサブスクリプション**: Enterprise E3以上  
**リソースグループ名**: rg-it-management-prod  
**ロケーション**: Japan East

### 必要な権限

| 権限タイプ | 必要な権限 | 理由 |
|------------|------------|------|
| リソース作成 | Contributor | インフラストラクチャリソースの作成 |
| Azure AD | Global Administrator (一時的) | アプリケーション登録と権限設定 |
| Key Vault | Key Vault Administrator | シークレット管理のため |
| SQL Database | SQL Server Contributor | データベース管理 |
| Network | Network Contributor | VNET、NSG設定 |
| Security | Security Admin | セキュリティ設定の管理 |

## 3. Azure ADアプリケーション登録

**アプリケーション名**: IT-Management-System-Prod  
**アプリケーションタイプ**: Web application  
**リダイレクトURI**:
- https://it-management.example.com/auth/callback
- https://staging.it-management.example.com/auth/callback

**必要なAPIアクセス許可**:
- Microsoft Graph
  - User.Read
  - User.Read.All
  - Directory.Read.All
- Azure Key Vault
  - Secret.Read

## 4. インフラストラクチャ要件

### コンピューティングリソース

| リソースタイプ | サイズ | 数量 | 目的 |
|--------------|------|------|------|
| Virtual Machine (フロントエンド) | Standard_B2s | 2 | Webフロントエンド |
| Virtual Machine (バックエンド) | Standard_B4ms | 2 | APIサーバー |
| Azure SQL Database | Standard S1 | 1 | データストレージ |
| Azure Storage Account | Standard (LRS) | 1 | アセット保存、ログ保存 |
| Key Vault | Standard | 1 | シークレット管理 |
| Application Gateway | Standard_v2 | 1 | ロードバランサー、WAF |

### ネットワークリソース

| リソースタイプ | 仕様 | 目的 |
|--------------|------|------|
| Virtual Network | 10.0.0.0/16 | 主要ネットワーク |
| サブネット (フロントエンド) | 10.0.1.0/24 | Webサーバー用 |
| サブネット (バックエンド) | 10.0.2.0/24 | APIサーバー用 |
| サブネット (データベース) | 10.0.3.0/24 | データベース用 |
| Network Security Group | - | トラフィック制御 |
| Public IP | Standard SKU | 外部アクセス用 |

### 証明書要件

**証明書タイプ**: SSL/TLS証明書 (Let's Encryptまたは商用CA)  
**ドメイン名**:
- it-management.example.com
- *.it-management.example.com

## 5. 監視・ロギング

**Azure Monitor設定**:
- アプリケーションインサイトの有効化
- カスタムダッシュボードの作成
- アラートルールの設定

**ログ設定**:
- 診断ログの有効化
- Log Analyticsワークスペースの作成
- 30日間のログ保持期間

## 6. バックアップとDR計画

**バックアップ要件**:
- データベース: 日次バックアップ、7日間保持
- 重要設定ファイル: 変更時バックアップ
- 復旧時間目標 (RTO): 4時間以内
- 復旧ポイント目標 (RPO): 24時間以内

## 7. セキュリティ要件

**セキュリティルール**:
- 全トラフィックにHTTPS強制
- 内部ネットワークの分離
- JIT VM アクセスの有効化
- Azure Security Centerの標準プラン利用

**コンプライアンス要件**:
- 社内セキュリティポリシーへの準拠
- 個人情報保護法の遵守
- SOC 2コントロールの実装

## 8. 必要な作業と承認のタイムライン

| フェーズ | 作業内容 | 必要な承認 | 予定日 |
|---------|---------|-----------|--------|
| 準備 | リソースグループ作成、権限割り当て | IT部門マネージャー | 2025/3/20 |
| インフラ構築 | ネットワーク、VM、DBの構築 | インフラ管理者 | 2025/3/25 |
| アプリ登録 | Azure ADアプリケーション登録 | セキュリティ管理者 | 2025/3/27 |
| 検証環境構築 | ステージング環境の構築とテスト | QAリーダー | 2025/3/30 |
| 本番移行 | 最終データ移行、切り替え | CIO | 2025/4/1 |

## 9. 連絡先情報

**プロジェクト責任者**:  
名前: [責任者名]  
メール: project-lead@example.com  
電話: [電話番号]

**技術担当者**:  
名前: [技術担当者名]  
メール: tech-lead@example.com  
電話: [電話番号]

**緊急連絡先**:  
メール: emergency@example.com  
電話: [緊急用電話番号]
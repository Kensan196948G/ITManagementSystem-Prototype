# ITマネジメントシステム 本番環境移行スクリプト 詳細ガイド

本ドキュメントではITマネジメントシステムの本番環境移行に使用するPowerShellスクリプトについて詳細に解説します。各スクリプトの機能、使用方法、パラメータ、出力結果などを説明し、グローバル管理者や開発者が効率的に本番環境移行を進められるようにします。

## 目次

1. [スクリプト概要](#スクリプト概要)
2. [環境要件収集スクリプト](#環境要件収集スクリプト)
3. [Azure ADアプリケーション登録スクリプト](#azure-adアプリケーション登録スクリプト)
4. [本番環境リソース作成スクリプト](#本番環境リソース作成スクリプト)
5. [全体的な移行フロー](#全体的な移行フロー)
6. [よくある問題と解決方法](#よくある問題と解決方法)

## スクリプト概要

本番環境移行のために用意された3つの主要スクリプトと1つの申請ドキュメントは、異なる役割を持ち、移行プロセスの各段階をサポートします：

| ファイル名 | 目的 | 実行者 | 必要な権限 |
|------------|------|--------|------------|
| `Get-ProductionEnvRequirements.ps1` | 環境の準備状況を確認 | グローバル管理者 | 管理者権限 |
| `Register-AzureADApplication.ps1` | Azure ADアプリ登録 | グローバル管理者 | Azure AD管理者 |
| `New-ProductionEnvironment.ps1` | Azureリソースの作成 | グローバル管理者 | サブスクリプション権限 |
| `admin-request-documentation.md` | 管理者向け申請情報 | 開発者が作成、管理者が参照 | - |

これらのスクリプトは段階的に実行し、一つのスクリプトの出力が次のスクリプトの入力となる場合があります。

## 環境要件収集スクリプト

### 概要
`Get-ProductionEnvRequirements.ps1`は現在の環境が本番環境の要件を満たしているかを評価し、詳細なレポートを生成します。このスクリプトは実際のリソース作成やアプリケーション登録を行わず、診断ツールとして機能します。

### 主な機能

- **システム情報の収集**: OSバージョン、PowerShellバージョンなど
- **Azure接続状態の確認**: Azure PowerShellモジュールの有無、ログイン状態
- **管理者権限の確認**: 実行環境の権限レベル
- **ネットワーク接続確認**: Azure/Microsoft Onlineへの接続テスト
- **必要なツールの確認**: 必須モジュールが揃っているか

### 使用方法

```powershell
# 基本的な使用方法
.\Get-ProductionEnvRequirements.ps1

# 出力先を指定する場合
.\Get-ProductionEnvRequirements.ps1 -OutputPath "C:\Reports"

# 詳細情報を含める場合
.\Get-ProductionEnvRequirements.ps1 -IncludeDetails
```

### パラメータ詳細

| パラメータ名 | 必須 | 説明 | 既定値 |
|-------------|------|------|--------|
| OutputPath | いいえ | 結果レポートの出力先ディレクトリ | カレントディレクトリ |
| IncludeDetails | いいえ | 詳細な診断情報を含めるかどうか（スイッチ） | false |

### 出力内容

1. **HTMLレポート**: `IT-Management-EnvRequirements_YYYYMMDD_HHMMSS.html`
   - システム情報サマリー
   - Azure接続状態
   - ネットワーク設定
   - 必要なツールの確認結果
   - 検出されたエラーと警告
   - 推奨事項のリスト

2. **ログファイル**: `IT-Management-EnvRequirements_YYYYMMDD_HHMMSS.log`
   - 実行された各チェックの詳細ログ
   - 発生したエラーの詳細
   - タイムスタンプ付きの処理記録

### 出力例

```
===============================================================================
  ITマネジメントシステム - 環境要件レポート
===============================================================================

実行日時: 2025年03月15日 21:45:32

-----------------------------------
  1. システム情報
-----------------------------------
ComputerName: DESKTOP-AB123CD
OSVersion: Microsoft Windows NT 10.0.19042.0
PowerShellVersion: 5.1.19041.1320
CurrentUser: DOMAIN\Administrator
IsAdmin: True

-----------------------------------
  2. Azure接続状態
-----------------------------------
AzModuleInstalled: True
AzLoggedIn: False

// 以下略
```

## Azure ADアプリケーション登録スクリプト

### 概要
`Register-AzureADApplication.ps1`はITマネジメントシステムが利用するAzure ADアプリケーションを登録し、必要なAPI権限を設定します。このスクリプトを実行することで、認証に必要なアプリケーションIDやシークレットが生成されます。

### 主な機能

- **Azure ADアプリケーション登録**: 指定した名前でアプリケーション登録
- **リダイレクトURI設定**: 本番およびステージング環境のリダイレクトURIを設定
- **API権限設定**: Microsoft GraphとAzure Key Vaultへのアクセス権設定
- **クライアントシークレット生成**: アプリケーション認証に使用するシークレットの生成
- **詳細レポート生成**: 開発者に提供するための認証情報レポート作成

### 使用方法

```powershell
# 基本的な使用方法
.\Register-AzureADApplication.ps1

# アプリケーション名を指定する場合
.\Register-AzureADApplication.ps1 -AppName "MyITSystem"

# カスタムリダイレクトURIを指定する場合
.\Register-AzureADApplication.ps1 -RedirectUris "https://myapp.example.com/auth/callback","https://staging.myapp.example.com/auth/callback"
```

### パラメータ詳細

| パラメータ名 | 必須 | 説明 | 既定値 |
|-------------|------|------|--------|
| AppName | いいえ | 登録するアプリケーションの名前 | "IT-Management-System-Prod" |
| OutputPath | いいえ | 結果レポートの出力先ディレクトリ | カレントディレクトリ |
| RedirectUris | いいえ | リダイレクトURI（複数指定可能） | 本番とステージング環境の既定URI |

### 出力内容

1. **テキストレポート**: `AzureAD-App-Registration_YYYYMMDD_HHMMSS.txt`
   - アプリケーション情報（ID、テナントID等）
   - リダイレクトURI一覧
   - 設定されたAPI権限
   - クライアントシークレット情報
   - 環境変数設定値（開発者向け）

2. **ログファイル**: `AzureAD-App-Registration_YYYYMMDD_HHMMSS.log`
   - 各処理のタイムスタンプ付きログ
   - 発生したエラーの詳細

### 出力例

```
===============================================================================
  ITマネジメントシステム - Azure ADアプリケーション登録レポート
===============================================================================

実行日時: 2025年03月15日 21:50:15

-----------------------------------
  1. アプリケーション情報
-----------------------------------
アプリケーション名: IT-Management-System-Prod
アプリケーションID: 12345678-1234-1234-1234-123456789abc
テナント名: contoso.onmicrosoft.com
テナントID: 87654321-4321-4321-4321-cba987654321
オブジェクトID: abcdef12-3456-7890-abcd-ef1234567890

-----------------------------------
  2. リダイレクトURI
-----------------------------------
- https://it-management.example.com/auth/callback
- https://staging.it-management.example.com/auth/callback

// 以下略
```

## 本番環境リソース作成スクリプト

### 概要
`New-ProductionEnvironment.ps1`は、ITマネジメントシステムの本番環境（または検証環境）に必要なAzureリソースを自動的に作成します。仮想ネットワーク、App Service、データベース、Key Vaultなどの構成を一括で行います。

### 主な機能

- **リソースグループ作成**: 指定した名前でリソースグループを作成
- **ネットワークリソース作成**: VNet、サブネット、NSGの構成
- **App Service作成**: フロントエンド/バックエンド用のApp Serviceインスタンス作成
- **データベースリソース作成**: SQL Server、データベースの準備
- **ストレージアカウント作成**: 静的ファイル用ストレージの構成
- **Key Vault作成**: シークレット管理用のKey Vaultプロビジョニング
- **デプロイスクリプト生成**: リソース作成後のアプリケーションデプロイ支援スクリプト生成

### 使用方法

```powershell
# 基本的な使用方法
.\New-ProductionEnvironment.ps1

# カスタムリソースグループとロケーションを指定する場合
.\New-ProductionEnvironment.ps1 -ResourceGroupName "my-rg-prod" -Location "westus"

# ステージング環境を作成する場合
.\New-ProductionEnvironment.ps1 -Environment "Staging"
```

### パラメータ詳細

| パラメータ名 | 必須 | 説明 | 既定値 |
|-------------|------|------|--------|
| ResourceGroupName | いいえ | 作成するリソースグループ名 | "rg-it-management-prod" |
| Location | いいえ | リソースの作成先リージョン | "japaneast" |
| Environment | いいえ | 環境名（Prod または Staging） | "Prod" |
| OutputPath | いいえ | 結果レポートの出力先ディレクトリ | カレントディレクトリ |

### 出力内容

1. **テキストレポート**: `Azure-Resource-Provisioning_YYYYMMDD_HHMMSS.txt`
   - リソースグループ情報
   - ネットワークリソース構成
   - App Service情報
   - データベース接続情報
   - ストレージアカウント情報
   - Key Vault情報
   - 作成されたリソース一覧
   - 環境変数設定値（開発者向け）

2. **ログファイル**: `Azure-Resource-Provisioning_YYYYMMDD_HHMMSS.log`
   - 各リソース作成のタイムスタンプ付きログ
   - 発生したエラーの詳細

3. **デプロイスクリプト**:
   - `deploy-frontend.ps1`: フロントエンドデプロイスクリプト
   - `deploy-backend.ps1`: バックエンドデプロイスクリプト
   - `init-database.ps1`: データベース初期化スクリプト

### 出力例

```
===============================================================================
  ITマネジメントシステム - Azureリソース作成レポート
===============================================================================

実行日時: 2025年03月15日 22:05:48
環境: Prod

-----------------------------------
  1. リソースグループ情報
-----------------------------------
リソースグループ名: rg-it-management-prod
ロケーション: japaneast
サブスクリプション: Visual Studio Enterprise
サブスクリプションID: 12345678-1234-1234-1234-123456789abc
テナントID: 87654321-4321-4321-4321-cba987654321

-----------------------------------
  2. ネットワークリソース
-----------------------------------
仮想ネットワーク: vnet-it-management
フロントエンドサブネット: snet-frontend
バックエンドサブネット: snet-backend
データベースサブネット: snet-database

// 以下略
```

## 全体的な移行フロー

本番環境移行のプロセスは以下の順序で進行します：

1. **初期準備**
   - `admin-request-documentation.md`を確認
   - グローバル管理者への申請準備

2. **環境診断**
   - `Get-ProductionEnvRequirements.ps1`を実行
   - 不足している要件を確認し対応
   - 必要なモジュールをインストール

3. **Azure ADアプリケーション登録**
   - `Register-AzureADApplication.ps1`を実行
   - 生成されたレポートを保存
   - 管理者の同意を付与

4. **リソース作成**
   - `New-ProductionEnvironment.ps1`を実行
   - リソース作成レポートを確認
   - 生成されたデプロイスクリプトを保存

5. **アプリケーションデプロイ**
   - データベーススキーマの適用
   - フロントエンド/バックエンドのデプロイ
   - 動作確認

6. **最終確認とカットオーバー**
   - セキュリティ設定の最終確認
   - DNSレコードの更新
   - 本番環境への切り替え

## よくある問題と解決方法

### 1. モジュールのインストールエラー

**問題**: Azure PowerShellモジュールのインストールが失敗する

**解決方法**:
```powershell
# 管理者権限でPowerShellを開き、以下を実行
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Install-Module -Name Az -AllowClobber -Force
Install-Module -Name AzureAD -AllowClobber -Force
```

### 2. Azure ADへの接続エラー

**問題**: Azure ADへのログインに失敗する

**解決方法**:
- グローバル管理者アカウントを使用していることを確認
- 多要素認証が有効な場合、認証プロンプトに応答
- プロキシ設定を確認し、必要に応じて調整

### 3. アプリケーション登録権限エラー

**問題**: "Insufficient privileges to complete the operation"

**解決方法**:
- グローバル管理者またはアプリケーション管理者権限を持つアカウントを使用
- 特定のディレクトリに対する権限を確認

### 4. リソース作成の競合エラー

**問題**: "ResourceNameInUse: The resource name is already in use"

**解決方法**:
- スクリプトを再実行し、異なるリソース名を指定
- `-ResourceGroupName`パラメータで別の名前を使用
- ストレージアカウント名は特に競合しやすいため注意

### 5. ネットワークアクセス制限

**問題**: "Network is unreachable"やファイアウォール関連のエラー

**解決方法**:
- 企業ネットワークでのフィルタリング設定を確認
- 必要なドメイン（*.microsoft.com, *.azure.com）への接続許可を確認
- VPN経由での接続を試す
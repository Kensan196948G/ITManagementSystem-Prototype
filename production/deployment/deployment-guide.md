# アプリケーションデプロイメントガイド

## 概要
ITマネジメントシステムの本番環境へのデプロイメント手順について説明します。

## 前提条件
- Azure App Service環境のセットアップ完了
- 必要なアクセス権限（デプロイ権限）
- Azure CLI / Azure PowerShellのインストール完了

## デプロイメント手順

### 1. フロントエンドのデプロイ

```bash
# フロントエンドアプリケーションのビルド
cd frontend
npm install
npm run build:prod

# ビルド成果物のデプロイ (Azure Blob Storage Static Website)
az storage blob upload-batch -d '$web' -s ./build --account-name itmanagementprod
```

### 2. バックエンドのデプロイ

```bash
# バックエンドAPI準備
cd ../backend
pip install -r requirements.txt

# App Serviceへのデプロイ
az webapp up --name it-management-api --resource-group it-management-prod --sku P1V2
```

### 3. 環境変数の設定

```powershell
# App Serviceの環境変数設定
az webapp config appsettings set --name it-management-api --resource-group it-management-prod --settings @../production/config/.env.production
```

## デプロイ検証

各コンポーネントのデプロイ後、以下の検証を実施します：

### フロントエンドの検証
```bash
# ヘルスチェック
curl -I https://it-management.example.com

# コンテンツチェック
curl https://it-management.example.com/version.json
```

### バックエンドの検証
```bash
# APIヘルスチェック
curl -I https://api.it-management.example.com/health

# 認証テスト
curl -H "Authorization: Bearer $TEST_TOKEN" https://api.it-management.example.com/api/v1/self
```

## デプロイ自動化

CI/CDパイプラインの設定例（Azure DevOps）：

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
    - main
    - release/*

pool:
  vmImage: 'windows-latest'

stages:
- stage: Build
  jobs:
  - job: BuildFrontend
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '16.x'
    - script: |
        cd frontend
        npm install
        npm run build:prod
      displayName: 'Build Frontend'
      
  - job: BuildBackend
    steps:
    - task: PythonTool@0
      inputs:
        versionSpec: '3.9'
    - script: |
        cd backend
        pip install -r requirements.txt
      displayName: 'Prepare Backend'

- stage: Deploy
  jobs:
  - job: DeployFrontend
    steps:
    - task: AzureCLI@2
      inputs:
        azureSubscription: 'Production Subscription'
        scriptType: 'bash'
        scriptLocation: 'inlineScript'
        inlineScript: |
          az storage blob upload-batch -d '$web' -s ./frontend/build --account-name itmanagementprod
      displayName: 'Deploy Frontend'
      
  - job: DeployBackend
    steps:
    - task: AzureWebApp@1
      inputs:
        azureSubscription: 'Production Subscription'
        appName: 'it-management-api'
        package: './backend'
      displayName: 'Deploy Backend'
```

## ロールバック手順

デプロイ失敗時のロールバック方法：

```powershell
# 前バージョンに戻す
az webapp deployment slot swap --name it-management-api --resource-group it-management-prod --slot staging --target-slot production

# フロントエンドのロールバック
az storage blob sync -c '$web' -s ./backup/frontend --account-name itmanagementprod
# ITマネジメントシステム 本番環境構築スクリプト

このディレクトリには、ITマネジメントシステムの本番環境構築に必要なPowerShellスクリプトが含まれています。これらのスクリプトを使用することで、グローバル管理者は必要な情報を収集し、環境を準備することができます。

## 前提条件

スクリプトを実行する前に、以下の前提条件を満たしていることを確認してください：

- Windows PowerShell 5.1以上がインストールされていること
- 実行ポリシーが適切に設定されていること (`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`)
- グローバル管理者権限を持つAzure ADアカウントへのアクセス
- Azureサブスクリプションへのアクセス

## 利用可能なスクリプト

### 1. 環境要件収集 (`Get-ProductionEnvRequirements.ps1`)

このスクリプトは、ITマネジメントシステムの本番環境構築に必要な環境要件を収集し、詳細なレポートを生成します。

```powershell
.\Get-ProductionEnvRequirements.ps1 -OutputPath "C:\Reports" -IncludeDetails
```

**パラメータ:**
- `-OutputPath`: 結果レポートの出力先パス（省略可）
- `-IncludeDetails`: 詳細な診断情報を含めるかどうか（スイッチパラメータ、省略可）

### 2. Azure ADアプリケーション登録 (`Register-AzureADApplication.ps1`)

このスクリプトは、ITマネジメントシステムの本番環境利用に必要なAzure ADアプリケーション登録を実行し、必要な情報を収集します。

```powershell
.\Register-AzureADApplication.ps1 -AppName "IT-Management-System-Prod" -OutputPath "C:\Reports"
```

**パラメータ:**
- `-AppName`: 登録するアプリケーションの名前（省略可）
- `-OutputPath`: 結果レポートの出力先パス（省略可）
- `-RedirectUris`: アプリケーション登録に設定するリダイレクトURI（カンマ区切りで複数指定可、省略可）

### 3. 本番環境リソース作成 (`New-ProductionEnvironment.ps1`)

このスクリプトは、ITマネジメントシステムの本番環境に必要なAzureリソースを作成します。

```powershell
.\New-ProductionEnvironment.ps1 -ResourceGroupName "rg-it-management-prod" -Location "japaneast" -Environment "Prod"
```

**パラメータ:**
- `-ResourceGroupName`: 作成するリソースグループ名（省略可）
- `-Location`: リソースの作成先リージョン（省略可）
- `-Environment`: 環境名（"Prod" または "Staging"、省略可）
- `-OutputPath`: 結果レポートの出力先パス（省略可）

## 実行順序

本番環境を構築するには、以下の順序でスクリプトを実行することをお勧めします：

1. 最初に `Get-ProductionEnvRequirements.ps1` を実行して、環境が前提条件を満たしているか確認します。
2. 次に `Register-AzureADApplication.ps1` を実行して、必要なアプリケーション登録を行います。
3. 最後に `New-ProductionEnvironment.ps1` を実行して、実際のAzureリソースを作成します。

## 出力結果

各スクリプトは以下の出力を生成します：

- 詳細なログファイル（`.log` 拡張子）
- レポートファイル（`.txt` または `.html` 拡張子）
- デプロイスクリプト（`New-ProductionEnvironment.ps1` のみ）

これらのファイルにはアカウント情報やパスワードなどの機密情報が含まれている場合があります。安全に保管し、必要な関係者にのみ共有してください。

## トラブルシューティング

スクリプトの実行中に問題が発生した場合：

1. 生成されたログファイルを確認して、エラーメッセージを確認します。
2. PowerShellが管理者として実行されていることを確認します。
3. インターネット接続を確認します。
4. 必要なモジュールがインストールされていることを確認します：
   ```powershell
   Install-Module -Name Az -Force
   Install-Module -Name AzureAD -Force
   ```

詳細なエラーが解決しない場合は、システム開発者に連絡し、生成されたログファイルを提供してください。
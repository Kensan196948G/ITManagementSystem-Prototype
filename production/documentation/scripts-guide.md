# PowerShellスクリプト利用ガイド

本ドキュメントでは、本番環境のデプロイと管理に使用するPowerShellスクリプトについて説明します。

## 前提条件

- Windows Server 2022以上
- PowerShell 7.0以上
- 管理者権限
- IIS (インターネットインフォメーションサービス)
- NSSM (Non-Sucking Service Manager) ※サービス登録に使用

## スクリプト一覧

### 1. Generate-SelfSignedCertificate.ps1

自己署名SSL証明書を生成するためのスクリプトです。

#### パラメータ

| パラメータ名 | 必須 | 説明 | デフォルト値 |
|------------|-----|------|------------|
| Domain | いいえ | 証明書に設定するドメイン名 | localhost |
| OutputPath | いいえ | 証明書ファイルの出力先ディレクトリ | C:\certs |
| IPAddress | いいえ | 証明書に含めるIPアドレス | なし |
| Password | いいえ | 証明書のエクスポート用パスワード | P@ssw0rd1234 |

#### 使用例

```powershell
# 基本的な使用法
.\Generate-SelfSignedCertificate.ps1

# ドメインとIPアドレスを指定
.\Generate-SelfSignedCertificate.ps1 -Domain "it-management.local" -IPAddress "192.168.1.100"

# 出力先とパスワードを指定
.\Generate-SelfSignedCertificate.ps1 -Domain "it-management.local" -OutputPath "D:\certificates" -Password "MySecurePassword123"
```

#### 出力ファイル

- `<Domain>.pfx`: 秘密鍵を含む証明書ファイル
- `<Domain>.cer`: 公開鍵のみの証明書ファイル

### 2. Deploy-Production.ps1

ITマネジメントシステムを本番環境にデプロイするためのスクリプトです。

#### パラメータ

| パラメータ名 | 必須 | 説明 | デフォルト値 |
|------------|-----|------|------------|
| BackupFirst | いいえ | デプロイ前に既存のファイルをバックアップするかどうか | $true |
| InstallPath | いいえ | インストール先ディレクトリ | C:\ITManagementSystem |
| IISSiteName | いいえ | 作成するIISサイト名 | ITManagementSystem |

#### 使用例

```powershell
# 基本的な使用法
.\Deploy-Production.ps1

# バックアップなしでデプロイ (※非推奨)
.\Deploy-Production.ps1 -BackupFirst $false

# インストール先とIISサイト名を指定
.\Deploy-Production.ps1 -InstallPath "D:\Applications\ITManagement" -IISSiteName "IT-Management-Portal"
```

#### 主な処理内容

1. 既存ファイルのバックアップ (オプション)
2. 必要なディレクトリ構造の作成
3. SSL証明書の生成
4. フロントエンドのビルドとデプロイ
5. バックエンドのデプロイ
6. 環境変数の設定
7. IISサイトの設定
8. バックエンドサービスの設定
9. ファイアウォールルールの作成

### 3. Rollback-Production.ps1

デプロイに問題があった場合に、以前のバージョンに戻すためのスクリプトです。完全なロールバックと段階的なロールバックの両方をサポートします。

#### パラメータ

| パラメータ名 | 必須 | 説明 | デフォルト値 |
|------------|-----|------|------------|
| BackupDir | はい | ロールバック元のバックアップディレクトリパス | なし |
| InstallPath | いいえ | インストール先ディレクトリ | C:\ITManagementSystem |
| IISSiteName | いいえ | IISサイト名 | ITManagementSystem |
| RollbackVersion | いいえ | 段階的ロールバックするバージョン (例: "20250317_121530") | なし |
| PartialRollback | いいえ | 段階的ロールバックを有効にする | $false |
| SkipIntegrityCheck | いいえ | データベース整合性チェックをスキップする | $false |

#### 使用例

```powershell
# 完全ロールバック
.\Rollback-Production.ps1 -BackupDir "C:\Backups\ITManagementSystem\20250317_121530"

# 段階的ロールバック (特定バージョンのみ)
.\Rollback-Production.ps1 -BackupDir "C:\Backups\ITManagementSystem" -RollbackVersion "20250317_121530" -PartialRollback $true

# 整合性チェックをスキップ
.\Rollback-Production.ps1 -BackupDir "C:\Backups\ITManagementSystem\20250317_121530" -SkipIntegrityCheck $true
```

#### 主な処理内容

1. データベース整合性チェック (オプションでスキップ可能)
2. サービスとIISサイトの停止
3. 現在の状態の一時バックアップ
4. バックアップからのファイル復元 (段階的ロールバックの場合はトランザクションログを適用)
5. IISサイト設定の復元
6. サービスとIISサイトの再起動

#### 段階的ロールバックについて

- トランザクションログを使用して特定の変更のみを元に戻します
- データベースの状態を保ちながら、問題のある変更のみをロールバック
- バージョン指定が必要 (`RollbackVersion` パラメータ)
- トランザクションログは `BackupDir/txlogs/` 以下に保存されている必要があります

#### 整合性チェックについて

- ロールバック前にバックアップファイルの整合性を自動チェック
- チェックサムファイル (`checksum.sha256`) を使用して検証
- 整合性チェックに失敗した場合はロールバックを中止

## トラブルシューティング

### よくある問題

#### 証明書関連

- **問題**: SSL証明書が正しく生成されない
  **解決策**: 管理者権限でPowerShellを実行しているか確認してください。

- **問題**: 証明書警告が表示される
  **解決策**: 自己署名証明書を使用している場合は正常な動作です。社内環境では信頼された証明機関の証明書に置き換えるか、クライアントPCに証明書をインポートしてください。

#### デプロイ関連

- **問題**: IISサイトの作成に失敗する
  **解決策**: IISがインストールされているか、また指定のポートが他のアプリケーションで使用されていないか確認してください。

- **問題**: バックエンドサービスが起動しない
  **解決策**: ログファイル（C:\Logs\ITManagementSystem\）を確認し、具体的なエラーメッセージを特定してください。また、必要な依存関係（Python、パッケージなど）がインストールされているか確認してください。

#### ロールバック関連

- **問題**: ロールバックに失敗する
  **解決策**: 指定したバックアップディレクトリが存在するか、また必要なファイルがすべて含まれているか確認してください。

## ログファイル

各スクリプトの実行ログは以下の場所に保存されます：

- デプロイログ: `C:\Logs\ITManagementSystem\deploy_YYYYMMDD_HHMMSS.log`
- ロールバックログ: `C:\Logs\ITManagementSystem\rollback_YYYYMMDD_HHMMSS.log`

問題が発生した場合は、これらのログファイルを確認して具体的なエラーメッセージを特定してください。

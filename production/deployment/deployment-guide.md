# アプリケーションデプロイメントガイド

## 概要
ITマネジメントシステムの本番環境（社内オンプレミス）へのデプロイメント手順について説明します。

## 前提条件
- Windows Server 2022以上
- PowerShell 7.0以上
- .NET Core 6.0以上のランタイム
- Node.js 16.x以上
- Python 3.9以上

## HTTP設定

### 1. フロントエンドのデプロイ

```powershell
# フロントエンドアプリケーションのビルド
cd frontend
npm install
npm run build:prod

# IISディレクトリに配置
Copy-Item -Path .\build\* -Destination "C:\inetpub\wwwroot\it-management\" -Recurse -Force
```

### 2. バックエンドのデプロイ

```powershell
# バックエンドAPI準備
cd ..\backend
pip install -r requirements.txt

# Windows Serviceとして登録
New-Service -Name "ITManagementAPI" -BinaryPathName "python.exe C:\path\to\backend\main.py" -Description "ITマネジメントシステムAPI" -StartupType Automatic
Start-Service -Name "ITManagementAPI"
```

### 3. 環境変数の設定

```powershell
# システム環境変数の設定
[Environment]::SetEnvironmentVariable("API_PORT", "5000", "Machine")
[Environment]::SetEnvironmentVariable("LOG_LEVEL", "info", "Machine")
[Environment]::SetEnvironmentVariable("MS_CLIENT_ID", "22e5d6e4-805f-4516-af09-ff09c7c224c4", "Machine")
[Environment]::SetEnvironmentVariable("MS_TENANT_ID", "a7232f7a-a9e5-4f71-9372-dc8b1c6645ea", "Machine")
```

## ネットワーク設定
- アクセスURL: `http://<サーバー内部IP>:5000`
- ファイアウォール設定: 5000ポートを開放
- ホストファイル設定例:
  ```
  <サーバー内部IP> it-management.local
  ```

## Apache Webサーバー設定

### 1. Apacheインストール

```powershell
# Chocolateyを使用したApacheインストール
choco install apache-httpd -y

# Apache設定ディレクトリ
$apacheConfDir = "C:\tools\Apache24\conf"
$apacheSitesDir = "C:\tools\Apache24\conf\sites-available"

# sites-availableディレクトリがなければ作成
if (-not (Test-Path -Path $apacheSitesDir)) {
    New-Item -ItemType Directory -Path $apacheSitesDir -Force
}
```

### 2. HTTP基本設定

```powershell
# メイン設定ファイルの確認
$httpdConfPath = Join-Path -Path $apacheConfDir -ChildPath "httpd.conf"
$baseConfig = @"
Listen 5000
ServerName it-management.local
DocumentRoot "C:/ITManagementSystem/wwwroot"
"@

Add-Content -Path $httpdConfPath -Value "`n$baseConfig"
```

### 3. バーチャルホスト設定

```powershell
# 仮想ホスト設定ファイル作成
$virtualHostConf = Join-Path -Path $apacheSitesDir -ChildPath "it-management.conf"
@"
<VirtualHost *:5000>
    ServerName it-management.local
    DocumentRoot "C:/ITManagementSystem/wwwroot"
    ErrorLog "logs/it-management-error.log"
    CustomLog "logs/it-management-access.log" common

    <Directory "C:/ITManagementSystem/wwwroot">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # API呼び出しをバックエンドに転送
    ProxyPass /api http://localhost:5000/api
    ProxyPassReverse /api http://localhost:5000/api
</VirtualHost>
"@ | Out-File -FilePath $virtualHostConf -Encoding utf8

# 仮想ホスト設定を有効化
$virtualHostsInclude = "Include conf/sites-available/*.conf"
if (-not (Select-String -Path $httpdConfPath -Pattern $virtualHostsInclude -SimpleMatch -Quiet)) {
    Add-Content -Path $httpdConfPath -Value "`n# Include Virtual Hosts`n$virtualHostsInclude"
}
```

## ファイアウォール設定

```powershell
# HTTPポート開放
New-NetFirewallRule -DisplayName "IT Management HTTP" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
```

## デプロイ自動化

```powershell
# deploy-production.ps1
param (
    [switch]$BackupFirst = $true
)

# ログディレクトリ設定
$logDir = "C:\Logs\ITManagementSystem"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path -Path $logDir -ChildPath "deploy_$timestamp.log"

# ロギング関数
function Log-Message {
    param($message)
    $timeStamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timeStamp - $message" | Tee-Object -FilePath $logFile -Append
}

Log-Message "デプロイ開始"

# バックアップ
if ($BackupFirst) {
    Log-Message "バックアップ実行中..."
    $backupDir = "C:\Backups\ITManagementSystem\$timestamp"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    # フロントエンドバックアップ
    Copy-Item -Path "C:\inetpub\wwwroot\it-management\*" -Destination "$backupDir\frontend" -Recurse -Force
    
    # バックエンドバックアップ
    Copy-Item -Path "C:\path\to\backend\*" -Destination "$backupDir\backend" -Recurse -Force
    
    Log-Message "バックアップ完了: $backupDir"
}

try {
    # サービス停止
    Log-Message "サービス停止中..."
    Stop-Service -Name "ITManagementAPI" -Force
    
    # フロントエンドデプロイ
    Log-Message "フロントエンドデプロイ中..."
    Copy-Item -Path ".\frontend\build\*" -Destination "C:\inetpub\wwwroot\it-management\" -Recurse -Force
    
    # バックエンドデプロイ
    Log-Message "バックエンドデプロイ中..."
    Copy-Item -Path ".\backend\*" -Destination "C:\path\to\backend\" -Recurse -Force
    
    # サービス開始
    Log-Message "サービス開始中..."
    Start-Service -Name "ITManagementAPI"
    
    # IIS再起動
    Log-Message "IISリセット中..."
    iisreset
    
    Log-Message "デプロイ成功"
} catch {
    Log-Message "エラー発生: $_"
    if ($BackupFirst) {
        Log-Message "ロールバック開始..."
        .\rollback-production.ps1 -BackupDir $backupDir
    }
    Log-Message "デプロイ失敗"
    exit 1
}

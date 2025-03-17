# アプリケーションデプロイメントガイド

## 概要
ITマネジメントシステムの本番環境（社内オンプレミス）へのデプロイメント手順について説明します。

## 前提条件
- Windows Server 2022以上
- PowerShell 7.0以上
- .NET Core 6.0以上のランタイム
- Node.js 16.x以上
- Python 3.9以上

## SSL証明書の設定

### 1. 自己署名証明書の生成

```powershell
# 証明書生成スクリプト実行
.\production\scripts\Generate-SelfSignedCertificate.ps1 -Domain "it-management.local" -IPAddress "<サーバー内部IP>"
```

### 2. フロントエンドのデプロイ

```powershell
# フロントエンドアプリケーションのビルド
cd frontend
npm install
npm run build:prod

# IISディレクトリに配置
Copy-Item -Path .\build\* -Destination "C:\inetpub\wwwroot\it-management\" -Recurse -Force
```

### 3. バックエンドのデプロイ

```powershell
# バックエンドAPI準備
cd ..\backend
pip install -r requirements.txt

# Windows Serviceとして登録
New-Service -Name "ITManagementAPI" -BinaryPathName "python.exe C:\path\to\backend\main.py" -Description "ITマネジメントシステムAPI" -StartupType Automatic
Start-Service -Name "ITManagementAPI"
```

### 4. 環境変数の設定

```powershell
# システム環境変数の設定
[Environment]::SetEnvironmentVariable("API_PORT", "5000", "Machine")
[Environment]::SetEnvironmentVariable("LOG_LEVEL", "info", "Machine")
[Environment]::SetEnvironmentVariable("MS_CLIENT_ID", "22e5d6e4-805f-4516-af09-ff09c7c224c4", "Machine")
[Environment]::SetEnvironmentVariable("MS_TENANT_ID", "a7232f7a-a9e5-4f71-9372-dc8b1c6645ea", "Machine")
```

## ネットワーク設定
- アクセスURL: `https://<サーバー内部IP>:5000`
- SSL証明書: 自己署名証明書（下記PowerShellスクリプトで生成）
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

# 証明書のパス
$certFile = "C:\certs\it-management.local.crt"
$keyFile = "C:\certs\it-management.local.key"
```

### 2. HTTPS設定

```powershell
# SSLモジュール有効化確認
$httpdConfPath = Join-Path -Path $apacheConfDir -ChildPath "httpd.conf"
$sslModuleLine = 'LoadModule ssl_module modules/mod_ssl.so'

if (-not (Select-String -Path $httpdConfPath -Pattern $sslModuleLine -SimpleMatch -Quiet)) {
    Add-Content -Path $httpdConfPath -Value "`n# Enable SSL Module`n$sslModuleLine"
}

# SSL設定ファイル読み込み確認
$sslConfInclude = 'Include conf/extra/httpd-ssl.conf'
if (-not (Select-String -Path $httpdConfPath -Pattern $sslConfInclude -SimpleMatch -Quiet)) {
    Add-Content -Path $httpdConfPath -Value "`n# Include SSL Configuration`n$sslConfInclude"
}
```

### 3. バーチャルホスト設定

```powershell
# 仮想ホスト設定ファイル作成
$virtualHostConf = Join-Path -Path $apacheSitesDir -ChildPath "it-management.conf"
@"
<VirtualHost *:443>
    ServerName it-management.local
    DocumentRoot "C:/ITManagementSystem/wwwroot"
    ErrorLog "logs/it-management-error.log"
    CustomLog "logs/it-management-access.log" common

    SSLEngine on
    SSLCertificateFile "$certFile"
    SSLCertificateKeyFile "$keyFile"

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

### 4. 必要なモジュールの有効化

```powershell
# プロキシモジュールの有効化
$proxyModules = @(
    'LoadModule proxy_module modules/mod_proxy.so',
    'LoadModule proxy_http_module modules/mod_proxy_http.so',
    'LoadModule rewrite_module modules/mod_rewrite.so'
)

foreach ($module in $proxyModules) {
    if (-not (Select-String -Path $httpdConfPath -Pattern $module -SimpleMatch -Quiet)) {
        Add-Content -Path $httpdConfPath -Value "`n# Enable Proxy Modules`n$module"
    }
}
```

## Nginx Webサーバー設定（代替オプション）

### 1. Nginxインストール

```powershell
# Chocolateyを使用したNginxインストール
choco install nginx -y

# Nginx設定ディレクトリ
$nginxConfDir = "C:\tools\nginx\conf"
$nginxSitesDir = "C:\tools\nginx\conf\sites-available"

# sites-availableディレクトリがなければ作成
if (-not (Test-Path -Path $nginxSitesDir)) {
    New-Item -ItemType Directory -Path $nginxSitesDir -Force
}
```

### 2. SSL設定とバーチャルホスト

```powershell
# 仮想ホスト設定ファイル作成
$nginxConfFile = Join-Path -Path $nginxSitesDir -ChildPath "it-management.conf"
@"
server {
    listen 443 ssl;
    server_name it-management.local;
    
    ssl_certificate C:/certs/it-management.local.crt;
    ssl_certificate_key C:/certs/it-management.local.key;
    
    root C:/ITManagementSystem/wwwroot;
    index index.html;
    
    location / {
        try_files `$uri `$uri/ =404;
    }
    
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
    }
    
    error_log logs/it-management-error.log;
    access_log logs/it-management-access.log;
}
"@ | Out-File -FilePath $nginxConfFile -Encoding utf8

# nginx.conf にインクルード設定を追加
$nginxMainConf = Join-Path -Path $nginxConfDir -ChildPath "nginx.conf"
$includeDirective = "include sites-available/*.conf;"

# 既存のinclude行を確認
$httpBlock = Select-String -Path $nginxMainConf -Pattern "http {" -Context 0,50
if ($httpBlock -and -not ($httpBlock.Context.PostContext -join "`n" -match [regex]::Escape($includeDirective))) {
    $content = Get-Content -Path $nginxMainConf -Raw
    $updatedContent = $content -replace "http {", "http {`n    $includeDirective"
    Set-Content -Path $nginxMainConf -Value $updatedContent
}
```

## ファイアウォール設定

```powershell
# HTTPSポート開放
New-NetFirewallRule -DisplayName "IT Management HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# APIポート開放
New-NetFirewallRule -DisplayName "IT Management API" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
```

## デプロイ検証

各コンポーネントのデプロイ後、以下の検証を実施します：

### フロントエンドの検証
```powershell
# ヘルスチェック
Invoke-WebRequest -Uri "https://it-management.local" -SkipCertificateCheck

# 管理者権限でホストファイル設定確認
$internalIP = "<サーバー内部IP>"
$hostsEntry = "$internalIP it-management.local"
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"

# ホストファイルに設定がなければ追加
if (-not (Get-Content -Path $hostsPath | Where-Object { $_ -match $hostsEntry })) {
    Add-Content -Path $hostsPath -Value $hostsEntry -Force
    Write-Host "ホストファイルにエントリを追加しました"
}
```

### バックエンドの検証
```powershell
# APIヘルスチェック
Invoke-WebRequest -Uri "https://localhost:5000/health" -SkipCertificateCheck

# 認証テスト
$headers = @{
    "Authorization" = "Bearer $env:TEST_TOKEN"
}
Invoke-WebRequest -Uri "https://localhost:5000/api/v1/self" -Headers $headers -SkipCertificateCheck
```

## デプロイ自動化

オンプレミス環境でのデプロイ自動化スクリプト例：

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
        # ここにロールバック処理を実装
    }
    Log-Message "デプロイ失敗"
    exit 1
}
```

## ロールバック手順

デプロイ失敗時のロールバック手順：

```powershell
# rollback-production.ps1
param (
    [Parameter(Mandatory=$true)]
    [string]$BackupDir
)

# ロギング設定
$logDir = "C:\Logs\ITManagementSystem"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path -Path $logDir -ChildPath "rollback_$timestamp.log"

# ロギング関数
function Log-Message {
    param($message)
    $timeStamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timeStamp - $message" | Tee-Object -FilePath $logFile -Append
}

Log-Message "ロールバック開始: $BackupDir"

# バックアップディレクトリ確認
if (-not (Test-Path -Path $BackupDir)) {
    Log-Message "指定されたバックアップディレクトリが存在しません: $BackupDir"
    exit 1
}

try {
    # サービス停止
    Log-Message "サービス停止中..."
    Stop-Service -Name "ITManagementAPI" -Force
    
    # フロントエンドロールバック
    Log-Message "フロントエンドロールバック中..."
    Copy-Item -Path "$BackupDir\frontend\*" -Destination "C:\inetpub\wwwroot\it-management\" -Recurse -Force
    
    # バックエンドロールバック
    Log-Message "バックエンドロールバック中..."
    Copy-Item -Path "$BackupDir\backend\*" -Destination "C:\path\to\backend\" -Recurse -Force
    
    # サービス開始
    Log-Message "サービス開始中..."
    Start-Service -Name "ITManagementAPI"
    
    # IIS再起動
    Log-Message "IISリセット中..."
    iisreset
    
    Log-Message "ロールバック成功"
} catch {
    Log-Message "ロールバック中にエラーが発生しました: $_"
    Log-Message "ロールバック失敗"
    exit 1
}

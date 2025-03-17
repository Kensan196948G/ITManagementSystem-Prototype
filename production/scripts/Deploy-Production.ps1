# 本番環境デプロイスクリプト
# 使用方法: .\Deploy-Production.ps1 -BackupFirst $true

param (
    [switch]$BackupFirst = $true,
    [string]$InstallPath = "C:\ITManagementSystem",
    [string]$IISSiteName = "ITManagementSystem"
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

# ディレクトリの作成
if (-not (Test-Path -Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

Log-Message "本番環境デプロイを開始します"
Log-Message "インストール先: $InstallPath"
Log-Message "IISサイト名: $IISSiteName"

# バックアップ
if ($BackupFirst) {
    Log-Message "バックアップを実行しています..."
    $backupDir = "C:\Backups\ITManagementSystem\$timestamp"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    # 既存ファイルのバックアップ（存在する場合）
    if (Test-Path -Path $InstallPath) {
        Log-Message "既存ファイルをバックアップ中..."
        Copy-Item -Path "$InstallPath\*" -Destination "$backupDir\" -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    Log-Message "バックアップ完了: $backupDir"
}

try {
    # インストールディレクトリの作成
    if (-not (Test-Path -Path $InstallPath)) {
        Log-Message "インストールディレクトリを作成しています: $InstallPath"
        New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    }
    
    # IISディレクトリの作成
    $iisDir = Join-Path -Path $InstallPath -ChildPath "wwwroot"
    if (-not (Test-Path -Path $iisDir)) {
        Log-Message "IISディレクトリを作成しています: $iisDir"
        New-Item -ItemType Directory -Path $iisDir -Force | Out-Null
    }
    
    # バックエンドディレクトリの作成
    $backendDir = Join-Path -Path $InstallPath -ChildPath "backend"
    if (-not (Test-Path -Path $backendDir)) {
        Log-Message "バックエンドディレクトリを作成しています: $backendDir"
        New-Item -ItemType Directory -Path $backendDir -Force | Out-Null
    }
    
    # 証明書の生成
    Log-Message "自己署名証明書を生成しています..."
    $domain = "it-management.local"
    $certOutputPath = Join-Path -Path $InstallPath -ChildPath "certs"
    New-Item -ItemType Directory -Path $certOutputPath -Force | Out-Null
    
    # 証明書生成スクリプトを実行
    .\Generate-SelfSignedCertificate.ps1 -Domain $domain -OutputPath $certOutputPath
    
    # 実行中のサービスがあれば停止
    Log-Message "既存サービスを停止しています..."
    if (Get-Service -Name "ITManagementAPI" -ErrorAction SilentlyContinue) {
        Stop-Service -Name "ITManagementAPI" -Force
    }
    
    # フロントエンドのビルドとデプロイ
    Log-Message "フロントエンドをビルドしています..."
    Push-Location -Path "..\..\frontend"
    try {
        npm install
        npm run build:prod
        
        Log-Message "フロントエンドファイルをデプロイしています..."
        Copy-Item -Path ".\build\*" -Destination $iisDir -Recurse -Force
    } finally {
        Pop-Location
    }
    
    # バックエンドのデプロイ
    Log-Message "バックエンドをデプロイしています..."
    Push-Location -Path "..\..\backend"
    try {
        pip install -r requirements.txt
        
        Copy-Item -Path ".\*" -Destination $backendDir -Recurse -Force -Exclude "__pycache__", "*.pyc"
    } finally {
        Pop-Location
    }
    
    # 環境変数の設定
    Log-Message "環境変数を設定しています..."
    [Environment]::SetEnvironmentVariable("API_PORT", "5000", "Machine")
    [Environment]::SetEnvironmentVariable("LOG_LEVEL", "info", "Machine")
    [Environment]::SetEnvironmentVariable("MS_CLIENT_ID", "22e5d6e4-805f-4516-af09-ff09c7c224c4", "Machine")
    [Environment]::SetEnvironmentVariable("MS_TENANT_ID", "a7232f7a-a9e5-4f71-9372-dc8b1c6645ea", "Machine")
    
# Apache Webサーバー設定
    Log-Message "Apache Webサーバーを設定しています..."
    
    # Chocolateyがインストールされているか確認
    if (-not (Get-Command -Name choco -ErrorAction SilentlyContinue)) {
        Log-Message "Chocolateyをインストールしています..."
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
    }
    
    # Apacheがインストールされているか確認
    if (-not (Test-Path -Path "C:\tools\Apache24\bin\httpd.exe")) {
        Log-Message "Apacheをインストールしています..."
        choco install apache-httpd -y
    }
    
    # Apache設定ディレクトリ
    $apacheConfDir = "C:\tools\Apache24\conf"
    $apacheSitesDir = "C:\tools\Apache24\conf\sites-available"
    
    # sites-availableディレクトリがなければ作成
    if (-not (Test-Path -Path $apacheSitesDir)) {
        New-Item -ItemType Directory -Path $apacheSitesDir -Force | Out-Null
        Log-Message "Apache sites-availableディレクトリを作成しました"
    }
    
    # SSL証明書のパス
    $certFile = Join-Path -Path $certOutputPath -ChildPath "$domain.cer"
    $keyFile = Join-Path -Path $certOutputPath -ChildPath "$domain.key"
    
    # 証明書ファイルをPEMに変換（Apacheで使用するため）
    if (Test-Path -Path "$certOutputPath\$domain.pfx") {
        Log-Message "SSL証明書をApache用に変換しています..."
        
        # openssl.exeがあるか確認
        if (-not (Get-Command -Name openssl -ErrorAction SilentlyContinue)) {
            Log-Message "OpenSSLをインストールしています..."
            choco install openssl -y
        }
        
        # 証明書と秘密鍵の抽出
        $opensslCmd = "openssl pkcs12 -in `"$certOutputPath\$domain.pfx`" -clcerts -nokeys -out `"$certFile`" -passin pass:$Password"
        Invoke-Expression $opensslCmd
        
        $opensslKeyCmd = "openssl pkcs12 -in `"$certOutputPath\$domain.pfx`" -nocerts -out `"$keyFile`" -passin pass:$Password -passout pass:$Password"
        Invoke-Expression $opensslKeyCmd
        
        # 秘密鍵からパスフレーズを削除
        $opensslDecryptCmd = "openssl rsa -in `"$keyFile`" -out `"$keyFile`" -passin pass:$Password"
        Invoke-Expression $opensslDecryptCmd
    }
    
    # httpd.conf設定
    $httpdConfPath = Join-Path -Path $apacheConfDir -ChildPath "httpd.conf"
    Log-Message "Apache設定ファイルを更新しています..."
    
    # SSLモジュール有効化確認
    $sslModuleLine = 'LoadModule ssl_module modules/mod_ssl.so'
    if (-not (Select-String -Path $httpdConfPath -Pattern $sslModuleLine -SimpleMatch -Quiet)) {
        Add-Content -Path $httpdConfPath -Value "`n# Enable SSL Module`n$sslModuleLine"
    }
    
    # SSL設定ファイル読み込み確認
    $sslConfInclude = 'Include conf/extra/httpd-ssl.conf'
    if (-not (Select-String -Path $httpdConfPath -Pattern $sslConfInclude -SimpleMatch -Quiet)) {
        Add-Content -Path $httpdConfPath -Value "`n# Include SSL Configuration`n$sslConfInclude"
    }
    
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
    
    # 仮想ホスト設定ファイル作成
    $virtualHostConf = Join-Path -Path $apacheSitesDir -ChildPath "$domain.conf"
    Log-Message "Apache仮想ホスト設定を作成しています: $virtualHostConf"
    
    @"
<VirtualHost *:443>
    ServerName $domain
    DocumentRoot "$iisDir"
    ErrorLog "logs/$domain-error.log"
    CustomLog "logs/$domain-access.log" common

    SSLEngine on
    SSLCertificateFile "$certFile"
    SSLCertificateKeyFile "$keyFile"

    <Directory "$iisDir">
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
    
    # Windows Serviceとしてバックエンドを登録
    $serviceScriptPath = Join-Path -Path $InstallPath -ChildPath "BackendService.ps1"
    Log-Message "バックエンドサービススクリプトを作成しています: $serviceScriptPath"
    @"
# バックエンドサービス起動スクリプト
`$env:PYTHONPATH = "$backendDir"
python "$backendDir\main.py"
"@ | Out-File -FilePath $serviceScriptPath -Encoding utf8
    
    # サービスが存在しない場合のみ新規作成
    if (-not (Get-Service -Name "ITManagementAPI" -ErrorAction SilentlyContinue)) {
        Log-Message "バックエンドサービスを登録しています..."
        $nssm = "C:\Windows\System32\nssm.exe" # nssmがインストールされている前提
        if (Test-Path $nssm) {
            & $nssm install ITManagementAPI powershell.exe "-ExecutionPolicy Bypass -File $serviceScriptPath"
            & $nssm set ITManagementAPI Description "ITマネジメントシステムAPI"
            & $nssm set ITManagementAPI Start SERVICE_AUTO_START
        } else {
            Log-Message "警告: nssmが見つかりません。サービスは手動で登録する必要があります。"
        }
    }
    
    # サービスを開始
    Log-Message "バックエンドサービスを開始しています..."
    Start-Service -Name "ITManagementAPI" -ErrorAction SilentlyContinue
    
    # ファイアウォール設定
    Log-Message "ファイアウォール設定を構成しています..."
    New-NetFirewallRule -DisplayName "IT Management HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "IT Management API" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow -ErrorAction SilentlyContinue
    
    Log-Message "デプロイ成功！"
    Log-Message "アクセスURL: https://$domain"
    Log-Message "クライアントPCからアクセスするには、ホストファイルに以下を追加してください:"
    Log-Message "<サーバー内部IP> $domain"
    
} catch {
    Log-Message "エラーが発生しました: $_"
    if ($BackupFirst) {
        Log-Message "ロールバックオプションを検討してください: .\Rollback-Production.ps1 -BackupDir '$backupDir'"
    }
    Log-Message "デプロイ失敗"
    exit 1
}

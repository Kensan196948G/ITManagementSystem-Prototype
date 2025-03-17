# 本番環境ロールバックスクリプト
# 使用方法: .\Rollback-Production.ps1 -BackupDir "C:\Backups\ITManagementSystem\20250317_121530"

param (
    [Parameter(Mandatory=$true)]
    [string]$BackupDir,
    [string]$InstallPath = "C:\ITManagementSystem",
    [string]$IISSiteName = "ITManagementSystem"
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

# ディレクトリの確認
if (-not (Test-Path -Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

Log-Message "本番環境ロールバックを開始します"
Log-Message "バックアップディレクトリ: $BackupDir"
Log-Message "インストール先: $InstallPath"

# バックアップディレクトリ確認
if (-not (Test-Path -Path $BackupDir)) {
    Log-Message "指定されたバックアップディレクトリが存在しません: $BackupDir"
    exit 1
}

try {
    # サービス停止
    Log-Message "サービスを停止しています..."
    if (Get-Service -Name "ITManagementAPI" -ErrorAction SilentlyContinue) {
        Stop-Service -Name "ITManagementAPI" -Force
    }
    
    # Apacheサービス停止
    Log-Message "Apache HTTPDサービスを停止しています..."
    Stop-Service -Name "Apache2.4" -Force -ErrorAction SilentlyContinue
    
    # ファイルのロールバック
    Log-Message "ファイルをロールバックしています..."
    if (Test-Path -Path $InstallPath) {
        # 現在のファイルを一時バックアップ（トラブルシューティング用）
        $tempBackupDir = Join-Path -Path "C:\Backups\ITManagementSystem" -ChildPath "pre_rollback_$timestamp"
        Log-Message "現在の状態を一時バックアップしています: $tempBackupDir"
        New-Item -ItemType Directory -Path $tempBackupDir -Force | Out-Null
        Copy-Item -Path "$InstallPath\*" -Destination $tempBackupDir -Recurse -Force -ErrorAction SilentlyContinue
        
        # バックアップからファイル復元
        Log-Message "バックアップからファイルを復元しています..."
        Copy-Item -Path "$BackupDir\*" -Destination $InstallPath -Recurse -Force
    } else {
        Log-Message "インストールディレクトリが存在しません。新規作成します: $InstallPath"
        New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
        Copy-Item -Path "$BackupDir\*" -Destination $InstallPath -Recurse -Force
    }
    
    # Apache設定の復元
    Log-Message "Apache設定ファイルを復元しています..."
    $domain = "it-management.local"
    $apacheConfDir = "C:\tools\Apache24\conf"
    $apacheSitesDir = "C:\tools\Apache24\conf\sites-available"
    $backupApacheConf = Join-Path -Path $BackupDir -ChildPath "apache\conf"
    
    # Apache設定ディレクトリのバックアップがあれば復元
    if (Test-Path -Path $backupApacheConf) {
        Copy-Item -Path "$backupApacheConf\*" -Destination $apacheConfDir -Recurse -Force -ErrorAction SilentlyContinue
        Log-Message "Apache設定を復元しました"
    } else {
        Log-Message "警告: Apache設定のバックアップが見つかりません。デフォルト設定を使用します。"
        
        # sites-availableディレクトリがなければ作成
        if (-not (Test-Path -Path $apacheSitesDir)) {
            New-Item -ItemType Directory -Path $apacheSitesDir -Force | Out-Null
        }
        
        # 仮想ホスト設定を再作成
        $virtualHostConf = Join-Path -Path $apacheSitesDir -ChildPath "$domain.conf"
        $wwwroot = Join-Path -Path $InstallPath -ChildPath "wwwroot"
        $certFile = Join-Path -Path $InstallPath -ChildPath "certs\$domain.cer"
        $keyFile = Join-Path -Path $InstallPath -ChildPath "certs\$domain.key"
        
        @"
<VirtualHost *:443>
    ServerName $domain
    DocumentRoot "$wwwroot"
    ErrorLog "logs/$domain-error.log"
    CustomLog "logs/$domain-access.log" common

    SSLEngine on
    SSLCertificateFile "$certFile"
    SSLCertificateKeyFile "$keyFile"

    <Directory "$wwwroot">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # API呼び出しをバックエンドに転送
    ProxyPass /api http://localhost:5000/api
    ProxyPassReverse /api http://localhost:5000/api
</VirtualHost>
"@ | Out-File -FilePath $virtualHostConf -Encoding utf8
        
        Log-Message "Apache仮想ホスト設定を再作成しました: $virtualHostConf"
    }
    
    # サービス開始
    Log-Message "バックエンドサービスを開始しています..."
    Start-Service -Name "ITManagementAPI" -ErrorAction SilentlyContinue
    
    # IISリセット（念のため）
    Log-Message "IISをリセットしています..."
    iisreset
    
    Log-Message "ロールバック成功！"
    Log-Message "以前のバージョンに正常に戻りました"
    
} catch {
    Log-Message "ロールバック中にエラーが発生しました: $_"
    Log-Message "ロールバック失敗"
    exit 1
}

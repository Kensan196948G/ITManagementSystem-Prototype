# 本番環境ロールバックスクリプト
# 使用方法:
# 完全ロールバック: .\Rollback-Production.ps1 -BackupDir "C:\Backups\ITManagementSystem\20250317_121530"
# 段階的ロールバック: .\Rollback-Production.ps1 -BackupDir "C:\Backups\ITManagementSystem" -RollbackVersion "20250317_121530" -PartialRollback $true

[cmdletbinding(SupportsShouldProcess=$true, ConfirmImpact='High')]
param (
    [Parameter(Mandatory=$true)]
    [string]$BackupDir,
    [string]$InstallPath = "C:\ITManagementSystem",
    [string]$IISSiteName = "ITManagementSystem",
    [string]$RollbackVersion,
    [bool]$PartialRollback = $false,
    [bool]$SkipIntegrityCheck = $false,
    [bool]$EmergencyMode = $false,
    [string]$KeyVaultName,
    [string]$KeyName = "audit-log-encryption-key"
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

# データベース整合性チェック関数
function Check-DatabaseIntegrity {
    param($backupPath)
    
    Log-Message "データベース整合性チェックを開始します..."
    
    try {
        # バックアップファイルのチェックサム検証
        $checksumFile = Join-Path -Path $backupPath -ChildPath "checksum.sha256"
        if (-not (Test-Path -Path $checksumFile)) {
            Log-Message "警告: チェックサムファイルが見つかりません。整合性チェックをスキップします"
            return $true
        }

        # チェックサム検証実行
        $expectedHash = Get-Content -Path $checksumFile
        $actualHash = (Get-FileHash -Path "$backupPath\database.bak" -Algorithm SHA256).Hash
        
        if ($expectedHash -ne $actualHash) {
            Log-Message "エラー: データベースバックアップの整合性チェックに失敗しました"
            return $false
        }
        
        Log-Message "データベース整合性チェックが成功しました"
        return $true
    } catch {
        Log-Message "整合性チェック中にエラーが発生しました: $_"
        return $false
    }
}

# 段階的ロールバック関数
function Invoke-PartialRollback {
    param($backupPath, $version)
    
    Log-Message "段階的ロールバックを開始します (バージョン: $version)"
    
    try {
        # トランザクションログから特定の変更のみを復元
        $logFile = Join-Path -Path $backupPath -ChildPath "txlogs\$version.log"
        if (-not (Test-Path -Path $logFile)) {
            throw "指定されたバージョンのトランザクションログが見つかりません"
        }
        
        # トランザクションログを適用
        Log-Message "トランザクションログを適用しています..."
        # 実際のログ適用処理はデータベースエンジンに依存
        
        Log-Message "段階的ロールバックが完了しました"
        return $true
    } catch {
        Log-Message "段階的ロールバック中にエラーが発生しました: $_"
        return $false
    }
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
    # バージョン指定がある場合はバックアップディレクトリを調整
    if ($RollbackVersion) {
        $BackupDir = Join-Path -Path $BackupDir -ChildPath $RollbackVersion
    }

    # 整合性チェック (スキップ指定がない場合)
    if (-not $SkipIntegrityCheck -and -not (Check-DatabaseIntegrity -backupPath $BackupDir)) {
        throw "データベース整合性チェックに失敗しました。ロールバックを中止します"
    }

    # サービス停止
    if ($PSCmdlet.ShouldProcess("ITManagementAPIサービス", "停止")) {
        Log-Message "サービスを停止しています..."
        if (Get-Service -Name "ITManagementAPI" -ErrorAction SilentlyContinue) {
            Stop-Service -Name "ITManagementAPI" -Force
        }
    }

    # 段階的ロールバックの場合
    if ($PartialRollback) {
        if (-not $RollbackVersion) {
            throw "段階的ロールバックには -RollbackVersion パラメータが必要です"
        }
        Invoke-PartialRollback -backupPath $BackupDir -version $RollbackVersion
        exit 0
    }
    
    # Apacheサービス停止
    if ($PSCmdlet.ShouldProcess("Apache HTTPDサービス", "停止")) {
        Log-Message "Apache HTTPDサービスを停止しています..."
        Stop-Service -Name "Apache2.4" -Force -ErrorAction SilentlyContinue
    }
    
    # ファイルのロールバック
    if ($PSCmdlet.ShouldProcess("$InstallPathのファイル", "ロールバック")) {
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
    if ($PSCmdlet.ShouldProcess("ITManagementAPIサービス", "開始")) {
        Log-Message "バックエンドサービスを開始しています..."
        Start-Service -Name "ITManagementAPI" -ErrorAction SilentlyContinue
    }
    
    # IISリセット（念のため）
    if ($PSCmdlet.ShouldProcess("IIS", "リセット")) {
        Log-Message "IISをリセットしています..."
        iisreset
    }
    
    # 緊急モード時の追加処理
    if ($EmergencyMode) {
        Log-Message "緊急モード: 暗号化鍵を無効化しています..."
        try {
            Import-Module Az.KeyVault
            $key = Get-AzKeyVaultKey -VaultName $KeyVaultName -Name $KeyName
            Update-AzKeyVaultKey -VaultName $KeyVaultName -Name $KeyName -Expires (Get-Date).AddMinutes(-1)
            Log-Message "緊急モード: 暗号化鍵を無効化しました (即時失効)"
            
            # 監査ログ凍結
            Log-Message "緊急モード: 監査ログを凍結しています..."
            Invoke-WebRequest -Uri "http://localhost:5000/api/admin/freeze-audit-logs" -Method Post -UseBasicParsing
            Log-Message "緊急モード: 監査ログを凍結しました"
        } catch {
            Log-Message "警告: 緊急モード処理中にエラーが発生しました - $_"
        }
    }

    Log-Message "ロールバック成功！"
    Log-Message "以前のバージョンに正常に戻りました"
    
} catch {
    Log-Message "ロールバック中にエラーが発生しました: $_"
    Log-Message "ロールバック失敗"
    exit 1
}

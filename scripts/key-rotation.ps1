<# 
.SYNOPSIS
Azure Key Vaultの暗号化鍵をローテーションし、既存データを再暗号化するスクリプト

.DESCRIPTION
このスクリプトは:
1. Azure Key Vaultに新しい鍵バージョンを作成
2. 古い鍵で暗号化されたデータを検索
3. 新しい鍵で再暗号化
4. 監査ログに操作記録
#>

param(
    [string]$KeyVaultName = $(throw "KeyVaultName is required"),
    [string]$KeyName = "audit-log-encryption-key",
    [int]$KeyExpiryMonths = 12
)

# モジュールインポート
Import-Module Az.KeyVault
Import-Module Az.Accounts

try {
    # Azureに接続
    Connect-AzAccount -Identity

    # HSMで新しい鍵バージョンを作成
    $hsmParams = @{
        VaultName   = $KeyVaultName
        Name        = $KeyName
        Destination = "HSM"
        Expires     = (Get-Date).AddMonths($KeyExpiryMonths)
        NotBefore   = (Get-Date)
        KeyOps      = @('encrypt', 'decrypt', 'wrapKey', 'unwrapKey')
        Size        = 2048  # FIPS 140-2 Level 3準拠
    }

    try {
        $newKey = Add-AzKeyVaultKey @hsmParams
        Write-Host "HSMで新しい鍵バージョンが作成されました: $($newKey.Version)"
        
        # フォールバック用にTPM保護鍵を生成
        $tpmKey = New-TpmProtectedKey -Algorithm RSA -KeySize 2048
        Register-TpmKeyBackup -Key $tpmKey -Path ".\$KeyName-tpm-backup.key"
        
    } catch {
        Write-Warning "HSM鍵作成失敗: $_"
        Write-Host "ソフトウェア鍵でフォールバックします"
        $newKey = Add-AzKeyVaultKey -VaultName $KeyVaultName -Name $KeyName `
            -Destination "Software" -Expires $hsmParams.Expires -NotBefore $hsmParams.NotBefore
    }
    
    Write-Host "新しい鍵バージョンが作成されました: $($newKey.Version)"

    # 古い鍵バージョンを取得 (最新から2番目)
    $oldKeys = Get-AzKeyVaultKey -VaultName $KeyVaultName -Name $KeyName -IncludeVersions
    $oldKey = $oldKeys | Sort-Object Created -Descending | Select-Object -Skip 1 -First 1

    if (-not $oldKey) {
        Write-Host "ローテーション対象の古い鍵が見つかりませんでした"
        exit 0
    }

    Write-Host "古い鍵バージョンを検出: $($oldKey.Version)"

    # 暗号化データのバッチ再暗号化
    $batchSize = 100
    $totalRecords = Get-EncryptedRecordCount -KeyVersion $oldKey.Version
    $batches = [math]::Ceiling($totalRecords / $batchSize)
    
    for ($i = 0; $i -lt $batches; $i++) {
        $records = Get-EncryptedRecordsBatch -KeyVersion $oldKey.Version `
            -Skip ($i * $batchSize) -Take $batchSize
        
        # 非同期でバッチ再暗号化
        $jobs = @()
        foreach ($record in $records) {
            $jobs += Start-ThreadJob -ScriptBlock {
                param($record, $oldKey, $newKey, $KeyVaultName)
                
                try {
                    $decrypted = Invoke-HsmDecrypt -VaultName $KeyVaultName `
                        -KeyVersion $oldKey.Version -Ciphertext $record.Data
                    
                    $reencrypted = Invoke-HsmEncrypt -VaultName $KeyVaultName `
                        -KeyVersion $newKey.Version -Plaintext $decrypted
                    
                    Update-EncryptedRecord -Id $record.Id -Data $reencrypted `
                        -KeyVersion $newKey.Version -Iv $record.Iv
                    
                    return @{Id=$record.Id; Status="Success"}
                } catch {
                    return @{Id=$record.Id; Status="Failed"; Error=$_.Exception.Message}
                }
            } -ArgumentList $record, $oldKey, $newKey, $KeyVaultName
        }
        
        # 進捗表示
        $completed = 0
        while ($jobs.Count -gt 0) {
            $completed += (Get-Job -State Completed).Count
            Write-Progress -Activity "再暗号化処理中" `
                -Status "$($i+1)/$batches バッチ目 ($completed/$batchSize レコード完了)" `
                -PercentComplete (($completed / $batchSize) * 100)
            
            Start-Sleep -Milliseconds 500
        }
        
        # 結果を監査ログに記録
        $results = $jobs | Receive-Job | ConvertTo-Json -Depth 3
        Add-AuditLog -Operation "BatchReencryption" -Details $results `
            -BatchNumber $i -TotalBatches $batches
    }

    # 監査ログに記録
    $auditLog = @{
        Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
        Operation = "KeyRotation"
        KeyVault = $KeyVaultName
        KeyName = $KeyName
        OldKeyVersion = $oldKey.Version
        NewKeyVersion = $newKey.Version
        Status = "Completed"
    }

    # 監査ログをブロックチェーンに記録
    $blockchainTx = Submit-ToHyperledger -Operation "KeyRotation" -Details $auditLog
    $auditLog['BlockchainTx'] = $blockchainTx
    
    # 監査ログを複数箇所に保存
    $auditLog | ConvertTo-Json -Depth 5 | Out-File -FilePath ".\key-rotation-audit.log" -Append
    Add-AzLogAnalytics -WorkspaceId $env:LOG_ANALYTICS_WORKSPACE_ID -LogType "KeyRotation" -Data $auditLog

    Write-Host "鍵ローテーションが正常に完了しました"
}
catch {
    Write-Error "鍵ローテーション中にエラーが発生しました: $_"
    
    # エラーを監査ログに記録
    @{
        Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
        Operation = "KeyRotation"
        KeyVault = $KeyVaultName
        KeyName = $KeyName
        Error = $_.Exception.Message
        Status = "Failed"
    } | ConvertTo-Json | Out-File -FilePath ".\key-rotation-audit.log" -Append

    exit 1
}
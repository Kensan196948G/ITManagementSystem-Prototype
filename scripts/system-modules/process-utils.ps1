# プロセス管理モジュール
function Start-Servers {
    Write-Log "サーバー起動処理を開始します" -Level INFO
    
    # バックエンドサーバー起動
    try {
        $Global:BackendProcess = Start-Process -FilePath "python" -ArgumentList "main.py" -WorkingDirectory $backendPath -PassThru -NoNewWindow
        Write-Log "バックエンドサーバーを起動しました (PID: $($Global:BackendProcess.Id))" -Level INFO
    }
    catch {
        Write-Log "バックエンドサーバーの起動に失敗しました: $_" -Level ERROR
        throw
    }

    # フロントエンドサーバー起動
    try {
        $Global:FrontendProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $frontendPath -PassThru -NoNewWindow
        Write-Log "フロントエンドサーバーを起動しました (PID: $($Global:FrontendProcess.Id))" -Level INFO
    }
    catch {
        Write-Log "フロントエンドサーバーの起動に失敗しました: $_" -Level ERROR
        Stop-ServersQuietly
        throw
    }
}

function Stop-Servers {
    Write-Log "サーバー停止処理を開始します" -Level INFO
    $Global:stopInProgress = $true

    try {
        if ($Global:FrontendProcess -and -not $Global:FrontendProcess.HasExited) {
            Stop-Process -Id $Global:FrontendProcess.Id -Force
            Write-Log "フロントエンドサーバーを停止しました (PID: $($Global:FrontendProcess.Id))" -Level INFO
        }

        if ($Global:BackendProcess -and -not $Global:BackendProcess.HasExited) {
            Stop-Process -Id $Global:BackendProcess.Id -Force
            Write-Log "バックエンドサーバーを停止しました (PID: $($Global:BackendProcess.Id))" -Level INFO
        }
    }
    catch {
        Write-Log "サーバー停止中にエラーが発生しました: $_" -Level ERROR
    }
    finally {
        $Global:stopInProgress = $false
    }
}

function Stop-ServersQuietly {
    try {
        if ($Global:FrontendProcess -and -not $Global:FrontendProcess.HasExited) {
            Stop-Process -Id $Global:FrontendProcess.Id -Force -ErrorAction SilentlyContinue
        }

        if ($Global:BackendProcess -and -not $Global:BackendProcess.HasExited) {
            Stop-Process -Id $Global:BackendProcess.Id -Force -ErrorAction SilentlyContinue
        }
    }
    catch {
        # エラーを無視（クワイエットモード）
    }
}

function Show-SuccessMessage {
    Write-Host "`nシステムが正常に起動しました" -ForegroundColor Green
    Write-Host "バックエンド: http://localhost:5000" -ForegroundColor Cyan
    Write-Host "フロントエンド: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "`n停止するにはスクリプトを再度実行し -stop オプションを指定してください`n" -ForegroundColor Yellow
}
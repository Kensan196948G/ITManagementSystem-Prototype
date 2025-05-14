# ITサービス管理システム起動スクリプト（最適化版）
# バックエンド(Flask)とフロントエンド(React)を管理

# グローバル設定
$Global:ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Global:RepairLogFile = Join-Path $Global:ProjectRoot "repair_log.txt"
$Global:BackendProcess = $null
$Global:FrontendProcess = $null
$Global:stopInProgress = $false

# パス設定
$backendPath = Join-Path $Global:ProjectRoot "backend"
$frontendPath = Join-Path $Global:ProjectRoot "frontend"
$pythonVenvPath = Join-Path $backendPath "venv"
$logPath = Join-Path $Global:ProjectRoot "logs"

# パラメータ処理
param(
    [switch]$install,
    [switch]$stop,
    [switch]$help
)

# モジュールインポート
. "$PSScriptRoot\system-modules\logging.ps1"
. "$PSScriptRoot\system-modules\process-utils.ps1"
. "$PSScriptRoot\system-modules\dependencies.ps1"

# メイン処理
try {
    if ($help) { Show-Help; exit 0 }
    if ($stop) { Stop-Servers; exit 0 }
    
    Initialize-Environment
    
    # 依存関係チェック（詳細版）
    $depCheck = Test-SystemDependencies -Detailed
    if (-not $depCheck.Success) {
        Write-Log "依存関係チェック失敗: $($depCheck.Message)" -Level ERROR
        exit 1
    }

    if ($install) {
        Install-Dependencies -Force
        Write-Log "依存関係のインストールが完了しました" -Level INFO
        exit 0
    }
    
    # サービス起動
    $startResult = Start-Servers -WithMonitoring
    if (-not $startResult.Success) {
        throw $startResult.Error
    }
    
    Show-SuccessMessage
    Write-Log "システムが正常に起動しました" -Level INFO
}
catch {
    $errorMsg = "致命的なエラー: $($_.Exception.Message)`nStackTrace: $($_.ScriptStackTrace)"
    Write-Log $errorMsg -Level FATAL
    Stop-ServersQuietly
    Write-Log "システムを緊急停止しました" -Level WARNING
    exit 1
}

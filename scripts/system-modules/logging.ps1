# ロギングモジュール
function Write-Log {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,
        [ValidateSet("INFO", "WARN", "ERROR", "DEBUG")]
        [string]$Level = "INFO",
        [switch]$NoConsoleOutput,
        [System.Management.Automation.ErrorRecord]$ErrorRecordForLog
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"

    if ($ErrorRecordForLog) {
        $logEntry += "`nError Details: $($ErrorRecordForLog.ToString())"
    }

    try {
        Add-Content -Path $Global:RepairLogFile -Value $logEntry -Encoding UTF8
    }
    catch {
        Write-Warning "ログ書き込み失敗: $($_.Exception.Message)"
    }

    if (-not $NoConsoleOutput) {
        switch ($Level) {
            "INFO" { Write-Host $logEntry -ForegroundColor Green }
            "WARN" { Write-Host $logEntry -ForegroundColor Yellow }
            "ERROR" { Write-Host $logEntry -ForegroundColor Red }
            "DEBUG" { Write-Host $logEntry -ForegroundColor Cyan }
        }
    }
}

function Initialize-Logging {
    try {
        if (-not (Test-Path (Split-Path $Global:RepairLogFile -Parent))) {
            New-Item -Path (Split-Path $Global:RepairLogFile -Parent) -ItemType Directory -Force | Out-Null
        }
        if (-not (Test-Path $Global:RepairLogFile)) {
            New-Item -Path $Global:RepairLogFile -ItemType File -Force | Out-Null
        }
    }
    catch {
        Write-Warning "ログ初期化失敗: $($_.Exception.Message)"
    }
}
# パラメータ処理 - PowerShellではparamブロックはスクリプトの先頭に配置する必要があります
param(
    [Parameter()]
    [switch]$install,
    
    [Parameter()]
    [switch]$stop,
    
    [Parameter()]
    [switch]$help
)

# ITサービス管理システム起動スクリプト
# バックエンド(Flask)とフロントエンド(React)を同時に起動します

# --- グローバル変数定義 ---
$Global:ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Global:RepairLogFile = Join-Path $Global:ProjectRoot "repair_log.txt" # ログファイルパス

# --- ログ出力およびコマンド実行ヘルパー関数 ---

# 改修: ログ出力関数を追加
# Level: INFO, WARN, ERROR, DEBUG
function Write-Log {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,

        [Parameter(Mandatory = $false)]
        [ValidateSet("INFO", "WARN", "ERROR", "DEBUG")]
        [string]$Level = "INFO",

        [Parameter(Mandatory = $false)]
        [switch]$NoConsoleOutput,

        [Parameter(Mandatory = $false)]
        [System.Management.Automation.ErrorRecord]$ErrorRecordForLog # エラーオブジェクトを直接渡す場合
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntryBase = "[$timestamp] [$Level] $Message"
    
    $logEntry = $logEntryBase
    if ($ErrorRecordForLog) {
        $logEntry += "`nError Details: $($ErrorRecordForLog.ToString())`nInvocationInfo: $($ErrorRecordForLog.InvocationInfo.Line)`nScriptStackTrace: $($ErrorRecordForLog.ScriptStackTrace)"
    }

    try {
        # 改修: ログ書き込みの信頼性向上 - 既存のtry-catchでファイル書き込みエラーをハンドルし、コンソールに警告
        Add-Content -Path $Global:RepairLogFile -Value $logEntry -Encoding UTF8 -ErrorAction Stop
    }
    catch {
        # ログファイルへの書き込み失敗はコンソールへの警告のみとする (無限ループ防止)
        Write-Warning "[$timestamp] [ERROR] Failed to write to repair_log.txt: $($_.Exception.Message). Original Log Entry: $logEntry"
    }

    if (-not $NoConsoleOutput) {
        $consoleMessage = $logEntryBase # コンソールには基本メッセージのみ表示 (エラー詳細はログファイル参照)
        switch ($Level) {
            "INFO" { Write-Host $consoleMessage -ForegroundColor Green }
            "WARN" { Write-Host $consoleMessage -ForegroundColor Yellow }
            "ERROR" { Write-Host $consoleMessage -ForegroundColor Red }
            "DEBUG" { Write-Host $consoleMessage -ForegroundColor Cyan }
            default { Write-Host $consoleMessage }
        }
    }
}

# 改修: ログファイルの初期化処理を追加
try {
    if (-not (Test-Path (Split-Path $Global:RepairLogFile -Parent))) {
        New-Item -Path (Split-Path $Global:RepairLogFile -Parent) -ItemType Directory -Force -ErrorAction Stop | Out-Null
    }
    if (Test-Path $Global:RepairLogFile) {
        Clear-Content -Path $Global:RepairLogFile -ErrorAction SilentlyContinue
        Write-Log -Message "Initialized (cleared) repair log file: $Global:RepairLogFile" -Level INFO -NoConsoleOutput # 初期化ログはファイルのみ
    }
    else {
        New-Item -Path $Global:RepairLogFile -ItemType File -Force -ErrorAction Stop | Out-Null
        Write-Log -Message "Created repair log file: $Global:RepairLogFile" -Level INFO -NoConsoleOutput # 初期化ログはファイルのみ
    }
}
catch {
    Write-Warning "Critical error initializing repair_log.txt: $($_.Exception.Message). Script may not log correctly."
}


# 改修: コマンド実行とロギング関数を追加
# Returns: $true if success, $false if failure. $LASTEXITCODE は呼び出し側で確認が必要な場合がある。
function Execute-CommandWithLogging {
    param(
        [Parameter(Mandatory = $true)]
        [string]$CommandDescription, # ログ用のコマンド説明

        [Parameter(Mandatory = $true)]
        [scriptblock]$ScriptBlock,

        [Parameter(Mandatory = $false)]
        [string]$WorkingDirectory = (Get-Location).Path,
        
        [Parameter(Mandatory = $false)]
        [switch]$StopOnError = $true, # デフォルトではエラー時にスクリプトを停止

        [Parameter(Mandatory = $false)]
        [string]$SuccessMessageOverride, 

        [Parameter(Mandatory = $false)]
        [string]$FailureMessageOverride,

        [Parameter(Mandatory = $false)]
        [System.Collections.IDictionary]$EnvironmentVariables = @{}, # コマンド実行時に設定する環境変数

        [Parameter(Mandatory = $false)]
        [array]$ArgumentList # 改修: $using: 変数参照を避けるため、スクリプトブロックに引数を渡す
    )

    Write-Log -Message "Starting: $CommandDescription (CWD: $WorkingDirectory)" -Level INFO
    
    $originalLocation = Get-Location
    $originalEnvVars = @{} # 元の環境変数を保存
    $success = $false
    $outputLog = [System.Text.StringBuilder]::new()

    try {
        # 環境変数を設定
        foreach ($key in $EnvironmentVariables.Keys) {
            $originalEnvVars[$key] = Get-Content "Env:$key" -ErrorAction SilentlyContinue
            Set-Content "Env:$key" -Value $EnvironmentVariables[$key]
            Write-Log -Message "Set temporary environment variable: $key = $($EnvironmentVariables[$key])" -Level DEBUG
        }

        if (Test-Path $WorkingDirectory -PathType Container) {
            if ($WorkingDirectory -ne $originalLocation.Path) {
                Set-Location -Path $WorkingDirectory -ErrorAction Stop
            }
        }
        else {
            Write-Log -Message "Working directory '$WorkingDirectory' not found or not a directory. Using current: $($originalLocation.Path)." -Level WARN
            $WorkingDirectory = $originalLocation.Path # 念のため
        }
        
        $ErrorActionPreferenceBackup = $ErrorActionPreference
        $ErrorActionPreference = "Continue" # ScriptBlock 内のエラーをキャッチしやすくする

        # 改修: $using: 変数参照を避けるため -ArgumentList を使用
        $processOutput = Invoke-Command -ScriptBlock $ScriptBlock -ArgumentList $ArgumentList -ErrorVariable errStream -InformationAction Continue *>&1
        # PowerShell 7+ では Invoke-Command の *>&1 がうまく機能する。古いバージョンでは挙動が異なる可能性あり。
        # $processOutput には標準出力、標準エラー、警告、詳細、デバッグ、情報ストリームが含まれる可能性がある。

        if ($processOutput) {
            foreach ($line in $processOutput) {
                $outputLog.AppendLine($line.ToString()) | Out-Null
            }
        }

        # $LASTEXITCODE は外部コマンド実行後にのみ信頼できる
        # 多くのPowerShellコマンドレットは $LASTEXITCODE を設定しない
        $exitCode = if ($LASTEXITCODE -ne $null) { $LASTEXITCODE } else { 0 } # デフォルトは0(成功)

        if ($errStream.Count -eq 0 -and $exitCode -eq 0) {
            $success = $true
            $logMessage = if ([string]::IsNullOrEmpty($SuccessMessageOverride)) {
                "Successfully completed: $CommandDescription"
            }
            else {
                $SuccessMessageOverride
            }
            Write-Log -Message $logMessage -Level INFO
            if ($outputLog.Length -gt 0) {
                Write-Log -Message "Output from '$CommandDescription':`n$($outputLog.ToString())" -Level DEBUG -NoConsoleOutput
            }
        }
        else {
            $success = $false 
            $errorMessageCombined = ""
            if ($errStream.Count -gt 0) {
                $errorMessageCombined += "Error Stream: " + (($errStream | ForEach-Object { $_.ToString() }) -join [Environment]::NewLine)
            }
            if ($exitCode -ne 0) {
                $errorMessageCombined += "`nExit Code: $exitCode"
            }
            if ($outputLog.Length -gt 0 -and $errStream.Count -eq 0) {
                # エラーストリームはないが、出力にエラーが含まれる場合
                $errorMessageCombined += "`nOutput potentially contains error: $($outputLog.ToString())"
            }


            $logMessage = if ([string]::IsNullOrEmpty($FailureMessageOverride)) {
                "Failed: $CommandDescription. Details: $errorMessageCombined"
            }
            else {
                "$FailureMessageOverride. Details: $errorMessageCombined"
            }
            Write-Log -Message $logMessage -Level ERROR
            if ($outputLog.Length -gt 0) {
                # 失敗時も通常出力はDEBUGログへ
                Write-Log -Message "Full output from (failed) '$CommandDescription':`n$($outputLog.ToString())" -Level DEBUG -NoConsoleOutput
            }

            if ($StopOnError) {
                Write-Log -Message "Stopping script due to error in '$CommandDescription'." -Level ERROR
                Stop-ServersQuietly # エラー時は静かに停止試行
                exit 1
            }
        }
    }
    catch {
        $success = $false
        $currentError = $_
        $logMessage = if ([string]::IsNullOrEmpty($FailureMessageOverride)) {
            "Critical error executing '$CommandDescription': $($currentError.Exception.Message)"
        }
        else {
            "$FailureMessageOverride. Critical error: $($currentError.Exception.Message)"
        }
        Write-Log -Message $logMessage -Level ERROR -ErrorRecordForLog $currentError
        if ($outputLog.Length -gt 0) {
            Write-Log -Message "Output before critical error from '$CommandDescription':`n$($outputLog.ToString())" -Level DEBUG -NoConsoleOutput
        }
        if ($StopOnError) {
            Write-Log -Message "Stopping script due to critical error in '$CommandDescription'." -Level ERROR
            Stop-ServersQuietly # エラー時は静かに停止試行
            exit 1
        }
    }
    finally {
        $ErrorActionPreference = $ErrorActionPreferenceBackup
        if ($WorkingDirectory -ne $originalLocation.Path) {
            Set-Location -Path $originalLocation -ErrorAction SilentlyContinue
        }
        # 環境変数を元に戻す
        foreach ($key in $originalEnvVars.Keys) {
            if ($originalEnvVars[$key] -eq $null) {
                Remove-Item "Env:$key" -ErrorAction SilentlyContinue
            }
            else {
                Set-Content "Env:$key" -Value $originalEnvVars[$key]
            }
            Write-Log -Message "Restored environment variable: $key" -Level DEBUG
        }
    }
    return $success
}

# サーバーを静かに停止する関数 (エラーハンドリング用)
function Stop-ServersQuietly {
    Write-Log -Message "Attempting to stop servers quietly due to script error..." -Level WARN
    # 改修: エラー復旧処理の堅牢性向上のため、個々の停止処理をtry-catchで囲む
    try {
        Write-Log -Message "Quietly stopping backend (Port 5001)..." -Level DEBUG
        Stop-ProcessTreeByPort -Port 5001 -BackendScriptHint "backend/main.py" -Silent # Backend
    }
    catch {
        Write-Log -Message "Error during quiet stop of backend (Port 5001): $($_.Exception.Message)" -Level WARN -ErrorRecordForLog $_
    }
    
    try {
        Write-Log -Message "Quietly stopping frontend (Port 5000)..." -Level DEBUG
        Stop-ProcessTreeByPort -Port 5000 -Silent # Frontend
    }
    catch {
        Write-Log -Message "Error during quiet stop of frontend (Port 5000): $($_.Exception.Message)" -Level WARN -ErrorRecordForLog $_
    }
    Write-Log -Message "Quiet server stop attempt finished." -Level WARN
}


# スクリプトのタイトル表示
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  ITサービス管理システム起動スクリプト" -ForegroundColor Cyan
Write-Host "  ISO 20000・ISO 27001・ISO 27002準拠" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Log -Message "IT Service Management System startup script started." -Level INFO

# cargoのパスを一時的に設定
$CargoBinPath = Join-Path $env:USERPROFILE ".cargo\bin"
if (Test-Path $CargoBinPath) {
    $env:PATH = "$CargoBinPath;$env:PATH"
    Write-Log -Message "Temporarily added cargo to PATH: $CargoBinPath" -Level INFO
}
else {
    Write-Log -Message "cargo binary directory not found at $CargoBinPath. Ensure Rust is correctly installed and in PATH." -Level WARN
}

# 設定変数
# $projectRoot は Global:ProjectRoot を使用
$backendPath = Join-Path -Path $Global:ProjectRoot -ChildPath "backend"
$frontendPath = Join-Path -Path $Global:ProjectRoot -ChildPath "frontend"
$pythonVenvPath = Join-Path -Path $backendPath -ChildPath "venv"
$logPath = Join-Path -Path $Global:ProjectRoot -ChildPath "logs" # このスクリプト自体のログではなく、アプリのログ用
$backendLogPath = Join-Path -Path $logPath -ChildPath "backend.log"
$frontendLogPath = Join-Path -Path $logPath -ChildPath "frontend.log" 
$frontendPort = 5000 
$frontendStdoutLogPath = Join-Path -Path $logPath -ChildPath "frontend_stdout.log"
$frontendStderrLogPath = Join-Path -Path $logPath -ChildPath "frontend_stderr.log"
 
# アプリケーションログディレクトリの作成
if (-not (Test-Path -Path $logPath)) {
    Execute-CommandWithLogging -CommandDescription "Create application log directory $logPath" -ScriptBlock {
        New-Item -Path $logPath -ItemType Directory | Out-Null
    } -StopOnError $false -ArgumentList @() # ログディレクトリ作成失敗は警告に留める
}

# ヘルプ表示
if ($help) {
    Write-Log -Message "Displaying help information." -Level INFO
    Write-Host "使用方法:" -ForegroundColor Yellow
    Write-Host "  .\start-system.ps1 [-install] [-stop] [-help]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "オプション:" -ForegroundColor Yellow
    Write-Host "  -install  : 依存関係のインストールを実行します（初回または更新時）" -ForegroundColor Yellow
    Write-Host "  -stop     : 実行中のサーバーを停止します" -ForegroundColor Yellow
    Write-Host "  -help     : このヘルプメッセージを表示します" -ForegroundColor Yellow
    exit 0
}

# ヘルパー関数: ポート番号に基づいてプロセスツリーを停止する (改修: ログ強化)
function Stop-ProcessTreeByPort {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [int]$Port,
        [Parameter(Mandatory = $false)]
        [string]$BackendScriptHint,
        [Parameter(Mandatory = $false)]
        [switch]$Silent # ログ出力を抑制（コンソールのみ）
    )

    $LogParams = @{ Level = "INFO" }
    if ($Silent) { $LogParams.NoConsoleOutput = $true }

    Write-Log -Message "Attempting to stop process tree for port $Port (Hint: '$BackendScriptHint')" @LogParams
    if (-not $Silent) { Write-Host ("Stopping processes on port {0}..." -f $Port) -ForegroundColor Yellow }


    # フェーズ1: Get-NetTCPConnection で特定したPIDに対して taskkill /T /F を実行
    Write-Log -Message "Phase 1: Identifying and stopping processes listening on port $Port using taskkill /PID <PID> /T /F." @LogParams
    $phase1Success = $false
    try {
        $listeningPids = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
        
        if ($listeningPids.Count -gt 0) {
            $pidsString = $listeningPids -join ', '
            Write-Log -Message ("Found PIDs listening on port {0}: {1}" -f $Port, $pidsString) @LogParams
            foreach ($pid in $listeningPids) {
                Write-Log -Message "  Attempting to stop PID $pid (listening on port $Port) with taskkill /PID $pid /T /F" @LogParams
                $taskkillResult = ""
                $exitCode = -1
                try {
                    $taskkillOutput = taskkill /PID $pid /T /F 2>&1
                    $exitCode = $LASTEXITCODE
                    $taskkillResult = $taskkillOutput -join [Environment]::NewLine
                    # 354行目の修正: -Level DEBUG を維持しつつパラメータ重複を解消
                    $debugLogArgs = @{
                        Message = "  taskkill /PID $pid /T /F command executed. ExitCode: $exitCode. Output: $taskkillResult"
                        Level   = "DEBUG"
                    }
                    if ($Silent) { $debugLogArgs.NoConsoleOutput = $true } # $LogParamsからNoConsoleOutputの条件を継承
                    Write-Log @debugLogArgs
                    if ($exitCode -eq 0) {
                        # 改修: -Level パラメータの重複を修正。@LogParams に Level が含まれるため、明示的な -Level "INFO" を削除
                        Write-Log -Message "    Successfully sent termination signal to process tree for PID $pid." @LogParams 
                        $phase1Success = $true 
                    }
                    else {
                        if ($taskkillResult -match "プロセスが見つかりませんでした" -or $taskkillResult -match "not found") {
                            Write-Log -Message "    Process with PID $pid was not found by taskkill (or already terminated)." -Level WARN @LogParams
                        }
                        else {
                            Write-Log -Message "    taskkill command for PID $pid reported an issue or failed. Exit code: $exitCode. Output: $taskkillResult" -Level WARN @LogParams
                        }
                    }
                }
                catch {
                    Write-Log -Message "    Failed to execute taskkill for PID $pid. Error: $($_.Exception.Message)" -Level WARN @LogParams -ErrorRecordForLog $_
                }
            }
        }
        else {
            Write-Log -Message "No processes found directly listening on port $Port via Get-NetTCPConnection in Phase 1." @LogParams
            $phase1Success = $true 
        }
    }
    catch {
        Write-Log -Message "  Error during Phase 1 (Get-NetTCPConnection or iteration): $($_.Exception.Message)" -Level WARN @LogParams -ErrorRecordForLog $_
    }
    Write-Log -Message "Phase 1 completed." @LogParams

    Write-Log -Message "Waiting for 2 seconds for processes to terminate after Phase 1..." @LogParams
    Start-Sleep -Seconds 2

    # フェーズ2: 残存プロセスの確認と停止
    Write-Log -Message "Phase 2: Identifying and stopping potentially remaining backend processes..." @LogParams
    $phase2Success = $false
    try {
        $portStillInUse = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        
        if ($portStillInUse -or ($BackendScriptHint)) {
            Write-Log -Message "Port $Port may still be in use or BackendScriptHint ('$BackendScriptHint') is provided. Proceeding with Phase 2 search." @LogParams
            $processFilter = "Name = 'python.exe' OR Name = 'pythonw.exe' OR Name = 'node.exe' OR Name = 'cmd.exe'" # 関連する可能性のあるプロセス
            
            $candidateProcesses = Get-CimInstance Win32_Process -Filter $processFilter -ErrorAction SilentlyContinue
            $remainingPidsToKill = [System.Collections.Generic.List[int]]::new()

            if ($candidateProcesses) {
                foreach ($proc in $candidateProcesses) {
                    $processCommandLine = $proc.CommandLine
                    $shouldKill = $false
                    if ($BackendScriptHint -and $processCommandLine -like "*$BackendScriptHint*") {
                        Write-Log -Message "  Found candidate process PID $($proc.ProcessId) (Name: $($proc.Name), CmdLine: $processCommandLine) - Matches BackendScriptHint." -Level DEBUG @LogParams
                        $shouldKill = $true
                    }
                    elseif ($processCommandLine -like "*$frontendPath*" -and $proc.Name -match "(node|cmd)") {
                        # フロントエンド関連のプロセスの場合
                        Write-Log -Message "  Found candidate frontend-related process PID $($proc.ProcessId) (Name: $($proc.Name), CmdLine: $processCommandLine)." -Level DEBUG @LogParams
                        $shouldKill = $true
                    }
                    
                    if ($shouldKill) {
                        $remainingPidsToKill.Add($proc.ProcessId)
                    }
                }
            }

            if ($remainingPidsToKill.Count -gt 0) {
                Write-Log -Message "  Found $($remainingPidsToKill.Count) potentially remaining process(es): $($remainingPidsToKill -join ', ')" @LogParams
                foreach ($pid in $remainingPidsToKill) {
                    Write-Log -Message "    Attempting to stop remaining PID $pid with taskkill /PID $pid /F" @LogParams
                    try {
                        $taskkillOutput = taskkill /PID $pid /F 2>&1
                        $exitCode = $LASTEXITCODE
                        $taskkillResult = $taskkillOutput -join [Environment]::NewLine
                        Write-Log -Message "    taskkill /PID $pid /F executed. ExitCode: $exitCode. Output: $taskkillResult" -Level DEBUG @LogParams
                        if ($exitCode -eq 0) {
                            Write-Log -Message "      Successfully sent termination signal to PID $pid." -Level INFO @LogParams
                            $phase2Success = $true
                        }
                        else {
                            if ($taskkillResult -match "プロセスが見つかりませんでした" -or $taskkillResult -match "not found") {
                                Write-Log -Message "      Process with PID $pid was not found by taskkill (Phase 2)." -Level WARN @LogParams
                            }
                            else {
                                Write-Log -Message "      taskkill for PID $pid in Phase 2 failed. Exit code: $exitCode. Output: $taskkillResult" -Level WARN @LogParams
                            }
                        }
                    }
                    catch {
                        Write-Log -Message "      Failed to execute taskkill for remaining PID $pid in Phase 2. Error: $($_.Exception.Message)" -Level WARN @LogParams -ErrorRecordForLog $_
                    }
                }
            }
            else {
                Write-Log -Message "No remaining processes found based on filter in Phase 2." @LogParams
                $phase2Success = $true 
            }
        }
        else {
            Write-Log -Message "Port $Port is free and no BackendScriptHint was provided. Skipping Phase 2 search." @LogParams
            $phase2Success = $true 
        }
    }
    catch {
        Write-Log -Message "  Error during Phase 2 (Get-CimInstance or iteration): $($_.Exception.Message)" -Level WARN @LogParams -ErrorRecordForLog $_
    }
    Write-Log -Message "Phase 2 completed." @LogParams
    
    Write-Log -Message "Final check: Verifying if port $Port is free..." @LogParams
    $finalCheckConnection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($finalCheckConnection) {
        $pidsUsingPort = $finalCheckConnection | Select-Object -ExpandProperty OwningProcess -Unique
        Write-Log -Message "  Port $Port is STILL IN USE by PID(s): $($pidsUsingPort -join ', '). Run 'Get-Process -Id $($pidsUsingPort -join ', ')' for details." -Level WARN @LogParams
    }
    else {
        Write-Log -Message "  Port $Port is now free." @LogParams
    }
    Write-Log -Message "Process stopping sequence for port $Port finished." @LogParams
}

# サーバー停止関数 (改修: ログ強化)
function Stop-Servers {
    Write-Log -Message "Stopping running servers..." -Level INFO
    $Global:stopInProgress = $true # 停止処理中のフラグ

    $targetBackendPort = 5001 
    if ($Global:BackendProcess -and (Get-Process -Id $Global:BackendProcess.Id -ErrorAction SilentlyContinue)) {
        Write-Log -Message "Stopping backend server (PID: $($Global:BackendProcess.Id))..." -Level INFO
        try {
            Stop-Process -Id $Global:BackendProcess.Id -Force -ErrorAction Stop
            Write-Log -Message "Backend server (PID: $($Global:BackendProcess.Id)) stopped." -Level INFO
        }
        catch {
            Write-Log -Message "Failed to stop backend server (PID: $($Global:BackendProcess.Id)): $($_.Exception.Message)" -Level WARN -ErrorRecordForLog $_
        }
        $Global:BackendProcess = $null 
    }
    else {
        if ($Global:BackendProcess) { Write-Log -Message "Backend server process info (PID: $($Global:BackendProcess.Id)) found, but process already terminated or inaccessible. Will attempt port-based stop." -Level DEBUG }
        else { Write-Log -Message "No running backend server process info (Global:BackendProcess). Will attempt port-based stop." -Level DEBUG }
        $Global:BackendProcess = $null 
    }
    Write-Log -Message "Fallback: Attempting to stop backend server processes on port $targetBackendPort using Stop-ProcessTreeByPort..." -Level INFO
    Stop-ProcessTreeByPort -Port $targetBackendPort -BackendScriptHint "backend/main.py" # VerboseはStop-ProcessTreeByPort内で制御

    if ($Global:FrontendProcess -and (Get-Process -Id $Global:FrontendProcess.Id -ErrorAction SilentlyContinue)) {
        Write-Log -Message "Stopping frontend server (PID: $($Global:FrontendProcess.Id))..." -Level INFO
        try {
            # フロントエンドは子プロセスも持つ可能性があるので /T を試みる (cmd経由で起動した場合、cmd自体を落とす)
            taskkill /PID $Global:FrontendProcess.Id /T /F | Out-Null
            Write-Log -Message "Attempted to stop frontend server process tree (PID: $($Global:FrontendProcess.Id)) via taskkill." -Level INFO
        }
        catch {
            Write-Log -Message "Failed to stop frontend server (PID: $($Global:FrontendProcess.Id)) via taskkill: $($_.Exception.Message)" -Level WARN -ErrorRecordForLog $_
            # フォールバックとして Stop-Process
            try { Stop-Process -Id $Global:FrontendProcess.Id -Force -ErrorAction Stop } catch {}
        }
        $Global:FrontendProcess = $null 
    }
    else {
        if ($Global:FrontendProcess) { Write-Log -Message "Frontend server process info (PID: $($Global:FrontendProcess.Id)) found, but process already terminated or inaccessible. Will attempt port-based stop." -Level DEBUG }
        else { Write-Log -Message "No running frontend server process info (Global:FrontendProcess). Will attempt port-based stop." -Level DEBUG }
        $Global:FrontendProcess = $null
    }
    Write-Log -Message "Fallback: Attempting to stop frontend server processes on port $frontendPort using Stop-ProcessTreeByPort..." -Level INFO
    Stop-ProcessTreeByPort -Port $frontendPort # フロントエンドなので BackendScriptHint は指定しない
    
    Write-Log -Message "All server stop processes completed." -Level INFO
    $Global:stopInProgress = $false
}

# 停止コマンドの処理
if ($stop) {
    Write-Log -Message "-stop parameter detected. Initiating server shutdown." -Level INFO
    Stop-Servers
    Write-Log -Message "Script finished after stopping servers." -Level INFO
    exit 0
}

# 仮想環境の確認と作成 (改修: ログ強化, Execute-CommandWithLogging 使用)
function Setup-PythonVenv {
    Write-Log -Message "Setting up Python virtual environment..." -Level INFO
    if (-not (Test-Path -Path $pythonVenvPath)) {
        Write-Log -Message "Python virtual environment ($pythonVenvPath) not found. Creating..." -Level INFO
        
        # 改修: $using: を避けるために ArgumentList を使用 (この場合は引数不要だが形式を統一)
        $success = Execute-CommandWithLogging -CommandDescription "Create Python virtual environment" -ScriptBlock {
            python -m venv venv # Assumes python is in PATH
            if ($LASTEXITCODE -ne 0) { throw "Failed to create venv. Exit code: $LASTEXITCODE" }
        } -WorkingDirectory $backendPath -StopOnError $true -ArgumentList @()

        if ($success) {
            Write-Log -Message "Python virtual environment created: $pythonVenvPath" -Level INFO
        }
        else {
            Write-Log -Message "Python virtual environment creation failed. See previous logs." -Level ERROR
            exit 1 # Ensure script stops if venv creation fails
        }
    }
    else {
        Write-Log -Message "Existing Python virtual environment will be used: $pythonVenvPath" -Level INFO
    }
}

# 依存関係のインストール (改修: ログ強化, Execute-CommandWithLogging 使用)
function Install-Dependencies {
    Write-Log -Message "Installing dependencies..." -Level INFO
    
    # バックエンド依存関係
    Write-Log -Message "Installing backend dependencies ($backendPath)..." -Level INFO
    $pythonExecutable = Join-Path $pythonVenvPath "Scripts\python.exe"
    if (-not (Test-Path $pythonExecutable)) {
        Write-Log -Message "Python executable not found in venv: $pythonExecutable. Cannot install backend dependencies." -Level ERROR
        exit 1
    }

    # 改修: $using:pythonExecutable を避けるために ArgumentList で pythonExecutable を渡す
    Execute-CommandWithLogging -CommandDescription "Upgrade pip" -ScriptBlock {
        param($pyExec) # ScriptBlock内で引数を受け取る
        & $pyExec -m pip install --upgrade pip
        if ($LASTEXITCODE -ne 0) { throw "pip upgrade failed. Exit code: $LASTEXITCODE" }
    } -WorkingDirectory $backendPath -StopOnError $true -ArgumentList $pythonExecutable

    # 改修: $using:pythonExecutable を避けるために ArgumentList で pythonExecutable を渡す
    Execute-CommandWithLogging -CommandDescription "Install backend requirements from requirements.txt" -ScriptBlock {
        param($pyExec) # ScriptBlock内で引数を受け取る
        & $pyExec -m pip install -r requirements.txt
        if ($LASTEXITCODE -ne 0) { throw "Backend requirements installation failed. Exit code: $LASTEXITCODE" }
    } -WorkingDirectory $backendPath -StopOnError $true -ArgumentList $pythonExecutable
    Write-Log -Message "Backend dependencies installation complete." -Level INFO
    
    # フロントエンド依存関係
    Write-Log -Message "Installing frontend dependencies ($frontendPath)..." -Level INFO
    Execute-CommandWithLogging -CommandDescription "Install frontend dependencies (npm install)" -ScriptBlock {
        npm install # Assumes npm is in PATH
        if ($LASTEXITCODE -ne 0) { throw "npm install failed. Exit code: $LASTEXITCODE" }
    } -WorkingDirectory $frontendPath -StopOnError $true -ArgumentList @() # 引数なし
    Write-Log -Message "Frontend dependencies installation complete." -Level INFO
}

# Rustインストール確認関数 (改修: ログ強化)
function Ensure-RustInstalled {
    Write-Log -Message "Checking Rust and Cargo installation status..." -Level INFO
    $rustcFound = $false
    $cargoFound = $false

    # rustc の確認
    try {
        $rustcOutput = & rustc --version 2>&1
        if ($LASTEXITCODE -eq 0 -and $rustcOutput -match "rustc") {
            Write-Log -Message "  Rust compiler (rustc) found: $($rustcOutput.Split([Environment]::NewLine)[0])" -Level INFO
            $rustcFound = $true
        }
        else { Write-Log -Message "  Rust compiler (rustc) not found or error during check." -Level WARN }
    }
    catch { Write-Log -Message "  Error checking rustc: $($_.Exception.Message)" -Level WARN -ErrorRecordForLog $_ }

    # cargo の確認
    try {
        $cargoOutput = & cargo --version 2>&1
        if ($LASTEXITCODE -eq 0 -and $cargoOutput -match "cargo") {
            Write-Log -Message "  Cargo found: $($cargoOutput.Split([Environment]::NewLine)[0])" -Level INFO
            $cargoFound = $true
        }
        else { Write-Log -Message "  Cargo not found or error during check." -Level WARN }
    }
    catch { Write-Log -Message "  Error checking cargo: $($_.Exception.Message)" -Level WARN -ErrorRecordForLog $_ }

    if ($rustcFound -and $cargoFound) {
        Write-Log -Message "Rust and Cargo are already installed." -Level INFO
        return $true
    }

    Write-Log -Message "Rust or Cargo is not installed." -Level WARN
    # 自動インストールは複雑なため、ユーザーに手動インストールを促すメッセージに変更
    Write-Host "Rust is not installed. Please install it manually from https://rustup.rs/ and ensure cargo is in your PATH." -ForegroundColor Yellow
    Write-Host "Then, re-run this script." -ForegroundColor Yellow
    Write-Log -Message "Advised user to install Rust manually." -Level WARN
    # exit 1 # Rustが必須な場合はここで終了する
    Write-Log -Message "Proceeding without Rust. Some Python packages might fail to build." -Level WARN
    return $false # Rust未インストールを返す
}

# Node.js環境確認関数 (改修: ログ強化)
function Check-NodeEnvironment {
    Write-Log -Message "Checking Node.js environment..." -Level INFO
    try {
        $nodeVersion = node -v
        Write-Log -Message "Node.js version: $nodeVersion" -Level INFO
    }
    catch {
        Write-Log -Message "Node.js is not installed. Please install it. Error: $($_.Exception.Message)" -Level ERROR -ErrorRecordForLog $_
        exit 1
    }
    try {
        $npmVersion = npm -v
        Write-Log -Message "npm version: $npmVersion" -Level INFO
    }
    catch {
        Write-Log -Message "npm is not installed. It should be installed with Node.js. Error: $($_.Exception.Message)" -Level ERROR -ErrorRecordForLog $_
        exit 1
    }
    
    $nodeModulesPath = Join-Path -Path $frontendPath -ChildPath "node_modules"
    if (-not (Test-Path -Path $nodeModulesPath)) {
        Write-Log -Message "Frontend dependencies (node_modules) not found. Running installation..." -Level INFO
        Install-Dependencies # これによりフロントエンドもインストールされる
    }
    else {
        $reactScriptsPath = Join-Path -Path $nodeModulesPath -ChildPath ".bin\react-scripts.cmd"
        if (-not (Test-Path -Path $reactScriptsPath)) {
            Write-Log -Message "react-scripts not found in node_modules. Reinstalling frontend dependencies..." -Level WARN
            # 改修: $using:nodeModulesPath を避けるために ArgumentList で nodeModulesPath を渡す
            Execute-CommandWithLogging -CommandDescription "Remove node_modules for reinstall" -ScriptBlock {
                param($nmPath) # ScriptBlock内で引数を受け取る
                Remove-Item -Path $nmPath -Recurse -Force
            } -WorkingDirectory $frontendPath -StopOnError $false -ArgumentList $nodeModulesPath # 失敗しても続行試行
            Install-Dependencies
        }
        else {
            Write-Log -Message "Frontend dependencies appear to be correctly installed." -Level INFO
        }
    }
}

# 依存関係のインストールが指定された場合
if ($install) {
    Write-Log -Message "-install parameter detected. Initiating dependency installation." -Level INFO
    Setup-PythonVenv
    Install-Dependencies
    Check-NodeEnvironment # インストール後に確認
    Write-Log -Message "Dependency installation process finished. Please run the script again without -install to start servers." -Level INFO
    exit 0
}

# サーバーの起動 (改修: ログ強化, Execute-CommandWithLogging 使用)
function Start-Servers {
    Write-Log -Message "Starting IT Service Management System servers..." -Level INFO
    
    if (-not $Global:stopInProgress) { Stop-Servers } # 既存サーバーを停止 (停止処理中でなければ)
    
    # Backend Server Configuration
    $backendPort = 5001 
    $backendErrorLogPath = $backendLogPath -replace '\.log$', '_error.log' 
    if (-not (Test-Path (Split-Path $backendLogPath -Parent))) {
        New-Item -ItemType Directory -Path (Split-Path $backendLogPath -Parent) -Force | Out-Null
    }
 
    Write-Log -Message "Preparing to start backend server on port $backendPort. Logs: $backendLogPath (stdout), $backendErrorLogPath (stderr)" -Level INFO
    
    # Python仮想環境のPython実行ファイル
    $pythonExecutable = Join-Path $pythonVenvPath "Scripts\python.exe"
    if (-not (Test-Path $pythonExecutable)) {
        Write-Log -Message "Python executable not found in venv: $pythonExecutable. Cannot start backend server." -Level ERROR
        exit 1
    }
 
    # PYTHONPATH設定
    $venvSitePackagesPath = Join-Path $pythonVenvPath "Lib\site-packages"
    $currentPythonPath = $env:PYTHONPATH
    $newPythonPath = "$venvSitePackagesPath;$Global:ProjectRoot;$Global:ProjectRoot\backend" # プロジェクトルートも追加
    if (-not [string]::IsNullOrEmpty($currentPythonPath)) {
        $newPythonPath = "$newPythonPath;$currentPythonPath"
    }
    $uniquePaths = $newPythonPath.Split(';') | Select-Object -Unique
    $env:PYTHONPATH_FOR_BACKEND = $uniquePaths -join ';' # 衝突を避けるため別名で設定し、Execute-CommandWithLogging で渡す
    Write-Log -Message "PYTHONPATH for backend will be: $($env:PYTHONPATH_FOR_BACKEND)" -Level DEBUG

    # バックエンドログファイルのクリア
    Write-Log -Message "Clearing backend log files ($backendLogPath, $backendErrorLogPath)..." -Level DEBUG
    Remove-Item -Path $backendLogPath -Force -ErrorAction SilentlyContinue
    New-Item -Path $backendLogPath -ItemType File -Force -ErrorAction SilentlyContinue | Out-Null
    Remove-Item -Path $backendErrorLogPath -Force -ErrorAction SilentlyContinue
    New-Item -Path $backendErrorLogPath -ItemType File -Force -ErrorAction SilentlyContinue | Out-Null
    
    $backendArgs = @("main.py", "--host", "0.0.0.0", "--port", $backendPort)
    
    # Start-Process でバックエンドを起動
    Write-Log -Message "Starting backend server process..." -Level INFO
    Write-Log -Message "  Command: $pythonExecutable $($backendArgs -join ' ')" -Level DEBUG
    Write-Log -Message "  CWD: $backendPath" -Level DEBUG

    try {
        # Start-Process は Execute-CommandWithLogging では直接ラップしにくい非同期プロセス起動のため、個別に処理
        # 環境変数は Start-Process の -Environment パラメータで渡す (PowerShell 7+)
        # または、このスクリプトブロックの親スコープで $env:PYTHONPATH を設定する (現在の実装)
        $process = Start-Process -FilePath $pythonExecutable -ArgumentList $backendArgs -WorkingDirectory $backendPath `
            -RedirectStandardOutput $backendLogPath -RedirectStandardError $backendErrorLogPath `
            -PassThru -NoNewWindow
        $Global:BackendProcess = $process
        Write-Log -Message "Backend server process started (PID: $($process.Id)). Check logs for details." -Level INFO
    }
    catch {
        Write-Log -Message "Failed to start backend server process: $($_.Exception.Message)" -Level ERROR -ErrorRecordForLog $_
        exit 1
    }
    
    # バックエンドサーバーのヘルスチェック
    Write-Log -Message "Waiting for backend server (localhost:$backendPort) to be ready..." -Level INFO
    $maxRetries = 30; $retryIntervalSeconds = 2; $backendReady = $false
    for ($i = 1; $i -le $maxRetries; $i++) {
        Write-Log -Message "  Backend health check attempt $i/$maxRetries..." -Level DEBUG
        try {
            $connectionResult = Test-NetConnection -ComputerName "localhost" -Port $backendPort -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
            if ($connectionResult -and $LASTEXITCODE -eq 0) {
                # $LASTEXITCODEも確認
                Write-Log -Message "Backend server is responsive on port $backendPort." -Level INFO
                $backendReady = $true; break
            }
        }
        catch { Write-Log -Message "  Connection attempt failed: $($_.Exception.Message)" -Level DEBUG }
        if ($i -lt $maxRetries) { Start-Sleep -Seconds $retryIntervalSeconds }
    }
    if (-not $backendReady) {
        Write-Log -Message "Backend server did not respond on port $backendPort after $maxRetries retries. Startup may have failed." -Level ERROR
        if ($Global:BackendProcess) { try { Stop-Process -Id $Global:BackendProcess.Id -Force -ErrorAction SilentlyContinue } catch {} }
        exit 1
    }

    # フロントエンドサーバーの起動
    Write-Log -Message "Preparing to start frontend server on port $frontendPort. Logs: $frontendStdoutLogPath (stdout), $frontendStderrLogPath (stderr)" -Level INFO
    
    # フロントエンドログファイルのクリア
    Write-Log -Message "Clearing frontend log files ($frontendStdoutLogPath, $frontendStderrLogPath)..." -Level DEBUG
    Remove-Item -Path $frontendStdoutLogPath -Force -ErrorAction SilentlyContinue; New-Item -Path $frontendStdoutLogPath -ItemType File -Force -ErrorAction SilentlyContinue | Out-Null
    Remove-Item -Path $frontendStderrLogPath -Force -ErrorAction SilentlyContinue; New-Item -Path $frontendStderrLogPath -ItemType File -Force -ErrorAction SilentlyContinue | Out-Null

    $frontendArgs = @("/c", "npm", "start") # cmd経由でnpm start
    Write-Log -Message "Starting frontend server process..." -Level INFO
    Write-Log -Message "  Command: cmd.exe $($frontendArgs -join ' ')" -Level DEBUG
    Write-Log -Message "  CWD: $frontendPath" -Level DEBUG

    try {
        # Start-Process でフロントエンドを起動
        $frontendProcessObject = Start-Process -FilePath "cmd.exe" -ArgumentList $frontendArgs -WorkingDirectory $frontendPath `
            -RedirectStandardOutput $frontendStdoutLogPath -RedirectStandardError $frontendStderrLogPath `
            -PassThru -NoNewWindow
        $Global:FrontendProcess = $frontendProcessObject
        Write-Log -Message "Frontend server process started (PID: $($Global:FrontendProcess.Id)). Check logs for details." -Level INFO
    }
    catch {
        Write-Log -Message "Failed to start frontend server process: $($_.Exception.Message)" -Level ERROR -ErrorRecordForLog $_
        Stop-Servers # バックエンドが起動している可能性があるので停止試行
        exit 1
    }
    
    Write-Log -Message "IT Service Management System startup sequence complete." -Level INFO
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host " ITサービス管理システム起動完了!" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "バックエンドAPI: http://localhost:$backendPort" -ForegroundColor Cyan
    Write-Host "フロントエンドUI: http://localhost:$frontendPort" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "ログファイル:" -ForegroundColor Cyan
    Write-Host "  このスクリプトのログ: $Global:RepairLogFile" -ForegroundColor Cyan
    Write-Host "  バックエンド (stdout): $backendLogPath" -ForegroundColor Cyan
    Write-Host "  バックエンド (stderr): $backendErrorLogPath" -ForegroundColor Cyan
    Write-Host "  フロントエンド (stdout): $frontendStdoutLogPath" -ForegroundColor Cyan
    Write-Host "  フロントエンド (stderr): $frontendStderrLogPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "システムを停止するには: .\start-system.ps1 -stop" -ForegroundColor Yellow
    Write-Host ""
}

# --- メイン処理 ---
Write-Log -Message "Starting main script execution..." -Level INFO
try {
    Setup-PythonVenv
    
    if (-not (Ensure-RustInstalled)) {
        Write-Log -Message "Rust installation check indicated Rust is not (fully) available. Continuing, but some operations might fail." -Level WARN
        # ここで exit するか続行するかはプロジェクトの要件による
    }

    # バックエンド依存関係の強制インストール（-install オプションなしでも毎回チェック）
    Write-Log -Message "Checking/Installing backend dependencies (mandatory check)..." -Level INFO
    $pythonExecForInstall = Join-Path $pythonVenvPath "Scripts\python.exe"
    if (Test-Path $pythonExecForInstall) {
        # 改修: $using:pythonExecForInstall を避けるために ArgumentList で pythonExecForInstall を渡す
        Execute-CommandWithLogging -CommandDescription "Install/check backend requirements (mandatory)" -ScriptBlock {
            param($pyExec) # ScriptBlock内で引数を受け取る
            & $pyExec -m pip install -r requirements.txt
            if ($LASTEXITCODE -ne 0) { throw "Backend requirements installation/check failed. Exit code: $LASTEXITCODE" }
        } -WorkingDirectory $backendPath -StopOnError $true -ArgumentList $pythonExecForInstall # 依存関係エラーは致命的
        Write-Log -Message "Backend dependencies check/installation complete." -Level INFO
    }
    else {
        Write-Log -Message "Python executable not found in venv ($pythonExecForInstall). Skipping mandatory backend dependency check." -Level ERROR
        exit 1 # 仮想環境がないと進めない
    }

    Check-NodeEnvironment
    Start-Servers
    
    Write-Log -Message "Script execution finished successfully. Servers are running." -Level INFO
    Write-Host "フロントエンドにアクセスするにはブラウザで http://localhost:$frontendPort を開いてください。" -ForegroundColor Cyan
    Write-Host ""
    
}
catch {
    Write-Log -Message "An unhandled error occurred in the main script execution: $($_.Exception.Message)" -Level ERROR -ErrorRecordForLog $_
    if (-not $Global:stopInProgress) { Stop-ServersQuietly } # 停止処理中でなければ、エラー時にサーバー群を停止試行
    Write-Log -Message "Script terminated due to an error." -Level ERROR
    exit 1
}

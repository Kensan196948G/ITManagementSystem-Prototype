# PowerShellスクリプトのパラメータ定義
param(
    [Parameter(Mandatory = $false)]
    [switch]$Interactive,

    [Parameter(Mandatory = $false)]
    [switch]$BatchMode,

    [Parameter(Mandatory = $false)]
    [string]$CsvPath,

    [Parameter(Mandatory = $false)]
    [string]$OutputPath,

    [Parameter(Mandatory = $false)]
    [int]$RequestLimit = 10,

    [Parameter(Mandatory = $false)]
    [switch]$ResetCounter,

    [Parameter(Mandatory = $false)]
    [switch]$Help
)

# Microsoft 365 APIリクエスト管理システム
# ISO 20000・ISO 27001・ISO 27002準拠のAPIリクエスト制御と監視

# スクリプトタイトル表示
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " Microsoft 365 APIリクエスト管理ツール" -ForegroundColor Cyan
Write-Host " ISO 20000・ISO 27001・ISO 27002準拠" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# グローバル変数
$script:ApiRequests = @()
$script:RequestLimitReached = $false
$script:ConfigFile = ".\config\api_requests_config.json"
$script:VerboseMode = $false

# ヘルプ表示
if ($Help) {
    Write-Host "Microsoft 365 APIリクエスト管理ツール 使用方法" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "オプション:" -ForegroundColor Yellow
    Write-Host "  -Interactive         : インタラクティブモードで実行（デフォルト）" -ForegroundColor White
    Write-Host "  -BatchMode           : バッチモードで実行（ユーザー入力なし）" -ForegroundColor White
    Write-Host "  -CsvPath <path>      : 過去のAPIリクエスト記録を含むCSVファイルのパス" -ForegroundColor White
    Write-Host "  -OutputPath <path>   : ログファイルの出力パス" -ForegroundColor White
    Write-Host "  -RequestLimit <num>  : APIリクエスト数の制限値（デフォルト: 10）" -ForegroundColor White
    Write-Host "  -ResetCounter        : APIリクエストカウンターをリセット" -ForegroundColor White
    Write-Host "  -Help                : このヘルプを表示" -ForegroundColor White
    Write-Host ""
    Write-Host "例:" -ForegroundColor Yellow
    Write-Host "  .\APIRequestManager.ps1" -ForegroundColor White
    Write-Host "  .\APIRequestManager.ps1 -RequestLimit 20" -ForegroundColor White
    Write-Host "  .\APIRequestManager.ps1 -ResetCounter" -ForegroundColor White
    exit 0
}

# 時刻付きログファイル名の生成
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$defaultLogPath = ".\logs"
$logFileName = "APIRequestLog.$timestamp.txt"

if ($OutputPath) {
    $logDir = $OutputPath
} else {
    $logDir = $defaultLogPath
}
$logPath = Join-Path -Path $logDir -ChildPath $logFileName

# 設定ディレクトリの作成
$configDir = Split-Path -Path $script:ConfigFile -Parent
if (-not (Test-Path -Path $configDir)) {
    New-Item -Path $configDir -ItemType Directory | Out-Null
    Write-Host "設定ディレクトリを作成しました: $configDir" -ForegroundColor Green
}

# ログディレクトリの作成
if (-not (Test-Path -Path $logDir)) {
    New-Item -Path $logDir -ItemType Directory | Out-Null
    Write-Host "ログディレクトリを作成しました: $logDir" -ForegroundColor Green
}

# ログ記録関数
function Write-Log {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Message,
        
        [Parameter(Mandatory = $false)]
        [ValidateSet("INFO", "WARNING", "ERROR", "SUCCESS", "AUDIT", "DEBUG")]
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    # ログファイルに書き込み
    Add-Content -Path $logPath -Value $logMessage
    
    # コンソールにも出力（色分け）
    switch ($Level) {
        "INFO" { Write-Host $logMessage -ForegroundColor White }
        "WARNING" { Write-Host $logMessage -ForegroundColor Yellow }
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
        "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
        "AUDIT" { Write-Host $logMessage -ForegroundColor Magenta }
        "DEBUG" { 
            if ($script:VerboseMode) {
                Write-Host $logMessage -ForegroundColor Gray 
            }
        }
    }
}

# 設定の読み込み
function Load-Configuration {
    try {
        if (Test-Path -Path $script:ConfigFile) {
            Write-Log "設定ファイルを読み込んでいます: $($script:ConfigFile)" -Level "INFO"
            $config = Get-Content -Path $script:ConfigFile -Raw | ConvertFrom-Json
            
            # 設定値を変数に反映
            $script:ApiRequests = $config.ApiRequests
            
            # カウンターのリセットが要求された場合
            if ($ResetCounter) {
                $script:ApiRequests = @()
                Save-Configuration
                Write-Log "APIリクエストカウンターをリセットしました。" -Level "SUCCESS"
            }
            
            Write-Log "設定を読み込みました。現在のAPIリクエスト数: $($script:ApiRequests.Count)" -Level "INFO"
        } else {
            Write-Log "設定ファイルが見つかりません。新しい設定ファイルを作成します: $($script:ConfigFile)" -Level "INFO"
            $script:ApiRequests = @()
            Save-Configuration
        }
    }
    catch {
        Write-Log "設定ファイルの読み込み中にエラーが発生しました: $_" -Level "ERROR"
        $script:ApiRequests = @()
    }
}

# 設定の保存
function Save-Configuration {
    try {
        $configData = @{
            ApiRequests = $script:ApiRequests
            LastUpdated = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        }
        
        # JSON形式で保存
        $configData | ConvertTo-Json -Depth 5 | Set-Content -Path $script:ConfigFile
        Write-Log "設定を保存しました: $($script:ConfigFile)" -Level "DEBUG"
    }
    catch {
        Write-Log "設定ファイルの保存中にエラーが発生しました: $_" -Level "ERROR"
    }
}

# APIリクエストの制限チェック
function Test-ApiRequestLimit {
    # 本日分のリクエスト数をカウント
    $today = (Get-Date).Date
    $todayRequests = $script:ApiRequests | Where-Object { 
        $requestDate = [DateTime]::Parse($_.Timestamp).Date
        $requestDate -eq $today 
    }
    
    # 制限に達しているかチェック
    if ($todayRequests.Count -ge $RequestLimit) {
        $script:RequestLimitReached = $true
        Write-Log "本日のAPIリクエスト数が制限に達しました ($($todayRequests.Count)/$RequestLimit)。" -Level "WARNING"
        Write-Host "警告: 本日のAPIリクエスト数の制限に達しました。" -ForegroundColor Red
        Write-Host "以下のオプションがあります：" -ForegroundColor Yellow
        Write-Host "1. '-ResetCounter'オプションを使用してカウンターをリセットする" -ForegroundColor Yellow
        Write-Host "2. '-RequestLimit'パラメーターで制限値を増やす" -ForegroundColor Yellow
        return $false
    }
    
    return $true
}

# APIリクエストの記録
function Add-ApiRequest {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Operation,
        
        [Parameter(Mandatory = $true)]
        [string]$UserName,
        
        [Parameter(Mandatory = $false)]
        [string]$ResourceId = "",
        
        [Parameter(Mandatory = $false)]
        [string]$Details = ""
    )
    
    # リクエスト制限のチェック
    if (-not (Test-ApiRequestLimit)) {
        return $false
    }
    
    # リクエスト情報の作成
    $requestInfo = @{
        Id = [Guid]::NewGuid().ToString()
        Timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        Operation = $Operation
        UserName = $UserName
        ResourceId = $ResourceId
        Details = $Details
        Status = "Completed"
    }
    
    # リクエスト情報の追加
    $script:ApiRequests += $requestInfo
    
    # 設定ファイルに保存
    Save-Configuration
    
    # ログに記録
    Write-Log "APIリクエストを記録しました: $Operation ($UserName)" -Level "AUDIT"
    
    return $true
}

# APIリクエスト履歴の表示
function Show-ApiRequestHistory {
    param (
        [Parameter(Mandatory = $false)]
        [int]$Days = 7,
        
        [Parameter(Mandatory = $false)]
        [string]$UserName = ""
    )
    
    # 期間指定
    $startDate = (Get-Date).AddDays(-$Days).Date
    
    # フィルタリング
    $filteredRequests = $script:ApiRequests | Where-Object { 
        $requestDate = [DateTime]::Parse($_.Timestamp).Date
        $matchDate = $requestDate -ge $startDate
        
        # ユーザー名が指定されている場合はフィルタリング
        $matchUser = $true
        if ($UserName) {
            $matchUser = $_.UserName -like "*$UserName*"
        }
        
        $matchDate -and $matchUser
    }
    
    # 表示
    Write-Host "`n直近 $Days 日間のAPIリクエスト履歴:" -ForegroundColor Cyan
    
    if ($filteredRequests.Count -eq 0) {
        Write-Host "  該当するAPIリクエスト履歴はありません。" -ForegroundColor Yellow
        return
    }
    
    # 日付でグループ化して表示
    $groupedRequests = $filteredRequests | Group-Object { [DateTime]::Parse($_.Timestamp).ToString("yyyy-MM-dd") }
    
    foreach ($group in $groupedRequests) {
        Write-Host "`n[$($group.Name)] - $($group.Count) リクエスト" -ForegroundColor Yellow
        
        $i = 1
        foreach ($request in $group.Group) {
            $time = [DateTime]::Parse($request.Timestamp).ToString("HH:mm:ss")
            Write-Host "  $i. [$time] $($request.Operation)" -ForegroundColor White
            Write-Host "     ユーザー: $($request.UserName)" -ForegroundColor Gray
            if ($request.ResourceId) {
                Write-Host "     リソースID: $($request.ResourceId)" -ForegroundColor Gray
            }
            if ($request.Details) {
                Write-Host "     詳細: $($request.Details)" -ForegroundColor Gray
            }
            $i++
        }
    }
    
    # 制限情報を表示
    $today = (Get-Date).Date
    $todayRequests = $script:ApiRequests | Where-Object { 
        $requestDate = [DateTime]::Parse($_.Timestamp).Date
        $requestDate -eq $today 
    }
    
    Write-Host "`n本日のAPIリクエスト数: $($todayRequests.Count)/$RequestLimit" -ForegroundColor Cyan
    if ($todayRequests.Count -ge ($RequestLimit * 0.8)) {
        Write-Host "警告: APIリクエスト制限に近づいています。" -ForegroundColor Yellow
    }
}

# APIリクエスト履歴のエクスポート
function Export-ApiRequestHistory {
    param (
        [Parameter(Mandatory = $true)]
        [string]$FilePath
    )
    
    try {
        # CSVファイルにエクスポート
        $script:ApiRequests | Export-Csv -Path $FilePath -NoTypeInformation
        Write-Log "APIリクエスト履歴を $FilePath にエクスポートしました。" -Level "SUCCESS"
        return $true
    }
    catch {
        Write-Log "APIリクエスト履歴のエクスポート中にエラーが発生しました: $_" -Level "ERROR"
        return $false
    }
}

# APIリクエスト履歴のインポート
function Import-ApiRequestHistory {
    param (
        [Parameter(Mandatory = $true)]
        [string]$FilePath
    )
    
    try {
        if (-not (Test-Path -Path $FilePath)) {
            Write-Log "インポートするファイルが見つかりません: $FilePath" -Level "ERROR"
            return $false
        }
        
        # CSVファイルからインポート
        $importedRequests = Import-Csv -Path $FilePath
        
        # 重複を避けるために既存のIDを確認
        $existingIds = $script:ApiRequests | ForEach-Object { $_.Id }
        $newRequests = $importedRequests | Where-Object { $_.Id -notin $existingIds }
        
        # 新しいリクエストを追加
        $script:ApiRequests += $newRequests
        
        # 設定ファイルに保存
        Save-Configuration
        
        Write-Log "$FilePath から $($newRequests.Count) 件のAPIリクエスト履歴をインポートしました。" -Level "SUCCESS"
        return $true
    }
    catch {
        Write-Log "APIリクエスト履歴のインポート中にエラーが発生しました: $_" -Level "ERROR"
        return $false
    }
}

# 統計情報の表示
function Show-ApiRequestStatistics {
    param (
        [Parameter(Mandatory = $false)]
        [int]$Days = 30
    )
    
    # 期間指定
    $startDate = (Get-Date).AddDays(-$Days).Date
    
    # フィルタリング
    $filteredRequests = $script:ApiRequests | Where-Object { 
        $requestDate = [DateTime]::Parse($_.Timestamp).Date
        $requestDate -ge $startDate
    }
    
    if ($filteredRequests.Count -eq 0) {
        Write-Host "`n該当期間のAPIリクエスト履歴はありません。" -ForegroundColor Yellow
        return
    }
    
    Write-Host "`n直近 $Days 日間のAPIリクエスト統計:" -ForegroundColor Cyan
    
    # 操作別の集計
    $operationStats = $filteredRequests | Group-Object -Property Operation | Sort-Object -Property Count -Descending
    
    Write-Host "`n[操作別のリクエスト数]" -ForegroundColor Yellow
    foreach ($stat in $operationStats) {
        Write-Host "  $($stat.Name): $($stat.Count) 回" -ForegroundColor White
    }
    
    # ユーザー別の集計
    $userStats = $filteredRequests | Group-Object -Property UserName | Sort-Object -Property Count -Descending
    
    Write-Host "`n[ユーザー別のリクエスト数]" -ForegroundColor Yellow
    foreach ($stat in $userStats) {
        Write-Host "  $($stat.Name): $($stat.Count) 回" -ForegroundColor White
    }
    
    # 日別の集計
    $dateStats = $filteredRequests | Group-Object { [DateTime]::Parse($_.Timestamp).ToString("yyyy-MM-dd") } | Sort-Object -Property Name
    
    Write-Host "`n[日別のリクエスト数]" -ForegroundColor Yellow
    foreach ($stat in $dateStats) {
        Write-Host "  $($stat.Name): $($stat.Count) 回" -ForegroundColor White
    }
}

# メイン処理
function Start-ApiRequestManager {
    # 設定の読み込み
    Load-Configuration
    
    # インタラクティブモードの場合
    if (-not $BatchMode) {
        $continue = $true
        
        while ($continue) {
            Write-Host "`n===== APIリクエスト管理メニュー =====" -ForegroundColor Cyan
            Write-Host "1. APIリクエストの記録" -ForegroundColor White
            Write-Host "2. APIリクエスト履歴の表示" -ForegroundColor White
            Write-Host "3. APIリクエスト統計の表示" -ForegroundColor White
            Write-Host "4. APIリクエスト履歴のエクスポート" -ForegroundColor White
            Write-Host "5. APIリクエスト履歴のインポート" -ForegroundColor White
            Write-Host "6. APIリクエストカウンターのリセット" -ForegroundColor White
            Write-Host "0. 終了" -ForegroundColor White
            
            $choice = Read-Host "`n選択してください (0-6)"
            
            switch ($choice) {
                "1" {
                    # APIリクエストの記録
                    $operation = Read-Host "操作を入力してください"
                    $userName = Read-Host "ユーザー名を入力してください"
                    $resourceId = Read-Host "リソースID（任意）"
                    $details = Read-Host "詳細情報（任意）"
                    
                    if (Add-ApiRequest -Operation $operation -UserName $userName -ResourceId $resourceId -Details $details) {
                        Write-Host "APIリクエストを記録しました。" -ForegroundColor Green
                    } else {
                        Write-Host "APIリクエストの記録に失敗しました。" -ForegroundColor Red
                    }
                }
                "2" {
                    # APIリクエスト履歴の表示
                    $days = Read-Host "表示する日数を入力してください (デフォルト: 7)"
                    if (-not $days) { $days = 7 }
                    
                    $userName = Read-Host "ユーザー名でフィルター（任意）"
                    
                    Show-ApiRequestHistory -Days $days -UserName $userName
                }
                "3" {
                    # APIリクエスト統計の表示
                    $days = Read-Host "統計を表示する日数を入力してください (デフォルト: 30)"
                    if (-not $days) { $days = 30 }
                    
                    Show-ApiRequestStatistics -Days $days
                }
                "4" {
                    # APIリクエスト履歴のエクスポート
                    $filePath = Read-Host "エクスポートするCSVファイルのパスを入力してください"
                    
                    if ($filePath) {
                        if (Export-ApiRequestHistory -FilePath $filePath) {
                            Write-Host "APIリクエスト履歴を $filePath にエクスポートしました。" -ForegroundColor Green
                        } else {
                            Write-Host "APIリクエスト履歴のエクスポートに失敗しました。" -ForegroundColor Red
                        }
                    } else {
                        Write-Host "ファイルパスが指定されていません。" -ForegroundColor Yellow
                    }
                }
                "5" {
                    # APIリクエスト履歴のインポート
                    $filePath = Read-Host "インポートするCSVファイルのパスを入力してください"
                    
                    if ($filePath) {
                        if (Import-ApiRequestHistory -FilePath $filePath) {
                            Write-Host "APIリクエスト履歴を $filePath からインポートしました。" -ForegroundColor Green
                        } else {
                            Write-Host "APIリクエスト履歴のインポートに失敗しました。" -ForegroundColor Red
                        }
                    } else {
                        Write-Host "ファイルパスが指定されていません。" -ForegroundColor Yellow
                    }
                }
                "6" {
                    # APIリクエストカウンターのリセット
                    $confirm = Read-Host "APIリクエストカウンターをリセットしますか？ (Y/N)"
                    
                    if ($confirm -eq "Y" -or $confirm -eq "y") {
                        $script:ApiRequests = @()
                        Save-Configuration
                        Write-Host "APIリクエストカウンターをリセットしました。" -ForegroundColor Green
                    } else {
                        Write-Host "リセットをキャンセルしました。" -ForegroundColor Yellow
                    }
                }
                "0" {
                    # 終了
                    $continue = $false
                    Write-Host "APIリクエスト管理を終了します。" -ForegroundColor Cyan
                }
                default {
                    Write-Host "無効な選択です。再度選択してください。" -ForegroundColor Red
                }
            }
        }
    }
    # バッチモードの場合
    elseif ($CsvPath) {
        # CSVファイルからAPIリクエスト履歴をインポート
        if (Import-ApiRequestHistory -FilePath $CsvPath) {
            Write-Host "APIリクエスト履歴を $CsvPath からインポートしました。" -ForegroundColor Green
        } else {
            Write-Host "APIリクエスト履歴のインポートに失敗しました。" -ForegroundColor Red
        }
    }
    else {
        # バッチモードでCSVパスが指定されていない場合は統計情報を表示
        Show-ApiRequestStatistics -Days 30
    }
}

# スクリプト実行
try {
    Write-Log "APIリクエスト管理ツールを開始します。" -Level "INFO"
    Start-ApiRequestManager
    Write-Log "APIリクエスト管理ツールを終了します。" -Level "INFO"
}
catch {
    Write-Log "APIリクエスト管理ツールの実行中にエラーが発生しました: $_" -Level "ERROR"
}

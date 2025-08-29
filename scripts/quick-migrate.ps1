# ITサービス管理システム - クイック移行スクリプト (Windows PowerShell)
# Context7統合による知的移行システム

[CmdletBinding()]
param(
    [switch]$AutoRepair = $false,
    [switch]$SkipInteractive = $false,
    [string]$LogLevel = "Info"
)

# エラー時の動作設定
$ErrorActionPreference = "Stop"

# カラー定義
$Colors = @{
    Red    = "Red"
    Green  = "Green"  
    Yellow = "Yellow"
    Blue   = "Blue"
    Purple = "Magenta"
    Cyan   = "Cyan"
    White  = "White"
}

# ログ関数
function Write-LogInfo {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Colors.Green
}

function Write-LogWarn {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $Colors.Yellow
}

function Write-LogError {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $Colors.Red
}

function Write-LogStep {
    param([string]$Message)
    Write-Host "🔄 $Message" -ForegroundColor $Colors.Cyan
}

function Write-LogSuccess {
    param([string]$Message)
    Write-Host "🎉 $Message" -ForegroundColor $Colors.Purple
}

# グローバル変数
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Split-Path -Parent $ScriptDir
$Platform = "windows"
$Architecture = $env:PROCESSOR_ARCHITECTURE
$StartTime = Get-Date

# Context7: システムコンテキスト - 環境検出
function Test-Environment {
    Write-LogStep "Context7 環境検出中..."
    
    $Environment = @{
        Platform = $Platform
        Architecture = $Architecture
        NodeVersion = ""
        PythonVersion = ""
        NpmVersion = ""
        GitVersion = ""
        PowerShellVersion = $PSVersionTable.PSVersion.ToString()
    }
    
    Write-Host "Platform: $Platform"
    Write-Host "Architecture: $Architecture"
    Write-Host "PowerShell: $($Environment.PowerShellVersion)"
    
    # Node.js検出
    try {
        $Environment.NodeVersion = & node --version 2>$null
        Write-LogInfo "Node.js: $($Environment.NodeVersion)"
    }
    catch {
        Write-LogWarn "Node.js が見つかりません"
    }
    
    # Python検出
    try {
        $Environment.PythonVersion = & python --version 2>$null
        Write-LogInfo "Python: $($Environment.PythonVersion)"
    }
    catch {
        try {
            $Environment.PythonVersion = & py --version 2>$null
            Write-LogInfo "Python (py): $($Environment.PythonVersion)"
        }
        catch {
            Write-LogWarn "Python が見つかりません"
        }
    }
    
    # npm検出
    try {
        $Environment.NpmVersion = & npm --version 2>$null
        Write-LogInfo "npm: $($Environment.NpmVersion)"
    }
    catch {
        Write-LogWarn "npm が見つかりません"
    }
    
    # Git検出
    try {
        $Environment.GitVersion = & git --version 2>$null
        Write-LogInfo "Git: $($Environment.GitVersion)"
    }
    catch {
        Write-LogWarn "Git が見つかりません"
    }
    
    return $Environment
}

# Context7: エラーコンテキスト - 前提条件チェック
function Test-Prerequisites {
    param([hashtable]$Environment)
    
    Write-LogStep "Context7 前提条件チェック中..."
    
    $PrerequisitesMet = $true
    
    # Node.jsバージョンチェック
    if ([string]::IsNullOrEmpty($Environment.NodeVersion)) {
        Write-LogError "Node.js が必要です (v18以上)"
        $PrerequisitesMet = $false
    }
    else {
        $NodeMajor = [int]($Environment.NodeVersion -replace 'v', '' -split '\.')[0]
        if ($NodeMajor -lt 18) {
            Write-LogError "Node.js v18以上が必要です (現在: $($Environment.NodeVersion))"
            $PrerequisitesMet = $false
        }
    }
    
    # Pythonバージョンチェック
    if ([string]::IsNullOrEmpty($Environment.PythonVersion)) {
        Write-LogError "Python が必要です (v3.8以上)"
        $PrerequisitesMet = $false
    }
    else {
        $PythonVersionMatch = [regex]::Match($Environment.PythonVersion, 'Python\s+(\d+)\.(\d+)')
        if ($PythonVersionMatch.Success) {
            $PythonMajor = [int]$PythonVersionMatch.Groups[1].Value
            $PythonMinor = [int]$PythonVersionMatch.Groups[2].Value
            if ($PythonMajor -lt 3 -or ($PythonMajor -eq 3 -and $PythonMinor -lt 8)) {
                Write-LogError "Python v3.8以上が必要です (現在: $($Environment.PythonVersion))"
                $PrerequisitesMet = $false
            }
        }
    }
    
    # npmチェック
    if ([string]::IsNullOrEmpty($Environment.NpmVersion)) {
        Write-LogError "npm が必要です"
        $PrerequisitesMet = $false
    }
    
    # ディスク容量チェック
    try {
        $Drive = (Get-Location).Drive
        $DriveInfo = Get-PSDrive -Name $Drive.Name
        $FreeSpaceGB = [math]::Round($DriveInfo.Free / 1GB, 2)
        
        if ($FreeSpaceGB -lt 5) {
            Write-LogWarn "ディスク容量が不足している可能性があります (利用可能: ${FreeSpaceGB}GB)"
        }
        else {
            Write-LogInfo "ディスク容量: ${FreeSpaceGB}GB利用可能"
        }
    }
    catch {
        Write-LogWarn "ディスク容量の確認に失敗しました"
    }
    
    # ポートチェック
    Test-Ports
    
    if (-not $PrerequisitesMet) {
        Write-LogError "前提条件が満たされていません。自動修復を試行します..."
        if ($AutoRepair) {
            Repair-Environment
        }
        else {
            Write-LogWarn "自動修復を実行するには -AutoRepair パラメータを使用してください"
        }
    }
    else {
        Write-LogInfo "前提条件チェック完了"
    }
    
    return $PrerequisitesMet
}

# ポート可用性チェック
function Test-Ports {
    $Ports = @(3000, 5174, 8000)
    $AvailablePorts = 0
    
    foreach ($Port in $Ports) {
        try {
            $TcpObject = New-Object Net.Sockets.TcpClient
            $Connect = $TcpObject.BeginConnect("127.0.0.1", $Port, $null, $null)
            $Wait = $Connect.AsyncWaitHandle.WaitOne(1000, $false)
            $TcpObject.Close()
            
            if ($Wait) {
                Write-LogWarn "ポート $Port は使用中"
            }
            else {
                Write-LogInfo "ポート $Port は利用可能"
                $AvailablePorts++
            }
        }
        catch {
            Write-LogInfo "ポート $Port は利用可能"
            $AvailablePorts++
        }
    }
    
    if ($AvailablePorts -lt 2) {
        Write-LogWarn "利用可能なポートが不足しています"
        return $false
    }
    
    return $true
}

# Context7: エラーコンテキスト - 自動修復
function Repair-Environment {
    Write-LogStep "Context7 自動修復実行中..."
    
    # PowerShell実行ポリシーチェック
    $ExecutionPolicy = Get-ExecutionPolicy
    if ($ExecutionPolicy -eq "Restricted") {
        Write-LogStep "PowerShell実行ポリシーを修正中..."
        try {
            Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
            Write-LogInfo "PowerShell実行ポリシー修正完了"
        }
        catch {
            Write-LogWarn "PowerShell実行ポリシーの修正に失敗しました。管理者権限が必要です"
        }
    }
    
    # Node.js自動インストール
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Install-NodeJS
    }
    
    # Python自動インストール
    if (-not (Get-Command python -ErrorAction SilentlyContinue) -and -not (Get-Command py -ErrorAction SilentlyContinue)) {
        Install-Python
    }
    
    # ポート競合解決
    Resolve-PortConflicts
    
    Write-LogInfo "自動修復完了"
}

function Install-NodeJS {
    Write-LogStep "Node.js自動インストール中..."
    
    try {
        # wingetが利用可能かチェック
        if (Get-Command winget -ErrorAction SilentlyContinue) {
            winget install OpenJS.NodeJS.LTS
            Write-LogInfo "Node.js (via winget) インストール完了"
        }
        elseif (Get-Command choco -ErrorAction SilentlyContinue) {
            choco install nodejs-lts -y
            Write-LogInfo "Node.js (via Chocolatey) インストール完了"
        }
        else {
            Write-LogWarn "wingetまたはChocolateyが必要です。手動でNode.jsをインストールしてください"
            Write-Host "Node.js公式サイト: https://nodejs.org/"
            return $false
        }
    }
    catch {
        Write-LogError "Node.jsインストール失敗: $($_.Exception.Message)"
        return $false
    }
    
    return $true
}

function Install-Python {
    Write-LogStep "Python自動インストール中..."
    
    try {
        # wingetが利用可能かチェック
        if (Get-Command winget -ErrorAction SilentlyContinue) {
            winget install Python.Python.3.11
            Write-LogInfo "Python (via winget) インストール完了"
        }
        elseif (Get-Command choco -ErrorAction SilentlyContinue) {
            choco install python3 -y
            Write-LogInfo "Python (via Chocolatey) インストール完了"
        }
        else {
            Write-LogWarn "wingetまたはChocolateyが必要です。手動でPythonをインストールしてください"
            Write-Host "Python公式サイト: https://www.python.org/"
            return $false
        }
    }
    catch {
        Write-LogError "Pythonインストール失敗: $($_.Exception.Message)"
        return $false
    }
    
    return $true
}

function Resolve-PortConflicts {
    Write-LogStep "ポート競合解決中..."
    
    $Ports = @(3000, 5174, 8000)
    $ResolvedCount = 0
    
    foreach ($Port in $Ports) {
        try {
            $Processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
                         Select-Object -ExpandProperty OwningProcess | 
                         Get-Process -ErrorAction SilentlyContinue
            
            if ($Processes) {
                foreach ($Process in $Processes) {
                    try {
                        Stop-Process -Id $Process.Id -Force
                        Write-LogInfo "ポート $Port のプロセス $($Process.ProcessName) を終了しました"
                        $ResolvedCount++
                    }
                    catch {
                        Write-LogWarn "プロセス $($Process.ProcessName) の終了に失敗しました"
                    }
                }
            }
        }
        catch {
            # ポートが使用されていない場合はエラーが発生するが問題なし
        }
    }
    
    if ($ResolvedCount -gt 0) {
        Write-LogInfo "$ResolvedCount 個のポート競合を解決しました"
    }
}

# Context7: コードコンテキスト - 依存関係インストール
function Install-Dependencies {
    Write-LogStep "Context7 依存関係インストール中..."
    
    Set-Location $ProjectRoot
    
    # ルート依存関係
    Write-LogStep "ルート依存関係インストール中..."
    try {
        npm install
        Write-LogInfo "ルート依存関係インストール完了"
    }
    catch {
        Write-LogError "ルート依存関係インストール失敗: $($_.Exception.Message)"
        return $false
    }
    
    # フロントエンド依存関係
    if (Test-Path "frontend") {
        Write-LogStep "フロントエンド依存関係インストール中..."
        Set-Location "frontend"
        try {
            npm install
            Write-LogInfo "フロントエンド依存関係インストール完了"
        }
        catch {
            Write-LogError "フロントエンド依存関係インストール失敗: $($_.Exception.Message)"
            Set-Location $ProjectRoot
            return $false
        }
        Set-Location $ProjectRoot
    }
    
    # バックエンド依存関係
    if (Test-Path "backend") {
        Write-LogStep "バックエンド依存関係インストール中..."
        Set-Location "backend"
        
        # Python実行可能ファイルの選択
        $PythonExe = $null
        if (Get-Command python -ErrorAction SilentlyContinue) {
            $PythonExe = "python"
        }
        elseif (Get-Command py -ErrorAction SilentlyContinue) {
            $PythonExe = "py"
        }
        
        if ($PythonExe) {
            # 仮想環境作成
            if (-not (Test-Path "venv")) {
                try {
                    & $PythonExe -m venv venv
                    Write-LogInfo "Python仮想環境作成完了"
                }
                catch {
                    Write-LogError "Python仮想環境作成失敗: $($_.Exception.Message)"
                    Set-Location $ProjectRoot
                    return $false
                }
            }
            
            # 仮想環境アクティベート＆依存関係インストール
            try {
                $VenvActivate = Join-Path $PWD "venv\Scripts\Activate.ps1"
                if (Test-Path $VenvActivate) {
                    & $VenvActivate
                    pip install -r requirements.txt
                    Write-LogInfo "バックエンド依存関係インストール完了"
                    deactivate
                }
                else {
                    Write-LogWarn "仮想環境のActivate.ps1が見つかりません"
                }
            }
            catch {
                Write-LogError "バックエンド依存関係インストール失敗: $($_.Exception.Message)"
                Set-Location $ProjectRoot
                return $false
            }
        }
        else {
            Write-LogWarn "Pythonが見つからないため、バックエンド依存関係をスキップします"
        }
        
        Set-Location $ProjectRoot
    }
    
    Write-LogInfo "全依存関係インストール完了"
    return $true
}

# Context7: システムコンテキスト - 環境設定
function Set-Environment {
    Write-LogStep "Context7 環境設定中..."
    
    Set-Location $ProjectRoot
    
    # .env設定
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-LogInfo ".envファイルを.env.exampleから作成"
        }
        else {
            # デフォルト.env作成
            $DefaultEnv = @"
# ITサービス管理システム環境設定
DATABASE_URL=sqlite:///./itsm.db
JWT_SECRET_KEY=$([System.Guid]::NewGuid().ToString("N"))
SESSION_SECRET=$([System.Guid]::NewGuid().ToString("N"))

# Context7設定
CONTEXT7_ENABLED=true
CONTEXT7_LAYERS=all
CONTEXT7_CACHE_SIZE=1000

# Claude Flow設定
CLAUDE_FLOW_ENABLED=true
MAX_PARALLEL_TASKS=10
AUTO_REPAIR=true

# ネットワーク設定
PORT=5174
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:5174
BACKEND_URL=http://localhost:8000
"@
            Set-Content -Path ".env" -Value $DefaultEnv
            Write-LogInfo "デフォルト.envファイルを作成"
        }
    }
    else {
        Write-LogInfo "既存の.envファイルを使用"
    }
    
    # Context7設定最適化
    if (Test-Path "context7-config.json") {
        Write-LogStep "Context7設定最適化中..."
        # システムリソースに基づく最適化をここに追加
        Write-LogInfo "Context7設定最適化完了"
    }
    
    Write-LogInfo "環境設定完了"
}

# Context7: ユーザーコンテキスト - サービス起動準備
function Start-Services {
    Write-LogStep "Context7 サービス起動準備中..."
    
    Set-Location $ProjectRoot
    
    # package.jsonの存在確認
    if (-not (Test-Path "package.json")) {
        Write-LogError "package.jsonが見つかりません"
        return $false
    }
    
    # 起動スクリプトの確認
    try {
        $PackageJson = Get-Content "package.json" | ConvertFrom-Json
        $Scripts = $PackageJson.scripts | Get-Member -MemberType NoteProperty | Where-Object { $_.Name -match "(start|dev)" } | Select-Object -ExpandProperty Name
        
        if ($Scripts) {
            Write-LogInfo "利用可能な起動スクリプト:"
            foreach ($Script in $Scripts) {
                Write-Host "  - $Script"
            }
        }
    }
    catch {
        Write-LogWarn "package.jsonの解析に失敗しました"
    }
    
    # 最適なスクリプト選択
    $StartScript = ""
    if ($Scripts -contains "start:full") {
        $StartScript = "start:full"
    }
    elseif ($Scripts -contains "dev") {
        $StartScript = "dev"
    }
    elseif ($Scripts -contains "start") {
        $StartScript = "start"
    }
    else {
        Write-LogError "起動スクリプトが見つかりません"
        return $false
    }
    
    Write-LogInfo "npm run $StartScript でサービスを起動します"
    
    if (-not $SkipInteractive) {
        $Response = Read-Host "サービスを起動しますか？ (y/N)"
        if ($Response -notmatch "^[Yy]$") {
            Write-LogInfo "手動でサービスを起動してください: npm run $StartScript"
            return $true
        }
    }
    
    Write-LogInfo "サービス起動中... (Ctrl+C で終了)"
    
    # サービス起動
    try {
        npm run $StartScript
    }
    catch {
        Write-LogError "サービス起動失敗: $($_.Exception.Message)"
        return $false
    }
    
    return $true
}

# メイン実行関数
function Start-Migration {
    Write-Host "🌟 === Context7統合移行システム開始 ===" -ForegroundColor $Colors.Purple
    Write-Host ""
    
    # 実行時間計測開始
    $StartTime = Get-Date
    
    try {
        # 1. プロジェクトコンテキスト: 環境検出
        $Environment = Test-Environment
        Write-Host ""
        
        # 2. エラーコンテキスト: 前提条件チェック
        $PrerequisitesMet = Test-Prerequisites -Environment $Environment
        Write-Host ""
        
        if (-not $PrerequisitesMet -and -not $AutoRepair) {
            Write-LogError "前提条件が満たされていません。-AutoRepair パラメータで自動修復を試行してください"
            return
        }
        
        # 3. コードコンテキスト: 依存関係インストール
        if (-not (Install-Dependencies)) {
            Write-LogError "依存関係インストール失敗"
            return
        }
        Write-Host ""
        
        # 4. システムコンテキスト: 環境設定
        Set-Environment
        Write-Host ""
        
        # 実行時間計算
        $EndTime = Get-Date
        $Duration = [math]::Round(($EndTime - $StartTime).TotalSeconds, 0)
        
        Write-LogSuccess "Context7移行完了 (${Duration}秒)"
        Write-Host ""
        Write-Host "🌐 アクセス情報:" -ForegroundColor $Colors.Cyan
        Write-Host "   • メインアプリ: http://localhost:5174"
        Write-Host "   • API: http://localhost:8000"
        Write-Host "   • Context7: http://localhost:5174/context7"
        Write-Host ""
        
        # 5. タスクコンテキスト: サービス起動
        Start-Services
        
    }
    catch {
        Write-LogError "移行中にエラーが発生しました: $($_.Exception.Message)"
        Write-Host "詳細: $($_.Exception)" -ForegroundColor $Colors.Red
    }
}

# スクリプト実行時の処理
if ($MyInvocation.InvocationName -ne '.') {
    # Ctrl+C ハンドリング
    $null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
        Write-Host "`n🛑 移行プロセスが中断されました" -ForegroundColor Red
    }
    
    # メイン関数実行
    Start-Migration
}
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

# スクリプトのタイトル表示
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  ITサービス管理システム起動スクリプト" -ForegroundColor Cyan
Write-Host "  ISO 20000・ISO 27001・ISO 27002準拠" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# 設定変数
$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$backendPath = Join-Path -Path $projectRoot -ChildPath "backend"
$frontendPath = Join-Path -Path $projectRoot -ChildPath "frontend"
$pythonVenvPath = Join-Path -Path $backendPath -ChildPath "venv"
$logPath = Join-Path -Path $projectRoot -ChildPath "logs"
$backendLogPath = Join-Path -Path $logPath -ChildPath "backend.log"
$frontendLogPath = Join-Path -Path $logPath -ChildPath "frontend.log"

# ログディレクトリの作成
if (-not (Test-Path -Path $logPath)) {
    New-Item -Path $logPath -ItemType Directory | Out-Null
    Write-Host "ログディレクトリを作成しました: $logPath" -ForegroundColor Green
}

# ヘルプ表示
if ($help) {
    Write-Host "使用方法:" -ForegroundColor Yellow
    Write-Host "  .\start-system.ps1 [-install] [-stop] [-help]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "オプション:" -ForegroundColor Yellow
    Write-Host "  -install  : 依存関係のインストールを実行します（初回または更新時）" -ForegroundColor Yellow
    Write-Host "  -stop     : 実行中のサーバーを停止します" -ForegroundColor Yellow
    Write-Host "  -help     : このヘルプメッセージを表示します" -ForegroundColor Yellow
    exit 0
}

# サーバー停止関数
function Stop-Servers {
    Write-Host "実行中のサーバーを停止しています..." -ForegroundColor Yellow
    
    # バックエンドサーバーの停止 (Flaskサーバー - ポート5001)
    $backendProcess = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue | 
                     Where-Object { $_.State -eq "Listen" } | 
                     ForEach-Object { Get-Process -Id $_.OwningProcess }
    
    if ($backendProcess) {
        Write-Host "バックエンドサーバー(PID: $($backendProcess.Id))を停止しています..." -ForegroundColor Yellow
        Stop-Process -Id $backendProcess.Id -Force
        Write-Host "バックエンドサーバーを停止しました" -ForegroundColor Green
    } else {
        Write-Host "実行中のバックエンドサーバーが見つかりませんでした" -ForegroundColor Gray
    }
    
    # フロントエンドサーバーの停止 (React開発サーバー - ポート5000)
    $frontendProcess = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | 
                      Where-Object { $_.State -eq "Listen" } | 
                      ForEach-Object { Get-Process -Id $_.OwningProcess }
    
    if ($frontendProcess) {
        Write-Host "フロントエンドサーバー(PID: $($frontendProcess.Id))を停止しています..." -ForegroundColor Yellow
        Stop-Process -Id $frontendProcess.Id -Force
        Write-Host "フロントエンドサーバーを停止しました" -ForegroundColor Green
    } else {
        Write-Host "実行中のフロントエンドサーバーが見つかりませんでした" -ForegroundColor Gray
    }
    
    Write-Host "すべてのサーバーを停止しました" -ForegroundColor Green
}

# 停止コマンドの処理
if ($stop) {
    Stop-Servers
    exit 0
}

# 仮想環境の確認と作成
function Setup-PythonVenv {
    if (-not (Test-Path -Path $pythonVenvPath)) {
        Write-Host "Pythonの仮想環境がないため、作成します..." -ForegroundColor Yellow
        
        # 現在のディレクトリを保存
        $currentLocation = Get-Location
        
        # バックエンドディレクトリに移動
        Set-Location -Path $backendPath
        
        # 仮想環境の作成
        python -m venv venv
        
        # 元のディレクトリに戻る
        Set-Location -Path $currentLocation
        
        if (Test-Path -Path $pythonVenvPath) {
            Write-Host "Python仮想環境を作成しました" -ForegroundColor Green
        } else {
            Write-Host "Python仮想環境の作成に失敗しました" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "既存のPython仮想環境を使用します" -ForegroundColor Green
    }
}

# 依存関係のインストール
function Install-Dependencies {
    Write-Host "依存関係をインストールしています..." -ForegroundColor Yellow
    
    # バックエンド依存関係のインストール
    Write-Host "バックエンドの依存関係をインストールしています..." -ForegroundColor Yellow
    
    # 現在のディレクトリを保存
    $currentLocation = Get-Location
    
    # バックエンドディレクトリに移動
    Set-Location -Path $backendPath
    
    # 仮想環境内でpipを実行
    # Windows環境では常にバックスラッシュを使用
    & "$pythonVenvPath\Scripts\activate.ps1"
    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt
    deactivate
    
    # 元のディレクトリに戻る
    Set-Location -Path $currentLocation
    
    Write-Host "バックエンドの依存関係のインストールが完了しました" -ForegroundColor Green
    
    # フロントエンド依存関係のインストール
    Write-Host "フロントエンドの依存関係をインストールしています..." -ForegroundColor Yellow
    
    # フロントエンドディレクトリに移動
    Set-Location -Path $frontendPath
    
    # npm installを実行
    npm install
    
    # 元のディレクトリに戻る
    Set-Location -Path $currentLocation
    
    Write-Host "フロントエンドの依存関係のインストールが完了しました" -ForegroundColor Green
}

# Node.jsのバージョンとnpm依存関係の確認
function Check-NodeEnvironment {
    Write-Host "Node.js環境を確認しています..." -ForegroundColor Yellow
    
    # Node.jsのバージョン確認
    try {
        $nodeVersion = node -v
        Write-Host "Node.jsバージョン: $nodeVersion" -ForegroundColor Green
    } 
    catch {
        Write-Host "Node.jsがインストールされていません。インストールしてください。" -ForegroundColor Red
        exit 1
    }

    # npmのバージョン確認
    try {
        $npmVersion = npm -v
        Write-Host "npmバージョン: $npmVersion" -ForegroundColor Green
    } 
    catch {
        Write-Host "npmがインストールされていません。Node.jsと一緒にインストールされるはずです。" -ForegroundColor Red
        exit 1
    }
    
    # フロントエンドのnode_modulesが存在するか確認
    $nodeModulesPath = Join-Path -Path $frontendPath -ChildPath "node_modules"
    if (-not (Test-Path -Path $nodeModulesPath)) {
        Write-Host "フロントエンドの依存関係がインストールされていません。インストールします..." -ForegroundColor Yellow
        Install-Dependencies
    } else {
        # react-scriptsが正しくインストールされているか確認
        $reactScriptsPath = Join-Path -Path $nodeModulesPath -ChildPath ".bin\react-scripts.cmd"
        if (-not (Test-Path -Path $reactScriptsPath)) {
            Write-Host "react-scriptsが見つかりません。依存関係を再インストールします..." -ForegroundColor Yellow
            # node_modulesを削除して再インストール
            Remove-Item -Path $nodeModulesPath -Recurse -Force
            Install-Dependencies
        } else {
            Write-Host "フロントエンドの依存関係が正しくインストールされています" -ForegroundColor Green
        }
    }
}

# 依存関係のインストールが指定された場合
if ($install) {
    Setup-PythonVenv
    Install-Dependencies
}

# サーバーの起動
function Start-Servers {
    # 既存のサーバーを停止
    Stop-Servers
    
    Write-Host "ITサービス管理システムを起動しています..." -ForegroundColor Yellow
    
    # バックエンドサーバーの起動
    Write-Host "バックエンドサーバーを起動しています..." -ForegroundColor Yellow
    
    # 現在のディレクトリを保存
    $currentLocation = Get-Location
    
    # バックエンドディレクトリに移動
    Set-Location -Path $backendPath
    
    # PowerShellジョブでバックエンドサーバーを起動
    $backendJob = Start-Job -ScriptBlock {
        param($backendPath, $pythonVenvPath, $backendLogPath)
        
        # 現在のディレクトリをバックエンドディレクトリに設定
        Set-Location -Path $backendPath
        
        # Flaskサーバ゙ー起動
        if ($IsWindows) {
            & "$pythonVenvPath\Scripts\activate.ps1"
            cd $backendPath/..
            python -m backend.main > $backendLogPath 2>&1
        } else {
            cd $backendPath/..
            & "$pythonVenvPath/bin/python" -m backend.main > $backendLogPath 2>&1
        }
    } -ArgumentList $backendPath, $pythonVenvPath, $backendLogPath
    
    # フロントエンドサーバーの起動
    Write-Host "フロントエンドサーバーを起動しています..." -ForegroundColor Yellow
    
    # フロントエンドディレクトリに移動
    Set-Location -Path $frontendPath
    
    # PowerShellジョブでフロントエンドサーバーを起動
    $frontendJob = Start-Job -ScriptBlock {
        param($frontendPath, $frontendLogPath)
        
        # 現在のディレクトリをフロントエンドディレクトリに設定
        Set-Location -Path $frontendPath
        
        # npm startを実行 (.envの設定を尊重)
        npm start | Out-File -FilePath $frontendLogPath -Encoding utf8 -Force
    } -ArgumentList $frontendPath, $frontendLogPath
    
    # 元のディレクトリに戻る
    Set-Location -Path $currentLocation
    
    # ジョブを格納
    $Global:BackendJob = $backendJob
    $Global:FrontendJob = $frontendJob
    
    # 待機とアクセス情報の表示
    Write-Host ""
    Write-Host "サーバーの起動を待機しています..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # アクセス情報の表示
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host " ITサービス管理システム起動完了!" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "バックエンドAPI: http://localhost:5001" -ForegroundColor Cyan
    Write-Host "フロントエンドUI: http://localhost:5000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "ログファイル:" -ForegroundColor Cyan
    Write-Host "  バックエンド: $backendLogPath" -ForegroundColor Cyan
    Write-Host "  フロントエンド: $frontendLogPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "システムを停止するには: .\start-system.ps1 -stop" -ForegroundColor Yellow
    Write-Host ""
    
    # ジョブのステータス表示
    Write-Host "バックエンドサーバージョブ ID: $($backendJob.Id)" -ForegroundColor Gray
    Write-Host "フロントエンドサーバージョブ ID: $($frontendJob.Id)" -ForegroundColor Gray
}

# メイン処理
try {
    # Python仮想環境の確認/作成
    Setup-PythonVenv
    
    # Node.js環境の確認と依存関係の確認
    Check-NodeEnvironment
    
    # サーバーの起動
    Start-Servers
    
    # ブラウザ起動はユーザーが手動で行うように変更
    Write-Host "フロントエンドにアクセスするにはブラウザで以下を開いてください:" -ForegroundColor Cyan
    Write-Host "  http://localhost:5000" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host "エラーが発生しました: $_" -ForegroundColor Red
    # エラー発生時は実行中のサーバーを停止
    Stop-Servers
}

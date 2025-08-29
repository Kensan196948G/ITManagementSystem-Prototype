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
$pythonVenvPath = Join-Path -Path $backendPath -ChildPath "venv" # backendディレクトリ内のvenvを優先
$logPath = Join-Path -Path $projectRoot -ChildPath "logs"
$backendLogPath = Join-Path -Path $logPath -ChildPath "backend.log"
$frontendLogPath = Join-Path -Path $logPath -ChildPath "frontend.log"
$frontendPort = 5000 # フロントエンドサーバーが使用するポート
 
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
    
    # バックエンドサーバーの停止 (Flaskサーバー - ポート5001を想定)
    # ポート番号は動的に変更される可能性があるため、$backendPort を参照できると良いが、
    # この関数は Start-Servers 外からも呼ばれるため、ここでは固定値または環境変数等で管理するのが望ましい
    # 今回の修正範囲では Start-Servers 内の $backendPort を直接参照できない
    $targetBackendPort = 5001 # デフォルトのポートで停止を試みる
    # $Global:BackendPort のようなグローバル変数や設定ファイルから読み込む方法も検討可能
    
    $backendProcess = Get-NetTCPConnection -LocalPort $targetBackendPort -ErrorAction SilentlyContinue | 
                     Where-Object { $_.State -eq "Listen" } | 
                     ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue }
    
    if ($backendProcess) {
        Write-Host "バックエンドサーバー(PID: $($backendProcess.Id), Port: $targetBackendPort)を停止しています..." -ForegroundColor Yellow
        Stop-Process -Id $backendProcess.Id -Force
        Write-Host "バックエンドサーバーを停止しました" -ForegroundColor Green
    } else {
        Write-Host "実行中のバックエンドサーバー(Port: $targetBackendPort)が見つかりませんでした" -ForegroundColor Gray
    }
    
    # フロントエンドサーバーの停止 (React開発サーバー - ポート5000)
    $frontendProcess = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | 
                      Where-Object { $_.State -eq "Listen" } | 
                      ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue }
    
    if ($frontendProcess) {
        Write-Host "フロントエンドサーバー(PID: $($frontendProcess.Id))を停止しています..." -ForegroundColor Yellow
        Stop-Process -Id $frontendProcess.Id -Force
        Write-Host "フロントエンドサーバーを停止しました" -ForegroundColor Green
    } else {
        Write-Host "実行中のフロントエンドサーバーが見つかりませんでした" -ForegroundColor Gray
    }
    
    Write-Host "すべてのサーバーの停止処理が完了しました" -ForegroundColor Green
}

# 停止コマンドの処理
if ($stop) {
    Stop-Servers
    exit 0
}

# 仮想環境の確認と作成
function Setup-PythonVenv {
    if (-not (Test-Path -Path $pythonVenvPath)) {
        Write-Host "Pythonの仮想環境 ($pythonVenvPath) がないため、作成します..." -ForegroundColor Yellow
        
        $currentLocation = Get-Location
        Set-Location -Path $backendPath
        
        python -m venv venv # backendディレクトリ内にvenvを作成
        
        Set-Location -Path $currentLocation
        
        if (Test-Path -Path $pythonVenvPath) {
            Write-Host "Python仮想環境を作成しました: $pythonVenvPath" -ForegroundColor Green
        } else {
            Write-Host "Python仮想環境の作成に失敗しました" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "既存のPython仮想環境を使用します: $pythonVenvPath" -ForegroundColor Green
    }
}

# 依存関係のインストール
function Install-Dependencies {
    Write-Host "依存関係をインストールしています..." -ForegroundColor Yellow
    
    # バックエンド依存関係のインストール
    Write-Host "バックエンドの依存関係をインストールしています ($backendPath)..." -ForegroundColor Yellow
    
    $currentLocation = Get-Location
    Set-Location -Path $backendPath
    
    # 仮想環境内のPython実行ファイルを特定してpipを実行
    $pythonExecutable = Join-Path $pythonVenvPath "Scripts\python.exe"
    if (-not (Test-Path $pythonExecutable)) {
        Write-Error "Python仮想環境の実行ファイルが見つかりません: $pythonExecutable"
        exit 1
    }

    Write-Host "  pipをアップグレードしています..."
    & $pythonExecutable -m pip install --upgrade pip
    if ($LASTEXITCODE -ne 0) {
        Write-Error "pipのアップグレードに失敗しました。"
        exit 1
    }

    Write-Host "  requirements.txt から依存関係をインストールしています..."
    & $pythonExecutable -m pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Error "バックエンドの依存関係のインストールに失敗しました (requirements.txt)。"
        exit 1
    }
    
    Set-Location -Path $currentLocation
    
    Write-Host "バックエンドの依存関係のインストールが完了しました" -ForegroundColor Green
    
    # フロントエンド依存関係のインストール
    Write-Host "フロントエンドの依存関係をインストールしています ($frontendPath)..." -ForegroundColor Yellow
    
    Set-Location -Path $frontendPath
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "フロントエンドの依存関係のインストールに失敗しました (npm install)。"
        exit 1
    }
    Set-Location -Path $currentLocation
    
    Write-Host "フロントエンドの依存関係のインストールが完了しました" -ForegroundColor Green
}

# Node.jsのバージョンとnpm依存関係の確認
function Check-NodeEnvironment {
    Write-Host "Node.js環境を確認しています..." -ForegroundColor Yellow
    
    try {
        $nodeVersion = node -v
        Write-Host "Node.jsバージョン: $nodeVersion" -ForegroundColor Green
    } 
    catch {
        Write-Host "Node.jsがインストールされていません。インストールしてください。" -ForegroundColor Red
        exit 1
    }

    try {
        $npmVersion = npm -v
        Write-Host "npmバージョン: $npmVersion" -ForegroundColor Green
    } 
    catch {
        Write-Host "npmがインストールされていません。Node.jsと一緒にインストールされるはずです。" -ForegroundColor Red
        exit 1
    }
    
    $nodeModulesPath = Join-Path -Path $frontendPath -ChildPath "node_modules"
    if (-not (Test-Path -Path $nodeModulesPath)) {
        Write-Host "フロントエンドの依存関係がインストールされていません。インストールします..." -ForegroundColor Yellow
        Install-Dependencies # Install-Dependencies内でフロントエンドもインストールされる
    } else {
        $reactScriptsPath = Join-Path -Path $nodeModulesPath -ChildPath ".bin\react-scripts.cmd"
        if (-not (Test-Path -Path $reactScriptsPath)) {
            Write-Host "react-scriptsが見つかりません。依存関係を再インストールします..." -ForegroundColor Yellow
            Remove-Item -Path $nodeModulesPath -Recurse -Force
            Install-Dependencies # Install-Dependencies内でフロントエンドもインストールされる
        } else {
            Write-Host "フロントエンドの依存関係が正しくインストールされています" -ForegroundColor Green
        }
    }
}

# 依存関係のインストールが指定された場合
if ($install) {
    Setup-PythonVenv
    Install-Dependencies # Install-Dependencies はバックエンドとフロントエンド両方を行う
}

# サーバーの起動
function Start-Servers {
    # 既存のサーバーを停止
    Stop-Servers
    
    Write-Host "ITサービス管理システムを起動しています..." -ForegroundColor Yellow
    
    # Backend Server Configuration
    $backendPort = 5001 # バックエンドサーバーが使用するポート
    # $projectRoot はスクリプトの冒頭で定義済み
    $backendStartupLogPath = Join-Path $projectRoot "logs" "backend_startup.log" # $projectRoot ベースに変更
    if (-not (Test-Path (Split-Path $backendStartupLogPath -Parent))) {
        New-Item -ItemType Directory -Path (Split-Path $backendStartupLogPath -Parent) -Force | Out-Null
    }
 
    # バックエンドサーバーの起動
    Write-Host "バックエンドサーバーをポート $backendPort で起動し、ログを $backendStartupLogPath に出力します..." -ForegroundColor Yellow
    
    $currentLocation = Get-Location # フロントエンド起動後に戻るため保存
 
    # PowerShellジョブでバックエンドサーバーを起動
    $backendJob = Start-Job -ScriptBlock {
        param($projectRootParam, $backendLogOutput) # 引数名を $backendLogOutput に変更
        
        $backendDir = Join-Path $projectRootParam "backend"
        Push-Location $backendDir # backendディレクトリに移動
        Write-Host "バックエンドの作業ディレクトリ: $(Get-Location)"

        # 仮想環境のPython実行ファイルを特定 (venvはbackendディレクトリ直下を想定)
        $pythonExecutable = Join-Path $backendDir "venv\Scripts\python.exe"

        if (-not (Test-Path $pythonExecutable)) {
            Write-Error "仮想環境のPython実行ファイルが見つかりません: $pythonExecutable"
            Write-Error "Python仮想環境が正しくセットアップされているか確認してください。スクリプトを停止します。"
            exit 1 # ジョブを停止
        } else {
             Write-Host "Python実行ファイルとして $pythonExecutable を使用します。" -ForegroundColor DarkCyan
        }
        
        Write-Output "Backend job started. Running main.py. Logging to $backendLogOutput"
        # backend/main.py を直接実行。ホスト、ポート、デバッグモードはmain.py内のapp.run()で設定済み。
        # FLASK_APP, FLASK_ENV, FLASK_DEBUG の環境変数設定は不要。
        try {
            & $pythonExecutable main.py *>> "$backendLogOutput" # main.py を直接実行
            # エラーが発生した場合、ジョブの出力ストリームにエラーメッセージが含まれるので、
            # Receive-Job で確認するか、ログファイル $backendLogOutput を確認。
        } catch {
            # Start-Job の ScriptBlock 内での Write-Error は直接ホストには表示されにくい。
            # エラー内容は標準エラー出力経由で $backendLogOutput にリダイレクトされる。
            $errorMessage = "バックエンドサーバー(main.py)の起動中にエラーが発生しました: $($_.Exception.Message)"
            Write-Output $errorMessage # ジョブの出力に追加
            $errorMessage | Out-File -FilePath $backendLogOutput -Append # ログにも追記
        }
        
        Pop-Location # 元のディレクトリに戻る
    } -ArgumentList $projectRoot, $backendStartupLogPath
    
    # フロントエンドサーバーの起動
    Write-Host "フロントエンドサーバーをポート $frontendPort で起動します (cross-env使用)..." -ForegroundColor Yellow
    
    Set-Location -Path $frontendPath
    
    # $frontendPort を $using:frontendPort で参照できるように、ArgumentListとparamブロックに追加
    $frontendJob = Start-Job -ScriptBlock {
        param($frontendPathLocal, $frontendLogPathLocal, $frontendPortForJob)
        
        Write-Output "Frontend job started. Attempting to use port $frontendPortForJob with cross-env"
        Set-Location -Path $frontendPathLocal
        # cross-env を使用してPORT環境変数を設定し、npm start を実行
        # 出力は指定されたログファイルに追記する
        # npx cross-env を使用してPORT環境変数を設定し、npm start を実行
        # 出力は指定されたログファイルに追記する
        # npm start の標準出力と標準エラー出力をログファイルにリダイレクト
        npx cross-env PORT=$frontendPortForJob npm start *>> "$frontendLogPathLocal"
        if ($LASTEXITCODE -ne 0) {
            $errorMessage = "フロントエンドサーバー(npm start)の起動に失敗しました。ログを確認してください: $frontendLogPathLocal"
            Write-Output $errorMessage # ジョブの出力に追加
            # このエラーメッセージもログファイルに追記される
        }
    } -ArgumentList $frontendPath, $frontendLogPath, $frontendPort # $frontendPort を引数リストに追加
    
    Set-Location -Path $currentLocation # スクリプト実行開始時のディレクトリに戻る
    
    $Global:BackendJob = $backendJob
    $Global:FrontendJob = $frontendJob
    
    Write-Host ""
    Write-Host "サーバーの起動を待機しています..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host " ITサービス管理システム起動完了!" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "バックエンドAPI: http://localhost:$backendPort" -ForegroundColor Cyan # $backendPort変数を参照
    Write-Host "フロントエンドUI: http://localhost:$frontendPort" -ForegroundColor Cyan # $frontendPort変数を参照
    Write-Host ""
    Write-Host "ログファイル:" -ForegroundColor Cyan
    Write-Host "  バックエンド (起動ログ): $backendStartupLogPath" -ForegroundColor Cyan
    Write-Host "  バックエンド (ジョブ出力): Get-Job -Id $($backendJob.Id) | Receive-Job" -ForegroundColor Cyan
    Write-Host "  フロントエンド: $frontendLogPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "システムを停止するには: .\start-system.ps1 -stop" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "バックエンドサーバージョブ ID: $($backendJob.Id)" -ForegroundColor Gray
    Write-Host "フロントエンドサーバージョブ ID: $($frontendJob.Id)" -ForegroundColor Gray
}

# メイン処理
try {
    Setup-PythonVenv
    Check-NodeEnvironment
    Start-Servers
    
    Write-Host "フロントエンドにアクセスするにはブラウザで以下を開いてください:" -ForegroundColor Cyan
    Write-Host "  http://localhost:$frontendPort" -ForegroundColor Cyan # $frontendPort変数を参照
    Write-Host ""
    
} catch {
    Write-Host "エラーが発生しました: $_" -ForegroundColor Red
    Stop-Servers
}
# PowerShellスクリプト: setup_and_run.ps1
# 目的: フロントエンド（packages/frontend）とバックエンド（packages/backend）の依存関係インストール、
# ビルド、Linter、テスト、サーバ起動を全自動で実行し、ログを./logs/に保存する。

# ログディレクトリ作成
$logDir = Join-Path -Path $PSScriptRoot -ChildPath "logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

# フロントエンドディレクトリ
$frontendDir = Join-Path -Path $PSScriptRoot -ChildPath "packages/frontend"
# バックエンドディレクトリ
$backendDir = Join-Path -Path $PSScriptRoot -ChildPath "packages/backend"

# ログファイルパス
$npmInstallLog = Join-Path $logDir "npm_install.log"
$pipInstallLog = Join-Path $logDir "pip_install.log"
$frontendBuildLog = Join-Path $logDir "frontend_build.log"
$frontendLintLog = Join-Path $logDir "frontend_lint.log"
$backendLintLog = Join-Path $logDir "backend_lint.log"
$frontendTestLog = Join-Path $logDir "frontend_test.log"
$backendTestLog = Join-Path $logDir "backend_test.log"
$frontendServerLog = Join-Path $logDir "frontend_server.log"
$backendServerLog = Join-Path $logDir "backend_server.log"

# ヘルパー関数: コマンド実行とログ保存
function Run-Command {
    param(
        [string]$Command,
        [string]$WorkingDirectory,
        [string]$LogFile
    )
    Write-Host "=== 実行中: $Command ==="
    Push-Location $WorkingDirectory
    try {
        # コマンドを実行し、標準出力・標準エラーをログにリダイレクト
        & powershell -Command "$Command" *>&1 | Tee-Object -FilePath $LogFile
        if ($LASTEXITCODE -ne 0) {
            Write-Host "エラー: コマンド '$Command' が失敗しました。ログ: $LogFile"
            exit $LASTEXITCODE
        }
    }
    finally {
        Pop-Location
    }
}

# 1. npm install (frontend)
Run-Command -Command "npm install" -WorkingDirectory $frontendDir -LogFile $npmInstallLog

# 2. pip install -r requirements.txt (backend)
Run-Command -Command "pip install -r requirements.txt" -WorkingDirectory $backendDir -LogFile $pipInstallLog

# 3. フロントエンドビルド (Vite)
Run-Command -Command "npm run build" -WorkingDirectory $frontendDir -LogFile $frontendBuildLog

# 4. フロントエンドLinter (eslint)
Run-Command -Command "npx eslint . --ext .js,.jsx,.ts,.tsx" -WorkingDirectory $frontendDir -LogFile $frontendLintLog

# 5. バックエンドLinter (flake8)
Run-Command -Command "flake8 ." -WorkingDirectory $backendDir -LogFile $backendLintLog

# 6. フロントエンドテスト（カバレッジ含む）
Run-Command -Command "npm run test -- --coverage" -WorkingDirectory $frontendDir -LogFile $frontendTestLog

# 7. バックエンドテスト（pytestカバレッジ）
Run-Command -Command "pytest --cov=." -WorkingDirectory $backendDir -LogFile $backendTestLog

# 8. フロントエンド開発サーバ起動 (Vite)
Write-Host "=== フロントエンド開発サーバ起動中 (http://localhost:3000) ==="
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd `"$frontendDir`"; npm run dev *>&1 | Tee-Object -FilePath `"$frontendServerLog`"" -WindowStyle Normal

# 9. バックエンド開発サーバ起動 (Flask)
Write-Host "=== バックエンド開発サーバ起動中 (http://localhost:5000) ==="
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd `"$backendDir`"; set FLASK_APP=app.py; flask run *>&1 | Tee-Object -FilePath `"$backendServerLog`"" -WindowStyle Normal

Write-Host "=== 全処理完了 ==="
Write-Host "フロントエンド開発サーバ: http://localhost:3000"
Write-Host "バックエンド開発サーバ: http://localhost:5000"
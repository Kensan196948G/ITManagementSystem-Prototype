# 依存関係管理モジュール
function Initialize-Environment {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BackendPath,
        [Parameter(Mandatory = $true)]
        [string]$FrontendPath
    )

    # グローバル変数設定
    $Global:backendPath = $BackendPath
    $Global:frontendPath = $FrontendPath
    $Global:RepairLogFile = Join-Path $PSScriptRoot "..\repair_log.txt"

    # ログ初期化
    Initialize-Logging
}

function Install-BackendDependencies {
    Write-Log "バックエンド依存関係のチェックを開始します" -Level INFO

    try {
        # Python仮想環境チェック
        if (-not (Test-Path (Join-Path $backendPath "venv"))) {
            Write-Log "Python仮想環境が見つかりません。作成します..." -Level WARN
            python -m venv (Join-Path $backendPath "venv")
        }

        # 仮想環境アクティベート
        $activateScript = Join-Path $backendPath "venv\Scripts\Activate.ps1"
        if (Test-Path $activateScript) {
            . $activateScript
        }

        # 依存関係インストール
        pip install -r (Join-Path $backendPath "requirements.txt") --quiet
        Write-Log "バックエンド依存関係のインストールが完了しました" -Level INFO
    }
    catch {
        Write-Log "バックエンド依存関係のインストールに失敗しました: $_" -Level ERROR
        throw
    }
}

function Install-FrontendDependencies {
    Write-Log "フロントエンド依存関係のチェックを開始します" -Level INFO

    try {
        # node_modulesディレクトリチェック
        if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
            Write-Log "node_modulesが見つかりません。インストールします..." -Level WARN
            npm install --prefix $frontendPath --silent
        }
        else {
            # 依存関係チェック
            npm outdated --prefix $frontendPath --silent
            if ($LASTEXITCODE -ne 0) {
                Write-Log "依存関係の更新が必要です。更新します..." -Level WARN
                npm install --prefix $frontendPath --silent
            }
        }

        Write-Log "フロントエンド依存関係のインストールが完了しました" -Level INFO
    }
    catch {
        Write-Log "フロントエンド依存関係のインストールに失敗しました: $_" -Level ERROR
        throw
    }
}

function Check-Environment {
    [CmdletBinding()]
    param(
        [switch]$Detailed
    )

    $result = @{
        Success      = $true
        Messages     = @()
        Errors       = @()
        Requirements = @{
            Python            = "3.8+"
            NodeJS            = "16+"
            PowerShellModules = @(
                @{Name = "PSSQLite"; MinVersion = "1.2.0" },
                @{Name = "PSLogger"; MinVersion = "2.1.0" },
                @{Name = "PSProcessUtils"; MinVersion = "1.0.0" }
            )
        }
    }

    # Pythonチェック
    try {
        $pythonVersion = (python --version 2>&1).ToString()
        if ($pythonVersion -match "Python (\d+\.\d+\.\d+)") {
            $ver = [version]$Matches[1]
            if ($ver -ge [version]"3.8.0") {
                $result.Messages += "Pythonバージョン: $pythonVersion (要件を満たしています)"
            }
            else {
                $result.Errors += "Pythonバージョンが不足: $pythonVersion (必要: 3.8+)"
                $result.Success = $false
            }
        }
        else {
            $result.Errors += "Pythonバージョンの取得に失敗"
            $result.Success = $false
        }
    }
    catch {
        $result.Errors += "Pythonがインストールされていません"
        $result.Success = $false
    }

    # Node.jsチェック
    try {
        $nodeVersion = (node --version).ToString().TrimStart('v')
        if ([version]$nodeVersion -ge [version]"16.0.0") {
            $result.Messages += "Node.jsバージョン: v$nodeVersion (要件を満たしています)"
        }
        else {
            $result.Errors += "Node.jsバージョンが不足: v$nodeVersion (必要: v16+)"
            $result.Success = $false
        }
    }
    catch {
        $result.Errors += "Node.jsがインストールされていません"
        $result.Success = $false
    }

    # PowerShellモジュールチェック
    foreach ($module in $result.Requirements.PowerShellModules) {
        $installed = Get-Module -ListAvailable -Name $module.Name
        if (-not $installed) {
            $result.Errors += "PowerShellモジュールが不足: $($module.Name)"
            $result.Success = $false
            continue
        }

        $installedVersion = [version]$installed.Version
        $requiredVersion = [version]$module.MinVersion
        if ($installedVersion -lt $requiredVersion) {
            $result.Errors += "PowerShellモジュールのバージョン不足: $($module.Name) (インストール: $installedVersion, 必要: $requiredVersion)"
            $result.Success = $false
        }
        else {
            $result.Messages += "PowerShellモジュール: $($module.Name) v$installedVersion (要件を満たしています)"
        }
    }

    # 結果出力
    if ($Detailed) {
        return $result
    }

    if (-not $result.Success) {
        $result.Errors | ForEach-Object { Write-Log $_ -Level ERROR }
        throw "環境チェックに失敗しました"
    }

    $result.Messages | ForEach-Object { Write-Log $_ -Level INFO }
    return $true
}

function Install-PowerShellModules {
    [CmdletBinding()]
    param(
        [switch]$Force
    )

    try {
        $modules = @(
            @{Name = "PSSQLite"; MinVersion = "1.2.0" },
            @{Name = "PSLogger"; MinVersion = "2.1.0" },
            @{Name = "PSProcessUtils"; MinVersion = "1.0.0" }
        )

        foreach ($module in $modules) {
            $params = @{
                Name           = $module.Name
                MinimumVersion = $module.MinVersion
                Scope          = "CurrentUser"
                Force          = $Force
                AllowClobber   = $true
                ErrorAction    = "Stop"
            }
            
            Write-Log "PowerShellモジュール $($module.Name) (最低バージョン: $($module.MinVersion)) をインストール中..." -Level INFO
            Install-Module @params
            Write-Log "PowerShellモジュール $($module.Name) のインストールが完了しました" -Level INFO
        }

        Write-Log "すべてのPowerShellモジュールのインストールが完了しました" -Level SUCCESS
    }
    catch {
        Write-Log "PowerShellモジュールのインストールに失敗: $_" -Level FATAL
        throw "PowerShellモジュールインストールエラー: $_"
    }
}
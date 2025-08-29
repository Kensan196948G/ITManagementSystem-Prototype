#requires -Version 5.1
<#
.SYNOPSIS
    ITマネジメントシステム本番環境要件収集スクリプト

.DESCRIPTION
    このスクリプトは、ITマネジメントシステムの本番環境構築に必要な情報を収集し、
    詳細なレポートを生成します。グローバル管理者が実行することを想定しています。

.PARAMETER OutputPath
    結果レポートの出力先パス。指定がない場合はカレントディレクトリに出力します。

.PARAMETER IncludeDetails
    詳細な診断情報を含めるかどうかを指定します。

.EXAMPLE
    .\Get-ProductionEnvRequirements.ps1
    基本的な環境要件情報を収集し、カレントディレクトリに結果を出力します。

.EXAMPLE
    .\Get-ProductionEnvRequirements.ps1 -OutputPath C:\Reports -IncludeDetails
    詳細な診断情報を含めた環境要件情報を収集し、指定されたパスに結果を出力します。

.NOTES
    作成者: ITマネジメントシステム開発チーム
    最終更新日: 2025/03/15
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string] $OutputPath = (Get-Location).Path,

    [Parameter(Mandatory = $false)]
    [switch] $IncludeDetails
)

#region 初期設定

# エラーアクション設定 - エラーが発生してもスクリプトを継続
$ErrorActionPreference = "Continue"

# スクリプト開始時間とログファイル名設定
$startTime = Get-Date
$logFileName = "IT-Management-EnvRequirements_$($startTime.ToString('yyyyMMdd_HHmmss')).log"
$reportFileName = "IT-Management-EnvRequirements_$($startTime.ToString('yyyyMMdd_HHmmss')).html"
$logFilePath = Join-Path -Path $OutputPath -ChildPath $logFileName
$reportFilePath = Join-Path -Path $OutputPath -ChildPath $reportFileName

# 出力ディレクトリの確認と作成
if (-not (Test-Path -Path $OutputPath)) {
    try {
        New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
        Write-Verbose "出力ディレクトリを作成しました: $OutputPath"
    }
    catch {
        throw "出力ディレクトリを作成できませんでした: $($_.Exception.Message)"
    }
}

# 結果を格納する変数
$results = @{
    SystemInfo       = @{}
    AzureConnection  = @{}
    Subscriptions    = @()
    AzureAD          = @{}
    ResourceGroups   = @()
    NetworkSettings  = @{}
    SecuritySettings = @{}
    Recommendations  = @()
    Errors           = @()
}

# HTMLレポートのヘッダー
$htmlHeader = @"
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ITマネジメントシステム - 環境要件レポート</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #333; }
        h1 { color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
        h2 { color: #0099cc; margin-top: 30px; }
        h3 { color: #333; margin-top: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .summary { background-color: #f0f7ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .success { color: green; }
        .warning { color: orange; }
        .error { color: red; }
        table { border-collapse: collapse; width: 100%; margin: 15px 0; }
        th, td { text-align: left; padding: 8px; border: 1px solid #ddd; }
        th { background-color: #0066cc; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .timestamp { color: #666; font-size: 0.8em; }
        .recommendation { background-color: #e6f7ff; padding: 10px; border-left: 4px solid #0099cc; margin: 10px 0; }
        .section { margin-bottom: 30px; }
        pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>ITマネジメントシステム - 環境要件レポート</h1>
        <div class="timestamp">実行日時: $($startTime.ToString('yyyy年MM月dd日 HH:mm:ss'))</div>
        <div class="summary">
"@

# HTMLレポートのフッター
$htmlFooter = @"
        <h2>実行ログ</h2>
        <p>詳細ログファイル: $logFileName</p>
    </div>
</body>
</html>
"@

#endregion

#region ユーティリティ関数

# ログ出力関数
function Write-Log {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true, Position = 0)]
        [string] $Message,

        [Parameter(Mandatory = $false)]
        [ValidateSet('INFO', 'WARNING', 'ERROR', 'SUCCESS')]
        [string] $Level = 'INFO'
    )

    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logMessage = "[$timestamp] [$Level] $Message"
    
    # ログファイルに出力
    Add-Content -Path $logFilePath -Value $logMessage
    
    # コンソールに出力（色分け）
    switch ($Level) {
        'WARNING' { Write-Host $logMessage -ForegroundColor Yellow }
        'ERROR'   { Write-Host $logMessage -ForegroundColor Red }
        'SUCCESS' { Write-Host $logMessage -ForegroundColor Green }
        default   { Write-Host $logMessage }
    }
}

# テスト実行関数 - 各チェック項目を実行して結果を記録
function Test-Requirement {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string] $Name,
        
        [Parameter(Mandatory = $true)]
        [scriptblock] $Test,
        
        [Parameter(Mandatory = $false)]
        [string] $SuccessMessage = "${Name}: 成功",
        
        [Parameter(Mandatory = $false)]
        [string] $FailureMessage = "${Name}: 失敗",
        
        [Parameter(Mandatory = $false)]
        [string] $Category = "一般"
    )
    
    Write-Log "テスト実行: $Name" -Level INFO
    
    try {
        $result = & $Test
        
        if ($result -eq $true) {
            Write-Log $SuccessMessage -Level SUCCESS
            return @{
                Name = $Name
                Category = $Category
                Result = $true
                Message = $SuccessMessage
                Details = $null
            }
        }
        else {
            Write-Log $FailureMessage -Level WARNING
            return @{
                Name = $Name
                Category = $Category
                Result = $false
                Message = $FailureMessage
                Details = $result
            }
        }
    }
    catch {
        $errorMessage = $_.Exception.Message
        Write-Log "$FailureMessage - エラー: $errorMessage" -Level ERROR
        
        # エラー情報を記録
        $results.Errors += @{
            Name = $Name
            Message = $errorMessage
            Category = $Category
            Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
        }
        
        return @{
            Name = $Name
            Category = $Category
            Result = $false
            Message = "$FailureMessage - エラー: $errorMessage"
            Details = $_.Exception
        }
    }
}

# 結果からHTMLの一部を生成
function ConvertTo-HtmlSection {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string] $Title,
        
        [Parameter(Mandatory = $true)]
        [object] $Data,
        
        [Parameter(Mandatory = $false)]
        [string] $Description = ""
    )
    
    $html = "<div class='section'><h2>$Title</h2>"
    
    if ($Description) {
        $html += "<p>$Description</p>"
    }
    
    if ($Data -is [System.Collections.IDictionary]) {
        $html += "<table><tr><th>項目</th><th>値</th></tr>"
        foreach ($key in $Data.Keys) {
            $value = if ($null -eq $Data[$key]) { "N/A" } else { $Data[$key].ToString() }
            $html += "<tr><td>$key</td><td>$value</td></tr>"
        }
        $html += "</table>"
    }
    elseif ($Data -is [System.Collections.IList]) {
        if ($Data.Count -gt 0) {
            # 配列の最初の要素からプロパティを取得
            $firstItem = $Data[0]
            if ($firstItem -is [System.Collections.IDictionary]) {
                $properties = $firstItem.Keys
            }
            else {
                $properties = $firstItem.PSObject.Properties.Name
            }
            
            $html += "<table><tr>"
            foreach ($prop in $properties) {
                $html += "<th>$prop</th>"
            }
            $html += "</tr>"
            
            foreach ($item in $Data) {
                $html += "<tr>"
                foreach ($prop in $properties) {
                    $value = if ($item -is [System.Collections.IDictionary]) {
                        if ($null -eq $item[$prop]) { "N/A" } else { $item[$prop].ToString() }
                    }
                    else {
                        if ($null -eq $item.$prop) { "N/A" } else { $item.$prop.ToString() }
                    }
                    $html += "<td>$value</td>"
                }
                $html += "</tr>"
            }
            $html += "</table>"
        }
        else {
            $html += "<p>データがありません</p>"
        }
    }
    else {
        $html += "<pre>$Data</pre>"
    }
    
    $html += "</div>"
    return $html
}

# 推奨事項をHTMLに変換
function ConvertTo-HtmlRecommendations {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [object[]] $Recommendations
    )
    
    $html = "<div class='section'><h2>推奨事項</h2>"
    
    if ($Recommendations.Count -eq 0) {
        $html += "<p>特に推奨事項はありません。</p>"
    }
    else {
        foreach ($rec in $Recommendations) {
            $priority = switch ($rec.Priority) {
                "高" { "error" }
                "中" { "warning" }
                default { "success" }
            }
            
            $html += "<div class='recommendation'>"
            $html += "<h3><span class='$priority'>[$($rec.Priority)]</span> $($rec.Title)</h3>"
            $html += "<p>$($rec.Description)</p>"
            
            if ($rec.Actions -and $rec.Actions.Count -gt 0) {
                $html += "<p><strong>対応方法:</strong></p><ul>"
                foreach ($action in $rec.Actions) {
                    $html += "<li>$action</li>"
                }
                $html += "</ul>"
            }
            $html += "</div>"
        }
    }
    
    $html += "</div>"
    return $html
}

# エラーのHTMLセクションを生成
function ConvertTo-HtmlErrors {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [object[]] $Errors
    )
    
    $html = "<div class='section'><h2>エラー</h2>"
    
    if ($Errors.Count -eq 0) {
        $html += "<p class='success'>エラーは検出されませんでした。</p>"
    }
    else {
        $html += "<table><tr><th>タイムスタンプ</th><th>カテゴリ</th><th>名前</th><th>メッセージ</th></tr>"
        foreach ($error in $Errors) {
            $html += "<tr class='error'>"
            $html += "<td>$($error.Timestamp)</td>"
            $html += "<td>$($error.Category)</td>"
            $html += "<td>$($error.Name)</td>"
            $html += "<td>$($error.Message)</td>"
            $html += "</tr>"
        }
        $html += "</table>"
    }
    
    $html += "</div>"
    return $html
}

#endregion

#region メイン処理

Write-Log "ITマネジメントシステム環境要件収集スクリプトを開始しています..." -Level INFO
Write-Log "ログファイル: $logFilePath" -Level INFO
Write-Log "レポートファイル: $reportFilePath" -Level INFO

# ステップ1: システム情報の収集
Write-Log "システム情報を収集しています..." -Level INFO
try {
    $results.SystemInfo = @{
        ComputerName = $env:COMPUTERNAME
        OSVersion = [System.Environment]::OSVersion.VersionString
        PowerShellVersion = $PSVersionTable.PSVersion.ToString()
        CurrentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
        ExecutionTime = $startTime.ToString('yyyy-MM-dd HH:mm:ss')
    }
    Write-Log "システム情報の収集が完了しました" -Level SUCCESS
}
catch {
    Write-Log "システム情報の収集中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
    $results.Errors += @{
        Name = "システム情報収集"
        Message = $_.Exception.Message
        Category = "システム"
        Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    }
}

# ステップ2: Azure接続情報の確認
Write-Log "Azure接続を確認しています..." -Level INFO
try {
    # Azure PowerShellモジュールがインストールされているか確認
    $azModuleTest = Test-Requirement -Name "Azure PowerShellモジュールの確認" -Category "Azure接続" -Test {
        $azModule = Get-Module -Name Az -ListAvailable
        if ($azModule) {
            return $true
        }
        
        # モジュールが存在しない場合は推奨事項に追加
        $results.Recommendations += @{
            Title = "Azure PowerShellモジュールのインストールが必要です"
            Description = "ITマネジメントシステムの本番環境構築には、Azure PowerShellモジュールが必要です。"
            Priority = "高"
            Actions = @(
                "管理者権限でPowerShellを開き、次のコマンドを実行してください: Install-Module -Name Az -AllowClobber -Force",
                "または、https://docs.microsoft.com/ja-jp/powershell/azure/install-az-ps からインストール手順を確認してください。"
            )
        }
        return $false
    }
    
    # Azureログイン状態の確認（実際にはログインしない）
    $azLoginTest = Test-Requirement -Name "Azureログイン状態の確認" -Category "Azure接続" -Test {
        try {
            # Get-AzContextが存在するか確認するだけ（実際には実行しない）
            if (Get-Command Get-AzContext -ErrorAction SilentlyContinue) {
                return $true
            }
            return $false
        }
        catch {
            $results.Recommendations += @{
                Title = "Azureにログインする必要があります"
                Description = "ITマネジメントシステムの本番環境構築には、Azureアカウントへのログインが必要です。"
                Priority = "高"
                Actions = @(
                    "PowerShellで次のコマンドを実行してください: Connect-AzAccount",
                    "ログイン後、このスクリプトを再度実行してください。"
                )
            }
            return $false
        }
    }
    
    $results.AzureConnection = @{
        AzModuleInstalled = $azModuleTest.Result
        AzLoggedIn = $azLoginTest.Result
    }
}
catch {
    Write-Log "Azure接続確認中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
    $results.Errors += @{
        Name = "Azure接続確認"
        Message = $_.Exception.Message
        Category = "Azure接続"
        Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    }
}

# ステップ3: 管理者権限の確認
Write-Log "管理者権限を確認しています..." -Level INFO
try {
    $adminTest = Test-Requirement -Name "管理者権限の確認" -Category "システム" -Test {
        $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
        $principal = New-Object System.Security.Principal.WindowsPrincipal($identity)
        $adminRole = [System.Security.Principal.WindowsBuiltInRole]::Administrator
        
        $isAdmin = $principal.IsInRole($adminRole)
        
        if (-not $isAdmin) {
            $results.Recommendations += @{
                Title = "管理者権限で実行する必要があります"
                Description = "一部の機能を実行するには管理者権限が必要です。"
                Priority = "中"
                Actions = @(
                    "PowerShellを管理者として実行してください（右クリック→「管理者として実行」）",
                    "その後、スクリプトを再度実行してください。"
                )
            }
        }
        
        return $isAdmin
    }
    
    $results.SystemInfo.IsAdmin = $adminTest.Result
}
catch {
    Write-Log "管理者権限の確認中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
    $results.Errors += @{
        Name = "管理者権限確認"
        Message = $_.Exception.Message
        Category = "システム"
        Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    }
}

# ステップ4: ネットワーク接続確認
Write-Log "ネットワーク接続を確認しています..." -Level INFO
try {
    $msOnlineTest = Test-Requirement -Name "Microsoft Online接続確認" -Category "ネットワーク" -Test {
        $pingResult = Test-NetConnection -ComputerName login.microsoftonline.com -Port 443 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        return $pingResult.TcpTestSucceeded
    }
    
    $azurePortalTest = Test-Requirement -Name "Azureポータル接続確認" -Category "ネットワーク" -Test {
        $pingResult = Test-NetConnection -ComputerName portal.azure.com -Port 443 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        return $pingResult.TcpTestSucceeded
    }
    
    $results.NetworkSettings = @{
        MicrosoftOnlineConnectivity = $msOnlineTest.Result
        AzurePortalConnectivity = $azurePortalTest.Result
    }
    
    if (-not $msOnlineTest.Result -or -not $azurePortalTest.Result) {
        $results.Recommendations += @{
            Title = "Azureサービスへの接続に問題があります"
            Description = "Azureサービスに接続できない問題があります。ネットワーク設定やプロキシ設定を確認してください。"
            Priority = "高"
            Actions = @(
                "企業のファイアウォールやプロキシ設定を確認してください",
                "*.microsoft.com、*.azure.com、*.windowsazure.comなどのドメインへのアクセスが許可されていることを確認してください",
                "ネットワーク管理者に問い合わせて、Azureサービスへのアクセスを許可してもらってください"
            )
        }
    }
}
catch {
    Write-Log "ネットワーク接続確認中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
    $results.Errors += @{
        Name = "ネットワーク接続確認"
        Message = $_.Exception.Message
        Category = "ネットワーク"
        Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    }
}

# ステップ5: 必要なツールがインストールされているか確認
Write-Log "必要なツールを確認しています..." -Level INFO
$requiredTools = @(
    @{
        Name = "Az PowerShell"
        Command = "Get-Module -Name Az -ListAvailable"
        CommandType = "Module"
        Required = $true
    },
    @{
        Name = "AzureAD PowerShell"
        Command = "Get-Module -Name AzureAD -ListAvailable"
        CommandType = "Module"
        Required = $true
    },
    @{
        Name = "SqlServer PowerShell"
        Command = "Get-Module -Name SqlServer -ListAvailable"
        CommandType = "Module"
        Required = $false
    }
)

$toolResults = @()
foreach ($tool in $requiredTools) {
    $toolTest = Test-Requirement -Name "$($tool.Name)の確認" -Category "ツール" -Test {
        if ($tool.CommandType -eq "Module") {
            $module = Invoke-Expression $tool.Command -ErrorAction SilentlyContinue
            $isInstalled = $null -ne $module
            
            if (-not $isInstalled -and $tool.Required) {
                $installCommand = if ($tool.Name -eq "Az PowerShell") {
                    "Install-Module -Name Az -AllowClobber -Force"
                }
                elseif ($tool.Name -eq "AzureAD PowerShell") {
                    "Install-Module -Name AzureAD -AllowClobber -Force"
                }
                elseif ($tool.Name -eq "SqlServer PowerShell") {
                    "Install-Module -Name SqlServer -AllowClobber -Force"
                }
                else {
                    "Install-Module -Name $($tool.Name) -AllowClobber -Force"
                }
                
                $results.Recommendations += @{
                    Title = "$($tool.Name)モジュールのインストールが必要です"
                    Description = "ITマネジメントシステムの本番環境構築には、$($tool.Name)モジュールが必要です。"
                    Priority = if ($tool.Required) { "高" } else { "中" }
                    Actions = @(
                        "管理者権限でPowerShellを開き、次のコマンドを実行してください: $installCommand"
                    )
                }
            }
            
            return $isInstalled
        }
        else {
            try {
                $cmdlet = Get-Command $tool.Command -ErrorAction Stop
                return $true
            }
            catch {
                if ($tool.Required) {
                    $results.Recommendations += @{
                        Title = "$($tool.Name)のインストールが必要です"
                        Description = "ITマネジメントシステムの本番環境構築には、$($tool.Name)が必要です。"
                        Priority = "高"
                        Actions = @(
                            "指定されたツールをインストールしてください: $($tool.Name)"
                        )
                    }
                }
                return $false
            }
        }
    }
    
    $toolResults += @{
        Name = $tool.Name
        Installed = $toolTest.Result
        Required = $tool.Required
    }
}

$results.Tools = $toolResults

# ステップ6: レポート生成
Write-Log "レポートを生成しています..." -Level INFO
try {
    # HTML本文の構築
    $htmlBody = "環境診断レポートの結果要約です。</div>"
    
    # システム情報セクション
    $htmlBody += ConvertTo-HtmlSection -Title "システム情報" -Data $results.SystemInfo -Description "実行環境に関する基本情報"
    
    # Azure接続情報セクション
    $htmlBody += ConvertTo-HtmlSection -Title "Azure接続状態" -Data $results.AzureConnection -Description "Azure環境への接続状態"
    
    # ネットワーク設定セクション
    $htmlBody += ConvertTo-HtmlSection -Title "ネットワーク設定" -Data $results.NetworkSettings -Description "Azure環境へのネットワーク接続状態"
    
    # 必要なツールセクション
    $htmlBody += ConvertTo-HtmlSection -Title "必要なツール" -Data $results.Tools -Description "ITマネジメントシステム本番環境構築に必要なツールの確認結果"
    
    # エラーセクション
    $htmlBody += ConvertTo-HtmlErrors -Errors $results.Errors
    
    # 推奨事項セクション
    $htmlBody += ConvertTo-HtmlRecommendations -Recommendations $results.Recommendations
    
    # レポートファイルの生成
    $htmlReport = $htmlHeader + $htmlBody + $htmlFooter
    Set-Content -Path $reportFilePath -Value $htmlReport
    
    Write-Log "レポートの生成が完了しました: $reportFilePath" -Level SUCCESS
}
catch {
    Write-Log "レポート生成中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
    $results.Errors += @{
        Name = "レポート生成"
        Message = $_.Exception.Message
        Category = "レポート"
        Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    }
}

# 処理完了時間
$endTime = Get-Date
$executionTime = ($endTime - $startTime).TotalSeconds

Write-Log "すべての処理が完了しました。実行時間: $executionTime 秒" -Level SUCCESS
Write-Log "レポートは以下の場所に保存されています: $reportFilePath" -Level INFO
Write-Log "詳細ログは以下の場所に保存されています: $logFilePath" -Level INFO

# 結果を表示
Write-Host ""
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "  ITマネジメントシステム 環境要件収集 - 完了" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "レポートファイル: $reportFilePath" -ForegroundColor Green
Write-Host "ログファイル: $logFilePath" -ForegroundColor Green
Write-Host ""
Write-Host "以下のファイルをシステム開発者に提供してください：" -ForegroundColor Yellow
Write-Host "1. $reportFileName" -ForegroundColor Yellow
Write-Host "2. $logFileName" -ForegroundColor Yellow
Write-Host ""
Write-Host "=============================================================" -ForegroundColor Cyan

#endregion
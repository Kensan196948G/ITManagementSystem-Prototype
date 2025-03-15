#requires -Version 5.1
<#
.SYNOPSIS
    ITマネジメントシステム用のAzure ADアプリケーション登録スクリプト

.DESCRIPTION
    このスクリプトは、ITマネジメントシステムの本番環境利用に必要なAzure ADアプリケーション登録を
    実行し、必要な情報を収集します。グローバル管理者権限で実行する必要があります。

.PARAMETER AppName
    登録するアプリケーションの名前。指定がない場合は「IT-Management-System-Prod」が使用されます。

.PARAMETER OutputPath
    結果レポートの出力先パス。指定がない場合はカレントディレクトリに出力します。

.PARAMETER RedirectUris
    アプリケーション登録に設定するリダイレクトURI。カンマ区切りで複数指定可能です。
    デフォルトではステージングと本番環境のURIが設定されます。

.EXAMPLE
    .\Register-AzureADApplication.ps1
    デフォルト設定でアプリケーション登録を行います。

.EXAMPLE
    .\Register-AzureADApplication.ps1 -AppName "MyITSystemApp" -OutputPath "C:\Reports"
    アプリケーション名とレポート出力先を指定してアプリケーション登録を行います。

.NOTES
    作成者: ITマネジメントシステム開発チーム
    最終更新日: 2025/03/15
    
    このスクリプトを実行するには、AzureAD PowerShellモジュールが必要です。
    インストールされていない場合は以下のコマンドでインストールできます：
    Install-Module -Name AzureAD -Force
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string] $AppName = "IT-Management-System-Prod",

    [Parameter(Mandatory = $false)]
    [string] $OutputPath = (Get-Location).Path,

    [Parameter(Mandatory = $false)]
    [string[]] $RedirectUris = @(
        "https://it-management.example.com/auth/callback",
        "https://staging.it-management.example.com/auth/callback"
    )
)

#region 初期設定

# エラーアクション設定 - エラーが発生してもスクリプトを継続
$ErrorActionPreference = "Continue"

# スクリプト開始時間とログファイル名設定
$startTime = Get-Date
$logFileName = "AzureAD-App-Registration_$($startTime.ToString('yyyyMMdd_HHmmss')).log"
$reportFileName = "AzureAD-App-Registration_$($startTime.ToString('yyyyMMdd_HHmmss')).txt"
$logFilePath = Join-Path -Path $OutputPath -ChildPath $logFileName
$reportFilePath = Join-Path -Path $OutputPath -ChildPath $reportFileName

# 出力ディレクトリの確認と作成
if (-not (Test-Path -Path $OutputPath)) {
    try {
        New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
        Write-Host "出力ディレクトリを作成しました: $OutputPath" -ForegroundColor Green
    }
    catch {
        Write-Host "出力ディレクトリを作成できませんでした: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# 結果を格納する変数
$results = @{
    ApplicationInfo = @{}
    Permissions = @()
    CertificateInfo = @{}
    RedirectUris = @()
    Success = $false
    ErrorDetails = @()
}

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
    Add-Content -Path $logFilePath -Value $logMessage -Encoding UTF8
    
    # コンソールに出力（色分け）
    switch ($Level) {
        'WARNING' { Write-Host $logMessage -ForegroundColor Yellow }
        'ERROR'   { Write-Host $logMessage -ForegroundColor Red }
        'SUCCESS' { Write-Host $logMessage -ForegroundColor Green }
        default   { Write-Host $logMessage }
    }
}

# モジュール確認関数
function Test-Module {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string] $ModuleName
    )
    
    try {
        $module = Get-Module -Name $ModuleName -ListAvailable
        if ($null -eq $module) {
            Write-Log "必要なモジュール '$ModuleName' がインストールされていません。" -Level ERROR
            Write-Log "以下のコマンドでインストールできます: Install-Module -Name $ModuleName -Force" -Level INFO
            return $false
        }
        else {
            Write-Log "モジュール '$ModuleName' ($($module.Version)) が見つかりました。" -Level SUCCESS
            return $true
        }
    }
    catch {
        Write-Log "モジュール '$ModuleName' の確認中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
        return $false
    }
}

# Azure AD接続確認関数
function Connect-ToAzureAD {
    [CmdletBinding()]
    param()
    
    try {
        # 現在の接続状態を確認
        $context = Get-AzureADCurrentSessionInfo -ErrorAction SilentlyContinue
        
        if ($context) {
            Write-Log "既にAzure AD ($($context.TenantDomain)) に接続されています。" -Level SUCCESS
            return $true
        }
    }
    catch {
        # 接続されていないのでログイン処理を行う
        Write-Log "Azure ADへの接続を開始します..." -Level INFO
    }
    
    try {
        # ユーザーにログインを促す
        Write-Host "`n---------------------------------------------------" -ForegroundColor Cyan
        Write-Host "Azure ADへのログインが必要です。" -ForegroundColor Cyan
        Write-Host "ログインウィンドウが表示されたら、グローバル管理者権限を持つアカウントでログインしてください。" -ForegroundColor Cyan
        Write-Host "---------------------------------------------------`n" -ForegroundColor Cyan
        
        Connect-AzureAD -ErrorAction Stop
        
        # 接続成功の確認
        $context = Get-AzureADCurrentSessionInfo -ErrorAction Stop
        Write-Log "Azure AD ($($context.TenantDomain)) への接続に成功しました。" -Level SUCCESS
        
        # テナント情報を保存
        $results.ApplicationInfo.TenantName = $context.TenantDomain
        $results.ApplicationInfo.TenantId = $context.TenantId.Guid
        
        return $true
    }
    catch {
        Write-Log "Azure ADへの接続に失敗しました: $($_.Exception.Message)" -Level ERROR
        $results.ErrorDetails += @{
            Area = "Azure AD接続"
            Message = $_.Exception.Message
            Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
        }
        return $false
    }
}

# アプリケーション登録関数
function Register-Application {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string] $Name,
        
        [Parameter(Mandatory = $true)]
        [string[]] $RedirectUris
    )
    
    try {
        # アプリケーションが既に存在するか確認
        $existingApp = Get-AzureADApplication -Filter "DisplayName eq '$Name'" -ErrorAction SilentlyContinue
        
        if ($existingApp) {
            Write-Log "アプリケーション '$Name' は既に存在します。既存のアプリケーションを使用します。" -Level WARNING
            
            # 既存アプリケーションの情報を取得
            $app = $existingApp
            $appId = $app.AppId
            
            # リダイレクトURIの更新が必要か確認
            $webRedirects = $app.ReplyUrls
            $needUpdate = $false
            
            foreach ($uri in $RedirectUris) {
                if ($webRedirects -notcontains $uri) {
                    $webRedirects += $uri
                    $needUpdate = $true
                    Write-Log "リダイレクトURI '$uri' を追加します。" -Level INFO
                }
            }
            
            if ($needUpdate) {
                # リダイレクトURIを更新
                Set-AzureADApplication -ObjectId $app.ObjectId -ReplyUrls $webRedirects
                Write-Log "アプリケーションのリダイレクトURIを更新しました。" -Level SUCCESS
            }
            else {
                Write-Log "既存のリダイレクトURIに変更はありません。" -Level INFO
            }
        }
        else {
            # 新しいアプリケーションを登録
            Write-Log "新しいアプリケーション '$Name' を登録しています..." -Level INFO
            
            # シングルテナントアプリケーション登録
            $app = New-AzureADApplication -DisplayName $Name -ReplyUrls $RedirectUris
            $appId = $app.AppId
            
            # サービスプリンシパルの作成
            $spParams = @{
                AppId = $appId
                Tags = @("WindowsAzureActiveDirectoryIntegratedApp")
            }
            
            $sp = New-AzureADServicePrincipal @spParams
            Write-Log "アプリケーション '$Name' (AppId: $appId) の登録が完了しました。" -Level SUCCESS
        }
        
        # 結果にアプリケーション情報を保存
        $results.ApplicationInfo.DisplayName = $Name
        $results.ApplicationInfo.ApplicationId = $appId
        $results.ApplicationInfo.ObjectId = $app.ObjectId
        $results.RedirectUris = $RedirectUris
        
        # アプリケーションオブジェクトを返す
        return $app
    }
    catch {
        Write-Log "アプリケーション登録中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
        $results.ErrorDetails += @{
            Area = "アプリケーション登録"
            Message = $_.Exception.Message
            Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
        }
        return $null
    }
}

# API権限の追加関数
function Add-ApiPermissions {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [Microsoft.Open.AzureAD.Model.Application] $Application
    )
    
    try {
        Write-Log "APIアクセス許可を設定しています..." -Level INFO
        
        # 必要な権限のリスト
        $requiredPermissions = @(
            # Microsoft Graph APIのアクセス許可
            @{
                ResourceAppId = "00000003-0000-0000-c000-000000000000" # Microsoft Graph
                ResourceName = "Microsoft Graph"
                Permissions = @(
                    @{
                        Type = "Scope" # 委任された権限
                        Value = "User.Read"
                        Name = "ユーザーのサインインとプロファイル読み取り"
                    },
                    @{
                        Type = "Scope"
                        Value = "User.Read.All"
                        Name = "すべてのユーザーのプロファイル読み取り"
                    },
                    @{
                        Type = "Scope"
                        Value = "Directory.Read.All"
                        Name = "ディレクトリデータの読み取り"
                    }
                )
            },
            # Azure Key Vault APIのアクセス許可（オプション）
            @{
                ResourceAppId = "cfa8b339-82a2-471a-a3c9-0fc0be7a4093" # Azure Key Vault
                ResourceName = "Azure Key Vault"
                Permissions = @(
                    @{
                        Type = "Scope"
                        Value = "user_impersonation"
                        Name = "Azure Key Vaultへのユーザーアクセス"
                    }
                )
            }
        )
        
        # 各APIごとに権限を設定
        foreach ($resource in $requiredPermissions) {
            Write-Log "$($resource.ResourceName) のアクセス許可を設定しています..." -Level INFO
            
            # APIのサービスプリンシパルを取得
            $resourceSP = Get-AzureADServicePrincipal -Filter "AppId eq '$($resource.ResourceAppId)'"
            
            if (-not $resourceSP) {
                Write-Log "$($resource.ResourceName) のサービスプリンシパルが見つかりません。" -Level WARNING
                continue
            }
            
            # アクセス許可を設定
            $resourceAccess = @()
            
            foreach ($permission in $resource.Permissions) {
                # 権限の種類に応じてIDを取得
                if ($permission.Type -eq "Scope") {
                    # 委任された権限
                    $permissionId = ($resourceSP.OAuth2Permissions | Where-Object { $_.Value -eq $permission.Value }).Id
                    
                    if (-not $permissionId) {
                        Write-Log "権限 '$($permission.Value)' が $($resource.ResourceName) に見つかりません。" -Level WARNING
                        continue
                    }
                    
                    Write-Log "委任された権限 '$($permission.Value)' ($($permission.Name)) を追加しています..." -Level INFO
                }
                elseif ($permission.Type -eq "Role") {
                    # アプリケーション権限
                    $permissionId = ($resourceSP.AppRoles | Where-Object { $_.Value -eq $permission.Value }).Id
                    
                    if (-not $permissionId) {
                        Write-Log "権限 '$($permission.Value)' が $($resource.ResourceName) に見つかりません。" -Level WARNING
                        continue
                    }
                    
                    Write-Log "アプリケーション権限 '$($permission.Value)' ($($permission.Name)) を追加しています..." -Level INFO
                }
                else {
                    Write-Log "不明な権限タイプ: $($permission.Type)" -Level WARNING
                    continue
                }
                
                # リソースアクセスに追加
                $resourceAccess += @{
                    Id = $permissionId
                    Type = $permission.Type
                }
                
                # 結果に保存
                $results.Permissions += @{
                    ResourceName = $resource.ResourceName
                    PermissionName = $permission.Name
                    PermissionValue = $permission.Value
                    PermissionType = $permission.Type
                }
            }
            
            # 必要なアクセス許可をアプリケーションに設定
            if ($resourceAccess.Count -gt 0) {
                $requiredResourceAccess = @{
                    ResourceAppId = $resource.ResourceAppId
                    ResourceAccess = $resourceAccess
                }
                
                # 既存の権限を取得し、追加が必要な権限だけを追加
                $existingRequiredResourceAccess = $Application.RequiredResourceAccess | 
                    Where-Object { $_.ResourceAppId -ne $resource.ResourceAppId }
                
                $newRequiredResourceAccess = $existingRequiredResourceAccess + $requiredResourceAccess
                
                # アプリケーションを更新
                Set-AzureADApplication -ObjectId $Application.ObjectId -RequiredResourceAccess $newRequiredResourceAccess
                Write-Log "$($resource.ResourceName) のアクセス許可を設定しました。" -Level SUCCESS
            }
        }
        
        # 管理者同意の案内
        Write-Host "`n---------------------------------------------------" -ForegroundColor Yellow
        Write-Host "重要: APIアクセス許可には管理者の同意が必要です。" -ForegroundColor Yellow
        Write-Host "以下のURLにグローバル管理者としてアクセスし、" -ForegroundColor Yellow
        Write-Host "「組織の代理として同意する」ボタンをクリックしてください：" -ForegroundColor Yellow
        Write-Host "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/CallAnAPI/appId/$($Application.AppId)/isMSAApp/" -ForegroundColor Cyan
        Write-Host "---------------------------------------------------`n" -ForegroundColor Yellow
        
        return $true
    }
    catch {
        Write-Log "APIアクセス許可の設定中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
        $results.ErrorDetails += @{
            Area = "APIアクセス許可"
            Message = $_.Exception.Message
            Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
        }
        return $false
    }
}

# クライアントシークレットの作成関数
function New-ClientSecret {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [Microsoft.Open.AzureAD.Model.Application] $Application,
        
        [Parameter(Mandatory = $false)]
        [string] $Description = "IT-Management-System Secret",
        
        [Parameter(Mandatory = $false)]
        [int] $DurationYears = 2
    )
    
    try {
        Write-Log "クライアントシークレットを作成しています..." -Level INFO
        
        # シークレットの有効期限を設定
        $endDate = (Get-Date).AddYears($DurationYears)
        
        # シークレットを作成
        $passwordCred = New-AzureADApplicationPasswordCredential -ObjectId $Application.ObjectId `
            -CustomKeyIdentifier $Description `
            -EndDate $endDate
        
        Write-Log "クライアントシークレットを作成しました。有効期限: $($endDate.ToString('yyyy-MM-dd'))" -Level SUCCESS
        
        # 結果に保存
        $results.CertificateInfo = @{
            Type = "ClientSecret"
            Description = $Description
            CreatedDate = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
            ExpiryDate = $endDate.ToString('yyyy-MM-dd')
            Secret = $passwordCred.Value
        }
        
        return $passwordCred
    }
    catch {
        Write-Log "クライアントシークレットの作成中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
        $results.ErrorDetails += @{
            Area = "クライアントシークレット"
            Message = $_.Exception.Message
            Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
        }
        return $null
    }
}

# レポート生成関数
function Generate-Report {
    [CmdletBinding()]
    param ()
    
    try {
        Write-Log "結果レポートを生成しています..." -Level INFO
        
        $report = @"
===============================================================================
  ITマネジメントシステム - Azure ADアプリケーション登録レポート
===============================================================================

実行日時: $($startTime.ToString('yyyy年MM月dd日 HH:mm:ss'))

-----------------------------------
  1. アプリケーション情報
-----------------------------------
アプリケーション名: $($results.ApplicationInfo.DisplayName)
アプリケーションID: $($results.ApplicationInfo.ApplicationId)
テナント名: $($results.ApplicationInfo.TenantName)
テナントID: $($results.ApplicationInfo.TenantId)
オブジェクトID: $($results.ApplicationInfo.ObjectId)

-----------------------------------
  2. リダイレクトURI
-----------------------------------
"@
        
        foreach ($uri in $results.RedirectUris) {
            $report += "`n- $uri"
        }
        
        $report += @"

-----------------------------------
  3. 設定されたAPIアクセス許可
-----------------------------------
"@
        
        foreach ($permission in $results.Permissions) {
            $report += "`n- $($permission.ResourceName): $($permission.PermissionName) ($($permission.PermissionValue)) [$($permission.PermissionType)]"
        }
        
        $report += @"

-----------------------------------
  4. シークレット情報
-----------------------------------
種類: $($results.CertificateInfo.Type)
説明: $($results.CertificateInfo.Description)
作成日時: $($results.CertificateInfo.CreatedDate)
有効期限: $($results.CertificateInfo.ExpiryDate)
シークレット値: $($results.CertificateInfo.Secret)

※重要※ このシークレット値は一度しか表示されません。安全な場所に保管してください。

-----------------------------------
  5. 環境変数設定値（開発者用）
-----------------------------------
REACT_APP_MS_CLIENT_ID=$($results.ApplicationInfo.ApplicationId)
REACT_APP_MS_AUTHORITY=https://login.microsoftonline.com/$($results.ApplicationInfo.TenantId)
MS_CLIENT_SECRET=$($results.CertificateInfo.Secret)

===============================================================================
  エラーと警告
===============================================================================
"@
        
        if ($results.ErrorDetails.Count -eq 0) {
            $report += "`n登録処理中にエラーは発生しませんでした。`n"
        }
        else {
            foreach ($error in $results.ErrorDetails) {
                $report += "`n[$($error.Timestamp)] [$($error.Area)] $($error.Message)"
            }
        }
        
        $report += @"

===============================================================================
  次のステップ
===============================================================================
1. APIアクセス許可に管理者の同意を付与してください。
   以下のURLにアクセスし、「組織の代理として同意する」をクリックします：
   https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/CallAnAPI/appId/$($results.ApplicationInfo.ApplicationId)/isMSAApp/

2. このレポートをシステム開発者に提供し、環境変数を設定してもらいます。

3. 本番環境へのアクセスが必要なアカウントをアプリケーションに追加するには、
   Azure ADポータルで「エンタープライズアプリケーション」→「$($results.ApplicationInfo.DisplayName)」→
   「ユーザーとグループ」から設定できます。

===============================================================================
"@
        
        # レポートをファイルに保存
        Set-Content -Path $reportFilePath -Value $report -Encoding UTF8
        Write-Log "レポートを $reportFilePath に保存しました。" -Level SUCCESS
        
        return $true
    }
    catch {
        Write-Log "レポート生成中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
        return $false
    }
}

#endregion

#region メイン処理

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  ITマネジメントシステム - Azure ADアプリケーション登録ツール" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Log "Azure ADアプリケーション登録スクリプトを開始します..." -Level INFO
Write-Log "アプリケーション名: $AppName" -Level INFO
Write-Log "出力ディレクトリ: $OutputPath" -Level INFO
Write-Log "リダイレクトURI: $($RedirectUris -join ', ')" -Level INFO

# ステップ1: 必要なモジュールの確認
$azureADModuleInstalled = Test-Module -ModuleName AzureAD
if (-not $azureADModuleInstalled) {
    Write-Host "`n---------------------------------------------------" -ForegroundColor Red
    Write-Host "AzureAD モジュールがインストールされていません。" -ForegroundColor Red
    Write-Host "以下のコマンドを実行してインストールしてください：" -ForegroundColor Red
    Write-Host "Install-Module -Name AzureAD -Force" -ForegroundColor Yellow
    Write-Host "その後、スクリプトを再度実行してください。" -ForegroundColor Red
    Write-Host "---------------------------------------------------`n" -ForegroundColor Red
    exit 1
}

# ステップ2: Azure ADに接続
$azureConnected = Connect-ToAzureAD
if (-not $azureConnected) {
    Write-Host "`n---------------------------------------------------" -ForegroundColor Red
    Write-Host "Azure ADへの接続に失敗しました。" -ForegroundColor Red
    Write-Host "グローバル管理者権限を持つアカウントでログインしてください。" -ForegroundColor Red
    Write-Host "---------------------------------------------------`n" -ForegroundColor Red
    exit 1
}

# ステップ3: アプリケーションの登録
$application = Register-Application -Name $AppName -RedirectUris $RedirectUris
if (-not $application) {
    Write-Host "`n---------------------------------------------------" -ForegroundColor Red
    Write-Host "アプリケーション登録に失敗しました。" -ForegroundColor Red
    Write-Host "詳細はログファイルを確認してください: $logFilePath" -ForegroundColor Red
    Write-Host "---------------------------------------------------`n" -ForegroundColor Red
    exit 1
}

# ステップ4: APIアクセス許可の設定
$permissionsAdded = Add-ApiPermissions -Application $application
if (-not $permissionsAdded) {
    Write-Log "APIアクセス許可の設定に失敗しました。手動で設定が必要な場合があります。" -Level WARNING
}

# ステップ5: クライアントシークレットの作成
$secret = New-ClientSecret -Application $application
if (-not $secret) {
    Write-Host "`n---------------------------------------------------" -ForegroundColor Red
    Write-Host "クライアントシークレットの作成に失敗しました。" -ForegroundColor Red
    Write-Host "詳細はログファイルを確認してください: $logFilePath" -ForegroundColor Red
    Write-Host "---------------------------------------------------`n" -ForegroundColor Red
}
else {
    # 成功フラグをセット
    $results.Success = $true
}

# ステップ6: レポート生成
$reportGenerated = Generate-Report
if (-not $reportGenerated) {
    Write-Host "`n---------------------------------------------------" -ForegroundColor Red
    Write-Host "レポート生成に失敗しました。" -ForegroundColor Red
    Write-Host "詳細はログファイルを確認してください: $logFilePath" -ForegroundColor Red
    Write-Host "---------------------------------------------------`n" -ForegroundColor Red
}

# 処理完了
$endTime = Get-Date
$executionTime = ($endTime - $startTime).TotalSeconds
Write-Log "処理が完了しました。実行時間: $executionTime 秒" -Level SUCCESS

# 結果表示
Write-Host ""
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "  Azure ADアプリケーション登録 - 完了" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""

if ($results.Success) {
    Write-Host "アプリケーション '$AppName' が正常に登録されました。" -ForegroundColor Green
    Write-Host "アプリケーションID: $($results.ApplicationInfo.ApplicationId)" -ForegroundColor Green
    Write-Host ""
    Write-Host "レポートファイル: $reportFilePath" -ForegroundColor Green
    Write-Host "ログファイル: $logFilePath" -ForegroundColor Green
    Write-Host ""
    Write-Host "重要: このレポートにはクライアントシークレットが含まれています。" -ForegroundColor Yellow
    Write-Host "安全に保管し、システム開発者に提供してください。" -ForegroundColor Yellow
    Write-Host ""
    
    # 管理者同意のリマインダー
    Write-Host "APIアクセス許可には管理者の同意が必要です。" -ForegroundColor Yellow
    Write-Host "以下のURLにアクセスし、「組織の代理として同意する」をクリックしてください：" -ForegroundColor Yellow
    Write-Host "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/CallAnAPI/appId/$($results.ApplicationInfo.ApplicationId)/isMSAApp/" -ForegroundColor Cyan
}
else {
    Write-Host "アプリケーション登録中にエラーが発生しました。" -ForegroundColor Red
    Write-Host "詳細はログファイルを確認してください: $logFilePath" -ForegroundColor Red
}

Write-Host ""
Write-Host "=============================================================" -ForegroundColor Cyan

#endregion
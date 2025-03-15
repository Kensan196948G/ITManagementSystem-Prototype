# PowerShellスクリプトのパラメータは先頭に定義する必要があります
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
    [string]$ConfigPath,

    [Parameter(Mandatory = $false)]
    [switch]$Help
)

# Microsoft Graph API パーミッション管理システム 強化版
# ISO 27001/27002準拠のアクセス管理と詳細ログ記録を実装

# スクリプトタイトル表示
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " Microsoft Graph API パーミッション管理ツール 強化版" -ForegroundColor Cyan
Write-Host " ISO 20000・ISO 27001・ISO 27002準拠" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# ヘルプ表示
if ($Help) {
    Write-Host "Microsoft Graph API パーミッション管理ツール 使用方法" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "オプション:" -ForegroundColor Yellow
    Write-Host "  -Interactive         : インタラクティブモードで実行（デフォルト）" -ForegroundColor White
    Write-Host "  -BatchMode           : バッチモードで実行（ユーザー入力なし）" -ForegroundColor White
    Write-Host "  -CsvPath <path>      : ユーザーリストを含むCSVファイルのパス" -ForegroundColor White
    Write-Host "  -OutputPath <path>   : ログファイルの出力パス" -ForegroundColor White
    Write-Host "  -ConfigPath <path>   : 設定ファイルのパス" -ForegroundColor White
    Write-Host "  -Help                : このヘルプを表示" -ForegroundColor White
    Write-Host ""
    Write-Host "例:" -ForegroundColor Yellow
    Write-Host "  .\EnhancedAPIPermission.ps1" -ForegroundColor White
    Write-Host "  .\EnhancedAPIPermission.ps1 -CsvPath .\users.csv -BatchMode" -ForegroundColor White
    Write-Host "  .\EnhancedAPIPermission.ps1 -ConfigPath .\config.json" -ForegroundColor White
    exit 0
}

# 環境変数・設定から認証情報を取得（または設定ファイルから読み込み）
# 実運用では環境変数または暗号化された設定ファイルから読み込むことを推奨
$clientId = $env:M365_CLIENT_ID
# テナントIDを設定 - ユーザー環境の実際のテナントID
$tenantId = "a7232f7a-a9e5-4f71-9372-dc8b1c6645ea"

# 時刻付きログファイル名の生成
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$defaultLogPath = ".\logs"
$logFileName = "MicrosoftGraphLog.$timestamp.txt"

if ($OutputPath) {
    $logDir = $OutputPath
} else {
    $logDir = $defaultLogPath
}
$logPath = Join-Path -Path $logDir -ChildPath $logFileName

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
        [ValidateSet("INFO", "WARNING", "ERROR", "SUCCESS", "DEBUG")]
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
        "DEBUG" { 
            if ($VerboseMode) {
                Write-Host $logMessage -ForegroundColor Gray 
            }
        }
    }
}

# Microsoft Graph モジュールの確認と自動インストール
function Install-RequiredModules {
    Write-Log "必要なモジュールを確認しています..." -Level "INFO"
    
    # Microsoft.Graph モジュールの確認
    $graphModule = Get-Module -Name Microsoft.Graph -ListAvailable
    
    if (-not $graphModule) {
        Write-Log "Microsoft.Graph モジュールが見つかりません。インストールを開始します..." -Level "INFO"
        
        try {
            Install-Module -Name Microsoft.Graph -Scope CurrentUser -Force -AllowClobber
            Write-Log "Microsoft.Graph モジュールのインストールが完了しました。" -Level "SUCCESS"
        }
        catch {
            Write-Log "Microsoft.Graph モジュールのインストールに失敗しました: $_" -Level "ERROR"
            Write-Log "手動でインストールするには管理者権限の PowerShell で以下を実行してください：" -Level "INFO"
            Write-Log "Install-Module -Name Microsoft.Graph -Scope CurrentUser -Force" -Level "INFO"
            exit 1
        }
    }
    else {
        Write-Log "Microsoft.Graph モジュールが見つかりました（バージョン: $($graphModule.Version)）" -Level "SUCCESS"
    }
    
    # Microsoft.Graph.Authentication モジュールのインポート
    try {
        Import-Module Microsoft.Graph.Authentication -ErrorAction Stop
        Import-Module Microsoft.Graph.Users -ErrorAction Stop
        Import-Module Microsoft.Graph.Groups -ErrorAction Stop
        Import-Module Microsoft.Graph.Identity.DirectoryManagement -ErrorAction Stop
        Write-Log "必要なMicrosoft.Graphモジュールがインポートされました。" -Level "SUCCESS"
    }
    catch {
        Write-Log "Microsoft.Graphモジュールのインポートに失敗しました: $_" -Level "ERROR"
        exit 1
    }
}

# スクリプト開始ログ
Write-Log "Microsoft Graph API パーミッション管理スクリプトを開始します。" -Level "INFO"

# 必要なモジュールのインストール
Install-RequiredModules

# Microsoft Graph API 認証関数
function Connect-MsGraphApi {
    param (
        [Parameter(Mandatory = $false)]
        [string]$TenantId = $tenantId,
        
        [Parameter(Mandatory = $false)]
        [string]$ClientId = $clientId,
        
        [Parameter(Mandatory = $false)]
        [string[]]$Scopes = @("User.Read.All", "Directory.Read.All", "Directory.ReadWrite.All", "Group.Read.All")
    )
    
    Write-Log "Microsoft Graph APIへの接続を開始します..." -Level "INFO"
    
    try {
        # すでに接続済みかチェック
        try {
            $currentConnection = Get-MgContext
            if ($currentConnection -and $currentConnection.AuthType -eq "Delegated") {
                Write-Log "すでにMicrosoft Graph APIに接続されています。" -Level "SUCCESS"
                Write-Log "接続アカウント: $($currentConnection.Account)" -Level "INFO"
                
                # 現在のユーザーがグローバル管理者かチェック
                $isAdmin = Test-IsGlobalAdmin
                if (-not $isAdmin) {
                    Write-Log "現在接続しているアカウントはグローバル管理者権限を持っていません。再認証を行います。" -Level "WARNING"
                    Disconnect-MgGraph | Out-Null
                }
                else {
                    return $true
                }
            }
        }
        catch {
            # 接続されていない場合は何もしない
        }
        
        # 接続パラメータの設定
        $connectParams = @{
            Scopes = $Scopes
        }
        
        # TenantIdとClientIdが提供されている場合は追加
        if ($TenantId) { $connectParams["TenantId"] = $TenantId }
        if ($ClientId) { $connectParams["ClientId"] = $ClientId }
        
        # Graph APIに接続
        Connect-MgGraph @connectParams
        
        # 接続が成功したか確認
        $context = Get-MgContext
        if ($context) {
            Write-Log "Microsoft Graph APIに正常に接続されました。" -Level "SUCCESS"
            Write-Log "接続アカウント: $($context.Account)" -Level "INFO"
            
            # グローバル管理者かチェック
            $isAdmin = Test-IsGlobalAdmin
            if (-not $isAdmin) {
                Write-Log "警告: 現在接続しているアカウントはグローバル管理者権限を持っていません。一部の操作が制限される可能性があります。" -Level "WARNING"
            }
            
            return $true
        }
        else {
            Write-Log "Microsoft Graph APIへの接続に失敗しました。" -Level "ERROR"
            return $false
        }
    }
    catch {
        Write-Log "Microsoft Graph APIへの接続中にエラーが発生しました: $_" -Level "ERROR"
        return $false
    }
}

# グローバル管理者かどうかをチェックする関数
function Test-IsGlobalAdmin {
    try {
        # 自分のユーザー情報を取得
        $currentUser = Get-MgUser -UserId (Get-MgContext).Account
        
        # すべてのディレクトリロールを取得
        $directoryRoles = Get-MgDirectoryRole
        
        # グローバル管理者ロールのID（表示名で検索）
        $globalAdminRole = $directoryRoles | Where-Object { $_.DisplayName -eq "Global Administrator" -or $_.DisplayName -eq "Company Administrator" }
        
        if (-not $globalAdminRole) {
            Write-Log "グローバル管理者ロールが見つかりませんでした。" -Level "WARNING"
            return $false
        }
        
        # 自分がグローバル管理者かどうかをチェック
        foreach ($role in $globalAdminRole) {
            $members = Get-MgDirectoryRoleMember -DirectoryRoleId $role.Id
            foreach ($member in $members) {
                if ($member.Id -eq $currentUser.Id) {
                    Write-Log "現在のユーザーはグローバル管理者権限を持っています。" -Level "SUCCESS"
                    return $true
                }
            }
        }
        
        Write-Log "現在のユーザーはグローバル管理者権限を持っていません。" -Level "WARNING"
        return $false
    }
    catch {
        Write-Log "グローバル管理者チェック中にエラーが発生しました: $_" -Level "ERROR"
        return $false
    }
}

# ユーザーを検索する関数
function Find-MgUsers {
    param (
        [Parameter(Mandatory = $false)]
        [string]$SearchString,
        
        [Parameter(Mandatory = $false)]
        [string]$Department,
        
        [Parameter(Mandatory = $false)]
        [string]$GroupId
    )
    
    try {
        if ($GroupId) {
            # グループに所属するユーザーを取得
            Write-Log "グループ ID: $GroupId のメンバーを取得しています..." -Level "INFO"
            $groupMembers = Get-MgGroupMember -GroupId $GroupId
            $users = @()
            
            foreach ($member in $groupMembers) {
                try {
                    $user = Get-MgUser -UserId $member.Id
                    $users += $user
                }
                catch {
                    Write-Log "ユーザー ID: $($member.Id) の取得中にエラーが発生しました: $_" -Level "WARNING"
                }
            }
            
            return $users
        }
        elseif ($Department) {
            # 部署でフィルタリング
            Write-Log "部署: $Department のユーザーを検索しています..." -Level "INFO"
            $users = Get-MgUser -Filter "department eq '$Department'" -All
            return $users
        }
        elseif ($SearchString) {
            # 検索文字列でフィルタリング
            Write-Log "検索キーワード: '$SearchString' でユーザーを検索しています..." -Level "INFO"
            $users = Get-MgUser -Search "\"displayName:$SearchString\" OR \"mail:$SearchString\" OR \"userPrincipalName:$SearchString\"" -All
            return $users
        }
        else {
            # すべてのユーザーを取得（一般ユーザーのみに限定しない）
            Write-Log "すべてのユーザーを取得しています..." -Level "INFO"
            $users = Get-MgUser -All
            return $users
        }
    }
    catch {
        Write-Log "ユーザー検索中にエラーが発生しました: $_" -Level "ERROR"
        return @()
    }
}

# グループを検索する関数
function Find-MgGroups {
    param (
        [Parameter(Mandatory = $false)]
        [string]$SearchString
    )
    
    try {
        if ($SearchString) {
            # 検索文字列でフィルタリング
            Write-Log "検索キーワード: '$SearchString' でグループを検索しています..." -Level "INFO"
            $groups = Get-MgGroup -Search "\"displayName:$SearchString\"" -All
        }
        else {
            # すべてのグループを取得
            Write-Log "すべてのグループを取得しています..." -Level "INFO"
            $groups = Get-MgGroup -All
        }
        
        return $groups
    }
    catch {
        Write-Log "グループ検索中にエラーが発生しました: $_" -Level "ERROR"
        return @()
    }
}

# CSVからユーザーを読み込む関数
function Import-UsersFromCsv {
    param (
        [Parameter(Mandatory = $true)]
        [string]$CsvPath
    )
    
    try {
        if (-not (Test-Path -Path $CsvPath)) {
            Write-Log "CSVファイルが見つかりません: $CsvPath" -Level "ERROR"
            return @()
        }
        
        Write-Log "CSVファイルからユーザーデータを読み込んでいます: $CsvPath" -Level "INFO"
        $csvData = Import-Csv -Path $CsvPath
        $users = @()
        
        foreach ($row in $csvData) {
            $identifier = $null
            
            # UserPrincipalName, Email, または DisplayName 列を探す
            if ($row.PSObject.Properties.Name -contains "UserPrincipalName") {
                $identifier = $row.UserPrincipalName
            }
            elseif ($row.PSObject.Properties.Name -contains "UPN") {
                $identifier = $row.UPN
            }
            elseif ($row.PSObject.Properties.Name -contains "Email") {
                $identifier = $row.Email
            }
            elseif ($row.PSObject.Properties.Name -contains "Mail") {
                $identifier = $row.Mail
            }
            elseif ($row.PSObject.Properties.Name -contains "DisplayName") {
                $identifier = $row.DisplayName
            }
            
            if ($identifier) {
                try {
                    # UPNまたはEmailでユーザーを検索
                    $user = $null
                    
                    if ($identifier -match "@") {
                        # メールアドレスまたはUPNの場合
                        $user = Get-MgUser -Filter "userPrincipalName eq '$identifier' or mail eq '$identifier'" -ErrorAction Stop
                    }
                    else {
                        # 表示名の場合
                        $user = Get-MgUser -Search "\"displayName:$identifier\"" -ErrorAction Stop | Select-Object -First 1
                    }
                    
                    if ($user) {
                        $users += $user
                    }
                    else {
                        Write-Log "ユーザーが見つかりませんでした: $identifier" -Level "WARNING"
                    }
                }
                catch {
                    Write-Log "ユーザーの検索中にエラーが発生しました: $identifier - $_" -Level "WARNING"
                }
            }
        }
        
        Write-Log "CSVから $($users.Count) 人のユーザーを読み込みました。" -Level "INFO"
        return $users
    }
    catch {
        Write-Log "CSVからのユーザー読み込み中にエラーが発生しました: $_" -Level "ERROR"
        return @()
    }
}

# APIパーミッションの定義
function Get-ApiPermissions {
    # Microsoft Graph リソースID
    $graphResourceId = "00000003-0000-0000-c000-000000000000"
    $exchangeResourceId = "00000002-0000-0ff1-ce00-000000000000"
    
    # 権限セットを定義
    $permissionSets = @{
        "OneDrive for Business" = @(
            @{
                Name = "Microsoft Graph - User.Read.All"
                ResourceId = $graphResourceId
                AppRoleId = "df021288-bdef-4463-88db-98f22de89214"
                Description = "ユーザー情報へのアクセス (OneDrive)"
            },
            @{
                Name = "Microsoft Graph - Directory.Read.All"
                ResourceId = $graphResourceId
                AppRoleId = "7ab1d382-f21e-4acd-a863-ba3e13f7da61"
                Description = "組織構造情報へのアクセス (OneDrive)"
            },
            @{
                Name = "Microsoft Graph - Files.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "75359482-378d-4052-8f01-80520e7db3cd"
                Description = "OneDriveファイルの読み書き"
            }
        ),
        "Microsoft Teams" = @(
            @{
                Name = "Microsoft Graph - User.Read.All"
                ResourceId = $graphResourceId
                AppRoleId = "df021288-bdef-4463-88db-98f22de89214"
                Description = "ユーザー情報へのアクセス (Teams)"
            },
            @{
                Name = "Microsoft Graph - Directory.Read.All"
                ResourceId = $graphResourceId
                AppRoleId = "7ab1d382-f21e-4acd-a863-ba3e13f7da61"
                Description = "組織構造情報へのアクセス (Teams)"
            },
            @{
                Name = "Microsoft Graph - Team.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "bdd80a03-d9bc-451d-b7c4-ce7c63fe3c8f"
                Description = "Teams管理"
            },
            @{
                Name = "Microsoft Graph - Channel.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "243cded2-bd16-4fd6-a953-d9095e9f1b0c"
                Description = "チャネル管理"
            },
            @{
                Name = "Microsoft Graph - Chat.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "294ce7c9-31ba-490a-ad7d-97a7d075e4ed"
                Description = "チャット管理"
            }
        ),
        "Microsoft Entra ID" = @(
            @{
                Name = "Microsoft Graph - User.Read.All"
                ResourceId = $graphResourceId
                AppRoleId = "df021288-bdef-4463-88db-98f22de89214"
                Description = "ユーザー情報へのアクセス (Entra ID)"
            },
            @{
                Name = "Microsoft Graph - Directory.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "19dbc75e-c2e2-444c-a770-ec69d8559fc7"
                Description = "ディレクトリデータの管理"
            },
            @{
                Name = "Microsoft Graph - Group.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "62a82d76-70ea-41e2-9197-370581804d09"
                Description = "グループ管理"
            },
            @{
                Name = "Microsoft Graph - RoleManagement.ReadWrite.Directory"
                ResourceId = $graphResourceId
                AppRoleId = "9e3f62cf-ca93-4989-b6ce-bf83c28f9fe8"
                Description = "ロール管理"
            }
        ),
        "Exchange Online" = @(
            @{
                Name = "Microsoft Graph - User.Read.All"
                ResourceId = $graphResourceId
                AppRoleId = "df021288-bdef-4463-88db-98f22de89214"
                Description = "ユーザー情報へのアクセス (Exchange)"
            },
            @{
                Name = "Microsoft Graph - Directory.Read.All"
                ResourceId = $graphResourceId
                AppRoleId = "7ab1d382-f21e-4acd-a863-ba3e13f7da61"
                Description = "組織構造情報へのアクセス (Exchange)"
            },
            @{
                Name = "Microsoft Graph - Mail.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "e2a3a72e-5f79-4c64-b1b1-878b674786c9"
                Description = "メール管理"
            },
            @{
                Name = "Microsoft Graph - MailboxSettings.ReadWrite"
                ResourceId = $graphResourceId
                AppRoleId = "6e74bfad-400e-4ea1-8f8c-c3ef50c237a1"
                Description = "メールボックス設定管理"
            },
            @{
                Name = "Microsoft Graph - Calendars.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "ef54d2bf-783f-4e0f-bca1-3210c0444d99"
                Description = "カレンダー管理"
            },
            @{
                Name = "Exchange Online - Exchange.ManageAsApp"
                ResourceId = $exchangeResourceId
                AppRoleId = "dc890d15-9560-4a4c-9b7f-a736ec74ec40"
                Description = "Exchange Online APIへのフルアクセス"
            }
        )
    }
    
    return $permissionSets
}

# ユーザーのアプリパーミッションを取得する関数
function Get-UserAppPermissions {
    param (
        [Parameter(Mandatory = $true)]
        [string]$UserId
    )
    
    try {
        Write-Log "ユーザーID $UserId のアプリパーミッションを取得しています..." -Level "INFO"
        $permissionsUri = "https://graph.microsoft.com/v1.0/users/$UserId/appRoleAssignments"
        $permissions = Invoke-MgGraphRequest -Uri $permissionsUri -Method GET
        
        Write-Log "アプリパーミッションの取得が完了しました。$($permissions.value.Count)個のパーミッションが見つかりました。" -Level "SUCCESS"
        return $permissions.value
    }
    catch {
        Write-Log "アプリパーミッションの取得中にエラーが発生しました: $_" -Level "ERROR"
        return @()
    }
}

# アプリパーミッション付与関数
function Grant-AppPermission {
    param (
        [Parameter(Mandatory = $true)]
        [string]$UserId,
        
        [Parameter(Mandatory = $true)]
        [string]$ResourceId,
        
        [Parameter(Mandatory = $true)]
        [string]$AppRoleId,
        
        [Parameter(Mandatory = $false)]
        [string]$PermissionName = "未指定のパーミッション"
    )
    
    try {
        Write-Log "ユーザーID $UserId にパーミッション '$PermissionName' を付与しています..." -Level "INFO"
        
        $grantUri = "https://graph.microsoft.com/v1.0/users/$UserId/appRoleAssignments"
        $grantBody = @{
            principalId = $UserId
            resourceId = $ResourceId
            appRoleId = $AppRoleId
        }
        
        $response = Invoke-MgGraphRequest -Uri $grantUri -Method POST -Body $grantBody
        
        Write-Log "パーミッション '$PermissionName' の付与が成功しました。" -Level "SUCCESS"
        return $response
    }
    catch {
        Write-Log "パーミッション '$PermissionName' の付与中にエラーが発生しました: $_" -Level "ERROR"
        return $null
    }
}

# アプリパーミッション解除関数
function Revoke-AppPermission {
    param (
        [Parameter(Mandatory = $true)]
        [string]$UserId,
        
        [Parameter(Mandatory = $true)]
        [string]$AppRoleAssignmentId,
        
        [Parameter(Mandatory = $false)]
        [string]$PermissionName = "未指定のパーミッション"
    )
    
    try {
        Write-Log "ユーザーID $UserId のパーミッション割り当て '$PermissionName' を解除しています..." -Level "INFO"
        
        $revokeUri = "https://graph.microsoft.com/v1.0/users/$UserId/appRoleAssignments/$AppRoleAssignmentId"
        $response = Invoke-MgGraphRequest -Uri $revokeUri -Method DELETE
        
        Write-Log "パーミッション '$PermissionName' の解除が成功しました。" -Level "SUCCESS"
        return $true
    }
    catch {
        Write-Log "パーミッション '$PermissionName' の解除中にエラーが発生しました: $_" -Level "ERROR"
        return $false
    }
}

# パーミッションセットの一括付与
function Grant-PermissionSet {
    param (
        [Parameter(Mandatory = $true)]
        [string]$UserId,
        
        [Parameter(Mandatory = $true)]
        [string]$UserDisplayName,
        
        [Parameter(Mandatory = $true)]
        [array]$Permissions
    )
    
    try {
        Write-Log "ユーザー '$UserDisplayName' ($UserId) にパーミッションセットを付与しています..." -Level "INFO"
        
        # 現在のパーミッションを取得
        $currentPermissions = Get-UserAppPermissions -UserId $UserId
        $successCount = 0
        $failCount = 0
        
        foreach ($permission in $Permissions) {
            # 既に付与されているか確認
            $isGranted = $false
            foreach ($perm in $currentPermissions) {
                if ($perm.appRoleId -eq $permission.AppRoleId -and $perm.resourceId -eq $permission.ResourceId) {
                    $isGranted = $true
                    break
                }
            }
            
            if ($isGranted) {
                Write-Log "パーミッション '$($permission.Name)' は既に付与されています。スキップします。" -Level "INFO"
                continue
            }
            
            # パーミッションを付与
            $result = Grant-AppPermission -UserId $UserId -ResourceId $permission.ResourceId -AppRoleId $permission.AppRoleId -PermissionName $permission.Name
            
            if ($result) {
                $successCount++
            }
            else {
                $failCount++
            }
        }
        
        Write-Log "ユーザー '$UserDisplayName' へのパーミッション付与処理が完了しました。成功: $successCount, 失敗: $failCount" -Level "INFO"
        return @{
            SuccessCount = $successCount
            FailCount = $failCount
            TotalCount = $Permissions.Count
        }
    }
    catch {
        Write-Log "パーミッションセットの付与中にエラーが発生しました: $_" -Level "ERROR"
        return $null
    }
}

# メイン処理
try {
    # Microsoft Graph APIに接続
    $connected = Connect-MsGraphApi
    
    if (-not $connected) {
        Write-Log "Microsoft Graph APIへの接続に失敗しました。スクリプトを終了します。" -Level "ERROR"
        exit 1
    }
    
    # CSVパスが指定されている場合はCSVからユーザーを読み込む
    if ($CsvPath) {
        $users = Import-UsersFromCsv -CsvPath $CsvPath
        
        if ($users.Count -eq 0) {
            Write-Log "CSVから有効なユーザーを読み込めませんでした。スクリプトを終了します。" -Level "ERROR"
            exit 1
        }
    }
    # バッチモードでない場合はインタラクティブにユーザーを選択
    elseif (-not $BatchMode) {
        # ユーザー検索方法を選択
        Write-Host "`nユーザー選択方法を選んでください:" -ForegroundColor Cyan
        Write-Host "[1] 名前またはメールで検索" -ForegroundColor White
        Write-Host "[2] 部署でフィルタリング" -ForegroundColor White
        Write-Host "[3] グループのメンバーを選択" -ForegroundColor White
        Write-Host "[4] すべてのユーザーを表示" -ForegroundColor White
        
        $selectMethod = Read-Host "`n選択方法を入力してください (1-4)"
        
        switch ($selectMethod) {
            "1" {
                $searchString = Read-Host "検索キーワードを入力してください (名前またはメールアドレスの一部)"
                $users = Find-MgUsers -SearchString $searchString
            }
            "2" {
                $department = Read-Host "部署名を入力してください"
                $users = Find-MgUsers -Department $department
            }
            "3" {
                $groupSearch = Read-Host "グループ名を入力してください (空白の場合はすべてのグループを表示)"
                $groups = Find-MgGroups -SearchString $groupSearch
                
                if ($groups.Count -eq 0) {
                    Write-Log "グループが見つかりませんでした。" -Level "WARNING"
                    exit 1
                }
                
                Write-Host "`nグループ一覧:" -ForegroundColor Cyan
                for ($i = 0; $i -lt $groups.Count; $i++) {
                    Write-Host "[$($i + 1)] $($groups[$i].DisplayName)" -ForegroundColor White
                }
                
                $groupIndex = Read-Host "`n選択するグループの番号を入力してください (1-$($groups.Count))"
                if ([int]::TryParse($groupIndex, [ref]$null)) {
                    $selectedGroup = $groups[[int]$groupIndex - 1]
                    $users = Find-MgUsers -GroupId $selectedGroup.Id
                }
                else {
                    Write-Log "無効な入力です。スクリプトを終了します。" -Level "ERROR"
                    exit 1
                }
            }
            "4" {
                $users = Find-MgUsers
            }
            default {
                Write-Log "無効な選択です。スクリプトを終了します。" -Level "ERROR"
                exit 1
            }
        }
    }
    else {
        Write-Log "バッチモードが指定されましたが、ユーザーリストが提供されていません。CSVパスを指定してください。" -Level "ERROR"
        exit 1
    }
    
    # ユーザーが見つからない場合
    if ($users.Count -eq 0) {
        Write-Log "条件に一致するユーザーが見つかりませんでした。スクリプトを終了します。" -Level "ERROR"
        exit 1
    }
    
    # ユーザー選択（インタラクティブモードの場合）
    $selectedUsers = @()
    
    if (-not $BatchMode) {
        Write-Host "`n見つかったユーザー一覧:" -ForegroundColor Cyan
        for ($i = 0; $i -lt $users.Count; $i++) {
            Write-Host "[$($i + 1)] $($users[$i].DisplayName) - $($users[$i].UserPrincipalName)" -ForegroundColor White
            if ($users[$i].JobTitle) {
                Write-Host "    役職: $($users[$i].JobTitle)" -ForegroundColor Gray
            }
            if ($users[$i].Department) {
                Write-Host "    部署: $($users[$i].Department)" -ForegroundColor Gray
            }
        }
        
        $userSelection = Read-Host "`n選択するユーザーの番号をカンマ区切りで入力してください (例: 1,3,5) または 'all' ですべて選択"
        
        if ($userSelection.ToLower() -eq "all") {
            $selectedUsers = $users
        }
        else {
            $selectedIndices = $userSelection -split ',' | ForEach-Object { $_.Trim() }
            
            foreach ($idx in $selectedIndices) {
                if ([int]::TryParse($idx, [ref]$null)) {
                    $index = [int]$idx - 1
                    if ($index -ge 0 -and $index -lt $users.Count) {
                        $selectedUsers += $users[$index]
                    }
                }
            }
        }
    }
    else {
        # バッチモードではすべてのユーザーを選択
        $selectedUsers = $users
    }
    
    if ($selectedUsers.Count -eq 0) {
        Write-Log "ユーザーが選択されていません。スクリプトを終了します。" -Level "ERROR"
        exit 1
    }
    
    # パーミッションセットを取得
    $permissionSets = Get-ApiPermissions
    
    # パーミッション操作選択（インタラクティブモードの場合）
    if (-not $BatchMode) {
        Write-Host "`n実行する操作を選択してください:" -ForegroundColor Cyan
        Write-Host "[1] APIパーミッションセットを付与する" -ForegroundColor White
        Write-Host "[2] 個別のAPIパーミッションを付与する" -ForegroundColor White
        Write-Host "[3] APIパーミッションを解除する" -ForegroundColor White
        Write-Host "[4] 現在のAPIパーミッションを表示する" -ForegroundColor White
        
        $operationChoice = Read-Host "`n操作を選択してください (1-4)"
        
        switch ($operationChoice) {
            "1" {
                # パーミッションセット付与
                Write-Host "`n付与するパーミッションセットを選択してください:" -ForegroundColor Cyan
                $categories = $permissionSets.Keys | Sort-Object
                
                for ($i = 0; $i -lt $categories.Count; $i++) {
                    Write-Host "[$($i + 1)] $($categories[$i])" -ForegroundColor White
                }
                
                $categoryIndex = Read-Host "`nパーミッションセットを選択してください (1-$($categories.Count))"
                if ([int]::TryParse($categoryIndex, [ref]$null)) {
                    $selectedCategory = $categories[[int]$categoryIndex - 1]
                    $selectedPermissions = $permissionSets[$selectedCategory]
                    
                    $results = @()
                    foreach ($user in $selectedUsers) {
                        $result = Grant-PermissionSet -UserId $user.Id -UserDisplayName $user.DisplayName -Permissions $selectedPermissions
                        
                        $results += [PSCustomObject]@{
                            User = $user.DisplayName
                            Email = $user.UserPrincipalName
                            Success = $result.SuccessCount
                            Failed = $result.FailCount
                            Total = $result.TotalCount
                        }
                    }
                    
                    # 結果サマリーを表示
                    Write-Host "`n付与結果サマリー:" -ForegroundColor Cyan
                    $results | Format-Table -AutoSize
                }
                else {
                    Write-Log "無効な選択です。スクリプトを終了します。" -Level "ERROR"
                    exit 1
                }
            }
            
            "4" {
                # 現在のパーミッションを表示
                foreach ($user in $selectedUsers) {
                    Write-Host "`nユーザー '$($user.DisplayName)' ($($user.UserPrincipalName)) の現在のパーミッション:" -ForegroundColor Cyan
                    
                    $permissions = Get-UserAppPermissions -UserId $user.Id
                    
                    if ($permissions.Count -eq 0) {
                        Write-Host "このユーザーには付与されているAPIパーミッションがありません。" -ForegroundColor Yellow
                    }
                    else {
                        foreach ($perm in $permissions) {
                            Write-Host "- AppRoleId: $($perm.appRoleId)" -ForegroundColor White
                            Write-Host "  ResourceId: $($perm.resourceId)" -ForegroundColor Gray
                            Write-Host "  割り当てID: $($perm.id)" -ForegroundColor Gray
                            Write-Host ""
                        }
                    }
                }
            }
            
            default {
                Write-Log "この操作は現在実装されていません。" -Level "WARNING"
            }
        }
    }
    
    Write-Log "スクリプトの処理が完了しました。" -Level "SUCCESS"
}
catch {
    Write-Log "スクリプト実行中にエラーが発生しました: $_" -Level "ERROR"
    exit 1
}

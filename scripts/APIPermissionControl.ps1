# PowerShellスクリプトのパラメータ定義
param(
    [Parameter(Mandatory = $false)]
    [switch]$Interactive,

    [Parameter(Mandatory = $false)]
    [switch]$BatchMode,

    [Parameter(Mandatory = $false)]
    [string]$CsvPath,

    [Parameter(Mandatory = $false)]
    [string]$ConfigPath = ".\config\api_permission_config.json",

    [Parameter(Mandatory = $false)]
    [switch]$ApprovalMode,

    [Parameter(Mandatory = $false)]
    [int]$RequestLimit = 10,

    [Parameter(Mandatory = $false)]
    [switch]$ResetCounter,

    [Parameter(Mandatory = $false)]
    [switch]$Help
)

# Microsoft 365 APIパーミッション管理システム - コントロール版
# ISO 20000・ISO 27001・ISO 27002準拠のアクセス管理と制御フロー

# スクリプトタイトル表示
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " Microsoft 365 APIパーミッション管理ツール - コントロール版" -ForegroundColor Cyan
Write-Host " ISO 20000・ISO 27001・ISO 27002準拠" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# グローバル変数
$script:ApiRequestCounter = 0
$script:RequestLimitReached = $false
$script:ConfigData = $null
$script:ApprovalQueue = @()
$script:VerboseMode = $false

# ヘルプ表示
if ($Help) {
    Write-Host "Microsoft 365 APIパーミッション管理ツール - コントロール版 使用方法" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "オプション:" -ForegroundColor Yellow
    Write-Host "  -Interactive         : インタラクティブモードで実行（デフォルト）" -ForegroundColor White
    Write-Host "  -BatchMode           : バッチモードで実行（ユーザー入力なし）" -ForegroundColor White
    Write-Host "  -CsvPath <path>      : ユーザーリストを含むCSVファイルのパス" -ForegroundColor White
    Write-Host "  -ConfigPath <path>   : 設定ファイルのパス（デフォルト: .\config\api_permission_config.json）" -ForegroundColor White
    Write-Host "  -ApprovalMode        : 承認モードで実行（リクエストの承認/拒否を管理）" -ForegroundColor White
    Write-Host "  -RequestLimit <num>  : APIリクエスト数の制限値（デフォルト: 10）" -ForegroundColor White
    Write-Host "  -ResetCounter        : APIリクエストカウンターをリセット" -ForegroundColor White
    Write-Host "  -Help                : このヘルプを表示" -ForegroundColor White
    Write-Host ""
    Write-Host "例:" -ForegroundColor Yellow
    Write-Host "  .\APIPermissionControl.ps1" -ForegroundColor White
    Write-Host "  .\APIPermissionControl.ps1 -CsvPath .\users.csv -BatchMode" -ForegroundColor White
    Write-Host "  .\APIPermissionControl.ps1 -ApprovalMode" -ForegroundColor White
    Write-Host "  .\APIPermissionControl.ps1 -ResetCounter" -ForegroundColor White
    exit 0
}

# 環境変数から認証情報を取得
$clientId = $env:M365_CLIENT_ID
$tenantId = "a7232f7a-a9e5-4f71-9372-dc8b1c6645ea"

# 時刻付きログファイル名の生成
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$logDir = ".\logs"
$logFileName = "APIPermissionControl.$timestamp.log"
$logPath = Join-Path -Path $logDir -ChildPath $logFileName

# 設定ディレクトリの作成
$configDir = Split-Path -Path $ConfigPath -Parent
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

# 設定の初期化とロード
function Initialize-Configuration {
    # デフォルト設定
    $defaultConfig = @{
        ApiRequestCounter = 0
        LastResetDate = (Get-Date).ToString("yyyy-MM-dd")
        RequestLimit = $RequestLimit
        ApprovalRequired = $true
        ApprovalQueue = @()
        ApprovedRequests = @()
        DeniedRequests = @()
        Administrators = @()
    }
    
    try {
        if (Test-Path -Path $ConfigPath) {
            Write-Log "設定ファイルを読み込んでいます: $ConfigPath" -Level "INFO"
            $config = Get-Content -Path $ConfigPath -Raw | ConvertFrom-Json
            $script:ConfigData = $config
            
            # カウンターのリセットが要求された場合
            if ($ResetCounter) {
                $script:ConfigData.ApiRequestCounter = 0
                $script:ConfigData.LastResetDate = (Get-Date).ToString("yyyy-MM-dd")
                Save-Configuration
                Write-Log "APIリクエストカウンターをリセットしました。" -Level "SUCCESS"
            }
            
            # 設定値をスクリプト変数に反映
            $script:ApiRequestCounter = $script:ConfigData.ApiRequestCounter
            $script:ApprovalQueue = $script:ConfigData.ApprovalQueue
            
            if ($RequestLimit -ne 10) {
                # コマンドラインで指定された場合は設定ファイルを更新
                $script:ConfigData.RequestLimit = $RequestLimit
                Save-Configuration
            }
            
            Write-Log "設定を読み込みました。現在のAPIリクエスト数: $($script:ApiRequestCounter)/$($script:ConfigData.RequestLimit)" -Level "INFO"
        } 
        else {
            # 設定ファイルが存在しない場合は新規作成
            Write-Log "設定ファイルが見つかりません。新しい設定ファイルを作成します: $ConfigPath" -Level "INFO"
            $script:ConfigData = $defaultConfig
            
            # 管理者の追加
            Write-Host "初期設定: 管理者のメールアドレスを入力してください（承認権限を持つユーザー）" -ForegroundColor Yellow
            $adminEmail = Read-Host "管理者メールアドレス"
            if ($adminEmail) {
                $script:ConfigData.Administrators += $adminEmail
            }
            
            Save-Configuration
            $script:ApiRequestCounter = 0
        }
    }
    catch {
        Write-Log "設定ファイルの読み込み中にエラーが発生しました: $_" -Level "ERROR"
        Write-Log "デフォルト設定を使用します。" -Level "INFO"
        $script:ConfigData = $defaultConfig
        $script:ApiRequestCounter = 0
    }
}

# 設定の保存
function Save-Configuration {
    try {
        # カウンター更新
        $script:ConfigData.ApiRequestCounter = $script:ApiRequestCounter
        $script:ConfigData.ApprovalQueue = $script:ApprovalQueue
        
        # JSON形式で保存
        $script:ConfigData | ConvertTo-Json -Depth 10 | Set-Content -Path $ConfigPath
        Write-Log "設定を保存しました: $ConfigPath" -Level "DEBUG"
    }
    catch {
        Write-Log "設定ファイルの保存中にエラーが発生しました: $_" -Level "ERROR"
    }
}

# APIリクエストの制限チェック
function Test-ApiRequestLimit {
    # 制限に達しているかチェック
    if ($script:ApiRequestCounter -ge $script:ConfigData.RequestLimit) {
        $script:RequestLimitReached = $true
        Write-Log "APIリクエスト数が制限に達しました（$($script:ApiRequestCounter)/$($script:ConfigData.RequestLimit)）。" -Level "WARNING"
        Write-Host "警告: APIリクエスト数の制限に達しました。" -ForegroundColor Red
        Write-Host "以下のオプションがあります：" -ForegroundColor Yellow
        Write-Host "1. '-ResetCounter'オプションを使用してカウンターをリセットする" -ForegroundColor Yellow
        Write-Host "2. 設定ファイルで制限値を増やす" -ForegroundColor Yellow
        Write-Host "3. 承認モードに切り替える（-ApprovalMode）" -ForegroundColor Yellow
        return $false
    }
    
    return $true
}

# APIリクエストカウンターの増加
function Increment-ApiRequestCounter {
    $script:ApiRequestCounter++
    Save-Configuration
    Write-Log "APIリクエストカウンターを増加しました: $($script:ApiRequestCounter)/$($script:ConfigData.RequestLimit)" -Level "INFO"
    
    # 制限に近づいている場合は警告
    if ($script:ApiRequestCounter -ge ($script:ConfigData.RequestLimit * 0.8)) {
        Write-Log "APIリクエスト数が制限の80%に達しています。" -Level "WARNING"
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
            # すべてのユーザーを取得
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
                Risk = "Low"
            },
            @{
                Name = "Microsoft Graph - Directory.Read.All"
                ResourceId = $graphResourceId
                AppRoleId = "7ab1d382-f21e-4acd-a863-ba3e13f7da61"
                Description = "組織構造情報へのアクセス (OneDrive)"
                Risk = "Medium"
            },
            @{
                Name = "Microsoft Graph - Files.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "75359482-378d-4052-8f01-80520e7db3cd"
                Description = "OneDriveファイルの読み書き"
                Risk = "High"
            }
        ),
        "Microsoft Teams" = @(
            @{
                Name = "Microsoft Graph - User.Read.All"
                ResourceId = $graphResourceId
                AppRoleId = "df021288-bdef-4463-88db-98f22de89214"
                Description = "ユーザー情報へのアクセス (Teams)"
                Risk = "Low"
            },
            @{
                Name = "Microsoft Graph - Directory.Read.All"
                ResourceId = $graphResourceId
                AppRoleId = "7ab1d382-f21e-4acd-a863-ba3e13f7da61"
                Description = "組織構造情報へのアクセス (Teams)"
                Risk = "Medium"
            },
            @{
                Name = "Microsoft Graph - Team.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "bdd80a03-d9bc-451d-b7c4-ce7c63fe3c8f"
                Description = "Teams管理"
                Risk = "High" 
            },
            @{
                Name = "Microsoft Graph - Channel.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "243cded2-bd16-4fd6-a953-d9095e9f1b0c"
                Description = "チャネル管理"
                Risk = "Medium"
            },
            @{
                Name = "Microsoft Graph - Chat.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "294ce7c9-31ba-490a-ad7d-97a7d075e4ed"
                Description = "チャット管理"
                Risk = "High"
            }
        ),
        "Microsoft Entra ID" = @(
            @{
                Name = "Microsoft Graph - User.Read.All"
                ResourceId = $graphResourceId
                AppRoleId = "df021288-bdef-4463-88db-98f22de89214"
                Description = "ユーザー情報へのアクセス (Entra ID)"
                Risk = "Low"
            },
            @{
                Name = "Microsoft Graph - Directory.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "19dbc75e-c2e2-444c-a770-ec69d8559fc7"
                Description = "ディレクトリデータの管理"
                Risk = "Critical"
            },
            @{
                Name = "Microsoft Graph - Group.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "62a82d76-70ea-41e2-9197-370581804d09"
                Description = "グループ管理"
                Risk = "High"
            },
            @{
                Name = "Microsoft Graph - RoleManagement.ReadWrite.Directory"
                ResourceId = $graphResourceId
                AppRoleId = "9e3f62cf-ca93-4989-b6ce-bf83c28f9fe8"
                Description = "ロール管理"
                Risk = "Critical"
            }
        ),
        "Exchange Online" = @(
            @{
                Name = "Microsoft Graph - User.Read.All"
                ResourceId = $graphResourceId
                AppRoleId = "df021288-bdef-4463-88db-98f22de89214"
                Description = "ユーザー情報へのアクセス (Exchange)"
                Risk = "Low"
            },
            @{
                Name = "Microsoft Graph - Directory.Read.All"
                ResourceId = $graphResourceId
                AppRoleId = "7ab1d382-f21e-4acd-a863-ba3e13f7da61"
                Description = "組織構造情報へのアクセス (Exchange)"
                Risk = "Medium"
            },
            @{
                Name = "Microsoft Graph - Mail.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "e2a3a72e-5f79-4c64-b1b1-878b674786c9"
                Description = "メール管理"
                Risk = "High"
            },
            @{
                Name = "Microsoft Graph - MailboxSettings.ReadWrite"
                ResourceId = $graphResourceId
                AppRoleId = "6e74b

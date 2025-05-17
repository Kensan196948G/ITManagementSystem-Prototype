# Microsoft 365 APIパーミッション管理システム
# ISO 27001/27002準拠のアクセス管理とログ記録を実装

# グローバル変数初期化 # 修正ポイント: 未定義変数の初期化を追加
$globalIndex = 0

# スクリプトタイトル表示
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host " Microsoft 365 APIパーミッション管理ツール " -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "ISO 27001/27002準拠のアクセス制御システム" -ForegroundColor Cyan
Write-Host ""

# 環境変数から認証情報を取得（または設定ファイルから読み込み）
# 実運用では環境変数または暗号化された設定ファイルから読み込むことを推奨
$clientId = $env:M365_CLIENT_ID
# テナントIDを設定 - ユーザー環境の実際のテナントID
# 環境変数からテナントIDを取得（実運用では環境変数または設定ファイルを使用）
$tenantId = $env:M365_TENANT_ID
if (-not $tenantId) {
    $tenantId = Read-Host "Microsoft 365 テナントIDを入力してください"
    # セッション中のみ保持するように環境変数に設定
    $env:M365_TENANT_ID = $tenantId
}
$logPath = ".\logs\apiPermission_$(Get-Date -Format 'yyyyMMdd').log"

# 環境変数が設定されていない場合は、ユーザーに入力を促す
if (-not $clientId) {
    $clientId = Read-Host "Microsoft Azure ADアプリケーションのクライアントIDを入力してください"
}

if (-not $tenantId) {
    $tenantId = Read-Host "テナントIDを入力してください"
}

# ログディレクトリの作成
$logDir = Split-Path -Path $logPath -Parent
if (-not (Test-Path -Path $logDir)) {
    New-Item -Path $logDir -ItemType Directory | Out-Null
}

# ログ記録関数
function Write-Log {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Message,
        
        [Parameter(Mandatory = $false)]
        [ValidateSet("INFO", "WARNING", "ERROR", "SUCCESS")]
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    # ログファイルに書き込み
    # 大規模ログに対応するためストリームライターを使用
    try {
        $streamWriter = [System.IO.StreamWriter]::new($logPath, $true)
        $streamWriter.WriteLine($logMessage)
    }
    finally {
        if ($null -ne $streamWriter) {
            $streamWriter.Dispose()
        }
    }
    
    # コンソールにも出力（色分け）
    switch ($Level) {
        "INFO" { Write-Host $logMessage -ForegroundColor White }
        "WARNING" { Write-Host $logMessage -ForegroundColor Yellow }
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
        "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
    }
}

# スクリプト開始ログ
Write-Log "APIパーミッション管理スクリプトを開始します。" -Level "INFO"

# デバイスコード認証フローの関数
function Get-DeviceCodeAuthToken {
    param (
        [Parameter(Mandatory = $true)]
        [string]$ClientId,
        
        [Parameter(Mandatory = $true)]
        [string]$TenantId,
        
        [Parameter(Mandatory = $true)]
        [string]$Scope
    )
    
    Write-Log "デバイスコード認証を開始します..." -Level "INFO"
    
    # デバイスコードリクエスト
    $deviceCodeUri = "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/devicecode"
    $deviceCodeBody = @{
        client_id = $ClientId
        scope = $Scope
    }
    
    try {
        $deviceCodeResponse = Invoke-RestMethod -Method Post -Uri $deviceCodeUri -Body $deviceCodeBody
        
        # ユーザーに認証を促す
        Write-Host "`n以下のURLにアクセスしてコードを入力し、認証を完了してください:" -ForegroundColor Yellow
        Write-Host $deviceCodeResponse.verification_uri -ForegroundColor Cyan
        Write-Host "`n入力コード: " -NoNewline -ForegroundColor Yellow
        Write-Host $deviceCodeResponse.user_code -ForegroundColor Green
        Write-Host "`n認証が完了するまで待機しています..." -ForegroundColor Yellow
        
        # トークン取得を試行
        $tokenUri = "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token"
        $tokenBody = @{
            grant_type = "urn:ietf:params:oauth:grant-type:device_code"
            client_id = $ClientId
            device_code = $deviceCodeResponse.device_code
        }
        
        $accessToken = $null
        $retryCount = 0
        $maxRetries = 60  # 最大5分間待機
        
        while (-not $accessToken -and $retryCount -lt $maxRetries) {
            try {
                $tokenResponse = Invoke-RestMethod -Method Post -Uri $tokenUri -Body $tokenBody -ErrorAction Stop
                $accessToken = $tokenResponse.access_token
                Write-Log "認証成功！アクセストークンを取得しました。" -Level "SUCCESS"
            }
            catch {
                # authorization_pending の場合は待機
                if ($_.Exception.Response.StatusCode.value__ -eq 400 -and
                    $_.ErrorDetails.Message -like "*authorization_pending*") {
                    Write-Log "認証待機中... ($retryCount/$maxRetries)" -Level "INFO"
                    Start-Sleep -Seconds 5
                    $retryCount++
                }
                else {
                    throw $_
                }
            }
        }
        
        if (-not $accessToken) {
            Write-Log "認証タイムアウト。再度実行してください。" -Level "ERROR"
            return $null
        }
        
        return $accessToken
    }
    catch {
        Write-Log "認証プロセス中にエラーが発生しました: $_" -Level "ERROR"
        return $null
    }
}

# アクセストークン取得
$scope = "https://graph.microsoft.com/.default"
$accessToken = Get-DeviceCodeAuthToken -ClientId $clientId -TenantId $tenantId -Scope $scope

if (-not $accessToken) {
    Write-Log "認証に失敗しました。スクリプトを終了します。" -Level "ERROR"
    exit 1
}

# Microsoft Graph API用のヘッダー
$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

# 一般ユーザー一覧取得関数
function Get-M365Users {
    param (
        [Parameter(Mandatory = $true)]
        [hashtable]$Headers
    )
    
    Write-Log "Microsoft 365ユーザー一覧を取得しています..." -Level "INFO"
    
    try {
        # 一般ユーザーを取得（管理者ロールを持たないユーザーのみ）
        $usersUri = "https://graph.microsoft.com/v1.0/users?`$select=id,displayName,userPrincipalName,jobTitle,department"
        $usersResponse = Invoke-RestMethod -Uri $usersUri -Headers $Headers -Method Get
        
        $users = @()
        foreach ($user in $usersResponse.value) {
            $userObject = [PSCustomObject]@{
                ID = $user.id
                DisplayName = $user.displayName
                UserPrincipalName = $user.userPrincipalName
                JobTitle = $user.jobTitle
                Department = $user.department
                IsAdmin = $false
            }
            $users += $userObject
        }
        
        # ユーザーが管理者かどうかを確認
        foreach ($user in $users) {
            $directoryRoleUri = "https://graph.microsoft.com/v1.0/directoryRoles"
            $directoryRoles = Invoke-RestMethod -Uri $directoryRoleUri -Headers $Headers -Method Get
            
            foreach ($role in $directoryRoles.value) {
                $membersUri = "https://graph.microsoft.com/v1.0/directoryRoles/$($role.id)/members"
                $members = Invoke-RestMethod -Uri $membersUri -Headers $Headers -Method Get
                
                foreach ($member in $members.value) {
                    if ($member.id -eq $user.ID) {
                        $user.IsAdmin = $true
                        break
                    }
                }
                
                if ($user.IsAdmin) {
                    break
                }
            }
        }
        
        Write-Log "ユーザー一覧の取得が完了しました。$($users.Count)人のユーザーが見つかりました。" -Level "SUCCESS"
        return $users | Where-Object { -not $_.IsAdmin }
    }
    catch {
        Write-Log "ユーザー一覧の取得中にエラーが発生しました: $_" -Level "ERROR"
        return @()
    }
}

# ユーザーの現在のアプリパーミッションを取得する関数
function Get-UserAppPermissions {
    param (
        [Parameter(Mandatory = $true)]
        [string]$UserId,
        
        [Parameter(Mandatory = $true)]
        [hashtable]$Headers
    )
    
    Write-Log "ユーザーID $UserId のアプリパーミッションを取得しています..." -Level "INFO"
    
    try {
        $permissionsUri = "https://graph.microsoft.com/v1.0/users/$UserId/appRoleAssignments"
        $permissionsResponse = Invoke-RestMethod -Uri $permissionsUri -Headers $Headers -Method Get
        
        Write-Log "アプリパーミッションの取得が完了しました。$($permissionsResponse.value.Count)個のパーミッションが見つかりました。" -Level "SUCCESS"
        return $permissionsResponse.value
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
        
        [Parameter(Mandatory = $true)]
        [hashtable]$Headers
    )
    
    Write-Log "ユーザーID $UserId にアプリパーミッション $AppRoleId を付与しています..." -Level "INFO"
    
    try {
        $grantUri = "https://graph.microsoft.com/v1.0/users/$UserId/appRoleAssignments"
        $grantBody = @{
            principalId = $UserId
            resourceId = $ResourceId
            appRoleId = $AppRoleId
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri $grantUri -Headers $Headers -Method Post -Body $grantBody
        
        Write-Log "パーミッション付与が成功しました。" -Level "SUCCESS"
        return $response
    }
    catch {
        Write-Log "パーミッション付与中にエラーが発生しました: $_" -Level "ERROR"
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
        
        [Parameter(Mandatory = $true)]
        [hashtable]$Headers
    )
    
    Write-Log "ユーザーID $UserId のアプリパーミッション割り当て $AppRoleAssignmentId を解除しています..." -Level "INFO"
    
    try {
        $revokeUri = "https://graph.microsoft.com/v1.0/users/$UserId/appRoleAssignments/$AppRoleAssignmentId"
        $response = Invoke-RestMethod -Uri $revokeUri -Headers $Headers -Method Delete
        
        Write-Log "パーミッション解除が成功しました。" -Level "SUCCESS"
        return $true
    }
    catch {
        Write-Log "パーミッション解除中にエラーが発生しました: $_" -Level "ERROR"
        return $false
    }
}

# 一般ユーザー一覧を取得
$generalUsers = Get-M365Users -Headers $headers

if ($generalUsers.Count -eq 0) {
    Write-Log "一般ユーザーが見つかりませんでした。スクリプトを終了します。" -Level "WARNING"
    exit 1
}

# ユーザー一覧表示
Write-Host "`n一般ユーザー一覧:" -ForegroundColor Cyan
for ($i = 0; $i -lt $generalUsers.Count; $i++) {
    Write-Host "[$($i + 1)] $($generalUsers[$i].DisplayName) - $($generalUsers[$i].UserPrincipalName)" -ForegroundColor White
    if ($generalUsers[$i].JobTitle) {
        Write-Host "    役職: $($generalUsers[$i].JobTitle)" -ForegroundColor Gray
    }
    if ($generalUsers[$i].Department) {
        Write-Host "    部署: $($generalUsers[$i].Department)" -ForegroundColor Gray
    }
}

# ユーザー選択
[int]$selectedIndex = 0
do {
    $userInput = Read-Host "`nユーザーを選択してください (1-$($generalUsers.Count))"
    if ([int]::TryParse($userInput, [ref]$selectedIndex)) {
        if ($selectedIndex -ge 1 -and $selectedIndex -le $generalUsers.Count) {
            break
        }
    }
    Write-Host "無効な選択です。1から$($generalUsers.Count)の間で入力してください。" -ForegroundColor Red
} while ($true)

$selectedUser = $generalUsers[$selectedIndex - 1]
Write-Host "選択したユーザー: $($selectedUser.DisplayName) ($($selectedUser.UserPrincipalName))" -ForegroundColor Green
Write-Log "ユーザー $($selectedUser.DisplayName) ($($selectedUser.UserPrincipalName)) が選択されました。" -Level "INFO"

# 操作メニュー
Write-Host "`n実行する操作を選択してください:" -ForegroundColor Cyan
Write-Host "[1] APIパーミッションを付与する" -ForegroundColor White
Write-Host "[2] APIパーミッションを解除する" -ForegroundColor White
Write-Host "[3] 現在のAPIパーミッションを表示する" -ForegroundColor White
Write-Host "[4] 終了" -ForegroundColor White

[int]$operationChoice = 0
do {
    $operationInput = Read-Host "`n操作を選択してください (1-4)"
    if ([int]::TryParse($operationInput, [ref]$operationChoice)) {
        if ($operationChoice -ge 1 -and $operationChoice -le 4) {
            break
        }
    }
    Write-Host "無効な選択です。1から4の間で入力してください。" -ForegroundColor Red
} while ($true)

switch ($operationChoice) {
    1 {
        # APIパーミッション付与
        Write-Host "`nAPIパーミッション付与" -ForegroundColor Cyan
        
        # パーミッション定義 - Microsoft Graph リソースID
        $graphResourceId = "00000003-0000-0000-c000-000000000000"  # Microsoft Graph ResourceId
        $exchangeResourceId = "00000002-0000-0ff1-ce00-000000000000"  # Exchange Online ResourceId
        
        # 必要なAPIパーミッション一覧
        $permissions = @(
            # 1. OneDrive for Business
            @{
                Name = "Microsoft Graph - User.Read.All"
                ResourceId = $graphResourceId
                AppRoleId = "df021288-bdef-4463-88db-98f22de89214"
                Description = "ユーザー情報へのアクセス (OneDrive)"
                Category = "OneDrive for Business"
            },
            @{
                Name = "Microsoft Graph - Directory.Read.All"
                ResourceId = $graphResourceId
                AppRoleId = "7ab1d382-f21e-4acd-a863-ba3e13f7da61"
                Description = "組織構造情報へのアクセス (OneDrive)"
                Category = "OneDrive for Business"
            },
            @{
                Name = "Microsoft Graph - Files.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "75359482-378d-4052-8f01-80520e7db3cd"
                Description = "OneDriveファイルの読み書き"
                Category = "OneDrive for Business"
            },
            
            # 2. Microsoft Teams
            @{
                Name = "Microsoft Graph - Team.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "bdd80a03-d9bc-451d-b7c4-ce7c63fe3c8f"
                Description = "Teams管理"
                Category = "Microsoft Teams"
            },
            @{
                Name = "Microsoft Graph - Channel.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "243cded2-bd16-4fd6-a953-d9095e9f1b0c"
                Description = "チャネル管理"
                Category = "Microsoft Teams"
            },
            @{
                Name = "Microsoft Graph - Chat.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "294ce7c9-31ba-490a-ad7d-97a7d075e4ed"
                Description = "チャット管理"
                Category = "Microsoft Teams"
            },
            
            # 3. Microsoft Entra ID
            @{
                Name = "Microsoft Graph - Directory.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "19dbc75e-c2e2-444c-a770-ec69d8559fc7"
                Description = "ディレクトリデータの管理"
                Category = "Microsoft Entra ID"
            },
            @{
                Name = "Microsoft Graph - Group.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "62a82d76-70ea-41e2-9197-370581804d09"
                Description = "グループ管理"
                Category = "Microsoft Entra ID"
            },
            @{
                Name = "Microsoft Graph - RoleManagement.ReadWrite.Directory"
                ResourceId = $graphResourceId
                AppRoleId = "9e3f62cf-ca93-4989-b6ce-bf83c28f9fe8"
                Description = "ロール管理"
                Category = "Microsoft Entra ID"
            },
            
            # 4. Exchange Online
            @{
                Name = "Microsoft Graph - Mail.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "e2a3a72e-5f79-4c64-b1b1-878b674786c9"
                Description = "メール管理"
                Category = "Exchange Online"
            },
            @{
                Name = "Microsoft Graph - MailboxSettings.ReadWrite"
                ResourceId = $graphResourceId
                AppRoleId = "6e74bfad-400e-4ea1-8f8c-c3ef50c237a1"
                Description = "メールボックス設定管理"
                Category = "Exchange Online"
            },
            @{
                Name = "Microsoft Graph - Calendars.ReadWrite.All"
                ResourceId = $graphResourceId
                AppRoleId = "ef54d2bf-783f-4e0f-bca1-3210c0444d99"
                Description = "カレンダー管理"
                Category = "Exchange Online"
            },
            @{
                Name = "Exchange Online - Exchange.ManageAsApp"
                ResourceId = $exchangeResourceId
                AppRoleId = "dc890d15-9560-4a4c-9b7f-a736ec74ec40"
                Description = "Exchange Online APIへのフルアクセス"
                Category = "Exchange Online"
            }
        )
        
        # 既存のパーミッションを確認して重複を避ける
        $currentPermissions = Get-UserAppPermissions -UserId $selectedUser.ID -Headers $headers
        
        # カテゴリ別にグループ化してパーミッションを表示
        $categories = $permissions | ForEach-Object { $_.Category } | Sort-Object -Unique
        
        Write-Host "`n付与可能なAPIパーミッション一覧:" -ForegroundColor Cyan
        
        # カテゴリごとにパーミッションを表示
        $categoryIndexMap = @{}
        
        foreach ($category in $categories) {
            Write-Host "`n[$category]" -ForegroundColor Yellow
            
            $categoryPermissions = $permissions | Where-Object { $_.Category -eq $category }
            $categoryIndexMap[$category] = @{}
            
            for ($i = 0; $i -lt $categoryPermissions.Count; $i++) {
                $globalIndex++
                $permission = $categoryPermissions[$i]
                $categoryIndexMap[$category][$i + 1] = $globalIndex
                
                # 既に付与されているかチェック
                $isGranted = $false
                foreach ($perm in $currentPermissions) {
                    if ($perm.appRoleId -eq $permission.AppRoleId -and $perm.resourceId -eq $permission.ResourceId) {
                        $isGranted = $true
                        break
                    }
                }
                
                # 付与済みの場合は色を変える
                if ($isGranted) {
                    Write-Host "  [$($i + 1)] $($permission.Name) [付与済み]" -ForegroundColor Gray
                }
                else {
                    Write-Host "  [$($i + 1)] $($permission.Name)" -ForegroundColor White
                }
                Write-Host "      $($permission.Description)" -ForegroundColor Gray
            }
        }
        
        # まずカテゴリを選択
        [string]$categoryInput = ""
        do {
            Write-Host "`nパーミッションカテゴリを選択してください:" -ForegroundColor Cyan
            for ($i = 0; $i -lt $categories.Count; $i++) {
                Write-Host "[$($i + 1)] $($categories[$i])" -ForegroundColor White
            }
            
            $categoryInput = Read-Host "`nカテゴリ番号を入力してください (1-$($categories.Count))"
            [int]$categoryIndex = 0
            
            if ([int]::TryParse($categoryInput, [ref]$categoryIndex)) {
                if ($categoryIndex -ge 1 -and $categoryIndex -le $categories.Count) {
                    break
                }
            }
            Write-Host "無効な選択です。1から$($categories.Count)の間で入力してください。" -ForegroundColor Red
        } while ($true)
        
        $selectedCategory = $categories[$categoryIndex - 1]
        $categoryPermissions = $permissions | Where-Object { $_.Category -eq $selectedCategory }
        
        # 次に選択したカテゴリ内のパーミッションを選択
        [int]$permIndex = 0
        do {
            Write-Host "`n[$selectedCategory] カテゴリから付与するパーミッションを選択してください:" -ForegroundColor Cyan
            for ($i = 0; $i -lt $categoryPermissions.Count; $i++) {
                Write-Host "[$($i + 1)] $($categoryPermissions[$i].Name)" -ForegroundColor White
                Write-Host "    $($categoryPermissions[$i].Description)" -ForegroundColor Gray
            }
            
            $permInput = Read-Host "`nパーミッション番号を入力してください (1-$($categoryPermissions.Count))"
            if ([int]::TryParse($permInput, [ref]$permIndex)) {
                if ($permIndex -ge 1 -and $permIndex -le $categoryPermissions.Count) {
                    break
                }
            }
            Write-Host "無効な選択です。1から$($categoryPermissions.Count)の間で入力してください。" -ForegroundColor Red
        } while ($true)
        
        $selectedPermission = $categoryPermissions[$permIndex - 1]
        
        # 選択したパーミッションが既に付与されているか確認
        $isAlreadyGranted = $false
        foreach ($perm in $currentPermissions) {
            if ($perm.appRoleId -eq $selectedPermission.AppRoleId -and $perm.resourceId -eq $selectedPermission.ResourceId) {
                $isAlreadyGranted = $true
                break
            }
        }
        
        if ($isAlreadyGranted) {
            Write-Host "`n選択したパーミッションは既に付与されています。" -ForegroundColor Yellow
            Write-Log "パーミッション $($selectedPermission.Name) は既にユーザー $($selectedUser.DisplayName) に付与されています。" -Level "WARNING"
        }
        else {
            # パーミッション付与の確認
            $confirmGrant = Read-Host "`nユーザー $($selectedUser.DisplayName) にパーミッション $($selectedPermission.Name) を付与しますか？ (Y/N)"
            
            if ($confirmGrant -eq "Y" -or $confirmGrant -eq "y") {
                # パーミッションの付与
                $grantResult = Grant-AppPermission -UserId $selectedUser.ID -ResourceId $selectedPermission.ResourceId -AppRoleId $selectedPermission.AppRoleId -Headers $headers
                
                if ($grantResult) {
                    Write-Host "`nパーミッションの付与が完了しました。" -ForegroundColor Green
                    Write-Log "ユーザー $($selectedUser.DisplayName) にパーミッション $($selectedPermission.Name) を付与しました。" -Level "SUCCESS"
                }
                else {
                    Write-Host "`nパーミッションの付与に失敗しました。" -ForegroundColor Red
                }
            }
            else {
                Write-Host "`n操作をキャンセルしました。" -ForegroundColor Yellow
                Write-Log "ユーザー $($selectedUser.DisplayName) へのパーミッション付与操作がキャンセルされました。" -Level "INFO"
            }
        }
    }
    
    2 {
        # APIパーミッション解除
        Write-Host "`nAPIパーミッション解除" -ForegroundColor Cyan
        
        # 現在のパーミッションを取得
        $currentPermissions = Get-UserAppPermissions -UserId $selectedUser.ID -Headers $headers
        
        if ($currentPermissions.Count -eq 0) {
            Write-Host "`nこのユーザーには付与されているAPIパーミッションがありません。" -ForegroundColor Yellow
            Write-Log "ユーザー $($selectedUser.DisplayName) には付与されているAPIパーミッションがありません。" -Level "WARNING"
        }
        else {
            # パーミッション表示
            Write-Host "`n現在付与されているAPIパーミッション一覧:" -ForegroundColor Cyan
            for ($i = 0; $i -lt $currentPermissions.Count; $i++) {
                Write-Host "[$($i + 1)] AppRoleId: $($currentPermissions[$i].appRoleId)" -ForegroundColor White
                Write-Host "    ResourceId: $($currentPermissions[$i].resourceId)" -ForegroundColor Gray
                Write-Host "    割り当てID: $($currentPermissions[$i].id)" -ForegroundColor Gray
            }
            
            # パーミッション選択
            [int]$permIndex = 0
            do {
                $permInput = Read-Host "`n解除するパーミッションを選択してください (1-$($currentPermissions.Count))"
                if ([int]::TryParse($permInput, [ref]$permIndex)) {
                    if ($permIndex -ge 1 -and $permIndex -le $currentPermissions.Count) {
                        break
                    }
                }
                Write-Host "無効な選択です。1から$($currentPermissions.Count)の間で入力してください。" -ForegroundColor Red
            } while ($true)
            
            $selectedPermission = $currentPermissions[$permIndex - 1]
            
            # パーミッション解除の確認
            $confirmRevoke = Read-Host "`nユーザー $($selectedUser.DisplayName) からパーミッション $($selectedPermission.appRoleId) を解除しますか？ (Y/N)"
            
            if ($confirmRevoke -eq "Y" -or $confirmRevoke -eq "y") {
                # パーミッションの解除
                $revokeResult = Revoke-AppPermission -UserId $selectedUser.ID -AppRoleAssignmentId $selectedPermission.id -Headers $headers
                
                if ($revokeResult) {
                    Write-Host "`nパーミッションの解除が完了しました。" -ForegroundColor Green
                    Write-Log "ユーザー $($selectedUser.DisplayName) からパーミッション $($selectedPermission.appRoleId) を解除しました。" -Level "SUCCESS"
                }
                else {
                    Write-Host "`nパーミッションの解除に失敗しました。" -ForegroundColor Red
                }
            }
            else {
                Write-Host "`n操作をキャンセルしました。" -ForegroundColor Yellow
                Write-Log "ユーザー $($selectedUser.DisplayName) からのパーミッション解除操作がキャンセルされました。" -Level "INFO"
            }
        }
    }
    
    3 {
        # 現在のAPIパーミッション表示
        Write-Host "`n現在のAPIパーミッション表示" -ForegroundColor Cyan
        
        $currentPermissions = Get-UserAppPermissions -UserId $selectedUser.ID -Headers $headers
        
        if ($currentPermissions.Count -eq 0) {
            Write-Host "`nこのユーザーには付与されているAPIパーミッションがありません。" -ForegroundColor Yellow
            Write-Log "ユーザー $($selectedUser.DisplayName) には付与されているAPIパーミッションがありません。" -Level "INFO"
        }
        else {
            Write-Host "`nユーザー $($selectedUser.DisplayName) に付与されているAPIパーミッション:" -ForegroundColor Cyan
            foreach ($perm in $currentPermissions) {
                Write-Host "- AppRoleId: $($perm.appRoleId)" -ForegroundColor White
                Write-Host "  ResourceId: $($perm.resourceId)" -ForegroundColor Gray
                Write-Host "  割り当てID: $($perm.id)" -ForegroundColor Gray
                Write-Host ""
            }
            
            Write-Log "ユーザー $($selectedUser.DisplayName) の $($currentPermissions.Count) 個のパーミッションを表示しました。" -Level "INFO"
        }
    }
    
    4 {
        # 終了
        Write-Host "`nスクリプトを終了します。" -ForegroundColor Cyan
        Write-Log "スクリプトが正常に終了しました。" -Level "INFO"
        exit 0
    }
}

# スクリプト終了
Write-Host "`n処理が完了しました。スクリプトを終了します。" -ForegroundColor Cyan
Write-Log "スクリプトが正常に終了しました。" -Level "INFO"

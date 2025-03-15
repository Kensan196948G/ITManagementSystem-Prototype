# Azure アプリケーションのリダイレクトURI更新スクリプト

# Microsoft Graph モジュールの確認とインポート
if (-not (Get-Module -Name Microsoft.Graph -ListAvailable)) {
    Write-Host "Microsoft Graph モジュールをインストールしています..." -ForegroundColor Yellow
    Install-Module -Name Microsoft.Graph -Scope CurrentUser -Force
}

Import-Module Microsoft.Graph.Authentication
Import-Module Microsoft.Graph.Applications

# Microsoft Graph API に接続
Connect-MgGraph -Scopes "Application.ReadWrite.All" -NoWelcome

# 現在時刻のログ記録
$currentTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "[$currentTime] Azure AD からアプリケーション情報を取得中..." -ForegroundColor Cyan

# アプリケーションIDの設定
$appId = "22e5d6e4-805f-4516-af09-ff09c7c224c4"  # 環境変数から取得するか直接指定

# アプリケーション情報を取得
$application = Get-MgApplication -Filter "appId eq '$appId'"

if (-not $application) {
    Write-Host "エラー: 指定されたアプリケーションIDのアプリケーションが見つかりませんでした。" -ForegroundColor Red
    exit 1
}

# アプリケーション名を取得
Write-Host "[$currentTime] アプリケーション名: $($application.DisplayName)" -ForegroundColor Green

# 現在のリダイレクトURIを表示
Write-Host "[$currentTime] 現在のリダイレクトURI: " -ForegroundColor Cyan
foreach ($uri in $application.Web.RedirectUris) {
    Write-Host "  - $uri" -ForegroundColor Gray
}

# 追加するリダイレクトURI
$redirectUris = @()
if ($application.Web.RedirectUris) {
    $redirectUris = $application.Web.RedirectUris
}

# 必要なリダイレクトURIを両方追加
$newUris = @(
    "https://localhost:5000/auth/callback",
    "http://localhost:3000/microsoft-callback",
    "http://localhost:3000/auth/callback",
    "https://localhost:3000/microsoft-callback",
    "https://localhost:3000/auth/callback"
)

$updated = $false
foreach ($newUri in $newUris) {
    if (-not $redirectUris.Contains($newUri)) {
        $redirectUris += $newUri
        $updated = $true
        Write-Host "[$currentTime] リダイレクトURIを追加: $newUri" -ForegroundColor Green
    }
}

if (-not $updated) {
    Write-Host "[$currentTime] すべてのリダイレクトURIは既に設定されています。更新は不要です。" -ForegroundColor Yellow
    exit 0
}

# リダイレクトURIの更新
$params = @{
    WebRedirectUris = $redirectUris
}

Update-MgApplication -ApplicationId $application.Id -BodyParameter $params

Write-Host "[$currentTime] リダイレクトURIを更新しました" -ForegroundColor Green
Write-Host "[$currentTime] 更新後のリダイレクトURI: " -ForegroundColor Cyan
foreach ($uri in $redirectUris) {
    Write-Host "  - $uri" -ForegroundColor White
}

# サインアウト
Disconnect-MgGraph

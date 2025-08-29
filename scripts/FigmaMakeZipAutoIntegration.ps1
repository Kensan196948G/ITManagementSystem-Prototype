# Figma Make Zip 自動統合スクリプト
# 仕様書に基づき、Downloadsフォルダから最新のUI Zipファイルを検出し、
# frontendディレクトリに解凍・配置する処理を実装

$downloadDir = "$env:USERPROFILE\Downloads"
$searchPattern = "ITSM IT Operations Platform*.zip"
$projectRoot = "C:\\kitting\\ITManagementSystem-Prototype"
$frontendRoot = "$projectRoot\\frontend"
$tempUnzip = "$env:TEMP\\figma_unzip"

# 最新のZipファイル検出
$latestZip = Get-ChildItem -Path $downloadDir -Filter $searchPattern |
Sort-Object LastWriteTime -Descending |
Select-Object -First 1

if (-not $latestZip) {
    Write-Host "❌ Figma Make の Zip ファイルが見つかりません。"
    exit 1
}

Write-Host "✅ 最新ファイルを発見: $($latestZip.Name)"

# frontend へ転送
$destZip = Join-Path $frontendRoot $latestZip.Name
Copy-Item -Path $latestZip.FullName -Destination $destZip -Force

# 一時解凍フォルダを準備
if (Test-Path $tempUnzip) { Remove-Item $tempUnzip -Recurse -Force }
New-Item -Path $tempUnzip -ItemType Directory | Out-Null

# 解凍
Expand-Archive -Path $destZip -DestinationPath $tempUnzip -Force

# components, pages, styles の各フォルダを frontend に配置
foreach ($folder in "components", "pages", "styles") {
    $source = Join-Path $tempUnzip $folder
    $dest = Join-Path $frontendRoot $folder
    if (Test-Path $source) {
        Copy-Item -Path "$source\\*" -Destination $dest -Recurse -Force
        Write-Host "📁 $folder フォルダを更新しました。"
    }
}

# Roocode呼びかけメッセージ
Write-Host "`n🚀 Figma Make UI の配置が完了しました！"
Write-Host "👉 Roocode を開いて Orchestrator モードで実装を開始してください！"
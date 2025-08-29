#requires -Version 5.1
<#
.SYNOPSIS
    ITマネジメントシステム本番環境リソース作成スクリプト

.DESCRIPTION
    このスクリプトは、ITマネジメントシステムの本番環境に必要なAzureリソースを作成します。
    リソースグループ、ネットワーク、App Service、SQLデータベースなどを自動的にプロビジョニングします。

.PARAMETER ResourceGroupName
    作成するリソースグループ名。指定がない場合は「rg-it-management-prod」が使用されます。

.PARAMETER Location
    リソースの作成先リージョン。指定がない場合は「japaneast」が使用されます。

.PARAMETER Environment
    環境名（Prod または Staging）。デフォルトは「Prod」です。

.PARAMETER OutputPath
    結果レポートの出力先パス。指定がない場合はカレントディレクトリに出力します。

.EXAMPLE
    .\New-ProductionEnvironment.ps1
    デフォルト設定でAzureリソースを作成します。

.EXAMPLE
    .\New-ProductionEnvironment.ps1 -ResourceGroupName "my-rg-prod" -Location "westus" -Environment "Staging"
    指定した設定でAzureリソースを作成します。

.NOTES
    作成者: ITマネジメントシステム開発チーム
    最終更新日: 2025/03/15
    
    このスクリプトを実行するには、Az PowerShellモジュールが必要です。
    インストールされていない場合は以下のコマンドでインストールできます：
    Install-Module -Name Az -Force
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string] $ResourceGroupName = "rg-it-management-prod",

    [Parameter(Mandatory = $false)]
    [string] $Location = "japaneast",

    [Parameter(Mandatory = $false)]
    [ValidateSet("Prod", "Staging")]
    [string] $Environment = "Prod",

    [Parameter(Mandatory = $false)]
    [string] $OutputPath = (Get-Location).Path
)

#region 初期設定

# エラーアクション設定 - エラーが発生してもスクリプトを継続
$ErrorActionPreference = "Continue"

# スクリプト開始時間とログファイル名設定
$startTime = Get-Date
$logFileName = "Azure-Resource-Provisioning_$($startTime.ToString('yyyyMMdd_HHmmss')).log"
$reportFileName = "Azure-Resource-Provisioning_$($startTime.ToString('yyyyMMdd_HHmmss')).txt"
$logFilePath = Join-Path -Path $OutputPath -ChildPath $logFileName
$reportFilePath = Join-Path -Path $OutputPath -ChildPath $reportFileName

# リソース名の接尾辞（環境に基づく）
$suffix = if ($Environment -eq "Prod") { "" } else { "-staging" }

# リソース名の設定
$resourceNames = @{
    VNet = "vnet-it-management$suffix"
    FrontendSubnet = "snet-frontend$suffix"
    BackendSubnet = "snet-backend$suffix"
    DatabaseSubnet = "snet-database$suffix"
    FrontendNSG = "nsg-frontend$suffix"
    BackendNSG = "nsg-backend$suffix"
    DatabaseNSG = "nsg-database$suffix"
    AppServicePlan = "plan-it-management$suffix"
    FrontendApp = "app-it-management-web$suffix"
    BackendApp = "app-it-management-api$suffix"
    SqlServer = "sql-it-management$suffix"
    SqlDatabase = "sqldb-it-management$suffix"
    KeyVault = "kv-it-management$suffix"
    Storage = "stitmgmt$($Environment.ToLower())$(Get-Random -Minimum 1000 -Maximum 9999)"
}

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
    ResourceGroupInfo = @{}
    NetworkResources = @()
    AppServices = @()
    DatabaseResources = @{}
    StorageResources = @{}
    KeyVaultInfo = @{}
    DeploymentScripts = @()
    CreatedResources = @()
    Errors = @()
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
            Write-Log "モジュール '$ModuleName' ($($module[0].Version)) が見つかりました。" -Level SUCCESS
            return $true
        }
    }
    catch {
        Write-Log "モジュール '$ModuleName' の確認中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
        return $false
    }
}

# Azure接続確認関数
function Connect-ToAzure {
    [CmdletBinding()]
    param()
    
    try {
        # 現在の接続状態を確認
        $context = Get-AzContext -ErrorAction SilentlyContinue
        
        if ($context) {
            Write-Log "既にAzure ($($context.Subscription.Name)) に接続されています。" -Level SUCCESS
            $results.ResourceGroupInfo.SubscriptionId = $context.Subscription.Id
            $results.ResourceGroupInfo.SubscriptionName = $context.Subscription.Name
            $results.ResourceGroupInfo.TenantId = $context.Tenant.Id
            return $true
        }
    }
    catch {
        # 接続されていないのでログイン処理を行う
        Write-Log "Azureへの接続を開始します..." -Level INFO
    }
    
    try {
        # ユーザーにログインを促す
        Write-Host "`n---------------------------------------------------" -ForegroundColor Cyan
        Write-Host "Azureへのログインが必要です。" -ForegroundColor Cyan
        Write-Host "ログインウィンドウが表示されたら、必要な権限を持つアカウントでログインしてください。" -ForegroundColor Cyan
        Write-Host "---------------------------------------------------`n" -ForegroundColor Cyan
        
        Connect-AzAccount -ErrorAction Stop
        
        # 接続成功の確認
        $context = Get-AzContext -ErrorAction Stop
        Write-Log "Azure ($($context.Subscription.Name)) への接続に成功しました。" -Level SUCCESS
        
        # サブスクリプション情報を保存
        $results.ResourceGroupInfo.SubscriptionId = $context.Subscription.Id
        $results.ResourceGroupInfo.SubscriptionName = $context.Subscription.Name
        $results.ResourceGroupInfo.TenantId = $context.Tenant.Id
        
        return $true
    }
    catch {
        Write-Log "Azureへの接続に失敗しました: $($_.Exception.Message)" -Level ERROR
        $results.Errors += @{
            Area = "Azure接続"
            Message = $_.Exception.Message
            Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
        }
        return $false
    }
}

# リソースグループ作成関数
function New-ResourceGroupIfNotExists {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string] $ResourceGroupName,
        
        [Parameter(Mandatory = $true)]
        [string] $Location
    )
    
    try {
        # リソースグループが存在するか確認
        $resourceGroup = Get-AzResourceGroup -Name $ResourceGroupName -ErrorAction SilentlyContinue
        
        if ($resourceGroup) {
            Write-Log "リソースグループ '$ResourceGroupName' は既に存在します。" -Level INFO
        }
        else {
            # リソースグループの作成
            Write-Log "リソースグループ '$ResourceGroupName' を作成しています..." -Level INFO
            $resourceGroup = New-AzResourceGroup -Name $ResourceGroupName -Location $Location
            Write-Log "リソースグループの作成が完了しました。" -Level SUCCESS
            
            # 作成したリソースを記録
            $results.CreatedResources += @{
                ResourceType = "ResourceGroup"
                ResourceName = $ResourceGroupName
                Status = "Created"
                Location = $Location
            }
        }
        
        # 結果にリソースグループ情報を保存
        $results.ResourceGroupInfo.Name = $resourceGroup.ResourceGroupName
        $results.ResourceGroupInfo.Location = $resourceGroup.Location
        $results.ResourceGroupInfo.Id = $resourceGroup.ResourceId
        
        return $resourceGroup
    }
    catch {
        Write-Log "リソースグループの作成中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
        $results.Errors += @{
            Area = "リソースグループ作成"
            Message = $_.Exception.Message
            Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
        }
        return $null
    }
}

# 仮想ネットワーク作成関数
function New-VirtualNetworkResources {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string] $ResourceGroupName,
        
        [Parameter(Mandatory = $true)]
        [string] $Location
    )
    
    try {
        # 仮想ネットワークの作成
        Write-Log "仮想ネットワーク '$($resourceNames.VNet)' を作成しています..." -Level INFO
        
        # 仮想ネットワークが既に存在するか確認
        $vnet = Get-AzVirtualNetwork -Name $resourceNames.VNet -ResourceGroupName $ResourceGroupName -ErrorAction SilentlyContinue
        
        if ($null -eq $vnet) {
            # フロントエンドサブネットの設定
            $frontendSubnetConfig = New-AzVirtualNetworkSubnetConfig -Name $resourceNames.FrontendSubnet -AddressPrefix "10.0.1.0/24"
            
            # バックエンドサブネットの設定
            $backendSubnetConfig = New-AzVirtualNetworkSubnetConfig -Name $resourceNames.BackendSubnet -AddressPrefix "10.0.2.0/24"
            
            # データベースサブネットの設定
            $databaseSubnetConfig = New-AzVirtualNetworkSubnetConfig -Name $resourceNames.DatabaseSubnet -AddressPrefix "10.0.3.0/24"
            
            # 仮想ネットワークの作成
            $vnet = New-AzVirtualNetwork -ResourceGroupName $ResourceGroupName -Location $Location `
                -Name $resourceNames.VNet -AddressPrefix "10.0.0.0/16" `
                -Subnet $frontendSubnetConfig, $backendSubnetConfig, $databaseSubnetConfig
            
            Write-Log "仮想ネットワークの作成が完了しました。" -Level SUCCESS
            
            # 作成したリソースを記録
            $results.CreatedResources += @{
                ResourceType = "VirtualNetwork"
                ResourceName = $resourceNames.VNet
                Status = "Created"
                Location = $Location
            }
        }
        else {
            Write-Log "仮想ネットワーク '$($resourceNames.VNet)' は既に存在します。" -Level INFO
        }
        
        # ネットワークセキュリティグループの作成
        Write-Log "ネットワークセキュリティグループを作成しています..." -Level INFO
        
        # フロントエンドNSGの作成
        $frontendNsg = Get-AzNetworkSecurityGroup -Name $resourceNames.FrontendNSG -ResourceGroupName $ResourceGroupName -ErrorAction SilentlyContinue
        
        if ($null -eq $frontendNsg) {
            $frontendNsg = New-AzNetworkSecurityGroup -ResourceGroupName $ResourceGroupName -Location $Location -Name $resourceNames.FrontendNSG
            
            # HTTPSルールの追加
            $frontendNsg | Add-AzNetworkSecurityRuleConfig -Name "Allow-HTTPS" -Description "Allow HTTPS" `
                -Access Allow -Protocol Tcp -Direction Inbound -Priority 100 `
                -SourceAddressPrefix * -SourcePortRange * `
                -DestinationAddressPrefix * -DestinationPortRange 443 | Set-AzNetworkSecurityGroup
            
            # HTTPルールの追加
            $frontendNsg | Add-AzNetworkSecurityRuleConfig -Name "Allow-HTTP" -Description "Allow HTTP" `
                -Access Allow -Protocol Tcp -Direction Inbound -Priority 110 `
                -SourceAddressPrefix * -SourcePortRange * `
                -DestinationAddressPrefix * -DestinationPortRange 80 | Set-AzNetworkSecurityGroup
            
            # 作成したリソースを記録
            $results.CreatedResources += @{
                ResourceType = "NetworkSecurityGroup"
                ResourceName = $resourceNames.FrontendNSG
                Status = "Created"
                Location = $Location
            }
        }
        else {
            Write-Log "フロントエンドNSG '$($resourceNames.FrontendNSG)' は既に存在します。" -Level INFO
        }
        
        # バックエンドNSGの作成
        $backendNsg = Get-AzNetworkSecurityGroup -Name $resourceNames.BackendNSG -ResourceGroupName $ResourceGroupName -ErrorAction SilentlyContinue
        
        if ($null -eq $backendNsg) {
            $backendNsg = New-AzNetworkSecurityGroup -ResourceGroupName $ResourceGroupName -Location $Location -Name $resourceNames.BackendNSG
            
            # APIポートルールの追加
            $backendNsg | Add-AzNetworkSecurityRuleConfig -Name "Allow-API" -Description "Allow API" `
                -Access Allow -Protocol Tcp -Direction Inbound -Priority 100 `
                -SourceAddressPrefix "10.0.1.0/24" -SourcePortRange * `
                -DestinationAddressPrefix * -DestinationPortRange 5000 | Set-AzNetworkSecurityGroup
            
            # 作成したリソースを記録
            $results.CreatedResources += @{
                ResourceType = "NetworkSecurityGroup"
                ResourceName = $resourceNames.BackendNSG
                Status = "Created"
                Location = $Location
            }
        }
        else {
            Write-Log "バックエンドNSG '$($resourceNames.BackendNSG)' は既に存在します。" -Level INFO
        }
        
        # データベースNSGの作成
        $databaseNsg = Get-AzNetworkSecurityGroup -Name $resourceNames.DatabaseNSG -ResourceGroupName $ResourceGroupName -ErrorAction SilentlyContinue
        
        if ($null -eq $databaseNsg) {
            $databaseNsg = New-AzNetworkSecurityGroup -ResourceGroupName $ResourceGroupName -Location $Location -Name $resourceNames.DatabaseNSG
            
            # SQLポートルールの追加
            $databaseNsg | Add-AzNetworkSecurityRuleConfig -Name "Allow-SQL" -Description "Allow SQL" `
                -Access Allow -Protocol Tcp -Direction Inbound -Priority 100 `
                -SourceAddressPrefix "10.0.2.0/24" -SourcePortRange * `
                -DestinationAddressPrefix * -DestinationPortRange 1433 | Set-AzNetworkSecurityGroup
            
            # 作成したリソースを記録
            $results.CreatedResources += @{
                ResourceType = "NetworkSecurityGroup"
                ResourceName = $resourceNames.DatabaseNSG
                Status = "Created"
                Location = $Location
            }
        }
        else {
            Write-Log "データベースNSG '$($resourceNames.DatabaseNSG)' は既に存在します。" -Level INFO
        }
        
        # NSGをサブネットに関連付け
        Write-Log "NSGをサブネットに関連付けています..." -Level INFO
        
        # フロントエンドサブネット取得とNSG関連付け
        $frontendSubnet = Get-AzVirtualNetworkSubnetConfig -Name $resourceNames.FrontendSubnet -VirtualNetwork $vnet
        Set-AzVirtualNetworkSubnetConfig -Name $resourceNames.FrontendSubnet -VirtualNetwork $vnet `
            -AddressPrefix $frontendSubnet.AddressPrefix -NetworkSecurityGroup $frontendNsg | Out-Null
        
        # バックエンドサブネット取得とNSG関連付け
        $backendSubnet = Get-AzVirtualNetworkSubnetConfig -Name $resourceNames.BackendSubnet -VirtualNetwork $vnet
        Set-AzVirtualNetworkSubnetConfig -Name $resourceNames.BackendSubnet -VirtualNetwork $vnet `
            -AddressPrefix $backendSubnet.AddressPrefix -NetworkSecurityGroup $backendNsg | Out-Null
        
        # データベースサブネット取得とNSG関連付け
        $databaseSubnet = Get-AzVirtualNetworkSubnetConfig -Name $resourceNames.DatabaseSubnet -VirtualNetwork $vnet
        Set-AzVirtualNetworkSubnetConfig -Name $resourceNames.DatabaseSubnet -VirtualNetwork $vnet `
            -AddressPrefix $databaseSubnet.AddressPrefix -NetworkSecurityGroup $databaseNsg | Out-Null
        
        # 変更を保存
        $vnet | Set-AzVirtualNetwork | Out-Null
        
        Write-Log "ネットワークリソースの作成が完了しました。" -Level SUCCESS
        
        # 結果にネットワークリソース情報を保存
        $results.NetworkResources += @{
            VNet = $resourceNames.VNet
            FrontendSubnet = $resourceNames.FrontendSubnet
            BackendSubnet = $resourceNames.BackendSubnet
            DatabaseSubnet = $resourceNames.DatabaseSubnet
            FrontendNSG = $resourceNames.FrontendNSG
            BackendNSG = $resourceNames.BackendNSG
            DatabaseNSG = $resourceNames.DatabaseNSG
        }
        
        return $vnet
    }
    catch {
        Write-Log "ネットワークリソースの作成中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
        $results.Errors += @{
            Area = "ネットワークリソース作成"
            Message = $_.Exception.Message
            Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
        }
        return $null
    }
}

# App Service作成関数
function New-AppServiceResources {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string] $ResourceGroupName,
        
        [Parameter(Mandatory = $true)]
        [string] $Location
    )
    
    try {
        # App Service Planの作成
        Write-Log "App Service Plan '$($resourceNames.AppServicePlan)' を作成しています..." -Level INFO
        
        # App Service Planが既に存在するか確認
        $appServicePlan = Get-AzAppServicePlan -ResourceGroupName $ResourceGroupName -Name $resourceNames.AppServicePlan -ErrorAction SilentlyContinue
        
        if ($null -eq $appServicePlan) {
            # App Service Planの作成
            $sku = if ($Environment -eq "Prod") { "P1V2" } else { "S1" }
            $appServicePlan = New-AzAppServicePlan -ResourceGroupName $ResourceGroupName -Location $Location `
                -Name $resourceNames.AppServicePlan -Tier $sku -NumberofWorkers 2 -Linux
            
            Write-Log "App Service Planの作成が完了しました。" -Level SUCCESS
            
            # 作成したリソースを記録
            $results.CreatedResources += @{
                ResourceType = "AppServicePlan"
                ResourceName = $resourceNames.AppServicePlan
                Status = "Created"
                Location = $Location
            }
        }
        else {
            Write-Log "App Service Plan '$($resourceNames.AppServicePlan)' は既に存在します。" -Level INFO
        }
        
        # フロントエンドApp Serviceの作成
        Write-Log "フロントエンドApp Service '$($resourceNames.FrontendApp)' を作成しています..." -Level INFO
        
        # フロントエンドApp Serviceが既に存在するか確認
        $frontendApp = Get-AzWebApp -ResourceGroupName $ResourceGroupName -Name $resourceNames.FrontendApp -ErrorAction SilentlyContinue
        
        if ($null -eq $frontendApp) {
            # フロントエンドApp Serviceの作成
            $frontendApp = New-AzWebApp -ResourceGroupName $ResourceGroupName -Location $Location `
                -Name $resourceNames.FrontendApp -AppServicePlan $resourceNames.AppServicePlan `
                -RuntimeStack "NODE|16-lts"
            
            # 環境設定の追加
            $appSettings = @{
                "WEBSITES_PORT" = "3000"
                "NODE_ENV" = if ($Environment -eq "Prod") { "production" } else { "staging" }
                "ENVIRONMENT" = if ($Environment -eq "Prod") { "production" } else { "staging" }
            }
            
            Set-AzWebApp -ResourceGroupName $ResourceGroupName -Name $resourceNames.FrontendApp `
                -AppSettings $appSettings | Out-Null
            
            Write-Log "フロントエンドApp Serviceの作成が完了しました。" -Level SUCCESS
            
            # 作成したリソースを記録
            $results.CreatedResources += @{
                ResourceType = "WebApp"
                ResourceName = $resourceNames.FrontendApp
                Status = "Created"
                Location = $Location
            }
        }
        else {
            Write-Log "フロントエンドApp Service '$($resourceNames.FrontendApp)' は既に存在します。" -Level INFO
        }
        
        # バックエンドApp Serviceの作成
        Write-Log "バックエンドApp Service '$($resourceNames.BackendApp)' を作成しています..." -Level INFO
        
        # バックエンドApp Serviceが既に存在するか確認
        $backendApp = Get-AzWebApp -ResourceGroupName $ResourceGroupName -Name $resourceNames.BackendApp -ErrorAction SilentlyContinue
        
        if ($null -eq $backendApp) {
            # バックエンドApp Serviceの作成
            $backendApp = New-AzWebApp -ResourceGroupName $ResourceGroupName -Location $Location `
                -Name $resourceNames.BackendApp -AppServicePlan $resourceNames.AppServicePlan `
                -RuntimeStack "PYTHON|3.9"
            
            # 環境設定の追加
            $appSettings = @{
                "WEBSITES_PORT" = "5000"
                "SCM_DO_BUILD_DURING_DEPLOYMENT" = "true"
                "ENVIRONMENT" = if ($Environment -eq "Prod") { "production" } else { "staging" }
            }
            
            Set-AzWebApp -ResourceGroupName $ResourceGroupName -Name $resourceNames.BackendApp `
                -AppSettings $appSettings | Out-Null
            
            Write-Log "バックエンドApp Serviceの作成が完了しました。" -Level SUCCESS
            
            # 作成したリソースを記録
            $results.CreatedResources += @{
                ResourceType = "WebApp"
                ResourceName = $resourceNames.BackendApp
                Status = "Created"
                Location = $Location
            }
        }
        else {
            Write-Log "バックエンドApp Service '$($resourceNames.BackendApp)' は既に存在します。" -Level INFO
        }
        
        # 結果にApp Service情報を保存
        $results.AppServices += @{
            AppServicePlan = $resourceNames.AppServicePlan
            FrontendApp = $resourceNames.FrontendApp
            BackendApp = $resourceNames.BackendApp
            FrontendUrl = "https://$($resourceNames.FrontendApp).azurewebsites.net"
            BackendUrl = "https://$($resourceNames.BackendApp).azurewebsites.net"
        }
        
        return @{
            FrontendApp = $frontendApp
            BackendApp = $backendApp
        }
    }
    catch {
        Write-Log "App Serviceリソースの作成中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
        $results.Errors += @{
            Area = "App Serviceリソース作成"
            Message = $_.Exception.Message
            Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
        }
        return $null
    }
}

# ストレージアカウント作成関数
function New-StorageResources {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string] $ResourceGroupName,
        
        [Parameter(Mandatory = $true)]
        [string] $Location
    )
    
    try {
        # ストレージアカウントの作成
        Write-Log "ストレージアカウント '$($resourceNames.Storage)' を作成しています..." -Level INFO
        
        # ストレージアカウントが既に存在するか確認
        $storageAccount = Get-AzStorageAccount -ResourceGroupName $ResourceGroupName -Name $resourceNames.Storage -ErrorAction SilentlyContinue
        
        if ($null -eq $storageAccount) {
            # ストレージアカウントの作成
            $storageAccount = New-AzStorageAccount -ResourceGroupName $ResourceGroupName -Location $Location `
                -Name $resourceNames.Storage -SkuName Standard_LRS -Kind StorageV2 -AccessTier Hot `
                -EnableHttpsTrafficOnly $true
            
            Write-Log "ストレージアカウントの作成が完了しました。" -Level SUCCESS
            
            # 作成したリソースを記録
            $results.CreatedResources += @{
                ResourceType = "StorageAccount"
                ResourceName = $resourceNames.Storage
                Status = "Created"
                Location = $Location
            }
            
            # 静的ウェブサイト設定の有効化
            Enable-AzStorageStaticWebsite -Context $storageAccount.Context -IndexDocument "index.html" -ErrorDocument404Path "index.html" | Out-Null
            Write-Log "静的ウェブサイト設定を有効化しました。" -Level SUCCESS
        }
        else {
            Write-Log "ストレージアカウント '$($resourceNames.Storage)' は既に存在します。" -Level INFO
        }
        
        # ストレージアカウントキーの取得
        $keys = Get-AzStorageAccountKey -ResourceGroupName $ResourceGroupName -Name $resourceNames.Storage
        $primaryKey = $keys[0].Value
        
        # ストレージアカウントの接続文字列
        $connectionString = "DefaultEndpointsProtocol=https;AccountName=$($resourceNames.Storage);AccountKey=$primaryKey;EndpointSuffix=core.windows.net"
        
        # 結果にストレージリソース情報を保存
        $results.StorageResources = @{
            StorageAccountName = $resourceNames.Storage
            ConnectionString = $connectionString
            StaticWebsiteUrl = "https://$($resourceNames.Storage).z01.azurefd.net"
            PrimaryKey = $primaryKey
        }
        
        return $storageAccount
    }
    catch {
        Write-Log "ストレージリソースの作成中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
        $results.Errors += @{
            Area = "ストレージリソース作成"
            Message = $_.Exception.Message
            Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
        }
        return $null
    }
}

# Key Vault作成関数
function New-KeyVaultResources {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string] $ResourceGroupName,
        
        [Parameter(Mandatory = $true)]
        [string] $Location,
        
        [Parameter(Mandatory = $false)]
        [string] $TenantId = $results.ResourceGroupInfo.TenantId
    )
    
    try {
        # Key Vaultの作成
        Write-Log "Key Vault '$($resourceNames.KeyVault)' を作成しています..." -Level INFO
        
        # Key Vaultが既に存在するか確認
        $keyVault = Get-AzKeyVault -ResourceGroupName $ResourceGroupName -Name $resourceNames.KeyVault -ErrorAction SilentlyContinue
        
        if ($null -eq $keyVault) {
            # 現在のユーザー情報を取得
            $currentUser = (Get-AzContext).Account.Id
            
            # Key Vaultの作成
            $keyVault = New-AzKeyVault -ResourceGroupName $ResourceGroupName -Location $Location `
                -Name $resourceNames.KeyVault -EnabledForDeployment -EnabledForTemplateDeployment `
                -EnabledForDiskEncryption -Sku Standard -EnablePurgeProtection
            
            # 現在のユーザーにアクセス権を付与
            Set-AzKeyVaultAccessPolicy -VaultName $resourceNames.KeyVault -ResourceGroupName $ResourceGroupName `
                -UserPrincipalName $currentUser -PermissionsToSecrets Get, List, Set, Delete, Backup, Restore, Recover, Purge
            
            Write-Log "Key Vaultの作成が完了しました。" -Level SUCCESS
            
            # 作成したリソースを記録
            $results.CreatedResources += @{
                ResourceType = "KeyVault"
                ResourceName = $resourceNames.KeyVault
                Status = "Created"
                Location = $Location
            }
        }
        else {
            Write-Log "Key Vault '$($resourceNames.KeyVault)' は既に存在します。" -Level INFO
        }
        
        # 結果にKey Vault情報を保存
        $results.KeyVaultInfo = @{
            KeyVaultName = $resourceNames.KeyVault
            Uri = "https://$($resourceNames.KeyVault).vault.azure.net/"
        }
        
        return $keyVault
    }
    catch {
        Write-Log "Key Vaultリソースの作成中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
        $results.Errors += @{
            Area = "Key Vaultリソース作成"
            Message = $_.Exception.Message
            Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
        }
        return $null
    }
}

# データベース作成関数
function New-DatabaseResources {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string] $ResourceGroupName,
        
        [Parameter(Mandatory = $true)]
        [string] $Location
    )
    
    try {
        # SQLサーバーの作成
        Write-Log "SQLサーバー '$($resourceNames.SqlServer)' を作成しています..." -Level INFO
        
        # SQLサーバーが既に存在するか確認
        $sqlServer = Get-AzSqlServer -ResourceGroupName $ResourceGroupName -ServerName $resourceNames.SqlServer -ErrorAction SilentlyContinue
        
        # ランダムなパスワードを生成
        $adminPassword = -join (1..15 | ForEach-Object { Get-Random -InputObject 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+={}[]|\:;"<>,.?/'.ToCharArray() })
        
        if ($null -eq $sqlServer) {
            # SQLサーバーの作成
            $adminName = "sqladmin"
            $securePassword = ConvertTo-SecureString -String $adminPassword -AsPlainText -Force
            $credential = New-Object -TypeName System.Management.Automation.PSCredential -ArgumentList $adminName, $securePassword
            
            $sqlServer = New-AzSqlServer -ResourceGroupName $ResourceGroupName -Location $Location `
                -ServerName $resourceNames.SqlServer -SqlAdministratorCredentials $credential `
                -MinimalTlsVersion "1.2"
            
            Write-Log "SQLサーバーの作成が完了しました。" -Level SUCCESS
            
            # Azureサービスのアクセスを許可するファイアウォールルールを追加
            New-AzSqlServerFirewallRule -ResourceGroupName $ResourceGroupName -ServerName $resourceNames.SqlServer `
                -AllowAllAzureIPs | Out-Null
            
            Write-Log "SQLサーバーファイアウォールルールを追加しました。" -Level SUCCESS
            
            # 作成したリソースを記録
            $results.CreatedResources += @{
                ResourceType = "SqlServer"
                ResourceName = $resourceNames.SqlServer
                Status = "Created"
                Location = $Location
            }
        }
        else {
            Write-Log "SQLサーバー '$($resourceNames.SqlServer)' は既に存在します。管理者パスワードはランダムに生成されますが、既存のパスワードは変更されません。" -Level INFO
        }
        
        # データベースの作成
        Write-Log "SQLデータベース '$($resourceNames.SqlDatabase)' を作成しています..." -Level INFO
        
        # データベースが既に存在するか確認
        $sqlDatabase = Get-AzSqlDatabase -ResourceGroupName $ResourceGroupName -ServerName $resourceNames.SqlServer `
            -DatabaseName $resourceNames.SqlDatabase -ErrorAction SilentlyContinue
        
        if ($null -eq $sqlDatabase -or $sqlDatabase.DatabaseName -eq "master") {
            # データベースの作成
            $edition = if ($Environment -eq "Prod") { "Standard" } else { "Basic" }
            $sqlDatabase = New-AzSqlDatabase -ResourceGroupName $ResourceGroupName -ServerName $resourceNames.SqlServer `
                -DatabaseName $resourceNames.SqlDatabase -Edition $edition `
                -RequestedServiceObjectiveName "S1"
            
            Write-Log "SQLデータベースの作成が完了しました。" -Level SUCCESS
            
            # 作成したリソースを記録
            $results.CreatedResources += @{
                ResourceType = "SqlDatabase"
                ResourceName = $resourceNames.SqlDatabase
                Status = "Created"
                Location = $Location
            }
        }
        else {
            Write-Log "SQLデータベース '$($resourceNames.SqlDatabase)' は既に存在します。" -Level INFO
        }
        
        # 接続文字列の作成
        $connectionString = "Server=tcp:$($resourceNames.SqlServer).database.windows.net,1433;Initial Catalog=$($resourceNames.SqlDatabase);Persist Security Info=False;User ID=sqladmin;Password=$adminPassword;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
        
        # 結果にデータベースリソース情報を保存
        $results.DatabaseResources = @{
            SqlServerName = $resourceNames.SqlServer
            SqlDatabaseName = $resourceNames.SqlDatabase
            AdminUsername = "sqladmin"
            AdminPassword = $adminPassword
            ConnectionString = $connectionString
        }
        
        return @{
            SqlServer = $sqlServer
            SqlDatabase = $sqlDatabase
        }
    }
    catch {
        Write-Log "データベースリソースの作成中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
        $results.Errors += @{
            Area = "データベースリソース作成"
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
  ITマネジメントシステム - Azureリソース作成レポート
===============================================================================

実行日時: $($startTime.ToString('yyyy年MM月dd日 HH:mm:ss'))
環境: $Environment

-----------------------------------
  1. リソースグループ情報
-----------------------------------
リソースグループ名: $($results.ResourceGroupInfo.Name)
ロケーション: $($results.ResourceGroupInfo.Location)
サブスクリプション: $($results.ResourceGroupInfo.SubscriptionName)
サブスクリプションID: $($results.ResourceGroupInfo.SubscriptionId)
テナントID: $($results.ResourceGroupInfo.TenantId)

-----------------------------------
  2. ネットワークリソース
-----------------------------------
仮想ネットワーク: $($results.NetworkResources[0].VNet)
フロントエンドサブネット: $($results.NetworkResources[0].FrontendSubnet)
バックエンドサブネット: $($results.NetworkResources[0].BackendSubnet)
データベースサブネット: $($results.NetworkResources[0].DatabaseSubnet)

-----------------------------------
  3. App Serviceリソース
-----------------------------------
App Service Plan: $($results.AppServices[0].AppServicePlan)
フロントエンドApp: $($results.AppServices[0].FrontendApp)
バックエンドApp: $($results.AppServices[0].BackendApp)
フロントエンドURL: $($results.AppServices[0].FrontendUrl)
バックエンドURL: $($results.AppServices[0].BackendUrl)

-----------------------------------
  4. データベースリソース
-----------------------------------
SQLサーバー名: $($results.DatabaseResources.SqlServerName).database.windows.net
データベース名: $($results.DatabaseResources.SqlDatabaseName)
管理者ユーザー名: $($results.DatabaseResources.AdminUsername)
管理者パスワード: $($results.DatabaseResources.AdminPassword)

接続文字列:
$($results.DatabaseResources.ConnectionString)

-----------------------------------
  5. ストレージリソース
-----------------------------------
ストレージアカウント名: $($results.StorageResources.StorageAccountName)
静的ウェブサイトURL: $($results.StorageResources.StaticWebsiteUrl)
プライマリキー: $($results.StorageResources.PrimaryKey)

接続文字列:
$($results.StorageResources.ConnectionString)

-----------------------------------
  6. Key Vaultリソース
-----------------------------------
Key Vault名: $($results.KeyVaultInfo.KeyVaultName)
Key Vault URI: $($results.KeyVaultInfo.Uri)

-----------------------------------
  7. 作成されたリソース一覧
-----------------------------------
"@
        
        foreach ($resource in $results.CreatedResources) {
            $report += "`n- [$($resource.ResourceType)] $($resource.ResourceName) ($($resource.Status))"
        }
        
        $report += @"

===============================================================================
  環境変数設定値（開発者用）
===============================================================================
# フロントエンド環境変数（.env.production）
REACT_APP_API_BASE_URL=$($results.AppServices[0].BackendUrl)
REACT_APP_STORAGE_URL=$($results.StorageResources.StaticWebsiteUrl)

# バックエンド環境変数（App Service設定）
DATABASE_CONNECTION_STRING=$($results.DatabaseResources.ConnectionString)
STORAGE_CONNECTION_STRING=$($results.StorageResources.ConnectionString)
KEY_VAULT_URI=$($results.KeyVaultInfo.Uri)

===============================================================================
  エラーと警告
===============================================================================
"@
        
        if ($results.Errors.Count -eq 0) {
            $report += "`nリソース作成中にエラーは発生しませんでした。`n"
        }
        else {
            foreach ($error in $results.Errors) {
                $report += "`n[$($error.Timestamp)] [$($error.Area)] $($error.Message)"
            }
        }
        
        $report += @"

===============================================================================
  次のステップ
===============================================================================
1. App Serviceにコードをデプロイします。
   - フロントエンド: $($results.AppServices[0].FrontendApp)
   - バックエンド: $($results.AppServices[0].BackendApp)

2. ドメイン名を設定します。
   - App Serviceのカスタムドメイン設定でドメイン名を構成します。
   - SSL証明書を追加します。

3. データベースの初期化スクリプトを実行します。
   - schema.sqlスクリプトをデータベースに適用します。

4. Key Vaultにシークレットを保存します。
   - データベース接続文字列
   - ストレージ接続文字列
   - その他の機密情報

5. 監視とアラートを設定します。
   - Application Insightsを有効化します。
   - アラートルールを設定します。

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

# デプロイスクリプト生成関数
function Generate-DeploymentScripts {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string] $OutputPath
    )
    
    try {
        Write-Log "デプロイスクリプトを生成しています..." -Level INFO
        
        # フロントエンドデプロイスクリプト
        $frontendDeployScript = @"
# フロントエンドデプロイスクリプト
# $($startTime.ToString('yyyy年MM月dd日'))

# フロントエンドのビルド
cd frontend
npm install
npm run build:$($Environment.ToLower())

# Azureストレージへのデプロイ
az storage blob upload-batch --account-name $($results.StorageResources.StorageAccountName) --auth-mode key --account-key "$($results.StorageResources.PrimaryKey)" --destination '$web' --source ./build --overwrite

# または、App Serviceへのデプロイ
az webapp deployment source config-zip --resource-group $ResourceGroupName --name $($results.AppServices[0].FrontendApp) --src ./build.zip
"@
        
        $frontendDeployScriptPath = Join-Path -Path $OutputPath -ChildPath "deploy-frontend.ps1"
        Set-Content -Path $frontendDeployScriptPath -Value $frontendDeployScript -Encoding UTF8
        
        # バックエンドデプロイスクリプト
        $backendDeployScript = @"
# バックエンドデプロイスクリプト
# $($startTime.ToString('yyyy年MM月dd日'))

# バックエンドのビルド
cd backend
pip install -r requirements.txt

# App Serviceへのデプロイ
az webapp deployment source config-zip --resource-group $ResourceGroupName --name $($results.AppServices[0].BackendApp) --src ./backend.zip
"@
        
        $backendDeployScriptPath = Join-Path -Path $OutputPath -ChildPath "deploy-backend.ps1"
        Set-Content -Path $backendDeployScriptPath -Value $backendDeployScript -Encoding UTF8
        
        # データベース初期化スクリプト
        $databaseInitScript = @"
# データベース初期化スクリプト
# $($startTime.ToString('yyyy年MM月dd日'))

# データベーススキーマの適用
sqlcmd -S $($results.DatabaseResources.SqlServerName).database.windows.net -d $($results.DatabaseResources.SqlDatabaseName) -U $($results.DatabaseResources.AdminUsername) -P "$($results.DatabaseResources.AdminPassword)" -i ./database/schema.sql

# サンプルデータのインポート（オプション）
# sqlcmd -S $($results.DatabaseResources.SqlServerName).database.windows.net -d $($results.DatabaseResources.SqlDatabaseName) -U $($results.DatabaseResources.AdminUsername) -P "$($results.DatabaseResources.AdminPassword)" -i ./database/sample-data.sql
"@
        
        $databaseInitScriptPath = Join-Path -Path $OutputPath -ChildPath "init-database.ps1"
        Set-Content -Path $databaseInitScriptPath -Value $databaseInitScript -Encoding UTF8
        
        Write-Log "デプロイスクリプトの生成が完了しました。" -Level SUCCESS
        
        # 結果にデプロイスクリプト情報を保存
        $results.DeploymentScripts = @(
            @{
                Name = "deploy-frontend.ps1"
                Path = $frontendDeployScriptPath
                Description = "フロントエンドデプロイスクリプト"
            },
            @{
                Name = "deploy-backend.ps1"
                Path = $backendDeployScriptPath
                Description = "バックエンドデプロイスクリプト"
            },
            @{
                Name = "init-database.ps1"
                Path = $databaseInitScriptPath
                Description = "データベース初期化スクリプト"
            }
        )
        
        return $true
    }
    catch {
        Write-Log "デプロイスクリプト生成中にエラーが発生しました: $($_.Exception.Message)" -Level ERROR
        return $false
    }
}

#endregion

#region メイン処理

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  ITマネジメントシステム - Azureリソース作成ツール" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Log "Azureリソース作成スクリプトを開始します..." -Level INFO
Write-Log "リソースグループ名: $ResourceGroupName" -Level INFO
Write-Log "ロケーション: $Location" -Level INFO
Write-Log "環境: $Environment" -Level INFO
Write-Log "出力ディレクトリ: $OutputPath" -Level INFO

# ステップ1: 必要なモジュールの確認
$azModuleInstalled = Test-Module -ModuleName Az
if (-not $azModuleInstalled) {
    Write-Host "`n---------------------------------------------------" -ForegroundColor Red
    Write-Host "Az モジュールがインストールされていません。" -ForegroundColor Red
    Write-Host "以下のコマンドを実行してインストールしてください：" -ForegroundColor Red
    Write-Host "Install-Module -Name Az -Force" -ForegroundColor Yellow
    Write-Host "その後、スクリプトを再度実行してください。" -ForegroundColor Red
    Write-Host "---------------------------------------------------`n" -ForegroundColor Red
    exit 1
}

# ステップ2: Azureに接続
$azureConnected = Connect-ToAzure
if (-not $azureConnected) {
    Write-Host "`n---------------------------------------------------" -ForegroundColor Red
    Write-Host "Azureへの接続に失敗しました。" -ForegroundColor Red
    Write-Host "詳細はログファイルを確認してください: $logFilePath" -ForegroundColor Red
    Write-Host "---------------------------------------------------`n" -ForegroundColor Red
    exit 1
}

# ステップ3: リソースグループの作成
$resourceGroup = New-ResourceGroupIfNotExists -ResourceGroupName $ResourceGroupName -Location $Location
if (-not $resourceGroup) {
    Write-Host "`n---------------------------------------------------" -ForegroundColor Red
    Write-Host "リソースグループの作成に失敗しました。" -ForegroundColor Red
    Write-Host "詳細はログファイルを確認してください: $logFilePath" -ForegroundColor Red
    Write-Host "---------------------------------------------------`n" -ForegroundColor Red
    exit 1
}

# ステップ4: ネットワークリソースの作成
$vnetResources = New-VirtualNetworkResources -ResourceGroupName $ResourceGroupName -Location $Location
if (-not $vnetResources) {
    Write-Log "ネットワークリソースの作成に失敗しました。処理を続行します..." -Level WARNING
}

# ステップ5: App Serviceリソースの作成
$appServices = New-AppServiceResources -ResourceGroupName $ResourceGroupName -Location $Location
if (-not $appServices) {
    Write-Log "App Serviceリソースの作成に失敗しました。処理を続行します..." -Level WARNING
}

# ステップ6: ストレージリソースの作成
$storageAccount = New-StorageResources -ResourceGroupName $ResourceGroupName -Location $Location
if (-not $storageAccount) {
    Write-Log "ストレージリソースの作成に失敗しました。処理を続行します..." -Level WARNING
}

# ステップ7: Key Vaultリソースの作成
$keyVault = New-KeyVaultResources -ResourceGroupName $ResourceGroupName -Location $Location
if (-not $keyVault) {
    Write-Log "Key Vaultリソースの作成に失敗しました。処理を続行します..." -Level WARNING
}

# ステップ8: データベースリソースの作成
$databaseResources = New-DatabaseResources -ResourceGroupName $ResourceGroupName -Location $Location
if (-not $databaseResources) {
    Write-Log "データベースリソースの作成に失敗しました。処理を続行します..." -Level WARNING
}

# ステップ9: デプロイスクリプトの生成
$deploymentScriptsGenerated = Generate-DeploymentScripts -OutputPath $OutputPath
if (-not $deploymentScriptsGenerated) {
    Write-Log "デプロイスクリプトの生成に失敗しました。処理を続行します..." -Level WARNING
}

# ステップ10: レポート生成
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
Write-Host "  Azureリソース作成 - 完了" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "リソースグループ: $ResourceGroupName" -ForegroundColor Green
Write-Host "環境: $Environment" -ForegroundColor Green
Write-Host ""
Write-Host "レポートファイル: $reportFilePath" -ForegroundColor Green
Write-Host "ログファイル: $logFilePath" -ForegroundColor Green
Write-Host ""
Write-Host "デプロイスクリプト:" -ForegroundColor Yellow
foreach ($script in $results.DeploymentScripts) {
    Write-Host "- $($script.Name): $($script.Description)" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "重要: レポートファイルにはシークレット情報が含まれています。" -ForegroundColor Yellow
Write-Host "安全に保管し、システム開発者に提供してください。" -ForegroundColor Yellow
Write-Host ""
Write-Host "=============================================================" -ForegroundColor Cyan

#endregion
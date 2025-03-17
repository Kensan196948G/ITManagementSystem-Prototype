# 自己署名証明書生成スクリプト
Param(
    [string]$Domain = "localhost",
    [string]$OutputPath = "C:\certs",
    [string]$IPAddress = "",
    [string]$Password = "P@ssw0rd1234"
)

# 出力ディレクトリがなければ作成
if(-not (Test-Path -Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    Write-Host "証明書出力ディレクトリを作成しました: $OutputPath"
}

# 証明書パラメータ設定
$certParams = @{
    DnsName = $Domain
    CertStoreLocation = "cert:\LocalMachine\My"
    KeySpec = "Signature"
    KeyUsage = "DigitalSignature"
    KeyAlgorithm = "RSA"
    KeyLength = 2048
    NotAfter = (Get-Date).AddYears(5)
}

# IPアドレスが指定された場合、SAN（Subject Alternative Name）として追加
if ($IPAddress) {
    $certParams.Add("IPAddress", $IPAddress)
}

# 証明書生成
try {
    Write-Host "自己署名証明書を生成しています..."
    $cert = New-SelfSignedCertificate @certParams
    
    # パスワードのセキュア文字列を作成
    $securePassword = ConvertTo-SecureString -String $Password -Force -AsPlainText

    # PFXファイルとしてエクスポート
    $pfxPath = Join-Path -Path $OutputPath -ChildPath "$Domain.pfx"
    Export-PfxCertificate -Cert "cert:\LocalMachine\My\$($cert.Thumbprint)" -FilePath $pfxPath -Password $securePassword
    
    # 証明書ファイルとしてエクスポート（.cerファイル）
    $cerPath = Join-Path -Path $OutputPath -ChildPath "$Domain.cer"
    Export-Certificate -Cert "cert:\LocalMachine\My\$($cert.Thumbprint)" -FilePath $cerPath
    
    Write-Host "証明書の生成が完了しました"
    Write-Host "PFXファイル（秘密鍵含む）: $pfxPath"
    Write-Host "CERファイル（公開鍵のみ）: $cerPath"
    Write-Host "証明書サムプリント: $($cert.Thumbprint)"
    Write-Host "有効期限: $($cert.NotAfter)"
    Write-Host "パスワード: $Password"
} catch {
    Write-Error "証明書生成中にエラーが発生しました: $_"
    exit 1
}

# IISへの証明書バインディング方法（参考情報）
Write-Host "`n----------- IISバインディング設定例 -----------"
Write-Host "# IISサイトにSSLをバインドする場合は以下のコマンドを実行："
Write-Host "New-WebBinding -Name 'Default Web Site' -Protocol https -Port 443 -IPAddress '*'"
Write-Host "# 次にSSL証明書をバインド:"
Write-Host "(Get-WebBinding -Name 'Default Web Site' -Protocol 'https').AddSslCertificate('$($cert.Thumbprint)', 'My')"
Write-Host "----------------------------------------------"

# 証明書情報を出力
return $cert

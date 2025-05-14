# HTTPS開発環境構築手順
<!-- 元ファイル: HTTPS-Development-Setup.md -->

## 1. 自己署名証明書生成
```powershell
# 証明書生成スクリプト実行
.\scripts\Generate-SelfSignedCertificate.ps1 -Domain "localhost" -ValidityYears 3
```

## 2. 開発環境設定
```javascript
// frontend/.env.development
SSL_CRT_FILE=./certificates/cert.pem
SSL_KEY_FILE=./certificates/key.pem
```

## 3. 開発サーバー起動
```bash
npm run start:secure
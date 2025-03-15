# HTTPS開発環境セットアップガイド

## 背景と問題点

Microsoft認証では、リダイレクトURIの完全一致が要求されます。Azure Portalに設定されているリダイレクトURI `https://localhost:5000/auth/callback` と実際のアプリケーション実行環境を一致させる必要があります。

接続拒否エラー「localhost 接続が拒否されました」が発生する原因は、アプリケーションが通常HTTP（ポート3000）で実行されているのに対し、リダイレクトURIがHTTPS（ポート5000）を指定しているためです。

## 解決方法

この問題を解決するため、以下の手順で開発環境をHTTPSで実行します。

### 1. 自己署名SSL証明書の生成

```bash
cd frontend
npm run generate-cert
```

このコマンドは以下を実行します：
- `certificates` ディレクトリの作成
- node-forgeを使用したSSL証明書（cert.pem）と秘密鍵（key.pem）の生成

**注**: OpenSSLを使用せず、純粋にNode.jsで証明書を生成します。初回実行時に必要な`node-forge`パッケージが自動的にインストールされます。

### 2. HTTPS開発サーバーの起動

```bash
cd frontend
npm run setup-auth
```

このコマンドは、必要に応じて証明書を生成し、HTTPSモードで開発サーバーを起動します。

## 詳細情報

### 環境変数

`.env.development` ファイルに以下の設定があります：

```
HTTPS=true
SSL_CRT_FILE=./certificates/cert.pem
SSL_KEY_FILE=./certificates/key.pem
PORT=5000
```

これにより、開発サーバーが以下の設定で起動します：
- HTTPSプロトコル使用
- ポート5000で起動
- 指定したSSL証明書と秘密鍵を使用

### 注意事項

1. **ブラウザのセキュリティ警告**: 自己署名証明書を使用しているため、ブラウザでセキュリティ警告が表示されます。これは開発環境では問題ありません。「詳細」→「このサイトに進む」を選択してください。

2. **証明書の信頼**: 開発マシンでのみ使用する自己署名証明書であるため、運用環境では使用しないでください。

3. **リダイレクトURI**: リダイレクトURIが `https://localhost:5000/auth/callback` に設定されていることを確認してください。

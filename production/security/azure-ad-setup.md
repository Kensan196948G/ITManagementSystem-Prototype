# Azure AD認証設定ガイド

## 概要
ITマネジメントシステムの本番環境におけるAzure Active Directory (AD) 認証の設定方法について説明します。このガイドでは、Azureポータルでのアプリケーション登録から、必要なAPIアクセス許可の設定、リダイレクトURIの設定まで、認証設定の全工程を解説します。

## 前提条件

- Azure ADのグローバル管理者またはアプリケーション管理者権限
- Azure サブスクリプションへのアクセス権
- ITマネジメントシステムのフロントエンドとバックエンドの構築が完了していること

## 1. アプリケーション登録

### 1.1 Azureポータルでのアプリケーション登録

1. [Azureポータル](https://portal.azure.com)にグローバル管理者またはアプリケーション管理者権限でログインします。
2. 「Azure Active Directory」→「アプリの登録」→「新規登録」を選択します。
3. 以下の情報を入力します：
   - 名前：`IT-Management-System-Prod`
   - サポートされているアカウントの種類：「この組織のディレクトリ内のアカウントのみ」
   - リダイレクトURI：
     - プラットフォーム：Web
     - URL：`https://it-management.mirai-const.co.jp/auth/callback`
4. 「登録」ボタンをクリックします。

### 1.2 ステージング環境用のリダイレクトURIを追加

1. 作成したアプリケーション登録を開きます。
2. 「認証」→「プラットフォームの追加」→「Web」を選択します。
3. リダイレクトURI：`https://staging.it-management.mirai-const.co.jp/auth/callback` を追加します。
4. 「構成」をクリックして保存します。

## 2. APIアクセス許可の設定

### 2.1 Microsoft Graphへのアクセス許可

1. アプリケーション登録の「APIアクセス許可」を選択します。
2. 「アクセス許可の追加」→「Microsoft Graph」を選択します。
3. 以下のアクセス許可を追加します：
   - 委任された権限
     - User.Read（サインインしたユーザーのプロファイル読み取り）
     - User.Read.All（すべてのユーザープロファイルの読み取り）
     - Directory.Read.All（ディレクトリデータの読み取り）
   
### 2.2 Azure Key Vaultへのアクセス許可（必要な場合）

1. 「アクセス許可の追加」→「Azure Key Vault」を選択します。
2. 以下のアクセス許可を追加します：
   - 委任された権限
     - Secret.Read（シークレットの読み取り）

### 2.3 管理者の同意

1. すべての権限が追加されたら、「<テナント名>に管理者の同意を与えます」ボタンをクリックします。
2. 確認ダイアログで「はい」をクリックして、組織全体に権限を付与します。

## 3. クライアントシークレットの作成

1. アプリケーション登録の「証明書とシークレット」を選択します。
2. 「新しいクライアントシークレット」をクリックします。
3. 説明と有効期限を入力します：
   - 説明：`IT-Management-System-Prod Secret`
   - 有効期限：24ヶ月（または組織のポリシーに合わせて設定）
4. 「追加」をクリックします。
5. 生成されたシークレット値を**すぐにコピーして安全に保存します**。このシークレットは二度と表示されません。

## 4. アプリケーションID（クライアントID）の取得

1. アプリケーション登録の「概要」ページを開きます。
2. 「アプリケーション（クライアント）ID」の値をコピーして保存します。
3. 「ディレクトリ（テナント）ID」もコピーして保存します。

## 5. 環境設定ファイルの更新

以下の環境設定ファイルに、取得したクライアントID、テナントID、クライアントシークレットを設定します：

### 5.1 本番環境設定

```bash
cd production/config
nano .env.production
```

以下の値を更新します：
```
REACT_APP_MS_CLIENT_ID=<コピーしたアプリケーションID>
REACT_APP_MS_AUTHORITY=https://login.microsoftonline.com/<コピーしたテナントID>
MS_CLIENT_SECRET=<コピーしたクライアントシークレット>
```

### 5.2 ステージング環境設定

```bash
cd production/config
nano .env.staging
```

同様に値を更新します：
```
REACT_APP_MS_CLIENT_ID=<コピーしたアプリケーションID>
REACT_APP_MS_AUTHORITY=https://login.microsoftonline.com/<コピーしたテナントID>
MS_CLIENT_SECRET=<コピーしたクライアントシークレット>
```

## 6. アプリケーションコードの更新

### 6.1 フロントエンドの認証設定

フロントエンドのソースコードで、MsalProviderの設定が環境変数を使用していることを確認します：

```javascript
// src/auth/MsalConfig.js
export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_MS_CLIENT_ID,
    authority: process.env.REACT_APP_MS_AUTHORITY,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};
```

### 6.2 バックエンドの認証設定

バックエンドのソースコードで、Azure ADの検証設定が環境変数を使用していることを確認します：

```python
# backend/auth/azure_ad.py
from flask import request, jsonify
import requests
import os

def validate_token(token):
    tenant_id = os.environ.get('MS_TENANT_ID')
    client_id = os.environ.get('MS_CLIENT_ID')
    
    # トークン検証ロジック...
```

## 7. 動作テスト手順

### 7.1 ステージング環境でのテスト

1. ステージング環境にデプロイします。
2. ブラウザで `https://staging.it-management.mirai-const.co.jp` にアクセスします。
3. 「ログイン」ボタンをクリックします。
4. Microsoft認証画面にリダイレクトされることを確認します。
5. テストユーザーでログインします。
6. 正常にアプリケーションにリダイレクトされ、ユーザー情報が表示されることを確認します。

### 7.2 本番環境での最終確認

1. 本番環境へのデプロイ後、同様の手順でログインフローを確認します。
2. 複数のユーザーロール（管理者、一般ユーザーなど）でテストします。
3. ログアウト機能も正常に動作することを確認します。

## トラブルシューティング

### よくある問題と解決策

1. **AADSTS50011: リダイレクトURIが登録されていない**
   - 解決策: Azureポータルで登録したリダイレクトURIとアプリケーションで設定したリダイレクトURIが完全に一致していることを確認します。

2. **AADSTS65001: ユーザーが同意していない**
   - 解決策: 管理者の同意を与えるか、初回ログイン時に同意を求めるダイアログでユーザーが同意する必要があります。

3. **AADSTS700016: アプリケーションが見つからない**
   - 解決策: アプリケーションIDが正しいこと、アプリケーションが無効になっていないことを確認します。

4. **トークン検証エラー**
   - 解決策: テナントID、クライアントID、およびクライアントシークレットが正しく設定されていることを確認します。
# Microsoft認証エラーのトラブルシューティング

## エラーメッセージ

以下のようなエラーメッセージが表示される場合があります：

### 1. 無効なアプリケーションID

```
AADSTS700038: 00000000-0000-0000-0000-000000000000 is not a valid application identifier.
```

または

```
AADSTS700016: Application with identifier 'XXXX' was not found in the directory 'XXX'. This can happen if the application has not been installed by the administrator of the tenant...
```

### 2. リダイレクトURL未設定

```
AADSTS500113: No reply address is registered for the application.
```

## 問題の原因

1. **無効なクライアントID**：アプリケーションID（クライアントID）が無効であるか存在しない
   - 一部のコンポーネントで無効なクライアントID `00000000-0000-0000-0000-000000000000` がハードコードされていた
   - 環境変数ファイル (.env) が存在しないか、有効なクライアントIDが設定されていない

2. **テナントID未設定**：アプリケーションにアクセスする権限がない、または正しいテナントが指定されていない
   - 認証リクエストが正しいテナントに送信されていない
   - アプリケーションがテナント内で登録されていない

3. **リダイレクトURL未設定**：Azure ADにアプリケーションのリダイレクトURLが登録されていない
   - リダイレクトURLはアプリケーション登録時に指定する必要がある
   - リダイレクトURLが間違っている、または設定されていない

## 解決方法

### 1. Microsoft Entra IDアプリケーションを登録する

[Azure App Setup Guide](./AzureApp-Setup-Guide.md)を参照して、Microsoft Entra IDにアプリケーションを登録し、クライアントIDを取得してください。

### 2. 環境変数ファイルにクライアントIDと権限URLを設定する

`frontend/.env`ファイルに有効なクライアントIDと権限URLを設定します：

```
REACT_APP_MS_CLIENT_ID=あなたのクライアントID
REACT_APP_MS_AUTHORITY=https://login.microsoftonline.com/あなたのテナントID
```

`あなたのクライアントID`を実際のアプリケーション（クライアント）ID、`あなたのテナントID`を実際のテナントID（Microsoft Entra IDのディレクトリID）に置き換えてください。
例:
```
REACT_APP_MS_CLIENT_ID=22e5d6e4-805f-4516-af09-ff09c7c224c4
REACT_APP_MS_AUTHORITY=https://login.microsoftonline.com/a7232f7a-a9e5-4f71-9372-dc8b1c6645ea
```

### 3. フロントエンドアプリケーションを再起動する

環境変数の変更を反映させるには、フロントエンドアプリケーションを再起動する必要があります：

```
cd frontend
npm run build
npm start
```

## 注意事項

- Reactの環境変数は**ビルド時**に決定されるため、`.env`ファイルを変更した後は必ずアプリケーションを再起動してください。
- クライアントIDは秘密情報ではありませんが、セキュリティのためにバージョン管理システムには含めないでください。
- 本番環境では、CI/CDパイプラインを通じて環境変数を設定することをお勧めします。

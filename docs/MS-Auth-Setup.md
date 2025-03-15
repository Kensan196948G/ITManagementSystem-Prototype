# Microsoft認証設定ガイド

## 問題: リダイレクトURI不一致エラー

エラーメッセージ:
```
AADSTS50011: The redirect URI specified in the request does not match the redirect URIs configured for the application '22e5d6e4-805f-4516-af09-ff09c7c224c4'.
```

このエラーは、アプリケーションが使用しているリダイレクトURIがAzure Portalで設定されたリダイレクトURIと一致していないことを示しています。

## 解決策

### 1. アプリケーション側の設定

アプリケーションは以下のリダイレクトURIを使用しています:
```javascript
redirectUri: 'https://localhost:5000/auth/callback'
```

このリダイレクトURIは、MicrosoftAuth.jsとMicrosoftCallback.jsの両方のファイルで設定されています。

### 2. Azure Portal設定の更新

Azureポータルで、アプリケーションのリダイレクトURIを以下のように更新する必要があります:

1. [Azure Portal](https://portal.azure.com)にサインイン
2. 「Microsoft Entra ID」→「アプリの登録」に移動
3. アプリケーションID `22e5d6e4-805f-4516-af09-ff09c7c224c4` を検索
4. 「認証」タブを選択
5. 「リダイレクトURI」セクションで以下のURIが含まれていることを確認:
   - `https://localhost:5000/auth/callback`（現在のアプリケーション設定）
6. もし存在しない場合は追加し、「保存」をクリック

**重要**: HTTPS開発環境設定ガイド（HTTPS-Development-Setup.md）に従って、HTTPSで開発サーバーを実行してください。これにより、認証リダイレクトが正しく機能します。

### 3. PowerShellによる設定更新（代替手段）

提供されたスクリプト `scripts/UpdateRedirectUris.ps1` を使用して、自動的にリダイレクトURIを追加することもできます。

```powershell
# 管理者権限でPowerShellを開き、実行
cd [プロジェクトの場所]
.\scripts\UpdateRedirectUris.ps1
```

このスクリプトは、アプリケーションに必要なリダイレクトURIを追加します。

## 確認方法

リダイレクトURIが正しく設定されたことを確認するには:

1. Azureポータルで設定を確認する
2. アプリケーションでMicrosoft認証を試してみる

リダイレクトURIが正しく設定されると、認証プロセスがエラーなく完了します。

## トラブルシューティング

リダイレクトURI設定を更新しても問題が解決しない場合:

1. ブラウザのキャッシュをクリアする
2. アプリケーションを再起動する
3. Azureポータルでアプリケーション登録の詳細を確認する
   - クライアントID、テナントIDが正しいか
   - 必要なAPIアクセス許可が設定されているか
4. アプリケーションで使用している環境変数が正しいか確認する

## 補足: 開発環境とプロダクション環境

開発環境とプロダクション環境で異なるリダイレクトURIを使用する場合は、Azure Portalに両方のURIを登録する必要があります。例えば:

開発環境:
- `https://localhost:5000/auth/callback`

プロダクション環境:
- `https://yourdomain.com/auth/callback`

両方をAzure PortalのリダイレクトURI設定に追加してください。

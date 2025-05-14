# Microsoft認証トラブルシューティング
<!-- 元ファイル: MS-Auth-Troubleshooting.md -->

## 1. 主要エラーと対応
### 1.1 AADSTS700016 エラー
```powershell
# アプリ登録存在確認
Get-AzADApplication -ApplicationId <client-id>
```

### 1.2 トークン有効期限切れ
```typescript
// トークン更新処理実装例
const refreshToken = async () => {
  const response = await msalInstance.acquireTokenSilent({
    scopes: ["User.Read"]
  });
  return response.accessToken;
};
```

## 2. ログ解析ガイド
### 2.1 主要ログ項目
| ログ項目 | 説明 | 正常値 |
|---------|------|--------|
| CorrelationId | 処理追跡ID | GUID形式 |
| StatusCode | HTTPステータス | 200-299 |

## 3. エスカレーションフロー
```mermaid
graph TD
    A[エラー発生] --> B{ログ確認}
    B -->|解明| C[対応実施]
    B -->|不明| D[Azureサポート連絡]
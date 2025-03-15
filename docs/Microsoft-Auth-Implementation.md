# Microsoft認証から実際のユーザー情報を取得する方法

## 概要

Microsoft認証を使用すると、Microsoft Entra ID（旧名: Azure AD）に登録されているユーザー情報を取得できます。ユーザーがMicrosoftアカウントでログインした後、その登録情報（本名、メールアドレス、部署、役職など）をアプリケーションに表示できます。

これらの情報は、認証後に発行されるアクセストークンを使用してMicrosoft Graph APIにアクセスすることで取得できます。

## 認証フロー全体

1. ユーザーがMicrosoftログインボタンをクリック
2. Microsoft認証ページにリダイレクト
3. ユーザーがMicrosoftアカウントでログイン
4. 認証コードを受け取り（コールバックURL）
5. 認証コードを使ってアクセストークンを取得
6. アクセストークンを使ってMicrosoft Graph APIからユーザー情報を取得
7. 取得した情報をアプリケーションに保存して表示

## 実装方法

### 1. MSALライブラリの使用

MSALjs（Microsoft Authentication Library for JavaScript）を使うと実装が簡単です：

```javascript
// MSALの設定
const msalConfig = {
  auth: {
    clientId: "アプリID",
    authority: "https://login.microsoftonline.com/テナントID",
    redirectUri: "https://localhost:5000/auth/callback"
  }
};

// MSALインスタンスを作成
const msalInstance = new msal.PublicClientApplication(msalConfig);

// ログイン処理
async function signIn() {
  try {
    // ポップアップまたはリダイレクトでログイン
    const loginResponse = await msalInstance.loginPopup({
      scopes: ["openid", "profile", "User.Read"]
    });
    
    // 認証成功、トークンが取得できる
    const token = loginResponse.accessToken;
    
    // このトークンでユーザー情報を取得
    const userInfo = await getUserInfo(token);
    
    // ユーザー名（フルネーム）がresponse.displayNameで取得できる
    console.log(userInfo.displayName); // 例: "山田 太郎"
  } catch (error) {
    console.error(error);
  }
}

// ユーザー情報取得
async function getUserInfo(accessToken) {
  const response = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  
  return await response.json();
}
```

### 2. Microsoft Graph APIからの主な取得可能情報

Graph APIの `/me` エンドポイントからは以下の情報が取得できます：

- **displayName**: ユーザーのフルネーム（例: "山田 太郎"）
- **givenName**: 名（例: "太郎"）
- **surname**: 姓（例: "山田"）
- **userPrincipalName**: UPN（例: "taro.yamada@contoso.com"）
- **mail**: メールアドレス
- **jobTitle**: 役職
- **department**: 部署
- **officeLocation**: オフィス所在地
- **id**: ユーザーID

### 3. 実際のレスポンス例

```json
{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users/$entity",
  "id": "87654321-1234-5678-abcd-1234567890ab",
  "displayName": "山田 太郎",
  "givenName": "太郎",
  "surname": "山田",
  "userPrincipalName": "taro.yamada@contoso.com",
  "mail": "taro.yamada@contoso.com",
  "jobTitle": "システムエンジニア",
  "department": "ITソリューション部",
  "mobilePhone": null,
  "officeLocation": "東京本社"
}
```

## 本システムへの適用

現在の実装はモックですが、実際の環境では：

1. MicrosoftCallback.jsで認証コードを受け取り後にトークン取得API呼び出し
2. トークンを使ってGraph APIを呼び出しユーザー情報を取得
3. 取得したユーザー情報をAuthContextに渡す
4. Headerコンポーネントが表示

実運用環境では、msal-browser、msal-react、microsoft-graph-clientなどのライブラリを使用することで実装が簡単になります。

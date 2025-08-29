import os
import time
import requests
from typing import Optional

class MicrosoftGraphAPIClient:
    """
    Microsoft Graph APIのClientSecret認証を用いたAPI呼び出しラッパークラス。
    トークンの取得・更新を内部で管理し、API呼び出しを簡素化する。
    """

    TOKEN_URL_TEMPLATE = "https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
    GRAPH_API_BASE_URL = "https://graph.microsoft.com/v1.0"

    def __init__(self,
                 tenant_id: Optional[str] = None,
                 client_id: Optional[str] = None,
                 client_secret: Optional[str] = None,
                 scope: str = "https://graph.microsoft.com/.default"):
        """
        初期化。環境変数から設定を取得可能。
        :param tenant_id: Azure ADテナントID
        :param client_id: Azure ADアプリケーションのクライアントID
        :param client_secret: クライアントシークレット
        :param scope: OAuth2スコープ（デフォルトはGraph APIの.defaultスコープ）
        """
        self.tenant_id = tenant_id or os.getenv("AZURE_TENANT_ID")
        self.client_id = client_id or os.getenv("AZURE_CLIENT_ID")
        self.client_secret = client_secret or os.getenv("AZURE_CLIENT_SECRET")
        self.scope = scope

        if not all([self.tenant_id, self.client_id, self.client_secret]):
            raise ValueError("tenant_id, client_id, client_secretは必須です。環境変数または引数で設定してください。")

        self.token_url = self.TOKEN_URL_TEMPLATE.format(tenant_id=self.tenant_id)
        self.access_token = None
        self.token_expires_at = 0

    def _get_token(self) -> None:
        """
        Client Credentialsフローでアクセストークンを取得し、期限を管理する。
        """
        data = {
            "client_id": self.client_id,
            "scope": self.scope,
            "client_secret": self.client_secret,
            "grant_type": "client_credentials"
        }
        response = requests.post(self.token_url, data=data)
        if response.status_code != 200:
            raise RuntimeError(f"トークン取得失敗: {response.status_code} {response.text}")

        token_response = response.json()
        self.access_token = token_response.get("access_token")
        expires_in = token_response.get("expires_in", 3600)
        self.token_expires_at = time.time() + expires_in - 300  # 5分前に期限切れとみなす

    def _ensure_token(self) -> None:
        """
        トークンが有効か確認し、無効なら再取得する。
        """
        if self.access_token is None or time.time() >= self.token_expires_at:
            self._get_token()

    def call_api(self, endpoint: str, method: str = "GET", params: dict = None, json: dict = None, headers: dict = None) -> dict:
        """
        Microsoft Graph APIを呼び出す。
        :param endpoint: Graph APIのエンドポイント（例: /users）
        :param method: HTTPメソッド（GET, POST, PATCH, DELETEなど）
        :param params: クエリパラメータ
        :param json: JSONボディ
        :param headers: 追加ヘッダー
        :return: APIレスポンスのJSONデコード結果
        """
        self._ensure_token()
        url = self.GRAPH_API_BASE_URL + endpoint
        req_headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        if headers:
            req_headers.update(headers)

        response = requests.request(method, url, headers=req_headers, params=params, json=json)
        if not response.ok:
            raise RuntimeError(f"API呼び出し失敗: {response.status_code} {response.text}")

        if response.status_code == 204:
            return {}  # No Content
        return response.json()

    # 例: ユーザー一覧取得
    def get_users(self) -> dict:
        return self.call_api("/users")

    # 例: グループ一覧取得
    def get_groups(self) -> dict:
        return self.call_api("/groups")

    # 例: 特定ユーザーの情報取得
    def get_user(self, user_id: str) -> dict:
        return self.call_api(f"/users/{user_id}")

    # 例: メール送信
    def send_mail(self, user_id: str, message: dict) -> None:
        self.call_api(f"/users/{user_id}/sendMail", method="POST", json={"message": message})
import unittest
import requests
from time import sleep
import json

BASE_URL = 'http://localhost:5000'

class SecurityTests(unittest.TestCase):
    def test_login(self):
        """ログイン機能テスト"""
        # 正しい認証情報
        response = requests.post(
            f'{BASE_URL}/login',
            json={'username': 'admin', 'password': 'admin'}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('access_token', response.json())

        # 間違った認証情報
        response = requests.post(
            f'{BASE_URL}/login',
            json={'username': 'wrong', 'password': 'wrong'}
        )
        self.assertEqual(response.status_code, 401)

    def test_protected_endpoint(self):
        """保護されたエンドポイントテスト"""
        # トークン取得
        login_res = requests.post(
            f'{BASE_URL}/login',
            json={'username': 'admin', 'password': 'admin'}
        )
        token = login_res.json()['access_token']

        # トークン付きリクエスト
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(
            f'{BASE_URL}/protected',
            headers=headers
        )
        self.assertEqual(response.status_code, 200)

        # トークンなしリクエスト
        response = requests.get(f'{BASE_URL}/protected')
        self.assertEqual(response.status_code, 401)

    def test_rate_limiting(self):
        """レートリミットテスト"""
        # 50回リクエストを送信
        for _ in range(50):
            response = requests.get(f'{BASE_URL}/user')
            self.assertIn(response.status_code, [200, 401, 403])

        # 51回目で制限
        response = requests.get(f'{BASE_URL}/user')
        self.assertEqual(response.status_code, 429)

    def test_role_based_access(self):
        """ロールベースアクセス制御テスト"""
        # トークン取得 (adminユーザー)
        login_res = requests.post(
            f'{BASE_URL}/login',
            json={'username': 'admin', 'password': 'admin'}
        )
        admin_token = login_res.json()['access_token']

        # adminユーザーは保護されたエンドポイントにアクセス可能
        headers = {'Authorization': f'Bearer {admin_token}'}
        response = requests.get(
            f'{BASE_URL}/protected',
            headers=headers
        )
        self.assertEqual(response.status_code, 200)

        # userユーザーは保護されたエンドポイントにアクセス不可
        # (実際にはuserユーザーのログイン実装が必要)
        response = requests.get(
            f'{BASE_URL}/protected',
            headers=headers
        )
        self.assertEqual(response.status_code, 403)
    def test_token_expiration(self):
        """トークン有効期限テスト"""
        # トークン取得
        login_res = requests.post(
            f'{BASE_URL}/login',
            json={'username': 'admin', 'password': 'admin'}
        )
        token = login_res.json()['access_token']

        # トークン有効期限を短く設定 (テスト用)
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.post(
            f'{BASE_URL}/set_token_expiry',
            headers=headers,
            json={'expiry': 1}  # 1秒
        )
        self.assertEqual(response.status_code, 200)

        # トークンが期限切れになるまで待機
        sleep(2)

        # 期限切れトークンでリクエスト
        response = requests.get(
            f'{BASE_URL}/protected',
            headers=headers
        )
        self.assertEqual(response.status_code, 401)

    def test_refresh_token(self):
        """リフレッシュトークン機能テスト"""
        # 初期ログイン
        login_res = requests.post(
            f'{BASE_URL}/login',
            json={'username': 'admin', 'password': 'admin'}
        )
        refresh_token = login_res.json()['refresh_token']

        # リフレッシュトークンを使用して新しいアクセストークンを取得
        response = requests.post(
            f'{BASE_URL}/refresh',
            headers={'Authorization': f'Bearer {refresh_token}'}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('access_token', response.json())

    def test_password_policy(self):
        """パスワードポリシーテスト"""
        # 短すぎるパスワード
        response = requests.post(
            f'{BASE_URL}/register',
            json={'username': 'test', 'password': '123'}
        )
        self.assertEqual(response.status_code, 400)

        # 一般的なパスワード
        response = requests.post(
            f'{BASE_URL}/register',
            json={'username': 'test', 'password': 'password'}
        )
        self.assertEqual(response.status_code, 400)

    def test_logout(self):
        """ログアウト機能テスト"""
        # ログイン
        login_res = requests.post(
            f'{BASE_URL}/login',
            json={'username': 'admin', 'password': 'admin'}
        )
        token = login_res.json()['access_token']

        # ログアウト
        response = requests.post(
            f'{BASE_URL}/logout',
            headers={'Authorization': f'Bearer {token}'}
        )
        self.assertEqual(response.status_code, 200)

        # ログアウト後のトークン使用
        response = requests.get(
            f'{BASE_URL}/protected',
            headers={'Authorization': f'Bearer {token}'}
        )
        self.assertEqual(response.status_code, 401)

if __name__ == '__main__':
    unittest.main()
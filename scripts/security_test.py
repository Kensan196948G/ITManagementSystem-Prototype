import requests
import subprocess
import sys
from urllib.parse import urljoin

BASE_URL = "http://localhost:5000"

def test_dependency_installation():
    """依存関係インストールのテスト"""
    try:
        # requirements.txtに基づいてインストール
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"])
        print("✅ 依存関係インストールテスト成功")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 依存関係インストールテスト失敗: {e}")
        return False

def test_security_headers():
    """セキュリティヘッダーのテスト"""
    try:
        response = requests.get(urljoin(BASE_URL, "/"))
        headers = response.headers
        
        required_headers = {
            'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN',
            'X-XSS-Protection': '1; mode=block',
            'Content-Security-Policy': None  # 内容はチェックしない
        }
        
        missing = []
        for header, expected_value in required_headers.items():
            if header not in headers:
                missing.append(header)
            elif expected_value and headers[header] != expected_value:
                print(f"⚠️ ヘッダー値不一致: {header} (期待: {expected_value}, 実際: {headers[header]})")
        
        if missing:
            print(f"❌ 不足しているセキュリティヘッダー: {', '.join(missing)}")
            return False
        
        print("✅ セキュリティヘッダーテスト成功")
        return True
    except Exception as e:
        print(f"❌ セキュリティヘッダーテスト失敗: {e}")
        return False

def test_api_connectivity():
    """API接続性テストと自律修復"""
    try:
        response = requests.get(f"{BASE_URL}/api/skysea/clients")
        assert response.status_code == 200
        print("✅ API接続正常")
        return True
    except Exception as e:
        print(f"🔴 API接続エラー: {str(e)}")
        subprocess.run(["python", "features/engine.py", "--repair", "api_connection"])
        return False
def test_jwt_authentication():
    """JWT認証のテスト"""
    try:
        # ログイン試行
        login_url = urljoin(BASE_URL, "/auth/login")
        test_credentials = {
            "username": "testuser",
            "password": "testpassword"
        }
        
        # 認証なしで保護されたルートにアクセス
        secured_url = urljoin(BASE_URL, "/security/status")
        response = requests.get(secured_url)
        if response.status_code != 401:
            print(f"❌ JWT認証テスト失敗: 認証なしでアクセス可能 (ステータスコード: {response.status_code})")
            return False
        
        # ログインしてトークンを取得
        login_response = requests.post(login_url, json=test_credentials)
        if login_response.status_code != 200:
            print(f"❌ JWT認証テスト失敗: ログインに失敗 (ステータスコード: {login_response.status_code})")
            return False
        
        token = login_response.json().get('access_token')
        if not token:
            print("❌ JWT認証テスト失敗: トークンがレスポンスに含まれていません")
            return False
        
        # トークン付きで保護されたルートにアクセス
        headers = {'Authorization': f'Bearer {token}'}
        secured_response = requests.get(secured_url, headers=headers)
        if secured_response.status_code != 200:
            print(f"❌ JWT認証テスト失敗: トークン付きでアクセス不可 (ステータスコード: {secured_response.status_code})")
            return False
        
        print("✅ JWT認証テスト成功")
        return True
    except Exception as e:
        print(f"❌ JWT認証テスト失敗: {e}")
        return False

if __name__ == "__main__":
    print("=== セキュリティテスト開始 ===")
    
    results = {
        "依存関係インストール": test_dependency_installation(),
        "セキュリティヘッダー": test_security_headers(),
        "JWT認証": test_jwt_authentication()
    }
    
    print("\n=== テスト結果サマリー ===")
    for test_name, success in results.items():
        status = "✅ 成功" if success else "❌ 失敗"
        print(f"{test_name}: {status}")
    
    if all(results.values()):
        print("\n🔒 すべてのセキュリティテストが成功しました")
    else:
        print("\n⚠️ 一部のセキュリティテストが失敗しました")
        sys.exit(1)
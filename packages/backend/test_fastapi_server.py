"""
FastAPIサーバーのテストスクリプト
"""

import sys
import os
from pathlib import Path

# プロジェクトルートを追加
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from fastapi.testclient import TestClient
from packages.backend.main import app

client = TestClient(app)

def test_health_check():
    """ヘルスチェックエンドポイントのテスト"""
    response = client.get("/health")
    print(f"Health check status: {response.status_code}")
    print(f"Health check response: {response.json()}")
    assert response.status_code == 200

def test_api_docs():
    """API ドキュメントエンドポイントのテスト"""
    response = client.get("/api/docs")
    print(f"API docs status: {response.status_code}")
    assert response.status_code == 200

def test_cors_headers():
    """CORSヘッダーのテスト"""
    response = client.options("/health", headers={
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET"
    })
    print(f"CORS preflight status: {response.status_code}")
    assert response.status_code == 200

if __name__ == "__main__":
    print("Testing FastAPI server...")
    
    try:
        test_health_check()
        print("✓ Health check test passed")
        
        test_api_docs()
        print("✓ API docs test passed")
        
        test_cors_headers()
        print("✓ CORS headers test passed")
        
        print("\n🎉 All basic tests passed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        sys.exit(1)
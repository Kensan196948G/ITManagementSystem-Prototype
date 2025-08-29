"""
テストユーザー作成スクリプト
"""

import sys
import os
from pathlib import Path

# プロジェクトルートを追加
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from packages.backend.database import SessionLocal, init_db
from packages.backend.models.user import User, Role, Permission
from packages.backend.utils.auth import get_password_hash

def create_test_user():
    """テストユーザーを作成"""
    db = SessionLocal()
    
    try:
        # データベース初期化
        init_db()
        
        # 既存のテストユーザーをチェック
        existing_user = db.query(User).filter(User.username == "admin").first()
        if existing_user:
            print("Test user 'admin' already exists.")
            return
        
        # テストユーザー作成
        test_user = User(
            username="admin",
            email="admin@example.com",
            first_name="Admin",
            last_name="User",
            department="IT",
            job_title="System Administrator",
            password_hash=get_password_hash("admin123"),
            is_active=True
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print(f"✓ Test user created successfully:")
        print(f"  Username: admin")
        print(f"  Password: admin123")
        print(f"  Email: admin@example.com")
        print(f"  ID: {test_user.id}")
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
シンプルなデータベース初期化スクリプト
admin/admin123でログインできるようにテストユーザーを作成
"""

from werkzeug.security import generate_password_hash
from database import db, db_session
from models import User
from flask import Flask
from config import Config

def init_database():
    """データベースの初期化とテストユーザーの作成"""
    
    # Flask アプリケーションを作成
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # データベース初期化
    db.init_app(app)
    
    with app.app_context():
        try:
            # テーブル作成
            print("データベーステーブルを作成中...")
            db.create_all()
            print("✅ テーブル作成完了")
            
            # adminユーザーを作成
            print("\nユーザー作成:")
            
            # 既存のadminユーザーを削除
            existing_admin = db_session.query(User).filter_by(username='admin').first()
            if existing_admin:
                db_session.delete(existing_admin)
                db_session.commit()
                print("  既存のadminユーザーを削除しました")
            
            # 新しいadminユーザーを作成
            admin_user = User(
                username='admin',
                email='admin@example.com',
                password_hash=generate_password_hash('admin123'),
                role='administrator',
                is_active=True
            )
            db_session.add(admin_user)
            db_session.commit()
            print("  ✅ adminユーザーを作成しました")
            
            # その他のテストユーザー
            test_users = [
                {
                    'username': 'user',
                    'email': 'user@example.com',
                    'password': 'user123',
                    'role': 'user'
                },
                {
                    'username': 'guest',
                    'email': 'guest@example.com',
                    'password': 'guest123',
                    'role': 'guest'
                }
            ]
            
            for user_data in test_users:
                # 既存ユーザーを削除
                existing_user = db_session.query(User).filter_by(username=user_data['username']).first()
                if existing_user:
                    db_session.delete(existing_user)
                    db_session.commit()
                
                # 新規作成
                user = User(
                    username=user_data['username'],
                    email=user_data['email'],
                    password_hash=generate_password_hash(user_data['password']),
                    role=user_data['role'],
                    is_active=True
                )
                db_session.add(user)
                print(f"  ✅ {user_data['username']}ユーザーを作成しました")
            
            db_session.commit()
            
            print("\n" + "="*50)
            print("✅ データベース初期化完了!")
            print("="*50)
            print("\n利用可能なユーザー:")
            print("  admin / admin123 (管理者)")
            print("  user / user123 (一般ユーザー)")
            print("  guest / guest123 (ゲスト)")
            
        except Exception as e:
            print(f"\n❌ エラーが発生しました: {e}")
            db_session.rollback()
            raise
        finally:
            db_session.close()

if __name__ == '__main__':
    init_database()
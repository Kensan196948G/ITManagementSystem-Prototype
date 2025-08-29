#!/usr/bin/env python3
"""
データベース初期化スクリプト
ISO 20000/27001準拠のITSMシステム用
"""

import sys
import os
from pathlib import Path
from datetime import datetime, timedelta

# プロジェクトルートをPythonパスに追加
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from packages.backend.database import engine, Base, SessionLocal, init_db
from packages.backend.models.incident import (
    Incident, IncidentStatus, IncidentPriority, 
    Comment, Attachment
)
from packages.backend.models.user import User, Role, Permission
from packages.backend.models.problem import Problem, ProblemStatus, ProblemPriority
from packages.backend.models.change import Change, ChangeStatus, ChangePriority
from sqlalchemy.exc import IntegrityError
from packages.backend.utils.auth import get_password_hash

def create_tables():
    """全テーブルを作成"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")

def drop_tables():
    """全テーブルを削除（危険：本番環境では使用しないこと）"""
    print("Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("✓ Tables dropped")

def seed_reference_data():
    """マスターデータの投入"""
    db = SessionLocal()
    
    try:
        # インシデントステータス
        statuses = [
            {"name": "新規", "description": "新規登録されたインシデント"},
            {"name": "対応中", "description": "対応作業中のインシデント"},
            {"name": "保留", "description": "追加情報待ち等で保留中"},
            {"name": "解決済み", "description": "問題が解決したインシデント"},
            {"name": "クローズ", "description": "対応完了"}
        ]
        
        for status_data in statuses:
            status = db.query(IncidentStatus).filter_by(name=status_data["name"]).first()
            if not status:
                status = IncidentStatus(**status_data)
                db.add(status)
        
        # インシデント優先度
        priorities = [
            {"name": "緊急", "description": "即座の対応が必要"},
            {"name": "高", "description": "早急な対応が必要"},
            {"name": "中", "description": "通常対応"},
            {"name": "低", "description": "時間があるときに対応"}
        ]
        
        for priority_data in priorities:
            priority = db.query(IncidentPriority).filter_by(name=priority_data["name"]).first()
            if not priority:
                priority = IncidentPriority(**priority_data)
                db.add(priority)
        
        # 問題ステータス
        problem_statuses = [
            {"name": "新規", "description": "新規登録された問題"},
            {"name": "調査中", "description": "根本原因調査中"},
            {"name": "既知エラー", "description": "原因が判明した問題"},
            {"name": "解決済み", "description": "解決策が実装された問題"},
            {"name": "クローズ", "description": "対応完了"}
        ]
        
        for status_data in problem_statuses:
            status = db.query(ProblemStatus).filter_by(name=status_data["name"]).first()
            if not status:
                status = ProblemStatus(**status_data)
                db.add(status)
        
        # 問題優先度
        for priority_data in priorities:
            priority = db.query(ProblemPriority).filter_by(name=priority_data["name"]).first()
            if not priority:
                priority = ProblemPriority(**priority_data)
                db.add(priority)
        
        # 変更ステータス
        change_statuses = [
            {"name": "申請中", "description": "変更申請中"},
            {"name": "承認待ち", "description": "承認待ち状態"},
            {"name": "承認済み", "description": "変更承認済み"},
            {"name": "実施中", "description": "変更実施中"},
            {"name": "完了", "description": "変更完了"},
            {"name": "却下", "description": "変更却下"},
            {"name": "取消", "description": "変更取消"}
        ]
        
        for status_data in change_statuses:
            status = db.query(ChangeStatus).filter_by(name=status_data["name"]).first()
            if not status:
                status = ChangeStatus(**status_data)
                db.add(status)
        
        # 変更優先度
        for priority_data in priorities:
            priority = db.query(ChangePriority).filter_by(name=priority_data["name"]).first()
            if not priority:
                priority = ChangePriority(**priority_data)
                db.add(priority)
        
        db.commit()
        print("✓ Reference data seeded successfully")
        
    except IntegrityError as e:
        db.rollback()
        print(f"Warning: Some reference data already exists: {e}")
    except Exception as e:
        db.rollback()
        print(f"Error seeding reference data: {e}")
        raise
    finally:
        db.close()

def seed_roles_and_permissions():
    """ロールと権限の初期データ投入"""
    db = SessionLocal()
    
    try:
        # 基本ロール
        roles_data = [
            {
                "name": "admin",
                "description": "システム管理者",
                "is_system_role": True
            },
            {
                "name": "manager",
                "description": "マネージャー",
                "is_system_role": True
            },
            {
                "name": "operator",
                "description": "オペレーター",
                "is_system_role": True
            },
            {
                "name": "user",
                "description": "一般ユーザー",
                "is_system_role": True
            },
            {
                "name": "auditor",
                "description": "監査担当者",
                "is_system_role": True
            }
        ]
        
        for role_data in roles_data:
            role = db.query(Role).filter_by(name=role_data["name"]).first()
            if not role:
                role = Role(**role_data)
                db.add(role)
        
        # 権限
        permissions_data = [
            # ユーザー管理
            {"code": "user:read", "name": "ユーザー閲覧", "description": "ユーザー情報の閲覧"},
            {"code": "user:write", "name": "ユーザー編集", "description": "ユーザー情報の編集"},
            {"code": "user:delete", "name": "ユーザー削除", "description": "ユーザーの削除"},
            # インシデント管理
            {"code": "incident:read", "name": "インシデント閲覧", "description": "インシデントの閲覧"},
            {"code": "incident:write", "name": "インシデント編集", "description": "インシデントの作成・編集"},
            {"code": "incident:delete", "name": "インシデント削除", "description": "インシデントの削除"},
            # 問題管理
            {"code": "problem:read", "name": "問題閲覧", "description": "問題の閲覧"},
            {"code": "problem:write", "name": "問題編集", "description": "問題の作成・編集"},
            {"code": "problem:delete", "name": "問題削除", "description": "問題の削除"},
            # 変更管理
            {"code": "change:read", "name": "変更閲覧", "description": "変更要求の閲覧"},
            {"code": "change:write", "name": "変更編集", "description": "変更要求の作成・編集"},
            {"code": "change:approve", "name": "変更承認", "description": "変更要求の承認"},
            # レポート
            {"code": "report:generate", "name": "レポート生成", "description": "レポートの生成"},
            {"code": "report:export", "name": "レポートエクスポート", "description": "レポートのエクスポート"},
            # 監査
            {"code": "audit:read", "name": "監査ログ閲覧", "description": "監査ログの閲覧"},
            # システム
            {"code": "system:admin", "name": "システム管理", "description": "システム全体の管理"}
        ]
        
        for perm_data in permissions_data:
            permission = db.query(Permission).filter_by(code=perm_data["code"]).first()
            if not permission:
                permission = Permission(**perm_data)
                db.add(permission)
        
        db.commit()
        print("✓ Roles and permissions seeded successfully")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding roles and permissions: {e}")
        raise
    finally:
        db.close()

def create_admin_user():
    """管理者ユーザーを作成"""
    db = SessionLocal()
    
    try:
        # 管理者ユーザーが存在しない場合のみ作成
        admin = db.query(User).filter_by(username="admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@example.com",
                password_hash=get_password_hash("admin123"),
                first_name="System",
                last_name="Administrator",
                is_active=True,
                is_system_user=True
            )
            
            # adminロールを取得
            admin_role = db.query(Role).filter_by(name="admin").first()
            if admin_role:
                admin.roles.append(admin_role)
            
            db.add(admin)
            db.commit()
            print("✓ Admin user created (username: admin, password: admin123)")
        else:
            print("✓ Admin user already exists")
            
    except Exception as e:
        db.rollback()
        print(f"Error creating admin user: {e}")
        raise
    finally:
        db.close()

def seed_sample_data():
    """サンプルデータの投入"""
    db = SessionLocal()
    
    try:
        # サンプルユーザー
        users_data = [
            {
                "username": "john.doe",
                "email": "john.doe@example.com",
                "password_hash": generate_password_hash("password123"),
                "first_name": "John",
                "last_name": "Doe",
                "is_active": True
            },
            {
                "username": "jane.smith",
                "email": "jane.smith@example.com",
                "password_hash": generate_password_hash("password123"),
                "first_name": "Jane",
                "last_name": "Smith",
                "is_active": True
            }
        ]
        
        for user_data in users_data:
            user = db.query(User).filter_by(username=user_data["username"]).first()
            if not user:
                user = User(**user_data)
                # デフォルトでuserロールを割り当て
                user_role = db.query(Role).filter_by(name="user").first()
                if user_role:
                    user.roles.append(user_role)
                db.add(user)
        
        db.commit()
        
        # サンプルインシデント
        admin = db.query(User).filter_by(username="admin").first()
        john = db.query(User).filter_by(username="john.doe").first()
        jane = db.query(User).filter_by(username="jane.smith").first()
        
        if admin and john and jane:
            incidents_data = [
                {
                    "title": "メールサーバー接続エラー",
                    "description": "社内メールサーバーへの接続ができません。複数のユーザーから報告があります。",
                    "status_id": 2,  # 対応中
                    "priority_id": 1,  # 緊急
                    "assignee_id": john.id,
                    "reporter_id": jane.id
                },
                {
                    "title": "印刷ができない問題",
                    "description": "3階のプリンターから印刷ができません。",
                    "status_id": 1,  # 新規
                    "priority_id": 3,  # 中
                    "assignee_id": None,
                    "reporter_id": john.id
                },
                {
                    "title": "パスワードリセット依頼",
                    "description": "ユーザーアカウントのパスワードリセットを依頼します。",
                    "status_id": 4,  # 解決済み
                    "priority_id": 4,  # 低
                    "assignee_id": admin.id,
                    "reporter_id": jane.id
                }
            ]
            
            for incident_data in incidents_data:
                # 既存チェック（タイトルで判定）
                existing = db.query(Incident).filter_by(title=incident_data["title"]).first()
                if not existing:
                    incident = Incident(**incident_data)
                    db.add(incident)
            
            db.commit()
            print("✓ Sample data seeded successfully")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding sample data: {e}")
        raise
    finally:
        db.close()

def main():
    """メイン処理"""
    print("=" * 60)
    print("IT Management System - Database Initialization")
    print("=" * 60)
    
    # 既存のデータベースをリセット（開発環境のみ）
    if os.path.exists("packages/backend/itsm.db"):
        response = input("Database already exists. Drop and recreate? (y/n): ")
        if response.lower() == 'y':
            drop_tables()
    
    # テーブル作成
    create_tables()
    
    # マスターデータ投入
    seed_reference_data()
    
    # ロールと権限
    seed_roles_and_permissions()
    
    # 管理者ユーザー作成
    create_admin_user()
    
    # サンプルデータ投入
    response = input("Seed sample data? (y/n): ")
    if response.lower() == 'y':
        seed_sample_data()
    
    print("=" * 60)
    print("✓ Database initialization completed successfully!")
    print("=" * 60)
    print("\nYou can now login with:")
    print("  Username: admin")
    print("  Password: admin123")
    print("\nDatabase location: packages/backend/itsm.db")

if __name__ == "__main__":
    main()
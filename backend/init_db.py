import sqlite3
from datetime import datetime, timedelta
import json

def init_database():
    # データベース接続
    conn = sqlite3.connect('itms.db')
    c = conn.cursor()

    # ユーザーテーブル作成
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            mfa_enabled BOOLEAN DEFAULT FALSE,
            mfa_method TEXT,
            phone_number TEXT,
            backup_codes TEXT,
            last_login TEXT,
            failed_login_attempts INTEGER DEFAULT 0,
            account_locked_until TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # ロールテーブル作成
    c.execute('''
        CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            is_system_role BOOLEAN DEFAULT FALSE
        )
    ''')

    # 権限テーブル作成
    c.execute('''
        CREATE TABLE IF NOT EXISTS permissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            description TEXT
        )
    ''')

    # ユーザーロール関連テーブル
    c.execute('''
        CREATE TABLE IF NOT EXISTS user_roles (
            user_id INTEGER NOT NULL,
            role_id INTEGER NOT NULL,
            PRIMARY KEY (user_id, role_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (role_id) REFERENCES roles(id)
        )
    ''')

    # ロール権限関連テーブル
    c.execute('''
        CREATE TABLE IF NOT EXISTS role_permissions (
            role_id INTEGER NOT NULL,
            permission_id INTEGER NOT NULL,
            PRIMARY KEY (role_id, permission_id),
            FOREIGN KEY (role_id) REFERENCES roles(id),
            FOREIGN KEY (permission_id) REFERENCES permissions(id)
        )
    ''')

    # skysea_clientsテーブル作成
    c.execute('''
        CREATE TABLE IF NOT EXISTS skysea_clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_name TEXT NOT NULL,
            ip_address TEXT NOT NULL,
            last_updated TEXT NOT NULL,
            status TEXT NOT NULL
        )
    ''')

    # skysea_violationsテーブル作成
    c.execute('''
        CREATE TABLE IF NOT EXISTS skysea_violations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER,
            type TEXT NOT NULL,
            description TEXT,
            detected_at TEXT NOT NULL,
            status TEXT NOT NULL,
            FOREIGN KEY(client_id) REFERENCES skysea_clients(id)
        )
    ''')

    # audit_logsテーブル作成
    c.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            log_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            operation_type TEXT NOT NULL,
            target_system TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            status TEXT NOT NULL,
            status_code INTEGER,
            command TEXT,
            host TEXT,
            privilege TEXT
        )
    ''')

    # テストデータ挿入
    now = datetime.now().isoformat()
    yesterday = (datetime.now() - timedelta(days=1)).isoformat()

    # skysea_clientsテストデータ
    c.executemany('''
        INSERT INTO skysea_clients (client_name, ip_address, last_updated, status)
        VALUES (?, ?, ?, ?)
    ''', [
        ('Client-001', '192.168.1.10', now, 'active'),
        ('Client-002', '192.168.1.11', yesterday, 'active'),
        ('Client-003', '192.168.1.12', now, 'inactive')
    ])

    # skysea_violationsテストデータ
    c.executemany('''
        INSERT INTO skysea_violations (client_id, type, description, detected_at, status)
        VALUES (?, ?, ?, ?, ?)
    ''', [
        (1, 'malware', 'Malware detected', now, 'open'),
        (1, 'policy', 'Policy violation', yesterday, 'closed'),
        (2, 'unauthorized', 'Unauthorized access', now, 'open')
    ])

    # 基本ロールと権限の初期データ
    c.executemany('''
        INSERT OR IGNORE INTO roles (name, description, is_system_role)
        VALUES (?, ?, ?)
    ''', [
        ('admin', 'システム管理者', 1),
        ('user', '一般ユーザー', 1),
        ('auditor', '監査担当者', 1)
    ])

    c.executemany('''
        INSERT OR IGNORE INTO permissions (code, name, description)
        VALUES (?, ?, ?)
    ''', [
        ('user:read', 'ユーザー閲覧', 'ユーザー情報の閲覧権限'),
        ('user:write', 'ユーザー編集', 'ユーザー情報の編集権限'),
        ('report:generate', 'レポート生成', 'レポート生成権限')
    ])

    # 管理者ユーザーの作成
    c.execute('''
        INSERT OR IGNORE INTO users (username, email, password_hash, first_name, last_name, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        'admin',
        'admin@example.com',
        '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',  # password=secret
        'Admin',
        'User',
        1
    ))

    # 管理者にadminロールを割り当て
    c.execute('''
        INSERT OR IGNORE INTO user_roles (user_id, role_id)
        SELECT u.id, r.id FROM users u, roles r
        WHERE u.username = 'admin' AND r.name = 'admin'
    ''')

    # 管理者ロールに全権限を割り当て
    c.execute('''
        INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.name = 'admin'
    ''')

    # audit_logsテストデータ
    c.executemany('''
        INSERT INTO audit_logs (user_id, operation_type, target_system, timestamp, status, status_code, command, host, privilege)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', [
        ('user1', 'login', 'system', now, 'success', 200, 'ssh login', 'server1', 'admin'),
        ('user2', 'file_access', 'fileserver', yesterday, 'failed', 403, 'file read', 'fileserver1', 'user')
    ])

    # 変更をコミット
    conn.commit()
    conn.close()

    print("データベース初期化が完了しました")

if __name__ == '__main__':
    init_database()

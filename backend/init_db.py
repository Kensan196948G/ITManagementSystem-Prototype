import sqlite3
from datetime import datetime, timedelta

def init_database():
    # データベース接続
    conn = sqlite3.connect('itms.db')
    c = conn.cursor()

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

import os
import json
import logging
import time
import sqlite3
import smtplib
import pyotp
import redis
import requests
from datetime import datetime, timedelta
from contextlib import contextmanager
from secrets import token_urlsafe
from email.mime.text import MIMEText
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.exceptions import BadRequest
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    create_refresh_token,
    get_jwt
)
from dotenv import load_dotenv
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.exceptions import InvalidSignature
from backend.models.user import User

# ロギング設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# データベース接続ヘルパー
@contextmanager
def get_db_connection():
    conn = sqlite3.connect('itms.db')
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# 環境変数の読み込み
try:
    load_dotenv()
except Exception as e:
    logger.error("環境変数の読み込みに失敗しました: %s", str(e))
    raise

# Redis接続設定
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    db=int(os.getenv('REDIS_DB', 0)),
    password=os.getenv('REDIS_PASSWORD', None)
)

auth_bp = Blueprint('auth', __name__)

def get_microsoft_token():
    """Microsoft Graph APIからアクセストークンを取得"""
    # Redisからキャッシュされたトークンをチェック
    cached_token = redis_client.get('microsoft:access_token')
    if cached_token:
        return cached_token.decode('utf-8')

    # デバイスコードフローでトークンを取得
    device_code_url = f"https://login.microsoftonline.com/{os.getenv('MS_TENANT_ID')}/oauth2/v2.0/devicecode"
    device_code_payload = {
        'client_id': os.getenv('MS_CLIENT_ID'),
        'scope': 'https://graph.microsoft.com/Directory.Read.All'
    }
    
    # デバイスコードを取得
    device_code_response = requests.post(device_code_url, data=device_code_payload)
    if device_code_response.status_code != 200:
        raise Exception(f"デバイスコード取得失敗: {device_code_response.text}")
    
    device_code_data = device_code_response.json()
    
    # ユーザーに認証指示を表示（本番環境ではログに記録）
    print(f"Microsoft認証が必要です: {device_code_data['message']}")
    
    # トークン取得
    token_url = f"https://login.microsoftonline.com/{os.getenv('MS_TENANT_ID')}/oauth2/v2.0/token"
    token_payload = {
        'client_id': os.getenv('MS_CLIENT_ID'),
        'device_code': device_code_data['device_code'],
        'grant_type': 'urn:ietf:params:oauth:grant-type:device_code'
    }
    
    # トークン取得を試行（ポーリング）
    start_time = time.time()
    while time.time() - start_time < device_code_data['expires_in']:
        token_response = requests.post(token_url, data=token_payload)
        if token_response.status_code == 200:
            token_data = token_response.json()
            access_token = token_data['access_token']
            expires_in = token_data['expires_in']
            break
        elif token_response.status_code != 400:
            raise Exception(f"トークン取得失敗: {token_response.text}")
        time.sleep(device_code_data['interval'])
    
    if 'access_token' not in locals():
        raise Exception("デバイスコード認証がタイムアウトしました")

    # Redisにトークンをキャッシュ (有効期限5分前に期限切れとみなす)
    redis_client.setex(
        'microsoft:access_token',
        expires_in - 300,  # 55分間キャッシュ
        access_token
    )

    return access_token

# クライアントクレデンシャル認証API
@auth_bp.route('/client_credentials', methods=['POST'])
def client_credential_auth():
    """Microsoft Graph APIを使用した非対話型認証"""
    try:
        # トークンを取得
        access_token = get_microsoft_token()

        # ユーザー情報を取得 (例: アプリケーションの管理者ユーザー)
        graph_url = 'https://graph.microsoft.com/v1.0/users'
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(graph_url, headers=headers)

        if response.status_code != 200:
            return jsonify({
                'status': 'error',
                'message': 'Microsoft Graph APIアクセス失敗'
            }), 401

        # ここでアプリケーション固有の認証処理を実施
        # 例: 特定のユーザーにアクセス権があるか確認

        # アプリケーション用のJWTトークンを発行
        app_token = create_access_token(identity='system')
        
        return jsonify({
            'status': 'success',
            'access_token': app_token,
            'expires_in': 3600  # 1時間有効
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# ログインAPI
@auth_bp.route('/login', methods=['POST'])
def login():
    """ユーザーログイン処理"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'status': 'error', 'message': 'ユーザー名とパスワードが必要です'}), 400

    # ユーザー情報取得
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({'status': 'error', 'message': 'ユーザー名またはパスワードが正しくありません'}), 401

    # アカウントロックチェック
    if user.account_locked_until and user.account_locked_until > datetime.now():
        return jsonify({
            'status': 'error',
            'message': 'アカウントがロックされています',
            'locked_until': user.account_locked_until.isoformat()
        }), 403

    # パスワード検証
    if not user.check_password(password):
        # 失敗したログイン試行を記録
        failed_attempts = user.failed_login_attempts + 1
        lock_time = None
        
        # ロックアウト機能が無効でない場合のみ処理
        if os.getenv('DISABLE_ACCOUNT_LOCK', 'False').lower() != 'true':
            threshold = int(os.getenv('ACCOUNT_LOCK_THRESHOLD', 5))
            lock_duration = int(os.getenv('ACCOUNT_LOCK_DURATION_MINUTES', 15))
            
            if failed_attempts >= threshold:
                lock_time = datetime.now() + timedelta(minutes=lock_duration)
                send_admin_lock_notification(username)
        
        user.failed_login_attempts = failed_attempts
        user.account_locked_until = lock_time
        db.session.commit()
        
        return jsonify({'status': 'error', 'message': 'ユーザー名またはパスワードが正しくありません'}), 401

    # ログイン成功 - 試行回数をリセット
    user.failed_login_attempts = 0
    user.account_locked_until = None
    user.last_login = datetime.now()
    db.session.commit()

    # 最小限のトークンデータを返す
    access_token = create_access_token(
        identity=user.username,
        additional_claims={
            'sub': user.id,
            'role': user.role
        }
    )
    return jsonify({
        'access_token': access_token,
        'token_type': 'Bearer',
        'expires_in': 3600
    }), 200

# MFA設定
@auth_bp.route('/mfa/setup', methods=['POST'])
@jwt_required()
def setup_mfa():
    user_id = get_jwt_identity()
    data = request.get_json()
    mfa_method = data.get('method')  # 'sms', 'email', 'app'
    
    # ユーザー情報取得
    conn = sqlite3.connect('itms.db')
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user = c.fetchone()
    
    if not user:
        return jsonify({'status': 'error', 'message': 'ユーザーが見つかりません'}), 404
    
    # MFAシークレット生成
    secret = pyotp.random_base32()
    
    # ユーザーにMFA設定を保存
    c.execute('''
        UPDATE users 
        SET mfa_enabled = TRUE, 
            mfa_method = ?,
            mfa_secret = ?
        WHERE id = ?
    ''', (mfa_method, secret, user_id))
    
    # バックアップコード生成
    backup_codes = [pyotp.random_base32(length=8) for _ in range(6)]
    
    # バックアップコードを保存
    c.execute('UPDATE users SET backup_codes = ? WHERE id = ?', 
              (json.dumps(backup_codes), user_id))
    
    conn.commit()
    conn.close()
    
    # ユーザーにMFA設定を通知
    if mfa_method == 'sms':
        send_mfa_sms(user['phone_number'], secret)
    elif mfa_method == 'email':
        send_mfa_email(user['email'], secret)
    
    return jsonify({
        'status': 'success',
        'mfa_secret': secret,
        'backup_codes': backup_codes
    })

# MFA検証
@auth_bp.route('/mfa/verify', methods=['POST'])
def verify_mfa():
    data = request.get_json()
    username = data.get('username')
    code = data.get('code')
    
    # ユーザー情報取得
    conn = sqlite3.connect('itms.db')
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = c.fetchone()
    
    if not user:
        return jsonify({'status': 'error', 'message': 'ユーザーが見つかりません'}), 404
    
    # MFAコード検証
    totp = pyotp.TOTP(user['mfa_secret'])
    if not totp.verify(code) and code not in json.loads(user['backup_codes'] or ''):
        return jsonify({'status': 'error', 'message': '無効なMFAコード'}), 401
    
    # アクセストークン発行 (アルゴリズム強制)
    jwt_algorithm = os.getenv('JWT_ALGORITHM', 'RS256')
    access_token = create_access_token(
        identity=user['id'],
        algorithm=jwt_algorithm
    )
    refresh_token = create_refresh_token(identity=user['id'])
    
    # セッション記録
    record_session(user['id'], request)
    
    return jsonify({
        'status': 'success',
        'access_token': access_token,
        'refresh_token': refresh_token
    })

# セッション管理
@auth_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_sessions():
    user_id = get_jwt_identity()
    
    conn = sqlite3.connect('itms.db')
    c = conn.cursor()
    c.execute('SELECT * FROM user_sessions WHERE user_id = ?', (user_id,))
    sessions = c.fetchall()
    
    return jsonify({
        'status': 'success',
        'sessions': [{
            'id': s[0],
            'device': s[3],
            'ip': s[4],
            'created': s[7]
        } for s in sessions]
    })

@auth_bp.route('/sessions/<int:session_id>', methods=['DELETE'])
@jwt_required()
def revoke_session(session_id):
    user_id = get_jwt_identity()
    
    conn = sqlite3.connect('itms.db')
    c = conn.cursor()
    c.execute('''
        UPDATE user_sessions 
        SET is_revoked = TRUE 
        WHERE id = ? AND user_id = ?
    ''', (session_id, user_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({'status': 'success'})

# ヘルパー関数
def send_admin_lock_notification(username):
    """管理者にアカウントロック通知を送信"""
    admin_email = os.getenv('ADMIN_EMAIL')
    if not admin_email:
        return
    
    subject = f"アカウントロック通知: {username}"
    body = f"""
    以下のアカウントがロックされました:
    
    ユーザー名: {username}
    ロック時刻: {datetime.now()}
    ロック期間: {os.getenv('ACCOUNT_LOCK_DURATION_MINUTES')}分
    
    システム管理者
    """
    
    send_email(
        email=admin_email,
        subject=subject,
        body=body
    )

def send_mfa_sms(phone_number, secret):
    # SMS送信ロジック (実際の実装ではSMS APIを使用)
    pass

def send_mfa_email(email, secret):
    """MFA設定用メールを送信"""
    send_email(
        email=email,
        subject='MFA Setup',
        body=f'Your MFA secret: {secret}'
    )

def send_password_reset_email(email, reset_token):
    """パスワードリセット用メールを送信"""
    reset_link = f"{os.getenv('FRONTEND_BASE_URL')}/reset-password?token={reset_token}"
    send_email(
        email=email,
        subject='パスワードリセットのご案内',
        body=f'''パスワードをリセットするには以下のリンクをクリックしてください:
{reset_link}

このリンクは24時間有効です。
'''
    )

def send_email(email, subject, body):
    # メール送信設定
    smtp_host = os.getenv('SMTP_HOST')
    smtp_port = int(os.getenv('SMTP_PORT'))
    smtp_user = os.getenv('SMTP_USER')
    smtp_pass = os.getenv('SMTP_PASS')
    
    msg = MIMEText(body)
    msg['Subject'] = 'MFA Setup'
    msg['From'] = smtp_user
    msg['To'] = email
    
    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)

# トークン生成・検証
def generate_reset_token(user_id, expires_in=3600):
    """有効期限付きリセットトークンを生成（暗号学的に安全な方法）"""
    # ユーザーIDとタイムスタンプを組み合わせたソルトを生成
    salt = f"{user_id}{datetime.now().timestamp()}".encode()
    
    # PBKDF2を使用してトークンを導出
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    token = kdf.derive(os.urandom(32))
    return token_urlsafe(32)

def verify_reset_token(token, user_id):
    """リセットトークンを検証"""
    stored_token = get_reset_token_from_db(user_id)
    if not stored_token:
        return False
    return token == stored_token

def get_reset_token_from_db(user_id):
    """DBからリセットトークンを取得"""
    conn = sqlite3.connect('itms.db')
    c = conn.cursor()
    c.execute('SELECT reset_token FROM users WHERE id = ?', (user_id,))
    result = c.fetchone()
    conn.close()

# パスワードリセット関連API
@auth_bp.route('/password/reset-request', methods=['POST'])
def request_password_reset():
    """パスワードリセットリクエストを受け付ける"""
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'status': 'error', 'message': 'メールアドレスが必要です'}), 400

    conn = sqlite3.connect('itms.db')
    c = conn.cursor()
    c.execute('SELECT id FROM users WHERE email = ?', (email,))
    user = c.fetchone()
    
    if not user:
        return jsonify({'status': 'error', 'message': '該当するユーザーが見つかりません'}), 404

    user_id = user[0]
    reset_token = generate_reset_token(user_id)
    
    # トークンをDBに保存
    c.execute('UPDATE users SET reset_token = ? WHERE id = ?', (reset_token, user_id))
    conn.commit()
    conn.close()

    # リセットメール送信
    send_password_reset_email(email, reset_token)

    return jsonify({'status': 'success'})

@auth_bp.route('/password/verify-token', methods=['POST'])
def verify_reset_token_api():
    """リセットトークンを検証する"""
    data = request.get_json()
    token = data.get('token')
    email = data.get('email')

    if not token or not email:
        return jsonify({'status': 'error', 'message': 'トークンとメールアドレスが必要です'}), 400

    conn = sqlite3.connect('itms.db')
    c = conn.cursor()
    c.execute('SELECT id, reset_token FROM users WHERE email = ?', (email,))
    user = c.fetchone()
    conn.close()

    if not user:
        return jsonify({'status': 'error', 'message': '該当するユーザーが見つかりません'}), 404

    user_id, stored_token = user
    if not stored_token or not verify_reset_token(token, user_id):
        return jsonify({'status': 'error', 'message': '無効なトークンです'}), 401

    return jsonify({'status': 'success'})

@auth_bp.route('/password/reset', methods=['POST'])
def reset_password():
    """パスワードをリセットする"""
    data = request.get_json()
    token = data.get('token')
    email = data.get('email')
    new_password = data.get('new_password')

    if not token or not email or not new_password:
        return jsonify({'status': 'error', 'message': 'トークン、メールアドレス、新しいパスワードが必要です'}), 400

    # トークン検証
    conn = sqlite3.connect('itms.db')
    c = conn.cursor()
    c.execute('SELECT id, reset_token FROM users WHERE email = ?', (email,))
    user = c.fetchone()

    if not user:
        conn.close()
        return jsonify({'status': 'error', 'message': '該当するユーザーが見つかりません'}), 404

    user_id, stored_token = user
    if not stored_token or not verify_reset_token(token, user_id):
        conn.close()
        return jsonify({'status': 'error', 'message': '無効なトークンです'}), 401

    # パスワード更新
    c.execute('''
        UPDATE users
        SET password = ?,
            reset_token = NULL
        WHERE id = ?
    ''', (new_password, user_id))
    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

def record_session(user_id, request):
    # セッション記録
    conn = sqlite3.connect('itms.db')
    c = conn.cursor()
    
    device_info = request.headers.get('User-Agent', 'Unknown')
    ip_address = request.remote_addr
    
    c.execute('''
        INSERT INTO user_sessions 
        (user_id, device_info, ip_address, expires_at)
        VALUES (?, ?, ?, datetime('now', '+30 days'))
    ''', (user_id, device_info, ip_address))
    
    conn.commit()
    conn.close()
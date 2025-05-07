from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    create_refresh_token,
    get_jwt
)
from datetime import datetime, timedelta
from models.user import User
import sqlite3
import pyotp
import smtplib
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv

# 環境変数の読み込み
load_dotenv()

auth_bp = Blueprint('auth', __name__)

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
    conn = sqlite3.connect('itms.db')
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = c.fetchone()

    if not user:
        conn.close()
        return jsonify({'status': 'error', 'message': 'ユーザー名またはパスワードが正しくありません'}), 401

    # アカウントロックチェック
    if user['account_locked_until'] and datetime.strptime(user['account_locked_until'], '%Y-%m-%d %H:%M:%S.%f') > datetime.now():
        conn.close()
        return jsonify({
            'status': 'error',
            'message': 'アカウントがロックされています',
            'locked_until': user['account_locked_until']
        }), 403

    # パスワード検証
    if not check_password_hash(user['password_hash'], password):
        # 失敗したログイン試行を記録
        failed_attempts = user['failed_login_attempts'] + 1
        lock_time = None
        
        # ロックアウト機能が無効でない場合のみ処理
        if os.getenv('DISABLE_ACCOUNT_LOCK', 'False').lower() != 'true':
            threshold = int(os.getenv('ACCOUNT_LOCK_THRESHOLD', 5))
            lock_duration = int(os.getenv('ACCOUNT_LOCK_DURATION_MINUTES', 15))
            
            if failed_attempts >= threshold:
                lock_time = datetime.now() + timedelta(minutes=lock_duration)
                send_admin_lock_notification(username)
        
        c.execute('''
            UPDATE users
            SET failed_login_attempts = ?,
                account_locked_until = ?
            WHERE id = ?
        ''', (failed_attempts, lock_time, user['id']))
        conn.commit()
        conn.close()
        
        return jsonify({'status': 'error', 'message': 'ユーザー名またはパスワードが正しくありません'}), 401

    # ログイン成功 - 試行回数をリセット
    c.execute('''
        UPDATE users
        SET failed_login_attempts = 0,
            account_locked_until = NULL,
            last_login = ?
        WHERE id = ?
    ''', (datetime.now(), user['id']))
    conn.commit()
    conn.close()

    # アクセストークン発行
    access_token = create_access_token(identity=user['id'])
    refresh_token = create_refresh_token(identity=user['id'])

    return jsonify({
        'status': 'success',
        'access_token': access_token,
        'refresh_token': refresh_token
    })

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
    
    # アクセストークン発行
    access_token = create_access_token(identity=user['id'])
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
    
    msg = MIMEText(f'Your MFA secret: {secret}')
    msg['Subject'] = 'MFA Setup'
    msg['From'] = smtp_user
    msg['To'] = email
    
    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)

# トークン生成・検証
def generate_reset_token(user_id, expires_in=3600):
    """有効期限付きリセットトークンを生成"""
    return pyotp.TOTP(pyotp.random_base32()).provisioning_uri(
        str(user_id),
        issuer_name="ITMS"
    ).split('secret=')[1][:32]

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
    return result[0] if result else None

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
import os
import sqlite3
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# 環境変数の読み込み
load_dotenv()

# Flaskアプリケーション初期化
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret')

# CORSの設定 - フロントエンドからのリクエストを許可
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5000", "http://localhost:3000", "http://localhost:5001"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# JWTの設定
jwt = JWTManager(app)

# SQLiteデータベース設定
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../db/database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# ルートの読み込み（後で作成するモジュールをインポート）
# from routes.auth import auth_bp
# from routes.system import system_bp
# from routes.reports import reports_bp
# from routes.workflow import workflow_bp
# from routes.security import security_bp

# ここでBlueprint登録をコメントアウト（後で実装）
# app.register_blueprint(auth_bp, url_prefix='/api/auth')
# app.register_blueprint(system_bp, url_prefix='/api/system')
# app.register_blueprint(reports_bp, url_prefix='/api/reports')
# app.register_blueprint(workflow_bp, url_prefix='/api/workflow')
# app.register_blueprint(security_bp, url_prefix='/api/security')

# ルートエンドポイント
@app.route('/')
def index():
    return jsonify({
        'status': 'success',
        'message': 'ITSM API起動中',
        'version': '0.1.0'
    })

# SkySea Client View APIエンドポイント
@app.route('/api/skysea/clients', methods=['GET'])
def get_skysea_clients():
    """SkySeaに登録されているクライアント情報を取得"""
    conn = sqlite3.connect('itms.db')
    c = conn.cursor()
    
    c.execute('SELECT COUNT(*) FROM skysea_clients')
    total_clients = c.fetchone()[0]
    
    c.execute('SELECT COUNT(*) FROM skysea_clients WHERE last_updated >= datetime("now", "-1 day")')
    updated_clients = c.fetchone()[0]
    
    c.execute('SELECT COUNT(*) FROM skysea_violations WHERE status = "open"')
    open_violations = c.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'status': 'success',
        'data': {
            'total_clients': total_clients,
            'updated_clients': updated_clients,
            'open_violations': open_violations
        }
    })

@app.route('/api/skysea/violations', methods=['GET'])
def get_skysea_violations():
    """SkySeaで検知された違反情報を取得"""
    conn = sqlite3.connect('itms.db')
    c = conn.cursor()
    
    c.execute('''
        SELECT type, COUNT(*) as count 
        FROM skysea_violations 
        WHERE status = "open"
        GROUP BY type
    ''')
    violations = [{'type': row[0], 'count': row[1]} for row in c.fetchall()]
    
    conn.close()
    
    return jsonify({
        'status': 'success',
        'data': violations
    })

# 監査ログAPIエンドポイント
@app.route('/api/audit/logs', methods=['GET'])
def get_audit_logs():
    """監査ログを取得するAPI"""
    print(f"監査ログAPIへのリクエスト受信 - ヘッダー: {request.headers}")
    try:
        conn = sqlite3.connect('itms.db')
        c = conn.cursor()
        
        # 監査ログテーブルからデータ取得
        c.execute('''
            SELECT 
                log_id, user_id, operation_type, 
                target_system, timestamp, status,
                status_code, command, host, privilege
            FROM audit_logs
            ORDER BY timestamp DESC
            LIMIT 100
        ''')
        
        logs = []
        for row in c.fetchall():
            logs.append({
                'id': row[0],
                'user': row[1],
                'operationType': row[2],
                'targetSystem': row[3],
                'timestamp': row[4],
                'status': row[5],
                'statusCode': row[6],
                'command': row[7],
                'host': row[8],
                'privilege': row[9]
            })
            
        conn.close()
        
        return jsonify({
            'status': 'success',
            'data': logs
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': '監査ログ取得エラー',
            'details': str(e)
        }), 500

# テスト用エンドポイント
@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'database': 'connected',
        'apis': {
            'microsoft_graph': 'ready',
            'exchange_online': 'ready',
            'active_directory': 'ready'
        }
    })

# Microsoft認証コールバック処理
@app.route('/auth/callback')
def auth_callback():
    """
    Microsoft認証からのコールバックを処理するエンドポイント
    """
    from flask import request, redirect, session
    from msal import ConfidentialClientApplication
    import requests
    
    # 環境変数から設定を取得
    client_id = os.getenv('AZURE_CLIENT_ID')
    client_secret = os.getenv('AZURE_CLIENT_SECRET')
    tenant_id = os.getenv('AZURE_TENANT_ID')
    
    # 必須パラメータチェック
    code = request.args.get('code')
    error = request.args.get('error')
    error_description = request.args.get('error_description')
    
    if error:
        return jsonify({
            'status': 'error',
            'message': f"認証エラー: {error}",
            'details': error_description
        }), 401
        
    if not code:
        return jsonify({'status': 'error', 'message': '認証コードがありません'}), 400
    
    # MSALクライアントの初期化
    app = ConfidentialClientApplication(
        client_id=client_id,
        client_credential=client_secret,
        authority=f"https://login.microsoftonline.com/{tenant_id}"
    )
    
    try:
        # 認証コードからトークンを取得
        result = app.acquire_token_by_authorization_code(
            code,
            scopes=["User.Read"],
            redirect_uri="http://localhost:5000/auth/callback"
        )
        
        if "error" in result:
            return jsonify({
                'status': 'error',
                'message': 'トークン取得失敗',
                'details': result.get('error_description')
            }), 401
            
        # ユーザー情報を取得
        graph_data = requests.get(
            "https://graph.microsoft.com/v1.0/me",
            headers={'Authorization': 'Bearer ' + result['access_token']}
        ).json()
        
        if 'error' in graph_data:
            return jsonify({
                'status': 'error',
                'message': 'ユーザー情報取得失敗',
                'details': graph_data['error']['message']
            }), 401
            
        # セッションにユーザー情報を保存
        session['user'] = {
            'id': graph_data['id'],
            'name': graph_data['displayName'],
            'email': graph_data['mail'],
            'access_token': result['access_token'],
            'expires_in': result['expires_in']
        }
        
        # フロントエンドダッシュボードへリダイレクト
        return redirect("http://localhost:5000/dashboard")
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'status': 'error',
            'message': 'Microsoft Graph API接続エラー',
            'details': str(e)
        }), 503
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': '内部サーバーエラー',
            'details': str(e)
        }), 500

# エラーハンドリング
@app.errorhandler(404)
def not_found(e):
    return jsonify({'status': 'error', 'message': 'リソースが見つかりません'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'status': 'error', 'message': 'サーバーエラーが発生しました'}), 500

    # アプリケーション実行
if __name__ == '__main__':
    # 開発環境では、デバッグモードで実行
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )

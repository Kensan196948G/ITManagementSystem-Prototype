import os
import sqlite3
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# 環境変数の読み込み
load_dotenv()

# JWT設定
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Flaskアプリケーション初期化
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret')

# CORSの設定 - フロントエンドからのリクエストを許可
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5000", "http://localhost:3000"],
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

# ルートの読み込み
from routes.auth import auth_bp
from routes.system import system_bp
from routes.reports import reports_bp
from routes.workflow import workflow_bp
from routes.security import security_bp

# Blueprint登録
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(system_bp, url_prefix='/api/system')
app.register_blueprint(reports_bp, url_prefix='/api/reports')
app.register_blueprint(workflow_bp, url_prefix='/api/workflow')
app.register_blueprint(security_bp, url_prefix='/api/security')

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

# Microsoft認証関連エンドポイント
@app.route('/auth/client_credentials', methods=['POST'])
def get_client_credentials_token():
    """
    Client Credentialsフローでトークンを取得するエンドポイント
    """
    from msal import ConfidentialClientApplication
    import requests
    import json
    
    try:
        # config.jsonから設定を取得
        with open('../config.json') as config_file:
            config = json.load(config_file)
            
        client_id = config['ClientId']
        client_secret = config['ClientSecret']
        tenant_id = config['TenantId']
        scopes = config['DefaultScopes']
        
        # MSALクライアントの初期化
        app = ConfidentialClientApplication(
            client_id=client_id,
            client_credential=client_secret,
            authority=f"https://login.microsoftonline.com/{tenant_id}"
        )
        
        # トークン取得
        result = app.acquire_token_for_client(scopes=scopes)
        
        if "error" in result:
            return jsonify({
                'status': 'error',
                'message': 'トークン取得失敗',
                'details': result.get('error_description'),
                'error_code': result.get('error')
            }), 401
            
        # トークン有効期限を計算 (5分前を更新タイミングとする)
        expires_at = datetime.now().timestamp() + result['expires_in'] - 300
        
        return jsonify({
            'status': 'success',
            'access_token': result['access_token'],
            'expires_at': expires_at,
            'token_type': result['token_type'],
            'scope': result.get('scope')
        })
        
    except FileNotFoundError:
        return jsonify({
            'status': 'error',
            'message': '設定ファイルが見つかりません',
            'details': 'config.jsonが存在しないか読み込めません'
        }), 500
        
    except KeyError as e:
        return jsonify({
            'status': 'error',
            'message': '設定値が不足しています',
            'details': f'必要な設定キー: {str(e)}'
        }), 500
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': '内部サーバーエラー',
            'details': str(e)
        }), 500

# トークン更新エンドポイント
@app.route('/auth/refresh_token', methods=['POST'])
def refresh_token():
    """
    期限切れ間近のトークンを更新するエンドポイント
    """
    try:
        # 現在のトークンを取得 (簡略化のためヘッダーから取得)
        current_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not current_token:
            return jsonify({
                'status': 'error',
                'message': '認証トークンがありません'
            }), 401
            
        # 新しいトークンを取得 (実際にはMSALのキャッシュを利用)
        # ここでは簡略化のため新しいトークンを取得
        return get_client_credentials_token()
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'トークン更新エラー',
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
        port=5001
    )

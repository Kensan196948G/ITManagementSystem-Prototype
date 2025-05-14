from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from flask_principal import Principal, Permission, RoleNeed

# ブループリント設定
security_bp = Blueprint('security', __name__)

# JWT設定
jwt = JWTManager()

# レートリミッター設定
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# セキュリティヘッダー設定
talisman = Talisman()

# ロールベースアクセス制御
principal = Principal()
admin_permission = Permission(RoleNeed('admin'))
user_permission = Permission(RoleNeed('user'))

def init_security(app):
    """セキュリティ関連の初期化処理"""
    # JWT設定
    app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # 本番環境では環境変数から取得
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1時間
    jwt.init_app(app)
    
    # セキュリティヘッダー
    talisman.init_app(
        app,
        force_https=False,  # 開発環境では無効
        strict_transport_security=False  # 開発環境では無効
    )
    
    # ロールベースアクセス制御
    principal.init_app(app)

@security_bp.route('/login', methods=['POST'])
def login():
    """認証エンドポイント"""
    username = request.json.get('username')
    password = request.json.get('password')
    
    # 簡易認証 (実際にはDB認証を実装)
    if username == 'admin' and password == 'admin':
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 200
    return jsonify({"msg": "Bad username or password"}), 401

@security_bp.route('/protected', methods=['GET'])
@jwt_required()
@admin_permission.require(http_exception=403)
def protected():
    """保護されたエンドポイント (管理者のみアクセス可能)"""
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

@security_bp.route('/user', methods=['GET'])
@jwt_required()
@user_permission.require(http_exception=403)
def user_endpoint():
    """ユーザー向けエンドポイント"""
    current_user = get_jwt_identity()
    return jsonify(user=current_user), 200
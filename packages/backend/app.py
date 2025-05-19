from flask import Flask, jsonify, request, make_response
from packages.backend.database import db  # 修正ポイント: SQLAlchemyのdbインスタンスをインポート
from packages.backend.config import Config  # 修正ポイント: 設定クラスをインポート（存在しなければ作成要検討）
from packages.backend import models  # 修正ポイント: ORMモデルをインポートして登録
import jwt  # 修正ポイント: PyJWTをインポート
from datetime import datetime, timedelta
from functools import wraps  # 修正ポイント: 認証デコレータ用に追加

app = Flask(__name__)
app.config.from_object(Config)  # 修正ポイント: 設定を読み込み

db.init_app(app)  # 修正ポイント: SQLAlchemyをFlaskアプリに初期化

# JWT発行用の秘密鍵と有効期限設定
SECRET_KEY = app.config.get('SECRET_KEY', 'your-secret-key')  # ConfigにSECRET_KEYを設定推奨
JWT_EXP_DELTA_SECONDS = 3600  # 1時間有効

def token_required(f):
    """
    JWT認証デコレータ
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = models.User.query.get(data['user_id'])
            if current_user is None:
                return jsonify({'message': 'User not found!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except Exception:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/api/status', methods=['GET'])
def get_status():
    """
    テスト用のAPIエンドポイント。システムのステータスを返します。
    """
    return jsonify({"status": "ok"})

@app.route('/api/login', methods=['POST'])
def login():
    """
    ログインAPI
    リクエストJSONにusernameとpasswordを含むことを期待
    """
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'message': 'usernameとpasswordが必要です'}), 400

    user = models.User.query.filter_by(username=data['username']).first()
    if user is None or not user.check_password(data['password']):
        return jsonify({'message': '認証に失敗しました'}), 401

    payload = {
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(seconds=JWT_EXP_DELTA_SECONDS)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

    return jsonify({'token': token})

@app.route('/api/logout', methods=['POST'])
def logout():
    """
    ログアウトAPI
    JWTの無効化はサーバー側でトークン管理しない限り難しいため、
    クライアント側でトークン破棄を促す形とする。
    """
    # 実装例としてはクライアントにトークン破棄を促すだけ
    return jsonify({'message': 'ログアウトしました。クライアント側でトークンを破棄してください。'})

# 修正ポイント: 通知一覧取得APIエンドポイントを追加
@app.route('/api/notifications', methods=['GET'])
@token_required
def get_notifications(current_user):
    """
    認証済みユーザーの通知一覧を取得するAPI
    """
    notifications = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).all()  # 修正ポイント: models.を外して直接Notificationを使用
    result = []
    for n in notifications:
        result.append({
            'id': n.id,
            'message': n.message,
            'is_read': n.is_read,
            'created_at': n.created_at.isoformat()
        })
    return jsonify(result)

# 既存のAPIやルーティングはそのまま維持

if __name__ == '__main__':
    # デバッグモードでアプリケーションを実行します。
    # 本番環境では適切なWSGIサーバーを使用してください。
    app.run(debug=True)
from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from models import User
from db_flask import db_session

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    ユーザー名とパスワードによる認証処理
    """
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'ユーザー名とパスワードは必須です。'}), 400

    user = db_session.query(User).filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        session['user_id'] = user.id
        return jsonify({'message': 'ログイン成功', 'user': {'id': user.id, 'username': user.username}})
    else:
        return jsonify({'error': '認証に失敗しました。'}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    ログアウト処理
    """
    session.pop('user_id', None)
    return jsonify({'message': 'ログアウトしました。'})

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """
    現在ログイン中のユーザー情報取得
    """
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'ログインしていません。'}), 401

    user = db_session.query(User).get(user_id)
    if not user:
        return jsonify({'error': 'ユーザーが存在しません。'}), 404

    return jsonify({'id': user.id, 'username': user.username})
import os
import secrets
from functools import wraps

from flask import Blueprint, current_app, jsonify, request, session
from pydantic import ValidationError
from werkzeug.security import check_password_hash, generate_password_hash

from flask_session import Session
from packages.backend.schemas.auth import (
    TokenSchema,
    UserLoginSchema,
    UserRegisterSchema,
)

# Blueprintの作成
auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

# 簡易的なユーザーストア（本来はDBを使うべき）
# {username: {password_hash: str, api_token: str}}
users = {}


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "username" not in session:
            return jsonify({"error": "ログインが必要です"}), 401
        return f(*args, **kwargs)

    return decorated_function


@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = UserRegisterSchema.parse_obj(request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    if data.username in users:
        return jsonify({"error": "ユーザー名は既に存在します"}), 400

    password_hash = generate_password_hash(data.password)
    users[data.username] = {"password_hash": password_hash, "api_token": None}
    return jsonify({"message": "ユーザー登録が完了しました"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = UserLoginSchema.parse_obj(request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    user = users.get(data.username)
    if not user or not check_password_hash(user["password_hash"], data.password):
        return jsonify({"error": "ユーザー名またはパスワードが正しくありません"}), 401

    # セッションにユーザー名を保存
    session["username"] = data.username

    # APIトークンを発行（ランダムトークン）
    token = secrets.token_hex(32)
    user["api_token"] = token

    return jsonify({"message": "ログイン成功", "token": token})


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    username = session.pop("username", None)
    if username and username in users:
        users[username]["api_token"] = None
    session.clear()
    return jsonify({"message": "ログアウトしました"})


@auth_bp.route("/token/verify", methods=["POST"])
def verify_token():
    try:
        data = TokenSchema.parse_obj(request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    # トークンが有効かどうかをチェック
    for user_info in users.values():
        if user_info.get("api_token") == data.token:
            return jsonify({"valid": True})
    return jsonify({"valid": False}), 401


# CSRF対策はFlask-WTFのCSRFProtectを利用するのが一般的ですが、
# ここでは最低限のコメントとして記載しています。
# from flask_wtf import CSRFProtect
# csrf = CSRFProtect()
# csrf.init_app(current_app)

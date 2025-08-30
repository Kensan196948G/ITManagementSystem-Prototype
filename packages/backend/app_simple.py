#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
シンプルなFlaskバックエンドサーバー
認証機能のみを実装
"""

import os
from datetime import timedelta

from flask import Flask, jsonify, request, session
from flask_cors import CORS
from werkzeug.security import check_password_hash

# Flask アプリケーション作成
app = Flask(__name__)

# 設定
app.config["SECRET_KEY"] = "dev-secret-key-change-in-production"
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = False
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=1)
app.config["SESSION_COOKIE_SECURE"] = False
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

# CORS設定 - すべてのオリジンを許可（開発環境）
CORS(
    app,
    origins="*",
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)

# ハードコードされたテストユーザー（データベースから取得したことにする）
TEST_USERS = {
    "admin": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGcBGJhMJcm",  # admin123
        "role": "administrator",
        "firstName": "System",
        "lastName": "Administrator",
    },
    "user": {
        "id": 2,
        "username": "user",
        "email": "user@example.com",
        "password_hash": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36C4nClOY/ROy6Znqvw0lim",  # user123
        "role": "user",
        "firstName": "Test",
        "lastName": "User",
    },
}


@app.route("/api/health", methods=["GET"])
def health_check():
    """ヘルスチェック"""
    return jsonify({"status": "healthy", "message": "Backend is running"})


@app.route("/api/auth/login", methods=["POST"])
def login():
    """ログイン処理"""
    data = request.json
    username = data.get("username")
    password = data.get("password")

    print(f"Login attempt: username={username}")

    if not username or not password:
        return jsonify({"error": "ユーザー名とパスワードは必須です。"}), 400

    # admin/admin123の特別処理
    if username == "admin" and password == "admin123":
        user = TEST_USERS["admin"]
        session["user_id"] = user["id"]

        # JWTトークンの代わりにシンプルなトークンを返す
        response = {
            "access_token": "test-token-admin",
            "token_type": "Bearer",
            "user": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "role": user["role"],
                "firstName": user["firstName"],
                "lastName": user["lastName"],
            },
        }
        return jsonify(response), 200

    # user/user123の処理
    if username == "user" and password == "user123":
        user = TEST_USERS["user"]
        session["user_id"] = user["id"]

        response = {
            "access_token": "test-token-user",
            "token_type": "Bearer",
            "user": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "role": user["role"],
                "firstName": user["firstName"],
                "lastName": user["lastName"],
            },
        }
        return jsonify(response), 200

    return jsonify({"error": "認証に失敗しました。"}), 401


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    """ログアウト処理"""
    session.pop("user_id", None)
    return jsonify({"message": "ログアウトしました。"})


@app.route("/api/auth/me", methods=["GET"])
def get_current_user():
    """現在のユーザー情報取得"""
    # Authorizationヘッダーからトークンを取得
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]

        # トークンから該当ユーザーを返す
        if token == "test-token-admin":
            user = TEST_USERS["admin"]
            return jsonify(
                {
                    "id": user["id"],
                    "username": user["username"],
                    "email": user["email"],
                    "role": user["role"],
                    "firstName": user["firstName"],
                    "lastName": user["lastName"],
                }
            )
        elif token == "test-token-user":
            user = TEST_USERS["user"]
            return jsonify(
                {
                    "id": user["id"],
                    "username": user["username"],
                    "email": user["email"],
                    "role": user["role"],
                    "firstName": user["firstName"],
                    "lastName": user["lastName"],
                }
            )

    return jsonify({"error": "ログインしていません。"}), 401


if __name__ == "__main__":
    print("=" * 60)
    print("Simple IT Management System Backend")
    print("=" * 60)
    print(f"Server running on http://0.0.0.0:8000")
    print("\nAvailable test users:")
    print("  admin / admin123")
    print("  user / user123")
    print("\nEndpoints:")
    print("  POST /api/auth/login - User login")
    print("  POST /api/auth/logout - User logout")
    print("  GET  /api/auth/me - Get current user")
    print("  GET  /api/health - Health check")
    print("=" * 60)

    app.run(host="0.0.0.0", port=8000, debug=True)

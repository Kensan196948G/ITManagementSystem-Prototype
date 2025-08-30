from datetime import datetime

import bcrypt  # 修正ポイント: bcryptをインポート
from db_flask import db


class User(db.Model):
    """
    ユーザーモデルの雛形
    """

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(
        db.String(128), nullable=False
    )  # 修正ポイント: パスワードハッシュ用カラム追加
    role = db.Column(db.String(64), default="user", nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password: str):
        """パスワードをハッシュ化して保存"""
        self.password_hash = bcrypt.hashpw(
            password.encode("utf-8"), bcrypt.gensalt()
        ).decode(
            "utf-8"
        )  # 修正ポイント

    def check_password(self, password: str) -> bool:
        """パスワードの検証"""
        return bcrypt.checkpw(
            password.encode("utf-8"), self.password_hash.encode("utf-8")
        )  # 修正ポイント

    def __repr__(self):
        return f"<User {self.username}>"


# 修正ポイント: 通知モデルを追加
class Notification(db.Model):
    """
    通知モデル
    """

    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("notifications", lazy=True))

    def __repr__(self):
        return f"<Notification {self.id} to User {self.user_id}>"

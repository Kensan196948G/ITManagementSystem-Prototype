from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from . import db

class User(db.Model):
    """ユーザーモデル - システムユーザー管理"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    role = db.Column(db.String(20), default='user')  # admin, user, auditor
    department = db.Column(db.String(50))
    active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, username, email, password, first_name=None, last_name=None, role='user', department=None):
        self.username = username
        self.email = email
        self.set_password(password)
        self.first_name = first_name
        self.last_name = last_name
        self.role = role
        self.department = department

    def set_password(self, password):
        """パスワードをハッシュ化して設定"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """パスワード検証"""
        return check_password_hash(self.password_hash, password)

    def update_last_login(self):
        """最終ログイン時間の更新"""
        self.last_login = datetime.utcnow()
        db.session.commit()

    def to_dict(self):
        """ユーザー情報を辞書形式で返却"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'department': self.department,
            'active': self.active,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<User {self.username}>'


class UserActivity(db.Model):
    """ユーザー活動ログ - ISO 27001対応のためのアクティビティ監査"""
    __tablename__ = 'user_activities'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # login, logout, password_change, access_denied
    resource = db.Column(db.String(100))  # アクセスしたリソース
    details = db.Column(db.Text)  # 詳細情報
    ip_address = db.Column(db.String(50))  # アクセス元IPアドレス
    user_agent = db.Column(db.String(255))  # ユーザーエージェント
    status = db.Column(db.String(20))  # success, failed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # リレーションシップ
    user = db.relationship('User', backref=db.backref('activities', lazy=True))

    def __repr__(self):
        return f'<UserActivity {self.action} by User {self.user_id}>'

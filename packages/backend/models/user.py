from backend.database import Base
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
# from . import db # Flask-SQLAlchemy依存を削除
from backend.database import Base # 共通のBaseをインポート

class User(Base): # Baseを継承
    """ユーザーモデル - システムユーザー管理"""
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True) # index=Trueを追加
    username = Column(String(50), unique=True, nullable=False, index=True) # index=Trueを追加
    email = Column(String(100), unique=True, nullable=False, index=True) # index=Trueを追加
    password_hash = Column(String(256), nullable=False)
    first_name = Column(String(50), nullable=True) # nullable=Trueを明示
    last_name = Column(String(50), nullable=True)  # nullable=Trueを明示
    role = Column(String(20), default='user')  # admin, user, auditor
    department = Column(String(50), nullable=True) # nullable=Trueを明示
    active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True) # nullable=Trueを明示
    failed_login_attempts = Column(Integer, default=0)  # 失敗したログイン試行回数
    account_locked_until = Column(DateTime, nullable=True)  # アカウントロック期限, nullable=Trueを明示
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # SQLAlchemyではリレーションシップはクラス定義の外で定義されることが多いが、
    # Flask-SQLAlchemyのスタイルに合わせてクラス内に記述することも可能。
    # UserActivityとのリレーション (back_populatesを使用)
    activities = relationship("UserActivity", back_populates="user")

    # Incidentとのリレーション (back_populatesを使用)
    # Incident.assignee_id と Incident.reporter_id を参照するため、
    # foreign_keys を明示的に指定する必要がある場合がある。
    # Incidentモデルの定義を見て、適切なforeign_keysを指定する。
    # 今回はIncidentモデル側でback_populatesが設定されているので、
    # SQLAlchemyが推測できる場合もあるが、明示する方が安全。
    assigned_incidents = relationship('Incident', foreign_keys='Incident.assignee_id', back_populates='assignee')
    reported_incidents = relationship('Incident', foreign_keys='Incident.reporter_id', back_populates='reporter')

    # Commentとのリレーション (back_populatesを使用)
    comments = relationship('Comment', back_populates='user')

    # Attachmentとのリレーション (back_populatesを使用)
    uploaded_attachments = relationship('Attachment', back_populates='uploaded_by')

    # Problemとのリレーション
    reported_problems = relationship('Problem', foreign_keys='Problem.reported_by_id', back_populates='reporter')
    assigned_problems = relationship('Problem', foreign_keys='Problem.assigned_to_id', back_populates='assignee')

    # RootCauseAnalysisとのリレーション (特定者として)
    identified_rcas = relationship('RootCauseAnalysis', foreign_keys='RootCauseAnalysis.identified_by_id', back_populates='identified_by')

    # Workaroundとのリレーション (実施者として)
    implemented_workarounds = relationship('Workaround', foreign_keys='Workaround.implemented_by_id', back_populates='implemented_by')

    # ProblemIncidentLink は User と直接関連しないため、このリレーションは削除 (または別途 linked_by_id を持つように設計変更が必要)
    # problem_links_created = relationship('ProblemIncidentLink', foreign_keys='ProblemIncidentLink.linked_by_id', back_populates='linker')


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
        # db.session.commit() # FastAPIではルーターでセッションを管理するため削除

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


class UserActivity(Base): # Baseを継承
    """ユーザー活動ログ - ISO 27001対応のためのアクティビティ監査"""
    __tablename__ = 'user_activities'

    id = Column(Integer, primary_key=True, index=True) # index=Trueを追加
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    action = Column(String(50), nullable=False)  # login, logout, password_change, access_denied
    resource = Column(String(100), nullable=True)  # アクセスしたリソース, nullable=Trueを明示
    details = Column(Text, nullable=True)  # 詳細情報, nullable=Trueを明示
    ip_address = Column(String(50), nullable=True)  # アクセス元IPアドレス, nullable=Trueを明示
    user_agent = Column(String(255), nullable=True)  # ユーザーエージェント, nullable=Trueを明示
    status = Column(String(20), nullable=True)  # success, failed, nullable=Trueを明示
    created_at = Column(DateTime, default=datetime.utcnow)

    # リレーションシップ (back_populatesを使用)
    user = relationship('User', back_populates='activities')

    def __repr__(self):
        return f'<UserActivity {self.action} by User {self.user_id}>'

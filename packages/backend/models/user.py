"""
ユーザーモデル定義
ISO 27001準拠のユーザー管理
"""

from packages.backend.database import Base
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Table, ForeignKey
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash

# 多対多の関連テーブル（ユーザーとロール）
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True)
)

# 多対多の関連テーブル（ロールと権限）
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id'), primary_key=True)
)

class User(Base):
    """ユーザーモデル（ISO 27001準拠）"""
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # プロファイル情報
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone_number = Column(String(20))
    department = Column(String(100))
    job_title = Column(String(100))
    
    # アカウント状態
    is_active = Column(Boolean, default=True)
    is_system_user = Column(Boolean, default=False)
    
    # セキュリティ設定（ISO 27001準拠）
    mfa_enabled = Column(Boolean, default=False)
    mfa_method = Column(String(20))  # totp, sms, email
    mfa_secret = Column(String(255))
    backup_codes = Column(Text)  # JSON形式で保存
    
    # ログイン情報
    last_login = Column(DateTime)
    last_password_change = Column(DateTime)
    password_expires_at = Column(DateTime)
    failed_login_attempts = Column(Integer, default=0)
    account_locked_until = Column(DateTime)
    
    # 監査情報
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(64))
    updated_by = Column(String(64))
    
    # リレーションシップ
    roles = relationship('Role', secondary=user_roles, back_populates='users')
    
    # インシデント関連
    assigned_incidents = relationship('Incident', foreign_keys='Incident.assignee_id', back_populates='assignee')
    reported_incidents = relationship('Incident', foreign_keys='Incident.reporter_id', back_populates='reporter')
    
    # 問題管理関連
    assigned_problems = relationship('Problem', foreign_keys='Problem.assignee_id', back_populates='assignee')
    reported_problems = relationship('Problem', foreign_keys='Problem.reporter_id', back_populates='reporter')
    
    # 変更管理関連
    requested_changes = relationship('Change', foreign_keys='Change.requester_id', back_populates='requester')
    approved_changes = relationship('Change', foreign_keys='Change.approver_id', back_populates='approver')
    
    # コメント・添付ファイル
    comments = relationship('Comment', back_populates='user')
    uploaded_attachments = relationship('Attachment', back_populates='uploaded_by')
    
    # 監査ログ
    audit_logs = relationship('AuditLog', back_populates='user')
    
    def set_password(self, password: str):
        """パスワードをハッシュ化して設定"""
        self.password_hash = generate_password_hash(password)
        self.last_password_change = datetime.utcnow()
    
    def check_password(self, password: str) -> bool:
        """パスワードを検証"""
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
    def has_permission(self, permission_code: str) -> bool:
        """権限チェック"""
        for role in self.roles:
            for perm in role.permissions:
                if perm.code == permission_code:
                    return True
        return False
    
    def has_role(self, role_name: str) -> bool:
        """ロールチェック"""
        return any(role.name == role_name for role in self.roles)
    
    def lock_account(self, minutes: int = 30):
        """アカウントをロック"""
        from datetime import timedelta
        self.account_locked_until = datetime.utcnow() + timedelta(minutes=minutes)
    
    def is_locked(self) -> bool:
        """アカウントロック状態をチェック"""
        if self.account_locked_until:
            return datetime.utcnow() < self.account_locked_until
        return False
    
    def record_login(self, success: bool = True):
        """ログイン試行を記録"""
        if success:
            self.last_login = datetime.utcnow()
            self.failed_login_attempts = 0
        else:
            self.failed_login_attempts += 1
            if self.failed_login_attempts >= 5:
                self.lock_account()
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def to_dict(self, include_details=False):
        """辞書形式に変換"""
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'is_active': self.is_active,
            'mfa_enabled': self.mfa_enabled,
            'roles': [role.name for role in self.roles],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
        
        if include_details:
            data.update({
                'department': self.department,
                'job_title': self.job_title,
                'phone_number': self.phone_number,
                'permissions': list(set(
                    perm.code for role in self.roles 
                    for perm in role.permissions
                ))
            })
        
        return data


class Role(Base):
    """ロールモデル"""
    __tablename__ = 'roles'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text)
    is_system_role = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # リレーションシップ
    users = relationship('User', secondary=user_roles, back_populates='roles')
    permissions = relationship('Permission', secondary=role_permissions, back_populates='roles')
    
    def __repr__(self):
        return f'<Role {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'is_system_role': self.is_system_role,
            'permissions': [perm.code for perm in self.permissions],
            'user_count': len(self.users)
        }


class Permission(Base):
    """権限モデル"""
    __tablename__ = 'permissions'
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # リレーションシップ
    roles = relationship('Role', secondary=role_permissions, back_populates='permissions')
    
    def __repr__(self):
        return f'<Permission {self.code}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'description': self.description
        }


class AuditLog(Base):
    """監査ログモデル（ISO 27001準拠）"""
    __tablename__ = 'audit_logs'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50))
    resource_id = Column(String(50))
    ip_address = Column(String(45))
    user_agent = Column(Text)
    status = Column(String(20))  # success, failure
    details = Column(Text)  # JSON形式
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # リレーションシップ
    user = relationship('User', back_populates='audit_logs')
    
    def __repr__(self):
        return f'<AuditLog {self.action} by {self.user_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else None,
            'action': self.action,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'ip_address': self.ip_address,
            'status': self.status,
            'details': self.details,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
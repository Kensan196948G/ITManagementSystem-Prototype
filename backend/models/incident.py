from backend.database import Base
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.associationproxy import association_proxy # association_proxy をインポート
# from . import db # Flask-SQLAlchemy依存を削除
from backend.database import Base # 共通のBaseをインポート
# from .user import User # Userモデルは直接インポートせず、relationshipで文字列で参照

class IncidentStatus(Base): # Baseを継承
    """インシデントステータスモデル"""
    __tablename__ = 'incident_statuses'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True) #例: "新規", "対応中", "解決済み", "クローズ"
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Incidentとのリレーション (back_populatesを使用)
    incidents = relationship('Incident', back_populates='status')

    def __repr__(self):
        return f'<IncidentStatus {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class IncidentPriority(Base): # Baseを継承
    """インシデント優先度モデル"""
    __tablename__ = 'incident_priorities'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True) # 例: "高", "中", "低"
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Incidentとのリレーション (back_populatesを使用)
    incidents = relationship('Incident', back_populates='priority')

    def __repr__(self):
        return f'<IncidentPriority {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Incident(Base): # Baseを継承
    """インシデントモデル"""
    __tablename__ = 'incidents'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    
    status_id = Column(Integer, ForeignKey('incident_statuses.id'), nullable=False)
    priority_id = Column(Integer, ForeignKey('incident_priorities.id'), nullable=False)
    
    assignee_id = Column(Integer, ForeignKey('users.id'), nullable=True) # Userモデルのusersテーブルを参照
    reporter_id = Column(Integer, ForeignKey('users.id'), nullable=False) # Userモデルのusersテーブルを参照
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # リレーションシップ (back_populatesを使用)
    status = relationship('IncidentStatus', back_populates='incidents')
    priority = relationship('IncidentPriority', back_populates='incidents')
    
    assignee = relationship('User', foreign_keys=[assignee_id], back_populates='assigned_incidents')
    reporter = relationship('User', foreign_keys=[reporter_id], back_populates='reported_incidents')
    
    comments = relationship('Comment', back_populates='incident', cascade="all, delete-orphan", lazy="select") # lazy='dynamic' から変更
    attachments = relationship('Attachment', back_populates='incident', cascade="all, delete-orphan", lazy="select") # lazy='dynamic' から変更

    # ProblemIncidentLink とのリレーション
    problem_links = relationship("ProblemIncidentLink", back_populates="incident", cascade="all, delete-orphan", lazy="select")
    linked_problems = association_proxy("problem_links", "problem")


    def __repr__(self):
        return f'<Incident {self.id}: {self.title}>'

    def to_dict(self, include_details=False):
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status_id': self.status_id,
            'status': self.status.name if self.status else None,
            'priority_id': self.priority_id,
            'priority': self.priority.name if self.priority else None,
            'assignee_id': self.assignee_id,
            'assignee': self.assignee.username if self.assignee else None, # assigneeのusernameを表示
            'reporter_id': self.reporter_id,
            'reporter': self.reporter.username if self.reporter else None, # reporterのusernameを表示
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'comments_count': len(self.comments) if self.comments else 0, # lazy='dynamic'ではないのでlen()を使用
            'attachments_count': len(self.attachments) if self.attachments else 0 # lazy='dynamic'ではないのでlen()を使用
        }
        if include_details:
            data['comments'] = [comment.to_dict() for comment in self.comments] # .all() は不要
            data['attachments'] = [attachment.to_dict() for attachment in self.attachments] # .all() は不要
        return data

class Comment(Base): # Baseを継承
    """コメントモデル"""
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey('incidents.id'), nullable=True) # インシデントへのFK (Nullable)
    problem_id = Column(Integer, ForeignKey('problems.id'), nullable=True) # 問題へのFK (Nullable)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False) # Userモデルのusersテーブルを参照
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # リレーションシップ (back_populatesを使用)
    user = relationship('User', back_populates='comments')
    incident = relationship('Incident', back_populates='comments')
    problem = relationship('Problem', back_populates='comments')


    def __repr__(self):
        if self.incident_id:
            return f'<Comment {self.id} for Incident {self.incident_id}>'
        elif self.problem_id:
            return f'<Comment {self.id} for Problem {self.problem_id}>'
        return f'<Comment {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'incident_id': self.incident_id,
            'problem_id': self.problem_id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else None, # コメントしたユーザーのusernameを表示
            'content': self.content,
            'created_at': self.created_at.isoformat()
        }

class Attachment(Base): # Baseを継承
    """添付ファイルモデル"""
    __tablename__ = 'attachments'

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey('incidents.id'), nullable=True) # インシデントへのFK (Nullable)
    problem_id = Column(Integer, ForeignKey('problems.id'), nullable=True) # 問題へのFK (Nullable)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(512), nullable=False) # ファイルの保存パス
    filesize = Column(Integer, nullable=True) # ファイルサイズ (バイト単位)
    uploaded_by_id = Column(Integer, ForeignKey('users.id'), nullable=False) # Userモデルのusersテーブルを参照
    created_at = Column(DateTime, default=datetime.utcnow)

    # リレーションシップ (back_populatesを使用)
    uploaded_by = relationship('User', back_populates='uploaded_attachments')
    incident = relationship('Incident', back_populates='attachments')
    problem = relationship('Problem', back_populates='attachments')

    def __repr__(self):
        if self.incident_id:
            return f'<Attachment {self.filename} for Incident {self.incident_id}>'
        elif self.problem_id:
            return f'<Attachment {self.filename} for Problem {self.problem_id}>'
        return f'<Attachment {self.filename}>'

    def to_dict(self):
        return {
            'id': self.id,
            'incident_id': self.incident_id,
            'problem_id': self.problem_id,
            'filename': self.filename,
            'filepath': self.filepath, # APIレスポンスに含めるか検討。セキュリティリスクの可能性。
            'filesize': self.filesize,
            'uploaded_by_id': self.uploaded_by_id,
            'uploaded_by': self.uploaded_by.username if self.uploaded_by else None, # アップロードしたユーザーのusernameを表示
            'created_at': self.created_at.isoformat()
        }
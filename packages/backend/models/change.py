"""
変更管理モデル定義
ISO 20000準拠の変更管理プロセス
"""

from packages.backend.database import Base
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, Enum, Table
from sqlalchemy.orm import relationship
import enum

class ChangeType(enum.Enum):
    """変更タイプ"""
    STANDARD = "standard"        # 標準変更
    NORMAL = "normal"           # 通常変更
    EMERGENCY = "emergency"      # 緊急変更
    MINOR = "minor"             # 軽微な変更

class ChangeRisk(enum.Enum):
    """変更リスクレベル"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ChangeStatus(Base):
    """変更ステータスモデル"""
    __tablename__ = 'change_statuses'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    changes = relationship('Change', back_populates='status')

    def __repr__(self):
        return f'<ChangeStatus {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }

class ChangePriority(Base):
    """変更優先度モデル"""
    __tablename__ = 'change_priorities'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    changes = relationship('Change', back_populates='priority')

    def __repr__(self):
        return f'<ChangePriority {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }

class Change(Base):
    """変更要求モデル（ISO 20000準拠）"""
    __tablename__ = 'changes'

    id = Column(Integer, primary_key=True, index=True)
    change_number = Column(String(20), unique=True, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    justification = Column(Text)  # 変更の正当性
    
    # 変更タイプとリスク
    change_type = Column(Enum(ChangeType), default=ChangeType.NORMAL)
    risk_level = Column(Enum(ChangeRisk), default=ChangeRisk.MEDIUM)
    
    # ステータスと優先度
    status_id = Column(Integer, ForeignKey('change_statuses.id'), nullable=False)
    priority_id = Column(Integer, ForeignKey('change_priorities.id'), nullable=False)
    
    # 関係者
    requester_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    assignee_id = Column(Integer, ForeignKey('users.id'))
    approver_id = Column(Integer, ForeignKey('users.id'))
    implementer_id = Column(Integer, ForeignKey('users.id'))
    
    # 計画情報
    planned_start = Column(DateTime)
    planned_end = Column(DateTime)
    actual_start = Column(DateTime)
    actual_end = Column(DateTime)
    
    # 影響範囲
    impact_description = Column(Text)
    affected_services = Column(Text)  # JSON形式で保存
    affected_users = Column(Integer, default=0)
    
    # 実装詳細
    implementation_plan = Column(Text)
    rollback_plan = Column(Text)
    test_plan = Column(Text)
    
    # 承認情報
    approved_at = Column(DateTime)
    approval_comments = Column(Text)
    
    # 完了情報
    implementation_result = Column(Text)
    lessons_learned = Column(Text)
    
    # フラグ
    is_emergency = Column(Boolean, default=False)
    requires_cab_approval = Column(Boolean, default=True)  # CAB承認要否
    has_rollback_plan = Column(Boolean, default=False)
    
    # 監査情報
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # リレーションシップ
    status = relationship('ChangeStatus', back_populates='changes')
    priority = relationship('ChangePriority', back_populates='changes')
    requester = relationship('User', foreign_keys=[requester_id], back_populates='requested_changes')
    assignee = relationship('User', foreign_keys=[assignee_id])
    approver = relationship('User', foreign_keys=[approver_id], back_populates='approved_changes')
    implementer = relationship('User', foreign_keys=[implementer_id])
    
    # 関連するインシデントと問題
    related_incidents = relationship('Incident', secondary='change_incident_links')
    related_problems = relationship('Problem', secondary='change_problem_links')
    
    # タスクとコメント
    tasks = relationship('ChangeTask', back_populates='change', cascade="all, delete-orphan")
    comments = relationship('ChangeComment', back_populates='change', cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<Change {self.change_number}: {self.title}>'
    
    def generate_change_number(self):
        """変更番号を生成"""
        from datetime import datetime
        now = datetime.now()
        return f"CHG-{now.strftime('%Y%m%d')}-{self.id:04d}"
    
    def calculate_risk_score(self) -> int:
        """リスクスコアを計算"""
        risk_scores = {
            ChangeRisk.LOW: 1,
            ChangeRisk.MEDIUM: 2,
            ChangeRisk.HIGH: 3,
            ChangeRisk.CRITICAL: 4
        }
        
        base_score = risk_scores.get(self.risk_level, 2)
        
        # 影響範囲によるスコア調整
        if self.affected_users > 100:
            base_score += 1
        if self.is_emergency:
            base_score += 1
        if not self.has_rollback_plan:
            base_score += 1
            
        return min(base_score, 5)  # 最大スコアは5
    
    def can_be_approved(self) -> bool:
        """承認可能かチェック"""
        required_fields = [
            self.implementation_plan,
            self.rollback_plan,
            self.test_plan,
            self.impact_description
        ]
        return all(required_fields)
    
    def to_dict(self, include_details=False):
        """辞書形式に変換"""
        data = {
            'id': self.id,
            'change_number': self.change_number,
            'title': self.title,
            'description': self.description,
            'change_type': self.change_type.value if self.change_type else None,
            'risk_level': self.risk_level.value if self.risk_level else None,
            'risk_score': self.calculate_risk_score(),
            'status': self.status.name if self.status else None,
            'priority': self.priority.name if self.priority else None,
            'requester': self.requester.username if self.requester else None,
            'assignee': self.assignee.username if self.assignee else None,
            'planned_start': self.planned_start.isoformat() if self.planned_start else None,
            'planned_end': self.planned_end.isoformat() if self.planned_end else None,
            'is_emergency': self.is_emergency,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_details:
            data.update({
                'justification': self.justification,
                'impact_description': self.impact_description,
                'affected_services': self.affected_services,
                'affected_users': self.affected_users,
                'implementation_plan': self.implementation_plan,
                'rollback_plan': self.rollback_plan,
                'test_plan': self.test_plan,
                'approver': self.approver.username if self.approver else None,
                'approved_at': self.approved_at.isoformat() if self.approved_at else None,
                'approval_comments': self.approval_comments,
                'tasks': [task.to_dict() for task in self.tasks],
                'comments': [comment.to_dict() for comment in self.comments]
            })
        
        return data

class ChangeTask(Base):
    """変更タスクモデル"""
    __tablename__ = 'change_tasks'
    
    id = Column(Integer, primary_key=True, index=True)
    change_id = Column(Integer, ForeignKey('changes.id'), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    assignee_id = Column(Integer, ForeignKey('users.id'))
    status = Column(String(50), default='pending')
    due_date = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # リレーションシップ
    change = relationship('Change', back_populates='tasks')
    assignee = relationship('User')
    
    def __repr__(self):
        return f'<ChangeTask {self.title} for Change {self.change_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'assignee': self.assignee.username if self.assignee else None,
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

class ChangeComment(Base):
    """変更コメントモデル"""
    __tablename__ = 'change_comments'
    
    id = Column(Integer, primary_key=True, index=True)
    change_id = Column(Integer, ForeignKey('changes.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    content = Column(Text, nullable=False)
    is_approval_comment = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # リレーションシップ
    change = relationship('Change', back_populates='comments')
    user = relationship('User')
    
    def __repr__(self):
        return f'<ChangeComment by {self.user_id} on Change {self.change_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user': self.user.username if self.user else None,
            'content': self.content,
            'is_approval_comment': self.is_approval_comment,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# 関連テーブル（多対多）
change_incident_links = Table(
    'change_incident_links',
    Base.metadata,
    Column('change_id', Integer, ForeignKey('changes.id'), primary_key=True),
    Column('incident_id', Integer, ForeignKey('incidents.id'), primary_key=True)
)

change_problem_links = Table(
    'change_problem_links',
    Base.metadata,
    Column('change_id', Integer, ForeignKey('changes.id'), primary_key=True),
    Column('problem_id', Integer, ForeignKey('problems.id'), primary_key=True)
)

# 旧モデルとの互換性のため
ChangeRequest = Change
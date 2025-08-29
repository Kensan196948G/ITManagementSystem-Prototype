from packages.backend.database import Base
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.associationproxy import association_proxy

# 中間テーブル: Problem と Incident の多対多リレーションシップ
# ProblemIncidentLink は双方向リレーションシップのための明示的なモデルとして定義
class ProblemIncidentLink(Base):
    __tablename__ = 'problem_incident_links'
    problem_id = Column(Integer, ForeignKey('problems.id'), primary_key=True)
    incident_id = Column(Integer, ForeignKey('incidents.id'), primary_key=True)
    linked_at = Column(DateTime, default=datetime.utcnow)

    # 親へのリレーション
    problem = relationship("Problem", back_populates="incident_links")
    incident = relationship("Incident", back_populates="problem_links")

    def __repr__(self):
        return f"<ProblemIncidentLink problem_id={self.problem_id} incident_id={self.incident_id}>"


class ProblemStatus(Base):
    """問題ステータスモデル"""
    __tablename__ = 'problem_statuses'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True) # 例: "登録済", "調査中", "既知のエラー", "解決済", "クローズ"
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    problems = relationship('Problem', back_populates='status')

    def __repr__(self):
        return f'<ProblemStatus {self.name}>'

class ProblemPriority(Base):
    """問題優先度モデル"""
    __tablename__ = 'problem_priorities'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True) # 例: "重大", "高", "中", "低"
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    problems = relationship('Problem', back_populates='priority')

    def __repr__(self):
        return f'<ProblemPriority {self.name}>'

class ProblemCategory(Base):
    """問題カテゴリモデル"""
    __tablename__ = 'problem_categories'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True) # 例: "ハードウェア障害", "ソフトウェアバグ", "ネットワーク問題"
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    problems = relationship('Problem', back_populates='category')

    def __repr__(self):
        return f'<ProblemCategory {self.name}>'


class RootCauseAnalysis(Base):
    """根本原因分析モデル"""
    __tablename__ = 'root_cause_analyses'

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey('problems.id'), nullable=False)
    description = Column(Text, nullable=False)
    identified_at = Column(DateTime, default=datetime.utcnow) #特定日
    identified_by_id = Column(Integer, ForeignKey('users.id'), nullable=True) # Userモデルのusersテーブルを参照
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    problem = relationship('Problem', back_populates='root_cause_analyses')
    identified_by = relationship('User', foreign_keys=[identified_by_id]) # User とのリレーション (RCAを特定した人)

    def __repr__(self):
        return f'<RootCauseAnalysis {self.id} for Problem {self.problem_id}>'


class Workaround(Base):
    """回避策モデル"""
    __tablename__ = 'workarounds'

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey('problems.id'), nullable=False)
    description = Column(Text, nullable=False)
    implemented_at = Column(DateTime, nullable=True) # 実施日
    implemented_by_id = Column(Integer, ForeignKey('users.id'), nullable=True) # Userモデルのusersテーブルを参照
    effectiveness_notes = Column(Text, nullable=True) # 有効性に関するメモ
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    problem = relationship('Problem', back_populates='workarounds')
    implemented_by = relationship('User', foreign_keys=[implemented_by_id]) # User とのリレーション (回避策を実施した人)

    def __repr__(self):
        return f'<Workaround {self.id} for Problem {self.problem_id}>'


class Problem(Base):
    """問題モデル"""
    __tablename__ = 'problems'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    impact_description = Column(Text, nullable=True) # 影響範囲の説明
    known_error_status = Column(String(100), nullable=True) # 例: "確認済み", "解決策開発中", "恒久対策待ち" (既知のエラーDBとしてのステータス)

    status_id = Column(Integer, ForeignKey('problem_statuses.id'), nullable=False)
    priority_id = Column(Integer, ForeignKey('problem_priorities.id'), nullable=False)
    category_id = Column(Integer, ForeignKey('problem_categories.id'), nullable=True)

    reporter_id = Column(Integer, ForeignKey('users.id'), nullable=False) # Userモデルのusersテーブルを参照
    assignee_id = Column(Integer, ForeignKey('users.id'), nullable=True) # Userモデルのusersテーブルを参照

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True) # 解決日時

    # リレーションシップ
    status = relationship('ProblemStatus', back_populates='problems')
    priority = relationship('ProblemPriority', back_populates='problems')
    category = relationship('ProblemCategory', back_populates='problems', uselist=False) # ProblemCategoryは一つなのでuselist=False

    reporter = relationship('User', foreign_keys=[reporter_id], back_populates='reported_problems')
    assignee = relationship('User', foreign_keys=[assignee_id], back_populates='assigned_problems')

    root_cause_analyses = relationship('RootCauseAnalysis', back_populates='problem', cascade="all, delete-orphan", lazy="select")
    workarounds = relationship('Workaround', back_populates='problem', cascade="all, delete-orphan", lazy="select")

    # Comment と Attachment へのリレーションは、Comment/Attachmentモデル側で problem_id FK を持つため、
    # Comment.problem, Attachment.problem で Problem に逆参照される
    # ここでは Problem -> Comments/Attachments の一対多を定義
    comments = relationship('Comment', back_populates='problem', cascade="all, delete-orphan", lazy="select")
    attachments = relationship('Attachment', back_populates='problem', cascade="all, delete-orphan", lazy="select")

    # Incident との多対多リレーションシップ (ProblemIncidentLink経由)
    incident_links = relationship("ProblemIncidentLink", back_populates="problem", cascade="all, delete-orphan", lazy="select")
    # linked_incidents を使うことで、Problem オブジェクトから直接関連する Incident オブジェクトのリストにアクセスできる
    linked_incidents = association_proxy("incident_links", "incident")


    def __repr__(self):
        return f'<Problem {self.id}: {self.title}>'

# Userモデル側に Problem との関連を追加するための back_populates を追記する必要がある
# User.reported_problems = relationship("Problem", foreign_keys=[Problem.reported_by_id], back_populates="reporter")
# User.assigned_problems = relationship("Problem", foreign_keys=[Problem.assigned_to_id], back_populates="assignee")
# User.identified_rcas = relationship("RootCauseAnalysis", back_populates="identified_by")
# User.implemented_workarounds = relationship("Workaround", back_populates="implemented_by")
# Comment と Attachment も User モデルへの参照 (user, uploaded_by) を持っているので、
# Userモデル側にも User.comments, User.uploaded_attachments のような back_populates が必要。
# これらは既存の incident.py や user.py で定義されていることを期待。
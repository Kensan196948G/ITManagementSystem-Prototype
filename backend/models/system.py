from sqlalchemy import Column, Integer, String, JSON, DateTime
from ..database import Base
from datetime import datetime

class SelfHealingHistory(Base):
    """自律修復モジュールの実行履歴を管理するモデル"""
    __tablename__ = "self_healing_history"

    id = Column(Integer, primary_key=True, index=True)
    system_name = Column(String(100), nullable=False)
    repair_status = Column(String(20), nullable=False)  # pending, running, success, failed
    execution_context = Column(JSON, nullable=True)  # 実行時のコンテキスト情報
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    error_details = Column(JSON, nullable=True)  # エラー発生時の詳細

    def __repr__(self):
        return f"<SelfHealingHistory(id={self.id}, system={self.system_name}, status={self.repair_status})>"

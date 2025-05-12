# backend/models/__init__.py

"""
SQLAlchemyモデルをこのパッケージから簡単にインポートできるようにするためのファイル。
このファイルは、FastAPIアプリケーションにおいて、モデルクラスを集約し、
他のモジュールからのアクセスポイントを提供します。
"""

from backend.database import Base # Baseをインポート

# 各モデルファイルをインポート
from .user import User
from .system import SystemMonitor, ServiceIncident, SecurityEvent
from .incident import Incident, IncidentStatus, IncidentPriority, Comment, Attachment
from .problem import (
    Problem,
    ProblemStatus,
    ProblemPriority,
    ProblemCategory,
    RootCauseAnalysis,
    Workaround,
    ProblemIncidentLink
)

# __all__ を定義して、'from backend.models import *' でインポートされるものを制御
__all__ = [
    "Base", # Base もエクスポート対象に含めることが多い
    "User",
    "SystemMonitor",
    "ServiceIncident",
    "SecurityEvent",
    "Incident",
    "IncidentStatus",
    "IncidentPriority",
    "Comment",
    "Attachment",
    "Problem",
    "ProblemStatus",
    "ProblemPriority",
    "ProblemCategory",
    "RootCauseAnalysis",
    "Workaround",
    "ProblemIncidentLink",
]

# 注意: Flask-SQLAlchemy の db オブジェクトや init_app 関数は、
# FastAPI では通常使用されません。データベースの初期化やセッション管理は、
# `backend.database` モジュールや `main.py` で処理されます。
# `Base.metadata.create_all(bind=engine)` のような形でテーブルを作成します。

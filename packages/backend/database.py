"""
データベース接続設定
ISO 20000/27001準拠のITSMシステム用
"""

import os

# 環境変数から取得（デフォルトはSQLite）
# 絶対パスを使用
import pathlib

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.pool import StaticPool

db_path = pathlib.Path(__file__).parent.parent.parent / "itsm.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{db_path.absolute()}")

# スタンドアロン用のエンジン設定
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False, "timeout": 30},
        poolclass=StaticPool,
        echo=False,
    )

    # SQLiteの最適化設定
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA cache_size=10000")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

else:
    engine = create_engine(
        DATABASE_URL, pool_size=10, max_overflow=20, pool_pre_ping=True, echo=False
    )

# セッション設定
SessionLocal = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)

# Baseクラスを定義
Base = declarative_base()

# セッションのエイリアス（互換性のため）
db_session = SessionLocal()


# データベースセッション管理
def get_db():
    """データベースセッションを取得"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """データベース初期化"""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


def drop_db():
    """データベースをドロップ（テスト用）"""
    Base.metadata.drop_all(bind=engine)
    print("Database tables dropped!")

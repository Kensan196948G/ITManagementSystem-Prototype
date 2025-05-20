from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.declarative import declarative_base

# SQLAlchemyのDBインスタンスを作成
db = SQLAlchemy()

# Baseクラスを定義 # 修正ポイント: Baseを追加
Base = declarative_base()

# セッションのエイリアスを作成（既存コードのdb_sessionに対応）
db_session = db.session
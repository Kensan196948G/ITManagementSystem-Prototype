from flask_sqlalchemy import SQLAlchemy

# SQLAlchemyのDBインスタンスを作成
db = SQLAlchemy()

# セッションのエイリアスを作成（既存コードのdb_sessionに対応）
db_session = db.session
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_app(app):
    """アプリケーションにデータベースを初期化する"""
    db.init_app(app)
    with app.app_context():
        db.create_all()  # テーブルの作成

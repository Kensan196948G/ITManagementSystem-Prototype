import os

class Config:
    # Flaskの基本設定
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key')  # セキュリティキー（環境変数推奨）
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///itsm.db')  # SQLite DBパス
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # 認証設定
    AUTH_USERNAME = os.environ.get('AUTH_USERNAME', 'admin')
    AUTH_PASSWORD = os.environ.get('AUTH_PASSWORD', 'password')

    # ログ設定
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', 'logs/app.log')
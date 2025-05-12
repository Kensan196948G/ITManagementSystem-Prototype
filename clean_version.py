import os
from pathlib import Path
from dotenv import load_dotenv

# .envファイルの絶対パス指定
env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(env_path)

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    # 絶対パスを使用してデータベースファイルを指定
    db_path = Path(__file__).parent.parent / 'instance' / 'app.db'
    db_path.parent.mkdir(parents=True, exist_ok=True)
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{db_path.resolve()}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# プロジェクトのルートディレクトリを基準に .env ファイルのパスを構築
# __file__ は現在のファイル (config.py) のパスを指す
# .parent は一つ上のディレクトリ (backend) を指す
# .parent.parent は二つ上のディレクトリ (プロジェクトルート) を指す
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    """
    アプリケーション設定を管理するクラス。
    環境変数または .env ファイルから値を読み込みます。
    """
    # 修正ポイント: SECRET_KEYのデフォルト値を削除し、環境変数からの読み込みを必須とする
    SECRET_KEY: str
    # データベースURL。デフォルトはプロジェクトルートの instance/app.db を指すSQLiteデータベース
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'instance' / 'app.db'}"
    ALGORITHM: str = "HS256"  # JWTトークンの署名アルゴリズム
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # アクセストークンの有効期限（分）

    # Pydantic Settings の設定
    # env_file に .env ファイルのパスを指定
    # extra = "ignore" は、モデルに定義されていない環境変数を無視する設定
    model_config = SettingsConfigDict(env_file=str(ENV_FILE_PATH), extra="ignore")

# 設定クラスのインスタンスを作成
settings = Settings()

# データベースファイルの親ディレクトリが存在しない場合は作成
# SettingsクラスでDATABASE_URLが初期化された後にパスを評価する必要があるため、
# ここでPathオブジェクトを作成し、ディレクトリ操作を行う
# 修正ポイント: データベースファイルのパス構築を os.path.join を使用するように修正
import os

if settings.DATABASE_URL.startswith("sqlite:///"):
    db_url_path_str = settings.DATABASE_URL.replace("sqlite:///", "")
    # 相対パスとして扱う
    db_path = os.path.join(BASE_DIR, db_url_path_str)

    # ディレクトリが存在しない場合は作成
    db_dir = os.path.dirname(db_path)
    os.makedirs(db_dir, exist_ok=True)

    # データベースエンジンに渡すURLとして絶対パスを使用
    # settings.DATABASE_URL 自体の書き換えは行いません。
    # 必要であれば、settingsインスタンスをここで再生成することも可能です。
    # settings = Settings(DATABASE_URL=f"sqlite:///{os.path.abspath(db_path)}")
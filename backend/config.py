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
    SECRET_KEY: str = "dev-secret-key"  # デフォルトのシークレットキー
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
if settings.DATABASE_URL.startswith("sqlite:///"):
    db_url_path_str = settings.DATABASE_URL.replace("sqlite:///", "")
    # Windows環境で `///` の後にドライブレターが来る場合を考慮
    if ":" in db_url_path_str and not db_url_path_str.startswith("/"):
        # 例: C:\path\to\db -> /C:\path\to\db にならないように先頭のスラッシュを削除
        db_path = Path(db_url_path_str)
    else:
        db_path = Path(f"/{db_url_path_str}")

    # 絶対パスであることを確認（特にUnix系で先頭に / がつく場合）
    if not db_path.is_absolute():
        db_path = BASE_DIR / db_url_path_str

    db_path.parent.mkdir(parents=True, exist_ok=True)
    # Pydanticモデルは不変なので、新しい値でインスタンスを再作成するか、
    # もしくはsettingsオブジェクトのDATABASE_URLを直接更新する代わりに、
    # データベースエンジンに渡すURLとしてこの絶対パスを使用します。
    # ここでは、後のデータベース初期化でこの絶対パスが使われることを想定し、
    # settings.DATABASE_URL 自体の書き換えは行いません。
    # 必要であれば、settingsインスタンスをここで再生成することも可能です。
    # settings = Settings(DATABASE_URL=f"sqlite:///{db_path.resolve()}")
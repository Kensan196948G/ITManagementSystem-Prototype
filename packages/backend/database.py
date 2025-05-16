from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from backend.config import settings # Configクラスからsettingsインスタンスに変更

# SQLAlchemyエンジンを作成
# Config.SQLALCHEMY_DATABASE_URI は 'sqlite:///./test.db' のような形式を想定
# 例: 'postgresql://user:password@host:port/database'
#     'mysql+mysqlconnector://user:password@host:port/database'
#     'sqlite:///./your_database.db'
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL # settingsインスタンスからDATABASE_URLを参照

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # connect_args={"check_same_thread": False} # SQLiteの場合に必要
)

# セッションローカルを作成 (リクエストごとにDBセッションを管理)
# scoped_session を使うと、同一スレッド内では同じセッションインスタンスを返すようになる
# FastAPIでは通常、Dependsを使ってリクエストごとにセッションを生成・クローズする
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# モデルクラスが継承する基本クラス
Base = declarative_base()

# データベースセッションを取得するための依存関数
def get_db():
    """
    FastAPIの依存性として使用されるデータベースセッションジェネレータ。
    リクエストの開始時にセッションを生成し、終了時にクローズ（またはロールバック）します。
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    データベース内のすべてのテーブルを作成します（存在しない場合）。
    通常、アプリケーションの起動時に一度だけ呼び出されます。
    Alembicのようなマイグレーションツールを使用している場合は、この関数は不要な場合があります。
    """
    # UserモデルなどもインポートしてBaseに認識させる必要がある
    from backend.models import user, incident, problem # 新しいモデルもここに追加
    # 全てのモデルで Base を継承していることを確認
    Base.metadata.create_all(bind=engine, checkfirst=True) # テーブル存在チェックを追加
    print("Database tables created (if they didn't exist).")
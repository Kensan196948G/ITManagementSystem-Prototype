import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager

# プロジェクトルートをシステムパスに追加
project_root = Path(__file__).resolve().parent.parent # .resolve() を追加して絶対パスを保証
if str(project_root) not in sys.path: # 重複追加を避ける
    sys.path.insert(0, str(project_root))

import uvicorn
from fastapi import FastAPI

# FastAPI用のインポート
from backend.database import init_db, engine, Base  # Base と engine もインポート
from backend.routes import problems as problems_router # problems ルーターをインポート
# from backend.routes import incidents as incidents_router # 必要であれば他のルーターも
# from backend.routes import auth as auth_router # FlaskのBlueprintとは異なるので注意

# FastAPIアプリケーションのライフサイクル管理
@asynccontextmanager
async def lifespan(app: FastAPI):
    # アプリケーション起動時の処理
    print("[INFO] FastAPI application startup...")
    print("[INFO] Initializing database...")
    # ここで Base.metadata.create_all(bind=engine) を直接呼び出すか、
    # init_db() の中で適切に処理するようにします。
    # init_db() が Base.metadata.create_all を呼び出す想定
    init_db() # データベーステーブルを作成
    print("[INFO] Database initialized.")
    yield
    # アプリケーション終了時の処理 (必要な場合)
    print("[INFO] FastAPI application shutdown...")

# FastAPIアプリケーションインスタンスを作成
# lifespan イベントハンドラを登録
app = FastAPI(
    title="IT Management System API",
    description="API for managing IT incidents, problems, and other system operations.",
    version="0.1.0", # APIバージョン
    lifespan=lifespan # ライフサイクルイベントハンドラを登録
)

# ルーターの登録
app.include_router(problems_router.router, prefix="/api", tags=["Problems"])
# app.include_router(incidents_router.router, prefix="/api", tags=["Incidents"]) # 例：インシデントもFastAPI化する場合
# app.include_router(auth_router.router, prefix="/auth", tags=["Authentication"]) # 例：認証もFastAPI化する場合

# # Flaskアプリケーションのコード (コメントアウトまたは削除)
# # from backend.__init__ import create_app
# # print(f"[DEBUG] main.py: Initializing Flask app...")
# # flask_app = create_app() # 変数名を変更して衝突を避ける
# # print(f"[DEBUG] main.py: Flask app created.")

if __name__ == "__main__":
    # FastAPIアプリケーションをUvicornで起動
    # host="0.0.0.0": すべてのネットワークインターフェースでリッスン
    # port=8000: FastAPIサーバーのポート番号 (Flaskの5001と区別)
    # reload=True: 開発中にコード変更を自動リロード (本番ではFalse)
    print(f"[INFO] Starting Uvicorn server on host='0.0.0.0', port=8000, reload=True")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

    # # Flask開発サーバーの起動コード (コメントアウトまたは削除)
    # # print(f"[DEBUG] main.py: Attempting to run Flask app on host='0.0.0.0', port=5001, debug=True")
    # # flask_app.run(host='0.0.0.0', port=5001, debug=True)

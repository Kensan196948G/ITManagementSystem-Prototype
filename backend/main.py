import sys
from pathlib import Path
from contextlib import asynccontextmanager
from typing import AsyncIterator

import uvicorn
from fastapi import FastAPI

from backend.database import init_db
from backend.routes import problems as problems_router

# プロジェクトルートをシステムパスに追加
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """FastAPIアプリケーションのライフサイクル管理
    
    Args:
        app (FastAPI): FastAPIアプリケーションインスタンス
    """
    print("[INFO] Starting application initialization...")
    print("[INFO] Initializing database...")
    init_db()
    print("[INFO] Database initialization completed")
    yield
    print("[INFO] Application shutdown complete")

app = FastAPI(
    title="IT Management System API",
    description="API for IT Service Management operations",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.include_router(
    problems_router.router,
    prefix="/api/v1/problems",
    tags=["Problem Management"]
)

if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

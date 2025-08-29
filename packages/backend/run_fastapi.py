#!/usr/bin/env python3
"""
FastAPI サーバー起動スクリプト
"""

import os
import sys
import uvicorn
from pathlib import Path

# プロジェクトルートを追加
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# 環境変数設定
os.environ.setdefault('DATABASE_URL', 'sqlite:///./packages/backend/itsm.db')

if __name__ == "__main__":
    # FastAPIサーバーを起動
    uvicorn.run(
        "packages.backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )
"""
FastAPI 依存関数
実際の認証は utils/auth.py を使用
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from packages.backend.database import get_db
from packages.backend.models.user import User
from packages.backend.utils.auth import get_current_active_user

# OAuth2スキーマ（後方互換性のため保持）
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# 実際の認証は utils/auth.py の get_current_active_user を使用
async def get_current_user(db: Session = Depends(get_db)) -> User:
    """現在のユーザーを取得（utils/auth.pyから移行）"""
    return await get_current_active_user()

# 後方互換性のためのエイリアス
get_current_active_superuser = get_current_active_user
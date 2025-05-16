from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from typing import Optional

# Pydanticモデル (Userのダミー)
# 実際のUserモデルは backend.models.user を参照し、必要なフィールドを定義
class UserInDB(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False

    model_config = {"from_attributes": True} # SQLAlchemyモデルからPydanticモデルへの変換を許可 (旧 orm_mode)

# ダミーユーザーデータ
fake_users_db = {
    "testuser": {
        "id": 1,
        "username": "testuser",
        "email": "testuser@example.com",
        "full_name": "Test User",
        "hashed_password": "fakehashedpassword", # 本来はハッシュ化されたパスワード
        "is_active": True,
        "is_superuser": False,
    }
}

# OAuth2PasswordBearer はトークンをAuthorizationヘッダーから取得するためのユーティリティ
# tokenUrl はトークンを取得するためのエンドポイントを指定 (例: /auth/token)
# ここではダミーとして /token を指定
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    トークンに基づいて現在のユーザーを取得するダミー関数。
    実際のアプリケーションでは、トークンを検証し、データベースからユーザー情報を取得します。
    """
    # ここでは、常に固定のユーザーを返すか、トークンが特定の値の場合のみユーザーを返すなど、
    # ダミーのロジックを実装します。
    # 例として、どんなトークンでも testuser を返すようにします。
    user_data = fake_users_db.get("testuser")
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return UserInDB(**user_data)


async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)):
    """
    現在のユーザーがアクティブであるかを確認するダミー関数。
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# 管理者権限をチェックするダミー依存関数 (オプション)
async def get_current_active_superuser(current_user: UserInDB = Depends(get_current_active_user)):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="The user doesn't have enough privileges"
        )
    return current_user
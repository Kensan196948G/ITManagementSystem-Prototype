"""
ユーザー関連のPydanticスキーマ
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    username: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    is_active: bool = True
    is_system_user: bool = False


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    is_active: Optional[bool] = None
    is_system_user: Optional[bool] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserInDB(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    mfa_enabled: bool = False

    model_config = ConfigDict(from_attributes=True)


class User(UserInDB):
    pass


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserMe(BaseModel):
    id: int
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    is_active: bool
    roles: List[str] = []

    model_config = ConfigDict(from_attributes=True)


class UserList(BaseModel):
    items: List[User]
    total: int
    page: int
    size: int
    pages: int

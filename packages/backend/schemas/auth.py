from pydantic import BaseModel, Field, constr


class UserRegisterSchema(BaseModel):
    username: constr(min_length=3, max_length=50)
    password: constr(min_length=8, max_length=128)


class UserLoginSchema(BaseModel):
    username: constr(min_length=3, max_length=50)
    password: constr(min_length=8, max_length=128)


class TokenSchema(BaseModel):
    token: str = Field(..., description="APIトークン")

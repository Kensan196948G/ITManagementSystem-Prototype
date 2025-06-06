from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ProblemBase(BaseModel):
    title: str = Field(..., example="Database connection issue")
    description: Optional[str] = Field(None, example="Description of the problem")
    status: Optional[str] = Field("open", example="open")
    priority: Optional[int] = Field(1, example=1)

class ProblemCreateSchema(ProblemBase):
    pass

class ProblemUpdateSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[int] = None

class ProblemResponseSchema(ProblemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True
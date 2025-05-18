from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class IncidentBase(BaseModel):
    title: str = Field(..., example="Network outage")
    description: Optional[str] = Field(None, example="Description of the incident")
    status: Optional[str] = Field("open", example="open")
    severity: Optional[int] = Field(1, example=1)

class IncidentCreateSchema(IncidentBase):
    pass

class IncidentUpdateSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    severity: Optional[int] = None

class IncidentResponseSchema(IncidentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True